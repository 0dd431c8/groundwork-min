import { runCli, type CliIo } from './adapters/cli.ts';

const io: CliIo = {
  writeStdout(message) {
    process.stdout.write(message);
  },
  writeStderr(message) {
    process.stderr.write(message);
  },
};

process.exitCode = runCli(process.argv.slice(2), io);
