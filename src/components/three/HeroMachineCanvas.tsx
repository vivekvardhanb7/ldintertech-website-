import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { MachineCategoryId } from '../../data/vendingCatalog';
import { computeHeroScrollPose } from '../../utils/scrollMath';
import { HERO_MACHINE_PROFILES } from '../../utils/venueSimulation';
import {
  afterDraw,
  attachStudioEnvironment,
  createBrushedMetalTexture,
  createContactShadowTexture,
  createStudioRenderer,
  detectSoftwareGl,
} from './webglUtils';
import { buildAllMachineArchitectures } from './machineArchitectures';

interface HeroMachineCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  activeCategory: MachineCategoryId;
  reducedMotion: boolean;
  fallbackImage?: string;
  fallbackAlt?: string;
}

const _targetColor = new THREE.Color();

export function HeroMachineCanvas({
  scrollProgressRef,
  activeCategory,
  reducedMotion,
  fallbackImage = '/assets/vending-machines/snacks/snack-kiosk-studio.jpg',
  fallbackAlt = 'LD Intertech Smart Vending Machine',
}: HeroMachineCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const categoryRef = useRef<MachineCategoryId>(activeCategory);
  const pointerRef = useRef<{
    x: number;
    y: number;
    dragging: boolean;
    dragYaw: number;
    lastX: number;
  }>({
    x: 0,
    y: 0,
    dragging: false,
    dragYaw: 0,
    lastX: 0,
  });
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    categoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = createStudioRenderer(isSoftwareGl);
    const width = container.clientWidth || 720;
    const height = container.clientHeight || 680;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x10100f, 0.05);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
    camera.position.set(0.35, 1.38, 4.4);
    camera.lookAt(0, 1.08, 0);

    const envTex = attachStudioEnvironment(renderer, scene);

    // 3-point studio lighting + interior illumination
    const hemiLight = new THREE.HemisphereLight(0x9ecffa, 0x1a1816, 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.3);
    keyLight.position.set(3.8, 5.4, 4.6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 16;
      keyLight.shadow.camera.left = -2.5;
      keyLight.shadow.camera.right = 2.5;
      keyLight.shadow.camera.top = 3;
      keyLight.shadow.camera.bottom = -1;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa374ff, 1.75);
    rimLight.position.set(-4.2, 2.8, -3.2);
    scene.add(rimLight);

    const interiorLight = new THREE.PointLight(0xa374ff, 1.2, 3.6, 2);
    interiorLight.position.set(-0.18, 1.32, 0.56);
    scene.add(interiorLight);

    // Procedural textures
    const brushedTex = createBrushedMetalTexture();
    const shadowTex = createContactShadowTexture();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const { machineGroup, categoryGroups, accentMat, dispose: disposeArchitectures } =
      buildAllMachineArchitectures({
        isSoftwareGl,
        maxAnisotropy: maxAniso,
        brushedTex,
      });
    scene.add(machineGroup);

    // Ground & horizon ring
    const floorMesh = new THREE.Mesh(
      new THREE.CircleGeometry(10, 48),
      new THREE.MeshStandardMaterial({
        color: 0x141413,
        roughness: 0.72,
        metalness: 0.18,
      })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa374ff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const floorRing = new THREE.Mesh(new THREE.RingGeometry(1.26, 1.3, 64), ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.02;
    scene.add(floorRing);

    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.95),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.75,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, 0.015, 0);
    scene.add(contactShadow);

    // Machine architectures mounted from shared builder above

    // Subtle floating particles
    const particleCount = 32;
    const pGeo = new THREE.OctahedronGeometry(0.016, 0);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xa374ff,
      transparent: true,
      opacity: 0.42,
    });
    const particles = new THREE.InstancedMesh(pGeo, pMat, particleCount);
    particles.frustumCulled = false;
    const pDummy = new THREE.Object3D();
    const pSeeds = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.sin(i * 12.9898) * 0.5 * 3.8,
      y: 0.25 + ((i * 0.618) % 1) * 2.2,
      z: Math.cos(i * 78.233) * 0.5 * 2.4,
      speed: 0.35 + (i % 5) * 0.12,
      phase: i * 0.8,
    }));
    scene.add(particles);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer interaction
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointerRef.current.y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      if (pointerRef.current.dragging) {
        const dx = e.clientX - pointerRef.current.lastX;
        pointerRef.current.dragYaw += dx * 0.008;
        pointerRef.current.lastX = e.clientX;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      pointerRef.current.dragging = true;
      pointerRef.current.lastX = e.clientX;
    };
    const onPointerUp = () => {
      pointerRef.current.dragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => setContextLost(false);
    domEl.addEventListener('webglcontextlost', onContextLost);
    domEl.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 680;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Loop + category transition state
    let disposed = false;
    let frameId = 0;
    const timers: number[] = [];
    const startTime = performance.now();
    let prevTime = startTime;
    let renderedCat: MachineCategoryId | null = null;
    let transitionMix = 1;

    const registerTimer = (id: number) => timers.push(id);

    const applyCategoryImmediate = (cat: MachineCategoryId) => {
      (Object.keys(categoryGroups) as MachineCategoryId[]).forEach((k) => {
        categoryGroups[k].visible = k === cat;
      });
      const profile = HERO_MACHINE_PROFILES[cat];
      _targetColor.setHex(profile.accentHex);
      accentMat.color.copy(_targetColor);
      accentMat.emissive.copy(_targetColor);
      interiorLight.color.copy(_targetColor);
      rimLight.color.copy(_targetColor);
      ringMat.color.copy(_targetColor);
      pMat.color.copy(_targetColor);
    };

    applyCategoryImmediate(categoryRef.current);
    renderedCat = categoryRef.current;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      const currentCat = categoryRef.current;
      if (renderedCat !== currentCat) {
        renderedCat = currentCat;
        (Object.keys(categoryGroups) as MachineCategoryId[]).forEach((k) => {
          categoryGroups[k].visible = k === currentCat;
        });
        transitionMix = 0;
      }

      transitionMix = Math.min(1, transitionMix + dt * 3.4);
      const profile = HERO_MACHINE_PROFILES[currentCat];

      _targetColor.setHex(profile.accentHex);
      accentMat.color.lerp(_targetColor, 1 - Math.exp(-8 * dt));
      accentMat.emissive.lerp(_targetColor, 1 - Math.exp(-8 * dt));
      interiorLight.color.lerp(_targetColor, 1 - Math.exp(-8 * dt));
      rimLight.color.lerp(_targetColor, 1 - Math.exp(-8 * dt));
      ringMat.color.lerp(_targetColor, 1 - Math.exp(-8 * dt));
      pMat.color.lerp(_targetColor, 1 - Math.exp(-8 * dt));

      const pose = computeHeroScrollPose(scrollProgressRef.current);
      const parallaxX = reducedMotion ? 0 : pointerRef.current.x * 0.14;
      const parallaxY = reducedMotion ? 0 : -pointerRef.current.y * 0.08;
      const dampK = isSoftwareGl ? 16 : 6;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, pose.camX + parallaxX, dampK, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, pose.camY + parallaxY, dampK, dt);
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        pose.camZ + profile.cameraZOffset,
        dampK,
        dt
      );
      camera.lookAt(0, profile.lookAtY, 0);

      // Gentle breathing + crisp category swap settle spin
      const swapYawOffset = reducedMotion ? 0 : (1 - transitionMix) * 0.34;
      const swapScale = reducedMotion ? 1 : 0.94 + transitionMix * 0.06;
      const idleBreath = reducedMotion ? 0 : Math.sin(elapsed * 0.55) * 0.05;
      const targetRotY = pose.rotY + pointerRef.current.dragYaw + idleBreath + swapYawOffset;

      machineGroup.rotation.y = THREE.MathUtils.damp(machineGroup.rotation.y, targetRotY, dampK, dt);
      machineGroup.scale.setScalar(swapScale);

      accentMat.emissiveIntensity = pose.glowIntensity;
      interiorLight.intensity = pose.glowIntensity * 1.1;

      for (let i = 0; i < particleCount; i++) {
        const s = pSeeds[i];
        const yOff = reducedMotion ? 0 : Math.sin(elapsed * s.speed + s.phase) * 0.14;
        pDummy.position.set(s.x, s.y + yOff, s.z);
        pDummy.rotation.set(elapsed * 0.3, elapsed * 0.5, 0);
        pDummy.scale.setScalar(0.7 + 0.3 * Math.sin(elapsed + s.phase));
        pDummy.updateMatrix();
        particles.setMatrixAt(i, pDummy.matrix);
      }
      particles.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(renderer, registerTimer, () => {
          if (!disposed) tick();
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(renderer, registerTimer, () => {
        if (!disposed) tick();
      });
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => clearTimeout(id));
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('webglcontextlost', onContextLost);
      domEl.removeEventListener('webglcontextrestored', onContextRestored);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material.dispose();
          }
        }
      });
      brushedTex.dispose();
      shadowTex.dispose();
      disposeArchitectures();
      envTex.dispose();
      renderer.dispose();
    };
  }, [reducedMotion, scrollProgressRef]);

  const profile = HERO_MACHINE_PROFILES[activeCategory];

  if (contextLost) {
    return (
      <div className="relative w-full h-full flex items-center justify-center rounded-2xl bg-[#161615] border border-white/10 p-6">
        <img
          src={fallbackImage}
          alt={fallbackAlt}
          className="max-h-full w-auto object-contain rounded-xl"
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full min-h-[420px] cursor-grab active:cursor-grabbing select-none"
      data-testid="hero-3d-canvas"
      data-active-category={activeCategory}
      aria-label={`Interactive 3D ${fallbackAlt}`}
    >
      <div ref={mountRef} className="w-full h-full" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] tracking-wider uppercase text-[#8C8C88] font-mono-tabular whitespace-nowrap">
        {profile.subtitle} · Drag to rotate
      </div>
    </div>
  );
}
