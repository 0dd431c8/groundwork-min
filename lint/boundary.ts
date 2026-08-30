/** Enforces the portable-core dependency direction documented in AGENTS.md. */

import { builtinModules } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { BaseContext, Node, Rule } from './types.ts';

type Layer = 'core' | 'adapter' | 'main';
type Context = BaseContext;

const NODE_MODULES = new Set(
  builtinModules.flatMap((name) => [
    name,
    name.startsWith('node:') ? name.slice(5) : `node:${name}`,
  ]),
);

function normalize(path: string): string {
  return path.replaceAll('\\', '/');
}

function layerOfPath(path: string): Layer | undefined {
  const normalized = normalize(path);
  if (normalized.includes('/src/core/')) return 'core';
  if (normalized.includes('/src/adapters/')) return 'adapter';
  if (normalized.endsWith('/src/main.ts')) return 'main';
  return undefined;
}

function importedLayer(filename: string, specifier: string): Layer | undefined {
  if (!specifier.startsWith('.')) return undefined;
  return layerOfPath(resolve(dirname(filename), specifier));
}

function isPlatformModule(specifier: string): boolean {
  return NODE_MODULES.has(specifier) || specifier === 'bun' || specifier.startsWith('bun:');
}

function report(context: Context, node: Node, message: string): void {
  context.report({ node, message });
}

function checkImport(context: Context, node: Node, layer: Layer): void {
  const value = node.source?.value;
  if (typeof value !== 'string') return;

  if (layer === 'core' && isPlatformModule(value)) {
    report(
      context,
      node,
      `The portable core cannot import ${value}. Read platform input in an adapter and pass plain values into core logic.`,
    );
    return;
  }

  const target = importedLayer(context.filename, value);
  if (layer === 'core' && (target === 'adapter' || target === 'main')) {
    report(
      context,
      node,
      `The core cannot import the ${target} layer. Dependencies point toward core: core <- adapters <- main.`,
    );
  }
  if (layer === 'adapter' && target === 'main') {
    report(
      context,
      node,
      'An adapter cannot import main. The entrypoint composes adapters; adapters never depend on it.',
    );
  }
}

const dependencyDirection: Rule<Context> = {
  meta: { docs: { description: 'Enforce core, adapter, and entrypoint dependency direction' } },
  create(context) {
    if (context.filename.includes('.test.')) return {};
    const layer = layerOfPath(context.filename);
    if (layer === undefined || layer === 'main') return {};

    return {
      ImportDeclaration: (node) => {
        checkImport(context, node, layer);
      },
    };
  },
};

export default {
  meta: { name: 'boundary' },
  rules: { 'dependency-direction': dependencyDirection },
};
