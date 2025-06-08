🧠 Prompt: Generate a Clean, Modular, Plugin-Based Code Analysis CLI Using TypeScript, AST, and Graphs


---

🎯 Goal

Create a modular, platform-agnostic tool written in TypeScript and powered by AST parsing and graph analysis that performs deep structural and qualitative inspection of source code in a given repo or folder.

It is designed to help developers:

Understand module structure, coupling, and complexity

Identify and track code quality issues or anti-patterns

Produce audit logs with diagnostics and improvement suggestions

Enforce quality gates via CI


The tool must:

Be CLI-first, but reusable in server/web contexts

Have an extensible plugin system

Be performance-conscious, with support for incremental watching

Produce machine- and human-readable outputs



---

🛠️ Tech Stack

Language: TypeScript

Runtime: Node.js (ESM/CJS compatible)

AST parsing: ts-morph or typescript compiler API

Code graph: internal or graphlib

Directory scanning: prefer fdir for speed and control

File ignore support: ignore (for .gitignore / .codemapignore)

CLI interface: commander, zod, or yargs

File watching: chokidar



---

🧑‍💻 Usage Modes

1. CLI

codemap analyze ./src --plugins moduleStructure,qualityMetrics

2. Watch Mode

codemap watch ./src --plugins auditTrail --debounce 300

Uses fdir + chokidar

Supports smart file fingerprinting to avoid re-analysis


3. CI Mode

codemap ci --plugins auditTrail,qualityMetrics --format json --out results/

Outputs:

codemap.graph.json → semantic graph snapshot

audit.log.json → diagnostics + suggestions

metrics.csv → per-file stats




---

🧱 Architecture

/src
  /core
    scanFiles.ts          ← optimized file crawler (fdir + ignore)
    traverseRepo.ts       ← main file orchestrator
    analyzeFile.ts        ← per-file plugin runner
    createGraph.ts        ← semantic graph builder
    runPlugins.ts         ← plugin lifecycle
    logger.ts             ← audit + diagnostics output
    hash.ts               ← file fingerprinting
  /types
    index.ts              ← shared types/interfaces
  /plugins
    moduleStructure.ts
    qualityMetrics.ts
    auditTrail.ts
  /cli
    index.ts
    commands.ts
    formatters.ts
/tests
  fixtures/
  unit/
  integration/


---

📂 File Scanning (fdir)

Use fdir as the preferred directory scanner:

import { fdir } from "fdir";
import { createIgnore } from "ignore";

const ignore = createIgnore();
ignore.add(fs.readFileSync(".gitignore", "utf-8"));

const files = await new fdir()
  .withFullPaths()
  .filter((path) =>
    !ignore.ignores(path) &&
    /\.(ts|tsx|js|jsx)$/.test(path)
  )
  .crawl("src")
  .withPromise();

Alternative: fallback to fast-glob if globs-only is acceptable or useful in simple scenarios.


---

🕸️ Graph Model

Node Types

File

Function

Class

Interface

Type Alias

Enum


Edge Types

imports

calls

extends / implements

uses


Type Definitions

type CodeNode = {
  id: string;
  type: 'file' | 'function' | 'class' | 'typeAlias' | 'interface';
  name: string;
  loc?: { start: number; end: number };
  metrics?: Record<string, number>;
  hash?: string;
};

type CodeEdge = {
  from: string;
  to: string;
  type: 'imports' | 'calls' | 'extends' | 'uses';
};


---

🔌 Plugin System

interface Plugin {
  name: string;
  setup?(ctx: ProjectContext): void;
  analyzeFile?(meta: FileMeta, ast: SourceFile, graph: CodeGraph): PluginResult;
  afterAnalyze?(graph: CodeGraph): PluginResult;
}

type PluginResult = {
  metrics?: Record<string, number>;
  diagnostics?: Diagnostic[];
  improvements?: CodeFix[];
};

Each plugin can:

Emit metrics, suggestions, and diagnostics

Interact with and mutate the code graph

Be easily swappable or extended via .codemaprc.ts



---

📓 Audit Logging

type AuditEntry = {
  file: string;
  plugin: string;
  message: string;
  severity: 'info' | 'warn' | 'error';
  suggestedFix?: {
    description: string;
    diff: string;
  };
  hash: string;
};

Stored in codemap.audit.json

Optional renderers: Markdown, HTML, JSON



---

🧪 Test Strategy

Unit tests for AST extractors, graph logic, and plugin outputs

Integration tests using sample fixtures + snapshot comparisons

CI compatibility for regressions and plugin diagnostics



---

💡 Extra Ideas

Browser-usable graph + metrics explorer (via WASM + esbuild-wasm)

GitHub PR bot that comments on audit results

WebSocket-based daemon to serve local graph state for a browser UI

GraphQL API for querying codebase structure



---

✅ Summary

The tool should:

Be modular and CLI-first, but usable in Node server and browser contexts

Use fdir (preferred) or fast-glob for repo traversal

Parse TypeScript using ts-morph

Build a semantic graph of modules and their relationships

Be extensible through lifecycle-aware plugins

Support watch mode, CI mode, and rich audit reporting



---




