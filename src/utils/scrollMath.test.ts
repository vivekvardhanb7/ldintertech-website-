import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp01, computeHeroScrollPose, latLonToCartesian } from './scrollMath';

test('clamp01 clamps out-of-range and NaN values', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.8), 1);
  assert.equal(clamp01(NaN), 0);
  assert.equal(clamp01(0.42), 0.42);
});

test('computeHeroScrollPose interpolates camera closer and rotates machine smoothly', () => {
  const start = computeHeroScrollPose(0);
  const end = computeHeroScrollPose(1);

  assert.ok(end.camZ < start.camZ, 'Camera should move closer on scroll');
  assert.ok(end.rotY > start.rotY, 'Machine should rotate smoothly across scroll');
  assert.ok(end.glowIntensity > start.glowIntensity, 'Internal illumination should intensify');
});

test('latLonToCartesian maps coordinates onto exact sphere radius', () => {
  const radius = 2.0;
  const pt = latLonToCartesian(16.5062, 80.648, radius);
  const dist = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
  assert.ok(Math.abs(dist - radius) < 1e-6);
});
