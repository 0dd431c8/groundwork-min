import { describe, expect, it } from 'vitest';
import { lint } from './test/harness.ts';

const identical = { 'dry/no-identical-functions': 'error' };
const body = `const rounded = Math.round(value * 100) / 100;
     const sign = rounded < 0 ? '-' : '';
     return sign + '$' + Math.abs(rounded).toFixed(2);`;

describe('dry/no-identical-functions', () => {
  it('reports the second identical function', async () => {
    const found = await lint(
      `export function priceLabel(value: number) {
         ${body}
       }
       export function costLabel(value: number) {
         ${body}
       }`,
      identical,
    );

    expect(found).toHaveLength(1);
    expect(found[0]?.rule).toBe('dry(no-identical-functions)');
    expect(found[0]?.message).toContain('identical to the one on line 1');
  });

  it('ignores a body below the token floor', async () => {
    const found = await lint(
      `export function open(id: string) {
         setOpen(id);
       }
       export function reopen(id: string) {
         setOpen(id);
       }`,
      identical,
    );

    expect(found).toEqual([]);
  });

  it('takes a configured token floor', async () => {
    const found = await lint(
      `export function open(id: string) {
         setOpen(id);
         return null;
       }
       export function reopen(id: string) {
         setOpen(id);
         return null;
       }`,
      { 'dry/no-identical-functions': ['error', { minTokens: 5 }] },
    );

    expect(found).toHaveLength(1);
  });
});
