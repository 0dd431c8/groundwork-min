import { describe, expect, it } from 'vitest';
import { type Finding, lintWithProjectConfig } from './test/harness.ts';

function only(findings: Finding[], rule: string): number[] {
  return findings.filter((finding) => finding.rule === rule).map((finding) => finding.line);
}

describe('local lint configuration', () => {
  it('enables the boundary rule', async () => {
    const found = await lintWithProjectConfig(
      "import '../adapters/cli.ts';",
      'src/core/example.ts',
    );

    expect(only(found, 'boundary(dependency-direction)')).toEqual([1]);
  });

  it('enables the duplicate-function rule', async () => {
    const functionBody = `
      const normalized = value.trim().toLowerCase();
      const words = normalized.split(/\\s+/u).filter(Boolean);
      return words.join('-') + normalized.length;
    `;
    const found = await lintWithProjectConfig(
      `function first(value: string): string {${functionBody}}
       function second(value: string): string {${functionBody}}
       export { first, second };`,
      'src/core/example.ts',
    );

    expect(only(found, 'dry(no-identical-functions)')).toEqual([6]);
  });
});
