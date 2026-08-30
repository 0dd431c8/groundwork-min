import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { onTestFinished } from 'vitest';

const repo = resolve(import.meta.dirname, '..', '..');
const oxlint = join(repo, 'node_modules', '.bin', 'oxlint');
const projectConfig = join(repo, '.oxlintrc.jsonc');
const plugins = [
  { name: 'boundary', specifier: join(repo, 'lint', 'boundary.ts') },
  { name: 'dry', specifier: join(repo, 'lint', 'dry.ts') },
];

export type Finding = { rule: string; message: string; help: string; line: number };

type Diagnostic = {
  code?: string;
  message?: string;
  help?: string;
  labels?: { span?: { line?: number } }[];
};

export async function lint(
  source: string,
  rules: Record<string, unknown>,
  name = 'case.ts',
): Promise<Finding[]> {
  const dir = await mkdtemp(join(tmpdir(), 'lint-'));
  onTestFinished(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const config = { jsPlugins: plugins, plugins: [], categories: {}, rules };
  const path = join(dir, 'config.json');
  await writeFile(path, JSON.stringify(config));
  await writeFixture(dir, name, source);

  return parse(await capture(dir, name, path));
}

export async function lintWithProjectConfig(source: string, name: string): Promise<Finding[]> {
  const dir = await mkdtemp(join(tmpdir(), 'lint-'));
  onTestFinished(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  await writeFixture(dir, name, source);
  return parse(await capture(dir, name, projectConfig));
}

async function writeFixture(dir: string, name: string, source: string): Promise<void> {
  const path = join(dir, name);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, source);
}

function capture(dir: string, name: string, config: string): Promise<string> {
  const args = ['-f', 'json', '--no-ignore', '-c', config, join(dir, name)];
  return new Promise((settle, fail) => {
    execFile(oxlint, args, { cwd: dir }, (error, stdout) => {
      if (stdout === '') fail(error ?? new Error('oxlint produced no output'));
      else settle(stdout);
    });
  });
}

function parse(stdout: string): Finding[] {
  // The JSON reporter has no exported runtime schema.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const { diagnostics } = JSON.parse(stdout) as { diagnostics: Diagnostic[] };
  return diagnostics.map((entry) => ({
    rule: entry.code ?? '',
    message: entry.message ?? '',
    help: entry.help ?? '',
    line: entry.labels?.[0]?.span?.line ?? -1,
  }));
}
