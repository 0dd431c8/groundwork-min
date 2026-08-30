/** Minimal ESTree shapes used by the local Oxlint plugins. */

export type Node = {
  type: string;
  body?: Node | undefined;
  imported?: Node | undefined;
  source?: Node | undefined;
  specifiers?: Node[] | undefined;
  value?: unknown;
};

export type Token = { value: string };

export type Loc = { start: { line: number }; end: { line: number } };

export type SourceCode = {
  getLoc: (node: Node) => Loc;
  getTokens: (node: Node) => Token[];
};

export type BaseContext = {
  filename: string;
  sourceCode: SourceCode;
  report: (descriptor: { message: string; node: Node }) => void;
};

export type Rule<Context> = {
  meta?: { docs?: { description: string }; schema?: unknown[] };
  create: (context: Context) => Record<string, (node: Node) => void>;
};
