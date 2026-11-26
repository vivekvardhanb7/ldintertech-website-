import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConsultationInput } from './validation';

test('rejects invalid email and short required fields', () => {
  const result = validateConsultationInput({
    name: 'A',
    company: '',
    email: 'invalid-email',
    phone: 'abc',
    productCategory: 'Medical Vending Machine',
    location: 'X',
    message: 'Hi',
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.company);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.location);
  assert.ok(result.errors.message);
});

test('accepts valid consultation payload and trims whitespace', () => {
  const result = validateConsultationInput({
    name: '  Aarav Reddy  ',
    company: '  Apollo Health Hubs ',
    email: 'aarav@apollohubs.example',
    phone: '+91 98480 12345',
    productCategory: 'Pizza Vending Machine',
    location: 'Hyderabad, India',
    message: 'Interested in deploying 4 pizza vending machines across metro transit hubs.',
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.sanitized.name, 'Aarav Reddy');
  assert.equal(result.sanitized.company, 'Apollo Health Hubs');
  assert.equal(result.sanitized.productCategory, 'Pizza Vending Machine');
});

test('flags unknown product category option', () => {
  const result = validateConsultationInput({
    name: 'Elena Weber',
    company: 'Campus Dining Group',
    email: 'elena@campusdining.example',
    phone: '',
    productCategory: 'Unknown Machine',
    location: 'Munich',
    message: 'Looking for automated campus food and snack dispensing machines.',
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.productCategory);
});
