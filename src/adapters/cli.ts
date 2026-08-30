import { createGreeting } from '../core/greeting.ts';

const USAGE = 'Usage: groundwork-min <name>\n';

export type CliIo = {
  readonly writeStdout: (message: string) => void;
  readonly writeStderr: (message: string) => void;
};

type ParsedArguments =
  | { readonly kind: 'greet'; readonly name: string }
  | { readonly kind: 'help' }
  | { readonly kind: 'error'; readonly message: string };

function parseArguments(args: readonly string[]): ParsedArguments {
  if (args.length === 1 && args[0] === '--help') return { kind: 'help' };
  if (args.length === 0) return { kind: 'error', message: 'Expected one name.' };
  if (args.length > 1) return { kind: 'error', message: 'Expected exactly one name.' };

  const name = args[0]?.trim() ?? '';
  if (name.length === 0) return { kind: 'error', message: 'Name must not be blank.' };
  if (name.startsWith('-')) return { kind: 'error', message: `Unknown option: ${name}` };
  return { kind: 'greet', name };
}

export function runCli(args: readonly string[], io: CliIo): number {
  const parsed = parseArguments(args);
  if (parsed.kind === 'help') {
    io.writeStdout(USAGE);
    return 0;
  }
  if (parsed.kind === 'error') {
    io.writeStderr(`${parsed.message}\n${USAGE}`);
    return 2;
  }

  io.writeStdout(`${createGreeting(parsed.name)}\n`);
  return 0;
}
