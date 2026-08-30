/** Formats and lint-fixes staged files, re-stages them, then typechecks every TS program. */

const SOURCE_FILE = /\.([cm]?[jt]sx?|css|ya?ml|jsonc?|md)$/u;

function fail(message: string): never {
  console.error(`pre-commit: ${message}`);
  process.exit(1);
}

async function gitPaths(...args: string[]): Promise<string[]> {
  const proc = Bun.spawn(['git', ...args, '-z'], { stdout: 'pipe', stderr: 'inherit' });
  const stdout = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0) fail(`\`git ${args.join(' ')}\` failed`);
  return stdout.split('\0').filter(Boolean);
}

async function run(cmd: string[]): Promise<number> {
  const proc = Bun.spawn(cmd, { stdout: 'inherit', stderr: 'inherit' });
  return await proc.exited;
}

async function assertFullyStaged(files: string[]): Promise<void> {
  const unstaged = new Set(await gitPaths('diff', '--name-only'));
  const partial = files.filter((file) => unstaged.has(file));
  if (partial.length === 0) return;
  fail(
    `these files are only partially staged, so auto-fixing them would pull in unstaged changes:\n` +
      partial.map((file) => `  ${file}`).join('\n') +
      `\nStage or stash the rest, or commit with --no-verify.`,
  );
}

async function fixStaged(files: string[]): Promise<void> {
  if ((await run(['bunx', 'oxfmt', '--no-error-on-unmatched-pattern', ...files])) !== 0) {
    fail('formatting failed');
  }
  if ((await run(['bunx', 'oxlint', '--fix', '--no-error-on-unmatched-pattern', ...files])) !== 0) {
    fail('lint errors remain after --fix');
  }
  if ((await run(['bunx', 'oxfmt', '--no-error-on-unmatched-pattern', ...files])) !== 0) {
    fail('formatting failed');
  }
  if ((await run(['git', 'add', '--', ...files])) !== 0) fail('could not re-stage fixed files');
}

const staged = (await gitPaths('diff', '--cached', '--name-only', '--diff-filter=ACMR')).filter(
  (file) => SOURCE_FILE.test(file),
);

if (staged.length > 0) {
  await assertFullyStaged(staged);
  await fixStaged(staged);
}

if ((await run(['bun', 'run', 'typecheck'])) !== 0) fail('typecheck failed');
