import { describe, expect, it } from 'vitest';
import { cn } from './utils.js';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resolves Tailwind conflicts with the last wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('skips falsy values', () => {
    const hidden = false;
    expect(cn('block', hidden && 'hidden', null, undefined, 'text-sm')).toBe('block text-sm');
  });
});
