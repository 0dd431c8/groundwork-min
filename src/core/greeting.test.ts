import { describe, expect, it } from 'vitest';
import { createGreeting } from './greeting.ts';

describe('createGreeting', () => {
  it('creates a greeting for a normalized name', () => {
    expect(createGreeting('Ada')).toBe('Hello, Ada!');
  });
});
