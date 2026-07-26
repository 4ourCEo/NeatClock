import { describe, expect, it } from 'vitest';
import { buildInitialInterestState, validateInterestForm } from './interestForm.js';

describe('buildInitialInterestState', () => {
  it('matches an active preset by value', () => {
    expect(buildInitialInterestState("Homeowner's Sentinel")).toEqual({
      preset: "Homeowner's Sentinel",
      interests: [],
      purchaseIntent: '',
      email: '',
    });
  });

  it('falls back to Custom when the active preset has no match', () => {
    expect(buildInitialInterestState('Something Unknown').preset).toBe('Custom');
  });

  it('falls back to Custom when no active preset is given', () => {
    expect(buildInitialInterestState(undefined).preset).toBe('Custom');
  });
});

describe('validateInterestForm', () => {
  const validState = {
    preset: 'Custom',
    interests: ['free-enough'],
    purchaseIntent: 'no',
    email: '',
  };

  it('passes for a fully valid state with no email', () => {
    expect(validateInterestForm(validState)).toBeNull();
  });

  it('requires a preset', () => {
    expect(validateInterestForm({ ...validState, preset: '' })).toMatch(/schedule type/);
  });

  it('requires at least one interest', () => {
    expect(validateInterestForm({ ...validState, interests: [] })).toMatch(/at least one/);
  });

  it('requires purchase intent', () => {
    expect(validateInterestForm({ ...validState, purchaseIntent: '' })).toMatch(/print pack/);
  });

  it('rejects a malformed email', () => {
    expect(validateInterestForm({ ...validState, email: 'not-an-email' })).toMatch(
      /valid email/,
    );
  });

  it('accepts a well-formed email', () => {
    expect(validateInterestForm({ ...validState, email: 'a@b.com' })).toBeNull();
  });

  it('accepts a blank email', () => {
    expect(validateInterestForm({ ...validState, email: '' })).toBeNull();
  });
});
