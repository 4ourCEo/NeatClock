import { describe, expect, it } from 'vitest';
import { buildInitialInterestState, validateInterestForm } from './interestForm.js';

describe('buildInitialInterestState', () => {
  it('matches an active preset by value in pre_launch mode', () => {
    expect(buildInitialInterestState("Homeowner's Sentinel", 'pre_launch')).toEqual({
      preset: "Homeowner's Sentinel",
      interests: [],
      purchaseIntent: '',
      email: '',
    });
  });

  it('builds post_launch state with different fields', () => {
    expect(buildInitialInterestState("Preventive Gearhead", 'post_launch')).toEqual({
      preset: "Preventive Gearhead",
      ctaFeel: '',
      priceFeel: '',
      nextInterest: [],
      note: '',
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
  const validPreLaunchState = {
    preset: 'Custom',
    interests: ['free-enough'],
    purchaseIntent: 'no',
    email: '',
  };

  const validPostLaunchState = {
    preset: 'Custom',
    ctaFeel: 'fine',
    priceFeel: 'fair',
    nextInterest: ['free-enough'],
    note: '',
    email: '',
  };

  it('passes for a fully valid pre_launch state', () => {
    expect(validateInterestForm(validPreLaunchState, 'pre_launch')).toBeNull();
  });

  it('passes for a fully valid post_launch state', () => {
    expect(validateInterestForm(validPostLaunchState, 'post_launch')).toBeNull();
  });

  it('requires a preset in both modes', () => {
    expect(validateInterestForm({ ...validPreLaunchState, preset: '' }, 'pre_launch')).toMatch(/schedule type/);
    expect(validateInterestForm({ ...validPostLaunchState, preset: '' }, 'post_launch')).toMatch(/schedule type/);
  });

  it('requires interests in pre_launch mode', () => {
    expect(validateInterestForm({ ...validPreLaunchState, interests: [] }, 'pre_launch')).toMatch(/at least one/);
  });

  it('requires nextInterest in post_launch mode', () => {
    expect(validateInterestForm({ ...validPostLaunchState, nextInterest: [] }, 'post_launch')).toMatch(/at least one/);
  });

  it('requires purchase intent in pre_launch mode', () => {
    expect(validateInterestForm({ ...validPreLaunchState, purchaseIntent: '' }, 'pre_launch')).toMatch(/print pack/);
  });

  it('requires ctaFeel in post_launch mode', () => {
    expect(validateInterestForm({ ...validPostLaunchState, ctaFeel: '' }, 'post_launch')).toMatch(/CTAs feel/);
  });

  it('requires priceFeel in post_launch mode', () => {
    expect(validateInterestForm({ ...validPostLaunchState, priceFeel: '' }, 'post_launch')).toMatch(/pricing/);
  });

  it('rejects a malformed email in both modes', () => {
    expect(validateInterestForm({ ...validPreLaunchState, email: 'not-an-email' }, 'pre_launch')).toMatch(/valid email/);
    expect(validateInterestForm({ ...validPostLaunchState, email: 'not-an-email' }, 'post_launch')).toMatch(/valid email/);
  });

  it('accepts a well-formed email in both modes', () => {
    expect(validateInterestForm({ ...validPreLaunchState, email: 'a@b.com' }, 'pre_launch')).toBeNull();
    expect(validateInterestForm({ ...validPostLaunchState, email: 'a@b.com' }, 'post_launch')).toBeNull();
  });

  it('accepts a blank email in both modes', () => {
    expect(validateInterestForm({ ...validPreLaunchState, email: '' }, 'pre_launch')).toBeNull();
    expect(validateInterestForm({ ...validPostLaunchState, email: '' }, 'post_launch')).toBeNull();
  });
});
