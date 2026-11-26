import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLOBE_HUBS, type GlobeHub } from '../../data/vendingCatalog';
import { latLonToCartesian } from '../../utils/scrollMath';
import { afterDraw, createStudioRenderer, detectSoftwareGl } from './webglUtils';

interface GlobalNetworkGlobeProps {
  activeHub: GlobeHub;
}

export function GlobalNetworkGlobe({ activeHub }: GlobalNetworkGlobeProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const targetYawRef = useRef<number>(0);

  useEffect(() => {
    // Rotate globe to face selected regional hub
    const lonRad = (activeHub.lon * Math.PI) / 180;
    targetYawRef.current = -lonRad - Math.PI / 2;
  }, [activeHub]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = createStudioRenderer(isSoftwareGl);
    const width = container.clientWidth || 520;
    const height = container.clientHeight || 460;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 40);
    camera.position.set(0, 0.35, 4.35);
    camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0x9ecffa, 0x1d1d22, 1.35);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfcfcfc, 2.2);
    key.position.set(3, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa374ff, 1.6);
    rim.position.set(-4, -1, -3);
    scene.add(rim);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 1.42;

    // Core dark sphere with visible slate sheen
    const coreGeo = new THREE.SphereGeometry(radius, 36, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1e2029,
      roughness: 0.55,
      metalness: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Crisp latitude/longitude grid wireframe
    const wireGeo = new THREE.SphereGeometry(radius + 0.01, 24, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x5c5c75,
      wireframe: true,
      transparent: true,
      opacity: 0.52,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Equatorial orbital ring around globe
    const orbitGeo = new THREE.TorusGeometry(radius + 0.24, 0.008, 8, 72);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x9ecffa,
      transparent: true,
      opacity: 0.42,
    });
    const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 2.25;
    globeGroup.add(orbitRing);

    // Surface lattice dots via InstancedMesh
    const dotCount = 360;
    const dotGeo = new THREE.SphereGeometry(0.02, 6, 6);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x9ecffa, transparent: true, opacity: 0.8 });
    const dotMesh = new THREE.InstancedMesh(dotGeo, dotMat, dotCount);
    dotMesh.frustumCulled = false;
    const dummy = new THREE.Object3D();
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < dotCount; i++) {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * rAtY;
      const z = Math.sin(theta) * rAtY;
      dummy.position.set(x * (radius + 0.018), y * (radius + 0.018), z * (radius + 0.018));
      dummy.updateMatrix();
      dotMesh.setMatrixAt(i, dummy.matrix);
    }
    dotMesh.instanceMatrix.needsUpdate = true;
    globeGroup.add(dotMesh);

    // Hub markers & curved connecting arcs
    const markerGeo = new THREE.SphereGeometry(0.058, 14, 14);
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xa374ff,
      emissive: 0xa374ff,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    });
    const hubVectors: THREE.Vector3[] = [];
    for (const hub of GLOBE_HUBS) {
      const pos = latLonToCartesian(hub.lat, hub.lon, radius + 0.035);
      const vec = new THREE.Vector3(pos.x, pos.y, pos.z);
      hubVectors.push(vec);
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(vec);
      globeGroup.add(marker);
    }

    // Arc connections from HQ to global deployment hubs
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0xa374ff,
      transparent: true,
      opacity: 0.85,
    });
    const hq = hubVectors[0];
    for (let i = 1; i < hubVectors.length; i++) {
      const target = hubVectors[i];
      const mid = hq.clone().add(target).multiplyScalar(0.5).normalize().multiplyScalar(radius + 0.45);
      const curve = new THREE.QuadraticBezierCurve3(hq, mid, target);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.014, 6, false);
      const arcMesh = new THREE.Mesh(tubeGeo, arcMat);
      globeGroup.add(arcMesh);
    }

    // Drag-to-spin interaction
    let dragging = false;
    let lastX = 0;
    let manualOffset = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      manualOffset += (e.clientX - lastX) * 0.008;
      lastX = e.clientX;
    };
    const onUp = () => {
      dragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onDown);
    domEl.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let disposed = false;
    let frameId = 0;
    const timers: number[] = [];
    const startTime = performance.now();
    let prevTime = startTime;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;
      const targetY = targetYawRef.current + manualOffset + elapsed * 0.08;
      globeGroup.rotation.y = THREE.MathUtils.damp(globeGroup.rotation.y, targetY, 4.5, dt);
      globeGroup.rotation.x = 0.24;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(renderer, (id) => timers.push(id), () => {
          if (!disposed) tick();
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(renderer, (id) => timers.push(id), () => {
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
      window.removeEventListener('pointerup', onUp);
      domEl.removeEventListener('pointerdown', onDown);
      domEl.removeEventListener('pointermove', onMove);
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
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full h-[380px] md:h-[460px] cursor-grab active:cursor-grabbing select-none"
      data-testid="global-network-globe"
      aria-label="Interactive 3D Global Vending Operations Network"
    >
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
