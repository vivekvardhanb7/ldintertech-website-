import type { MachineCategoryId } from '../data/vendingCatalog';

export const VENUE_VIDEO_DURATION = 6;

export type VenuePhaseId = 'approach' | 'select' | 'pay' | 'dispense' | 'exit';

export interface VenueSequenceState {
  progress: number;
  phase: VenuePhaseId;
  label: string;
  stepIndex: number;
  customerXRatio: number;
  walkStride: number;
  handRaise: number;
  nfcPulse: number;
  actionProgress: number;
}

export interface HeroMachineVisualProfile {
  subtitle: string;
  accentHex: number;
  accentCss: string;
  cameraZOffset: number;
  lookAtY: number;
}

export const HERO_MACHINE_PROFILES: Record<MachineCategoryId, HeroMachineVisualProfile> = {
  medical: {
    subtitle: 'DUAL-DOOR CLINICAL DISPENSER',
    accentHex: 0x9ecffa,
    accentCss: '#9ECFFA',
    cameraZOffset: 0.0,
    lookAtY: 1.08,
  },
  pizza: {
    subtitle: 'TWIN-BAY HOT PIZZA KIOSK',
    accentHex: 0xe6cf80,
    accentCss: '#E6CF80',
    cameraZOffset: 0.22,
    lookAtY: 1.08,
  },
  snacks: {
    subtitle: 'GLASS-FRONT GOURMET & SNACK',
    accentHex: 0xa374ff,
    accentCss: '#A374FF',
    cameraZOffset: 0.0,
    lookAtY: 1.08,
  },
  return: {
    subtitle: 'DUAL-STREAM REVERSE AUTOMAT',
    accentHex: 0x7ce3b4,
    accentCss: '#7CE3B4',
    cameraZOffset: 0.34,
    lookAtY: 0.96,
  },
};

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(edge1 - edge0, 1e-6));
  return t * t * (3 - 2 * t);
}

/**
 * Computes deterministic customer-to-machine choreography across the fast 6-second loop.
 */
export function computeVenueSequenceState(
  timeSeconds: number,
  machineCategory: MachineCategoryId,
  durationSeconds = VENUE_VIDEO_DURATION
): VenueSequenceState {
  const safeDuration = Math.max(durationSeconds, 1);
  const wrapped = ((timeSeconds % safeDuration) + safeDuration) % safeDuration;
  const p = clamp01(wrapped / safeDuration);

  // Machine kiosk center sits at ~0.64 horizontal canvas width; interaction panel at ~0.55
  const stopX = machineCategory === 'return' ? 0.52 : 0.54;

  if (p < 0.28) {
    const local = smoothstep(0, 0.28, p);
    return {
      progress: p,
      phase: 'approach',
      label: '01 · Approaching Kiosk',
      stepIndex: 0,
      customerXRatio: -0.08 + local * (stopX + 0.08),
      walkStride: Math.sin(wrapped * 12.0),
      handRaise: 0,
      nfcPulse: 0,
      actionProgress: 0,
    };
  }

  if (p < 0.5) {
    const local = clamp01((p - 0.28) / 0.22);
    return {
      progress: p,
      phase: 'select',
      label: machineCategory === 'return' ? '02 · Scanning Return' : '02 · Selecting on Touchscreen',
      stepIndex: 1,
      customerXRatio: stopX,
      walkStride: 0,
      handRaise: smoothstep(0, 0.35, local) * (1 - 0.15 * smoothstep(0.75, 1, local)),
      nfcPulse: 0,
      actionProgress: local,
    };
  }

  if (p < 0.66) {
    const local = clamp01((p - 0.5) / 0.16);
    return {
      progress: p,
      phase: 'pay',
      label: machineCategory === 'return' ? '03 · Validating Deposit' : '03 · Tap-to-Pay NFC',
      stepIndex: 2,
      customerXRatio: stopX,
      walkStride: 0,
      handRaise: 0.75,
      nfcPulse: local,
      actionProgress: local,
    };
  }

  if (p < 0.86) {
    const local = clamp01((p - 0.66) / 0.2);
    const dispenseLabel =
      machineCategory === 'pizza'
        ? '04 · Hot Pizza Ready'
        : machineCategory === 'return'
          ? '04 · Container Accepted'
          : '04 · Item Dispensed';
    return {
      progress: p,
      phase: 'dispense',
      label: dispenseLabel,
      stepIndex: 3,
      customerXRatio: stopX,
      walkStride: 0,
      handRaise: 0.4 * (1 - local),
      nfcPulse: 0,
      actionProgress: local,
    };
  }

  const local = smoothstep(0.86, 1.0, p);
  return {
    progress: p,
    phase: 'exit',
    label: '05 · Continuous High-Traffic Flow',
    stepIndex: 4,
    customerXRatio: stopX + local * (1.12 - stopX),
    walkStride: Math.sin(wrapped * 12.0),
    handRaise: 0,
    nfcPulse: 0,
    actionProgress: 1,
  };
}

export const VENUE_REEL_DURATION = 6;

export type ReelBeatId = 'venue' | 'dispense' | 'interaction';

export interface VenueMediaCrop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface VenueMediaEntry {
  image: string;
  alt: string;
  caption: string;
  crop: VenueMediaCrop;
}

export const VENUE_REAL_SCENES: Record<string, VenueMediaEntry> = {
  hospitals: {
    image: '/src/assets/images/venue_hospital_real_1795449908947.jpg',
    alt: 'Hospital staff and doctors walking through a sunlit Ward 4 clinical corridor',
    caption: 'Medical staff & visitors moving through Ward 4 corridors with 24/7 automated access.',
    crop: { sx: 0.0, sy: 0.08, sw: 0.5, sh: 0.84 },
  },
  offices: {
    image: '/src/assets/images/venue_office_real_1795449907915.jpg',
    alt: 'Corporate professionals walking across a glass and timber workplace atrium',
    caption: 'Teams tapping NFC badges inside the multi-tenant workplace atrium.',
    crop: { sx: 0.0, sy: 0.06, sw: 0.54, sh: 0.88 },
  },
  malls: {
    image: '/src/assets/images/venue_mall_real_1795449908288.jpg',
    alt: 'Shoppers walking along a sunlit shopping mall concourse near the food court exit',
    caption: 'High-footfall mall shoppers passing the food court exit concourse.',
    crop: { sx: 0.0, sy: 0.06, sw: 0.64, sh: 0.88 },
  },
  universities: {
    image: '/src/assets/images/venue_university_real_1795449908744.jpg',
    alt: 'University students studying and walking across a twilight timber-beam campus hall',
    caption: 'Students accessing round-the-clock convenience inside campus commons.',
    crop: { sx: 0.56, sy: 0.1, sw: 0.44, sh: 0.78 },
  },
  transit: {
    image: '/assets/backgrounds/architectural-transit-hub.jpg',
    alt: 'Travelers with luggage walking through a modern airport and rail concourse',
    caption: 'Passengers with luggage moving across airport and railway transit gates.',
    crop: { sx: 0.31, sy: 0.05, sw: 0.69, sh: 0.9 },
  },
  hotels: {
    image: '/src/assets/images/venue_hotel_real_1795449908234.jpg',
    alt: 'Warm architectural hotel reception lobby and evening guest lounge',
    caption: 'Late-arrival hotel guests accessing 24/7 unattended lobby convenience.',
    crop: { sx: 0.0, sy: 0.12, sw: 0.4, sh: 0.72 },
  },
  factories: {
    image: '/src/assets/images/venue_factory_real_1795449908361.jpg',
    alt: 'Industrial facility engineers in safety vests walking through a bright factory break hall',
    caption: 'Multi-shift engineering crews moving through industrial shift changeover halls.',
    crop: { sx: 0.0, sy: 0.05, sw: 0.61, sh: 0.9 },
  },
  public: {
    image: '/src/assets/images/venue_public_real_1795449908533.jpg',
    alt: 'Evening pedestrians passing a sheltered architectural pavilion at a civic station plaza',
    caption: 'Urban commuters passing through illuminated civic plaza walkways.',
    crop: { sx: 0.0, sy: 0.06, sw: 0.64, sh: 0.88 },
  },
};

export const DISPENSE_REAL_SCENES: Record<
  MachineCategoryId,
  Omit<VenueMediaEntry, 'crop'> & { actionTitle: string }
> = {
  medical: {
    image: '/src/assets/images/dispense_medical_real_1795449908110.jpg',
    alt: 'Nurse retrieving a sealed first-aid kit from an illuminated smart medical vending bay',
    actionTitle: '02 · Live Medical Dispensing',
    caption: 'Controlled bay unlocks smoothly after touchscreen verification and badge/NFC tap.',
  },
  pizza: {
    image: '/src/assets/images/dispense_pizza_real_1795449909140.jpg',
    alt: 'Customer pulling a hot freshly boxed pizza out of the heated stainless chute',
    actionTitle: '02 · Hot Pizza Dispensed',
    caption: 'Automated oven-to-chute transfer serves piping hot boxed artisan pizza on demand.',
  },
  snacks: {
    image: '/src/assets/images/dispense_snacks_real_1795449908864.jpg',
    alt: 'Office professional collecting a chilled bottle and salad bowl from the retrieve bay after NFC payment',
    actionTitle: '02 · Instant Grab & Go Pickup',
    caption: 'Contactless tap-to-pay confirms instantly and delivers chilled drinks and fresh bowls.',
  },
  return: {
    image: '/src/assets/images/dispense_return_real_1795449908632.jpg',
    alt: 'Customer placing a reusable tumbler into the glowing return intake drum beside an optical conveyor bay',
    actionTitle: '02 · Automated Container Intake',
    caption: 'Optical sensors verify returned cups and bottles while crediting user accounts immediately.',
  },
};

export interface VenueReelState {
  beat: ReelBeatId;
  beatIndex: 0 | 1 | 2;
  loopProgress: number;
  beatProgress: number;
  beatTitle: string;
  scale: number;
  panXPercent: number;
  panYPercent: number;
}

/**
 * Computes brisk 6-second continuous 3-cut GIF/video reel choreography:
 * Cut 0 (0.00 - 0.34): Real selected venue footfall with bold camera push & lateral sweep.
 * Cut 1 (0.34 - 0.68): Real human live product dispensing / intake close-up.
 * Cut 2 (0.68 - 1.00): Dynamic touchscreen & contactless cashless pull-back.
 */
export function computeVenueReelState(
  timeSeconds: number,
  machineCategory: MachineCategoryId,
  durationSeconds = VENUE_REEL_DURATION
): VenueReelState {
  const safeDuration = Math.max(durationSeconds, 1);
  const wrapped = ((timeSeconds % safeDuration) + safeDuration) % safeDuration;
  const p = clamp01(wrapped / safeDuration);

  if (p < 0.34) {
    const bp = clamp01(p / 0.34);
    return {
      beat: 'venue',
      beatIndex: 0,
      loopProgress: p,
      beatProgress: bp,
      beatTitle: '01 · Live Venue Footfall',
      scale: 1 + bp * 0.11,
      panXPercent: -2.4 + bp * 4.8,
      panYPercent: 0,
    };
  }

  if (p < 0.68) {
    const bp = clamp01((p - 0.34) / 0.34);
    return {
      beat: 'dispense',
      beatIndex: 1,
      loopProgress: p,
      beatProgress: bp,
      beatTitle: DISPENSE_REAL_SCENES[machineCategory].actionTitle,
      scale: 1.02 + bp * 0.1,
      panXPercent: 2.0 - bp * 4.0,
      panYPercent: -0.6 + bp * 1.2,
    };
  }

  const bp = clamp01((p - 0.68) / 0.32);
  return {
    beat: 'interaction',
    beatIndex: 2,
    loopProgress: p,
    beatProgress: bp,
    beatTitle: '03 · Contactless UI & Telemetry',
    scale: 1.15 - bp * 0.11,
    panXPercent: -1.6 + bp * 3.2,
    panYPercent: 1.2 - bp * 2.4,
  };
}


