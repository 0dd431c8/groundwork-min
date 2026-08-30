/** Detects identical function bodies within one file. */

import type { BaseContext, Node, Rule, Token } from './types.ts';

type Options = { minTokens?: number } | undefined;
type Context = BaseContext & { options: readonly Options[] };

const DEFAULT_MIN_TOKENS = 30;

function signature(tokens: Token[]): string {
  return tokens.map((token) => token.value).join(' ');
}

const noIdenticalFunctions: Rule<Context> = {
  meta: {
    docs: { description: 'Disallow two functions in one file with identical bodies' },
    schema: [
      {
        type: 'object',
        properties: { minTokens: { type: 'number' } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const minTokens = context.options[0]?.minTokens ?? DEFAULT_MIN_TOKENS;
    const firstSeenAt = new Map<string, number>();

    function check(node: Node): void {
      const body = node.body;
      if (body === undefined) return;

      const tokens = context.sourceCode.getTokens(body);
      if (tokens.length < minTokens) return;

      const key = signature(tokens);
      const first = firstSeenAt.get(key);
      if (first === undefined) {
        firstSeenAt.set(key, context.sourceCode.getLoc(node).start.line);
        return;
      }

      context.report({
        message:
          `This body is identical to the one on line ${first}. Two copies of one implementation ` +
          'drift, and then neither is the answer: keep one and pass what differs as an argument.',
        node,
      });
    }

    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
    };
  },
};

export default {
  meta: { name: 'dry' },
  rules: { 'no-identical-functions': noIdenticalFunctions },
};
