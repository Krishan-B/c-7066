import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should confirm environment is working', () => {
    expect(typeof process).toBe('object');
    expect(typeof process.env).toBe('object');
  });
});
