import { describe, expect, it } from 'vitest';
import { type Finding, lint } from './test/harness.ts';

const boundary = { 'boundary/dependency-direction': 'error' };
const RULE = 'boundary(dependency-direction)';

function onlyBoundary(findings: Finding[]): Finding[] {
  return findings.filter((finding) => finding.rule === RULE);
}

describe('boundary/dependency-direction', () => {
  it('rejects platform modules in core', async () => {
    const found = await lint(
      "import { readFile } from 'node:fs/promises';\nimport { file } from 'bun';",
      boundary,
      'src/core/read.ts',
    );

    const boundaryFindings = onlyBoundary(found);
    expect(boundaryFindings.map((finding) => finding.line)).toEqual([1, 2]);
    expect(boundaryFindings[0]?.message).toContain('portable core');
  });

  it('rejects adapter and main imports from core', async () => {
    const found = await lint(
      "import '../adapters/cli.ts';\nimport '../main.ts';",
      boundary,
      'src/core/read.ts',
    );

    expect(onlyBoundary(found).map((finding) => finding.line)).toEqual([1, 2]);
  });

  it('rejects main imports from an adapter', async () => {
    const found = await lint("import '../main.ts';", boundary, 'src/adapters/cli.ts');

    const boundaryFindings = onlyBoundary(found);
    expect(boundaryFindings).toHaveLength(1);
    expect(boundaryFindings[0]?.message).toContain('cannot import main');
  });

  it('allows dependencies pointing toward core', async () => {
    const core = await lint("import './name.ts';", boundary, 'src/core/greeting.ts');
    const adapter = await lint(
      "import { createGreeting } from '../core/greeting.ts';",
      boundary,
      'src/adapters/cli.ts',
    );
    const main = await lint("import { runCli } from './adapters/cli.ts';", boundary, 'src/main.ts');

    expect(onlyBoundary([...core, ...adapter, ...main])).toEqual([]);
  });

  it('does not classify test files as production layers', async () => {
    const found = await lint("import '../adapters/cli.ts';", boundary, 'src/core/a.test.ts');

    expect(onlyBoundary(found)).toEqual([]);
  });
});
