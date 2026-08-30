import { describe, expect, it } from 'vitest';
import { runCli } from './cli.ts';

type CliResult = {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
};

function invoke(args: readonly string[]): CliResult {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const code = runCli(args, {
    writeStdout: (message) => {
      stdout.push(message);
    },
    writeStderr: (message) => {
      stderr.push(message);
    },
  });
  return { code, stdout: stdout.join(''), stderr: stderr.join('') };
}

describe('runCli', () => {
  it('greets a trimmed positional name', () => {
    expect(invoke(['  Ada  '])).toEqual({
      code: 0,
      stdout: 'Hello, Ada!\n',
      stderr: '',
    });
  });

  it('prints help to stdout', () => {
    expect(invoke(['--help'])).toEqual({
      code: 0,
      stdout: 'Usage: groundwork-min <name>\n',
      stderr: '',
    });
  });

  it.each([
    { args: [], message: 'Expected one name.' },
    { args: ['  '], message: 'Name must not be blank.' },
    { args: ['Ada', 'Lovelace'], message: 'Expected exactly one name.' },
    { args: ['--unknown'], message: 'Unknown option: --unknown' },
  ])('reports invalid arguments to stderr: $message', ({ args, message }) => {
    expect(invoke(args)).toEqual({
      code: 2,
      stdout: '',
      stderr: `${message}\nUsage: groundwork-min <name>\n`,
    });
  });
});
