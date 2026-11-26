import * as THREE from 'three';
import type { MachineCategoryId } from '../../data/vendingCatalog';
import { createCategoryScreenTexture, createPlaqueTexture } from './webglUtils';

export interface BuiltMachineArchitectures {
  machineGroup: THREE.Group;
  categoryGroups: Record<MachineCategoryId, THREE.Group>;
  accentMat: THREE.MeshStandardMaterial;
  dispose: () => void;
}

/**
 * Builds the 4 distinct 3D vending machine architectures (Medical, Pizza, Snacks, Return)
 * modeled after LD InterTech / vendinaf.com studio hardware geometry and screen layouts.
 */
export function buildAllMachineArchitectures(options: {
  isSoftwareGl: boolean;
  maxAnisotropy: number;
  brushedTex: THREE.CanvasTexture;
}): BuiltMachineArchitectures {
  const { isSoftwareGl, maxAnisotropy, brushedTex } = options;

  const screenTextures: Record<MachineCategoryId, THREE.CanvasTexture> = {
    medical: createCategoryScreenTexture('medical', maxAnisotropy),
    pizza: createCategoryScreenTexture('pizza', maxAnisotropy),
    snacks: createCategoryScreenTexture('snacks', maxAnisotropy),
    return: createCategoryScreenTexture('return', maxAnisotropy),
  };

  const pizzaTopTex = createPlaqueTexture(
    '24/7 HOT PIZZA',
    'FRESH IN 3 MINUTES',
    '#141212',
    '#E6CF80',
    maxAnisotropy
  );
  const hotFreshTex = createPlaqueTexture(
    'HOT & FRESH',
    'STONE CONVECTION OVEN',
    '#1A1515',
    '#FCFCFC',
    maxAnisotropy
  );
  const pizzaOutTex = createPlaqueTexture('PIZZA OUT', '', '#100E0E', '#E6CF80', maxAnisotropy);
  const snackHeaderTex = createPlaqueTexture(
    'SMART GOURMET',
    'CHILLED & AMBIENT',
    '#141418',
    '#FCFCFC',
    maxAnisotropy
  );
  const medHeaderTex = createPlaqueTexture(
    'HEALTHCARE 24/7',
    'APPROVED ESSENTIALS',
    '#101D2C',
    '#9ECFFA',
    maxAnisotropy
  );
  const returnHeaderTex = createPlaqueTexture(
    'SMART RETURN',
    'BOWLS · CUPS · BOTTLES',
    '#111E1A',
    '#7CE3B4',
    maxAnisotropy
  );

  const darkChassisMat = new THREE.MeshPhysicalMaterial({
    color: 0x1b1c1f,
    roughness: 0.36,
    metalness: 0.84,
    bumpMap: brushedTex,
    bumpScale: 0.004,
    clearcoat: 0.35,
    clearcoatRoughness: 0.24,
  });

  const clinicalChassisMat = new THREE.MeshPhysicalMaterial({
    color: 0x262d36,
    roughness: 0.3,
    metalness: 0.72,
    bumpMap: brushedTex,
    bumpScale: 0.003,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x3b3e46,
    roughness: 0.24,
    metalness: 0.9,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xa374ff,
    emissive: 0xa374ff,
    emissiveIntensity: 1.0,
    roughness: 0.3,
    metalness: 0.2,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    roughness: 0.06,
    metalness: 0.05,
    transparent: true,
    opacity: isSoftwareGl ? 0.22 : 0.18,
    transmission: isSoftwareGl ? 0 : 0.72,
    ior: 1.5,
    depthWrite: false,
  });

  const addFeet = (group: THREE.Group, halfW: number, halfD: number) => {
    const footGeo = new THREE.CylinderGeometry(0.042, 0.052, 0.06, 16);
    const offsets: [number, number][] = [
      [-halfW, -halfD],
      [halfW, -halfD],
      [-halfW, halfD],
      [halfW, halfD],
    ];
    for (const [fx, fz] of offsets) {
      const foot = new THREE.Mesh(footGeo, steelMat);
      foot.position.set(fx, 0.03, fz);
      foot.castShadow = !isSoftwareGl;
      group.add(foot);
    }
  };

  const makeScreenMesh = (
    w: number,
    h: number,
    tex: THREE.CanvasTexture,
    emissiveStrength = 0.85
  ) =>
    new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: 0xffffff,
        emissiveIntensity: emissiveStrength,
        roughness: 0.16,
        metalness: 0.08,
      })
    );

  const machineGroup = new THREE.Group();

  // 1. SNACK / GOURMET VENDING
  const snacksGroup = new THREE.Group();
  addFeet(snacksGroup, 0.56, 0.34);

  const snackBack = new THREE.Mesh(new THREE.BoxGeometry(1.28, 2.04, 0.44), darkChassisMat);
  snackBack.position.set(0, 1.08, -0.17);
  snackBack.castShadow = !isSoftwareGl;
  snacksGroup.add(snackBack);

  const snackRight = new THREE.Mesh(new THREE.BoxGeometry(0.46, 2.04, 0.36), darkChassisMat);
  snackRight.position.set(0.41, 1.08, 0.23);
  snacksGroup.add(snackRight);

  const snackLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.04, 0.36), darkChassisMat);
  snackLeft.position.set(-0.6, 1.08, 0.23);
  snacksGroup.add(snackLeft);

  const snackBottom = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.36, 0.36), darkChassisMat);
  snackBottom.position.set(-0.19, 0.24, 0.23);
  snacksGroup.add(snackBottom);

  const snackLintel = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.16, 0.36), darkChassisMat);
  snackLintel.position.set(-0.19, 2.02, 0.23);
  snacksGroup.add(snackLintel);

  const snackCrown = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.2, 0.82), steelMat);
  snackCrown.position.set(0, 2.2, 0.02);
  snacksGroup.add(snackCrown);
  const snackSign = makeScreenMesh(1.18, 0.14, snackHeaderTex, 0.55);
  snackSign.position.set(0, 2.2, 0.435);
  snacksGroup.add(snackSign);

  const snackBayBack = new THREE.Mesh(
    new THREE.PlaneGeometry(0.74, 1.52),
    new THREE.MeshStandardMaterial({ color: 0x26242f, roughness: 0.6, metalness: 0.15 })
  );
  snackBayBack.position.set(-0.19, 1.18, 0.075);
  snacksGroup.add(snackBayBack);

  const snackItemMats = [
    new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.35 }),
    new THREE.MeshStandardMaterial({ color: 0xa374ff, roughness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0xe6cf80, roughness: 0.4 }),
    new THREE.MeshStandardMaterial({ color: 0x7ce3b4, roughness: 0.32 }),
  ];
  [0.54, 0.83, 1.12, 1.41, 1.7].forEach((sy, sIdx) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.28), steelMat);
    shelf.position.set(-0.19, sy, 0.22);
    snacksGroup.add(shelf);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.012, 0.016), accentMat);
    led.position.set(-0.19, sy + 0.22, 0.35);
    snacksGroup.add(led);
    for (let slot = 0; slot < 4; slot++) {
      const isBowl = sIdx >= 3;
      const geo = isBowl
        ? new THREE.CylinderGeometry(0.056, 0.044, 0.08, 16)
        : slot % 2 === 0
          ? new THREE.BoxGeometry(0.1, 0.16, 0.08)
          : new THREE.CylinderGeometry(0.036, 0.036, 0.17, 14);
      const item = new THREE.Mesh(geo, snackItemMats[(sIdx + slot) % snackItemMats.length]);
      item.position.set(-0.43 + slot * 0.16, sy + (isBowl ? 0.05 : 0.095), 0.24);
      snacksGroup.add(item);
    }
  });

  const snackGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 1.52), glassMat);
  snackGlass.position.set(-0.19, 1.18, 0.415);
  snackGlass.renderOrder = 3;
  snacksGroup.add(snackGlass);

  const snackBezel = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.64, 0.03), steelMat);
  snackBezel.position.set(0.41, 1.46, 0.415);
  snacksGroup.add(snackBezel);
  const snackScreen = makeScreenMesh(0.32, 0.58, screenTextures.snacks, 0.85);
  snackScreen.position.set(0.41, 1.46, 0.435);
  snacksGroup.add(snackScreen);

  const snackNfc = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.13, 0.04), steelMat);
  snackNfc.position.set(0.41, 1.0, 0.42);
  snacksGroup.add(snackNfc);
  const snackNfcRing = new THREE.Mesh(new THREE.RingGeometry(0.024, 0.032, 24), accentMat);
  snackNfcRing.position.set(0.41, 1.0, 0.444);
  snacksGroup.add(snackNfcRing);

  const snackChute = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.05), steelMat);
  snackChute.position.set(0.41, 0.62, 0.41);
  snacksGroup.add(snackChute);
  const snackChuteHole = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.24, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.85 })
  );
  snackChuteHole.position.set(0.41, 0.62, 0.425);
  snacksGroup.add(snackChuteHole);

  machineGroup.add(snacksGroup);

  // 2. PIZZA VENDING ARCHITECTURE (Twin-Bay Oven Kiosk)
  const pizzaGroup = new THREE.Group();
  addFeet(pizzaGroup, 0.64, 0.35);

  const crimsonTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd94336,
    emissive: 0x7c1d15,
    emissiveIntensity: 0.45,
    roughness: 0.28,
    metalness: 0.4,
  });
  const warmOvenMat = new THREE.MeshStandardMaterial({
    color: 0xffb347,
    emissive: 0xff8c24,
    emissiveIntensity: 1.35,
    roughness: 0.35,
  });

  const pizzaMainBody = new THREE.Mesh(new THREE.BoxGeometry(1.42, 2.02, 0.78), darkChassisMat);
  pizzaMainBody.position.set(0, 1.07, 0.02);
  pizzaMainBody.castShadow = !isSoftwareGl;
  pizzaGroup.add(pizzaMainBody);

  const pizzaHeaderBox = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.28, 0.84), steelMat);
  pizzaHeaderBox.position.set(0, 2.22, 0.02);
  pizzaGroup.add(pizzaHeaderBox);
  const pizzaHeaderPlaque = makeScreenMesh(1.36, 0.2, pizzaTopTex, 0.75);
  pizzaHeaderPlaque.position.set(0, 2.22, 0.446);
  pizzaGroup.add(pizzaHeaderPlaque);

  const pizzaBorderTop = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.024, 0.03), crimsonTrimMat);
  pizzaBorderTop.position.set(0, 2.06, 0.42);
  pizzaGroup.add(pizzaBorderTop);

  const pizzaScreenBezel = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.32, 0.036), crimsonTrimMat);
  pizzaScreenBezel.position.set(-0.28, 1.28, 0.415);
  pizzaGroup.add(pizzaScreenBezel);

  const pizzaScreenMesh = makeScreenMesh(0.66, 1.22, screenTextures.pizza, 0.92);
  pizzaScreenMesh.position.set(-0.28, 1.28, 0.436);
  pizzaGroup.add(pizzaScreenMesh);

  const pizzaBaseAccent = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.3, 0.024), crimsonTrimMat);
  pizzaBaseAccent.position.set(-0.28, 0.38, 0.412);
  pizzaGroup.add(pizzaBaseAccent);

  const hotFreshSign = makeScreenMesh(0.46, 0.16, hotFreshTex, 0.7);
  hotFreshSign.position.set(0.38, 1.84, 0.416);
  pizzaGroup.add(hotFreshSign);

  const ovenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.06), steelMat);
  ovenFrame.position.set(0.38, 1.46, 0.4);
  pizzaGroup.add(ovenFrame);

  const ovenCavity = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.06), warmOvenMat);
  ovenCavity.position.set(0.38, 1.46, 0.415);
  pizzaGroup.add(ovenCavity);

  const pizzaCrust = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.14, 0.025, 24),
    new THREE.MeshStandardMaterial({ color: 0xe3a857, roughness: 0.55 })
  );
  pizzaCrust.rotation.x = 0.22;
  pizzaCrust.position.set(0.38, 1.4, 0.45);
  pizzaGroup.add(pizzaCrust);

  const ovenGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), glassMat);
  ovenGlass.position.set(0.38, 1.46, 0.468);
  ovenGlass.renderOrder = 3;
  pizzaGroup.add(ovenGlass);

  const pizzaStatusSign = makeScreenMesh(0.42, 0.11, pizzaOutTex, 0.8);
  pizzaStatusSign.position.set(0.38, 1.09, 0.416);
  pizzaGroup.add(pizzaStatusSign);

  const pizzaSlotBezel = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.05), steelMat);
  pizzaSlotBezel.position.set(0.38, 0.91, 0.42);
  pizzaGroup.add(pizzaSlotBezel);
  const pizzaSlotOpening = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.065, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0a0909, roughness: 0.9 })
  );
  pizzaSlotOpening.position.set(0.38, 0.91, 0.436);
  pizzaGroup.add(pizzaSlotOpening);

  const pizzaPayPad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.04), steelMat);
  pizzaPayPad.position.set(0.38, 0.66, 0.42);
  pizzaGroup.add(pizzaPayPad);
  const pizzaPayLed = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.034, 24), accentMat);
  pizzaPayLed.position.set(0.38, 0.66, 0.444);
  pizzaGroup.add(pizzaPayLed);

  pizzaGroup.visible = false;
  machineGroup.add(pizzaGroup);

  // 3. MEDICAL VENDING ARCHITECTURE
  const medicalGroup = new THREE.Group();
  addFeet(medicalGroup, 0.58, 0.34);

  const medBack = new THREE.Mesh(new THREE.BoxGeometry(1.34, 2.04, 0.44), clinicalChassisMat);
  medBack.position.set(0, 1.08, -0.17);
  medBack.castShadow = !isSoftwareGl;
  medicalGroup.add(medBack);

  const medRight = new THREE.Mesh(new THREE.BoxGeometry(0.46, 2.04, 0.36), clinicalChassisMat);
  medRight.position.set(0.44, 1.08, 0.23);
  medicalGroup.add(medRight);

  const medLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.04, 0.36), clinicalChassisMat);
  medLeft.position.set(-0.63, 1.08, 0.23);
  medicalGroup.add(medLeft);

  const medBottom = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.26, 0.36), clinicalChassisMat);
  medBottom.position.set(-0.19, 0.19, 0.23);
  medicalGroup.add(medBottom);

  const medLintel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 0.36), clinicalChassisMat);
  medLintel.position.set(-0.19, 1.99, 0.23);
  medicalGroup.add(medLintel);

  const medSign = makeScreenMesh(0.68, 0.13, medHeaderTex, 0.72);
  medSign.position.set(-0.14, 1.99, 0.415);
  medicalGroup.add(medSign);

  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.1, 0.03), accentMat);
  crossV.position.set(-0.54, 1.99, 0.418);
  medicalGroup.add(crossV);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.032, 0.03), accentMat);
  crossH.position.set(-0.54, 1.99, 0.418);
  medicalGroup.add(crossH);

  const medBayBack = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 1.56),
    new THREE.MeshStandardMaterial({
      color: 0xdbe9f6,
      emissive: 0x9ecffa,
      emissiveIntensity: 0.22,
      roughness: 0.45,
    })
  );
  medBayBack.position.set(-0.19, 1.1, 0.075);
  medicalGroup.add(medBayBack);

  const medShelfMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.3 });
  const firstAidRedMat = new THREE.MeshStandardMaterial({ color: 0xd9383a, roughness: 0.32 });
  const sterileWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const pharmaBlueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35 });

  [0.44, 0.74, 1.04, 1.34, 1.64].forEach((sy, sIdx) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.018, 0.28), medShelfMat);
    shelf.position.set(-0.19, sy, 0.22);
    medicalGroup.add(shelf);
    for (let slot = 0; slot < 4; slot++) {
      const px = -0.45 + slot * 0.17;
      const mat =
        (sIdx === 0 || sIdx === 4) && slot === 0
          ? firstAidRedMat
          : (sIdx + slot) % 2 === 0
            ? sterileWhiteMat
            : pharmaBlueMat;
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.09), mat);
      box.position.set(px, sy + 0.09, 0.23);
      medicalGroup.add(box);
    }
  });

  const medGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.56), glassMat);
  medGlass.position.set(-0.19, 1.1, 0.415);
  medGlass.renderOrder = 3;
  medicalGroup.add(medGlass);

  const medMullion = new THREE.Mesh(new THREE.BoxGeometry(0.022, 1.56, 0.026), steelMat);
  medMullion.position.set(-0.19, 1.1, 0.422);
  medicalGroup.add(medMullion);

  const medBezel = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 0.03), steelMat);
  medBezel.position.set(0.44, 1.56, 0.415);
  medicalGroup.add(medBezel);
  const medScreen = makeScreenMesh(0.32, 0.56, screenTextures.medical, 0.86);
  medScreen.position.set(0.44, 1.56, 0.435);
  medicalGroup.add(medScreen);

  const medKeypad = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.04), steelMat);
  medKeypad.position.set(0.44, 1.12, 0.42);
  medicalGroup.add(medKeypad);

  const medPickup1 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.05), steelMat);
  medPickup1.position.set(0.44, 0.82, 0.41);
  medicalGroup.add(medPickup1);
  const medPickup2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.05), steelMat);
  medPickup2.position.set(0.44, 0.46, 0.41);
  medicalGroup.add(medPickup2);

  medicalGroup.visible = false;
  machineGroup.add(medicalGroup);

  // 4. RETURN VENDING ARCHITECTURE (Dual-Stream Reverse Automat)
  const returnGroup = new THREE.Group();
  addFeet(returnGroup, 0.72, 0.36);

  const retUpper = new THREE.Mesh(new THREE.BoxGeometry(1.62, 1.02, 0.8), darkChassisMat);
  retUpper.position.set(0, 1.38, 0.02);
  retUpper.castShadow = !isSoftwareGl;
  returnGroup.add(retUpper);

  const retLower = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.74, 0.8), darkChassisMat);
  retLower.position.set(0, 0.47, 0.02);
  retLower.castShadow = !isSoftwareGl;
  returnGroup.add(retLower);

  const retSeam = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.024, 0.82), steelMat);
  retSeam.position.set(0, 0.86, 0.02);
  returnGroup.add(retSeam);

  const retHeader = makeScreenMesh(0.84, 0.16, returnHeaderTex, 0.72);
  retHeader.position.set(0.24, 1.72, 0.425);
  returnGroup.add(retHeader);

  const retScreenBezel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.68, 0.034), steelMat);
  retScreenBezel.position.set(-0.52, 1.44, 0.42);
  returnGroup.add(retScreenBezel);
  const retScreen = makeScreenMesh(0.34, 0.62, screenTextures.return, 0.9);
  retScreen.position.set(-0.52, 1.44, 0.44);
  returnGroup.add(retScreen);

  const retScanner = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.04), steelMat);
  retScanner.position.set(-0.46, 0.99, 0.425);
  returnGroup.add(retScanner);

  const bowlFrame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.06), steelMat);
  bowlFrame.position.set(0.0, 1.3, 0.415);
  returnGroup.add(bowlFrame);

  const bowlInterior = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.26, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0x0b2019,
      emissive: 0x1e6b4f,
      emissiveIntensity: 0.9,
      roughness: 0.4,
    })
  );
  bowlInterior.position.set(0.0, 1.3, 0.428);
  returnGroup.add(bowlInterior);

  const bowlRamp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.12), steelMat);
  bowlRamp.rotation.x = 0.25;
  bowlRamp.position.set(0.0, 1.18, 0.46);
  returnGroup.add(bowlRamp);

  const drumOuterRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.026, 16, 40), steelMat);
  drumOuterRing.position.set(0.52, 1.3, 0.425);
  returnGroup.add(drumOuterRing);

  const drumGlowRing = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.012, 12, 40), accentMat);
  drumGlowRing.position.set(0.52, 1.3, 0.438);
  returnGroup.add(drumGlowRing);

  const drumHole = new THREE.Mesh(
    new THREE.CircleGeometry(0.155, 32),
    new THREE.MeshStandardMaterial({ color: 0x070809, roughness: 0.95 })
  );
  drumHole.position.set(0.52, 1.3, 0.424);
  returnGroup.add(drumHole);

  const ecoEmblem = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.016, 12, 32, Math.PI * 1.65),
    accentMat
  );
  ecoEmblem.position.set(0.48, 0.5, 0.425);
  returnGroup.add(ecoEmblem);

  returnGroup.visible = false;
  machineGroup.add(returnGroup);

  const categoryGroups: Record<MachineCategoryId, THREE.Group> = {
    medical: medicalGroup,
    pizza: pizzaGroup,
    snacks: snacksGroup,
    return: returnGroup,
  };

  return {
    machineGroup,
    categoryGroups,
    accentMat,
    dispose: () => {
      Object.values(screenTextures).forEach((t) => t.dispose());
      pizzaTopTex.dispose();
      hotFreshTex.dispose();
      pizzaOutTex.dispose();
      snackHeaderTex.dispose();
      medHeaderTex.dispose();
      returnHeaderTex.dispose();
    },
  };
}
