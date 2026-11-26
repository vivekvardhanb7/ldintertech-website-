import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeVenueReelState,
  computeVenueSequenceState,
  DISPENSE_REAL_SCENES,
  HERO_MACHINE_PROFILES,
  VENUE_REAL_SCENES,
  VENUE_REEL_DURATION,
  VENUE_VIDEO_DURATION,
} from './venueSimulation';

test('HERO_MACHINE_PROFILES covers all 4 machine categories with distinct accents', () => {
  const categories = ['medical', 'pizza', 'snacks', 'return'] as const;
  const accents = new Set(categories.map((c) => HERO_MACHINE_PROFILES[c].accentHex));
  assert.equal(accents.size, 4);
  assert.ok(HERO_MACHINE_PROFILES.return.cameraZOffset > HERO_MACHINE_PROFILES.snacks.cameraZOffset);
});

test('computeVenueSequenceState progresses through approach, select, pay, dispense, and exit', () => {
  const approach = computeVenueSequenceState(0.6, 'pizza');
  assert.equal(approach.phase, 'approach');
  assert.ok(approach.customerXRatio > -0.08 && approach.customerXRatio < 0.54);

  const select = computeVenueSequenceState(2.2, 'medical');
  assert.equal(select.phase, 'select');
  assert.ok(select.handRaise > 0.5);

  const pay = computeVenueSequenceState(3.5, 'snacks');
  assert.equal(pay.phase, 'pay');
  assert.ok(pay.nfcPulse > 0);

  const dispense = computeVenueSequenceState(4.5, 'return');
  assert.equal(dispense.phase, 'dispense');
  assert.equal(dispense.label, '04 · Container Accepted');

  const exit = computeVenueSequenceState(5.6, 'pizza');
  assert.equal(exit.phase, 'exit');
  assert.ok(exit.customerXRatio > 0.54);
});

test('computeVenueSequenceState wraps cleanly past loop duration', () => {
  const a = computeVenueSequenceState(1.5, 'snacks');
  const b = computeVenueSequenceState(1.5 + VENUE_VIDEO_DURATION * 3, 'snacks');
  assert.equal(a.phase, b.phase);
  assert.ok(Math.abs(a.customerXRatio - b.customerXRatio) < 1e-6);
});

test('real photographic media mappings exist for all 8 venues and 4 machine categories', () => {
  const expectedVenues = [
    'hospitals',
    'offices',
    'malls',
    'universities',
    'transit',
    'hotels',
    'factories',
    'public',
  ];
  for (const id of expectedVenues) {
    const entry = VENUE_REAL_SCENES[id];
    assert.ok(entry?.image.length > 0, `Missing scene for ${id}`);
    assert.ok(entry.crop.sx >= 0 && entry.crop.sx < 1, `Invalid crop.sx for ${id}`);
    assert.ok(entry.crop.sy >= 0 && entry.crop.sy < 1, `Invalid crop.sy for ${id}`);
    assert.ok(entry.crop.sw > 0.3 && entry.crop.sx + entry.crop.sw <= 1.001, `Invalid crop.sw for ${id}`);
    assert.ok(entry.crop.sh > 0.3 && entry.crop.sy + entry.crop.sh <= 1.001, `Invalid crop.sh for ${id}`);
  }

  const categories = ['medical', 'pizza', 'snacks', 'return'] as const;
  for (const cat of categories) {
    assert.ok(DISPENSE_REAL_SCENES[cat]?.image.length > 0, `Missing dispense scene for ${cat}`);
  }
});

test('computeVenueReelState loops seamlessly across venue, live dispense, and interaction beats', () => {
  const venueBeat = computeVenueReelState(0.8, 'medical');
  assert.equal(venueBeat.beat, 'venue');
  assert.equal(venueBeat.beatIndex, 0);

  const dispenseBeat = computeVenueReelState(2.8, 'pizza');
  assert.equal(dispenseBeat.beat, 'dispense');
  assert.equal(dispenseBeat.beatIndex, 1);
  assert.equal(dispenseBeat.beatTitle, '02 · Hot Pizza Dispensed');

  const interactionBeat = computeVenueReelState(4.9, 'snacks');
  assert.equal(interactionBeat.beat, 'interaction');
  assert.equal(interactionBeat.beatIndex, 2);

  const wrapped = computeVenueReelState(2.8 + VENUE_REEL_DURATION * 2, 'pizza');
  assert.equal(wrapped.beat, dispenseBeat.beat);
});

