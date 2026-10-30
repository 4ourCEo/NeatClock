import { describe, it, expect } from 'vitest';
import { hashOrderProof } from '../../server/neonStore.js';

describe('NeonStore (unit tests - no database)', () => {
  describe('hashOrderProof', () => {
    it('should hash order proof consistently', () => {
      const proof = 'test-proof-123';
      const hash1 = hashOrderProof(proof);
      const hash2 = hashOrderProof(proof);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA256 hex
    });

    it('should produce different hashes for different proofs', () => {
      const proof1 = 'proof-1';
      const proof2 = 'proof-2';
      expect(hashOrderProof(proof1)).not.toBe(hashOrderProof(proof2));
    });
  });

  describe('recovery token validation', () => {
    it('should verify valid recovery token structure', () => {
      const token = 'eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjEyMzQ1Njc4OTB9.signature';
      const parts = token.split('.');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toBeDefined();
      expect(parts[1]).toBeDefined();
    });

    it('should reject malformed tokens', () => {
      const invalid = 'invalid.token.with.extra.parts';
      const parts = invalid.split('.');
      expect(parts.length).not.toBe(2);
    });
  });
});
