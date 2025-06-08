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

1. Directory Scanner Prompt (scanFiles.ts)

> I’m building a TypeScript-based code analysis tool. Create a file scanner module using fdir that:

Recursively crawls a given folder

Ignores files based on .gitignore using the ignore npm package

Filters to include only .ts, .tsx, .js, .jsx files

Returns full absolute paths as a flat array

Is async and reusable

Has good DX: readable, typed, minimal deps

Exported as scanFiles(rootPath: string): Promise<string[]>





---

2. AST + Plugin Executor Prompt (analyzeFile.ts)

> I need a reusable TypeScript module that:

Accepts a file path, reads its contents, parses it with ts-morph

Runs a list of plugin hooks of type Plugin.analyzeFile(meta, ast, graph)

Each plugin returns metrics, diagnostics, or suggestions

Returns a PluginResult[]

This should be idiomatic, strongly typed, and make AST reuse easy




Define this Plugin interface:

interface Plugin {
  name: string;
  analyzeFile(meta: FileMeta, ast: SourceFile, graph: CodeGraph): PluginResult;
}


---

3. Graph Model Prompt (createGraph.ts)

> Generate a module that creates a semantic code graph. Use TypeScript types like:



type CodeNode = { id: string; type: string; name: string };
type CodeEdge = { from: string; to: string; type: 'imports' | 'calls' | 'extends' };
type CodeGraph = { nodes: CodeNode[]; edges: CodeEdge[] };

> The function should:

Accept all source files and their ASTs

Track imports, calls, class inheritance, etc.

Build a clean, queryable graph object

Be exportable and easy to debug





---

4. Plugin System Prompt (runPlugins.ts)

> Implement a plugin runner in TypeScript that:

Accepts an array of plugins and a list of files

Runs per-file analysis with each plugin

Optionally runs afterAnalyze(graph) on each plugin

Collects results (metrics, suggestions, diagnostics) into a unified PluginRunResult

Is asynchronous and logs timing/errors




Use this minimal plugin interface:

interface Plugin {
  name: string;
  analyzeFile?(meta: FileMeta, ast: SourceFile, graph: CodeGraph): PluginResult;
  afterAnalyze?(graph: CodeGraph): PluginResult;
}


---

5. Watch Mode Prompt (watcher.ts)

> Build a file watcher module using chokidar that:

Watches a folder and triggers a callback on file add/change/delete

Debounces changes

Uses an internal file hash cache (e.g., SHA1) to skip unchanged files

Can be started/stopped cleanly

Exposes startWatching() and stopWatching() functions





---

6. CLI Entrypoint Prompt (cli.ts)

> Create a CLI entrypoint using commander (or yargs) that:

Supports subcommands: analyze, watch, ci

Accepts --plugins, --format, --out

Loads .codemaprc.ts config (optional)

Orchestrates scanning, analysis, and plugin execution

Outputs results in JSON or human-readable format





---

7. Audit Logger Prompt (logger.ts)

> Build an audit logger that:

Accepts plugin results and writes structured logs to file

Includes timestamp, file, plugin name, message, severity, optional fix diff

Saves to .codemap.audit.json

Exposes a logAuditEntries(entries: AuditEntry[], options) function

Optionally pretty-prints logs in terminal


---

🔍 Plugin 1: Complexity & Module Graph Plugin

Prompt

> Write a TypeScript plugin for a CLI-based code analysis tool. The plugin should:

Be named complexity-analyzer

Export a Plugin object implementing this interface:




interface Plugin {
  name: string;
  analyzeFile(meta: FileMeta, ast: SourceFile, graph: CodeGraph): PluginResult;
}

> Compute per-function and per-file metrics:

Cyclomatic complexity

Function length (in lines)

Nesting depth

Exported symbols

Imported modules


Add nodes and edges to the provided graph parameter:

Add CodeNode for each file and function

Add CodeEdge for function calls, imports, exports


Return a PluginResult object per file containing:

Filename, functions, metrics, errors (if any)


Be fully typed, minimal-deps, and testable in isolation





---

🧠 Plugin 2: Refactor Hints Plugin

Prompt

> Write a TypeScript plugin named refactor-hints for a modular code analysis CLI. The plugin should:

Export a Plugin object:




interface Plugin {
  name: string;
  analyzeFile(meta: FileMeta, ast: SourceFile): PluginResult;
}

> Parse the AST using ts-morph and provide refactor suggestions:

Functions with more than 3 nested blocks → Suggest extraction

Long parameter lists (> 4 params) → Suggest object refactor

Repeated identifiers/constants → Suggest variable hoisting

Classes with only static methods → Suggest converting to plain object


For each issue, return a suggestion object like:




interface Suggestion {
  message: string;
  severity: 'info' | 'warn';
  location: { file: string; line: number };
  suggestionType: 'refactor';
}

> Collect all suggestions into a PluginResult

No actual code mutation, just analysis

Designed to be used in a watch/CI mode





---

⚙️ Plugin 3: Optimization Hints Plugin

Prompt

> Write a TypeScript plugin named optimization-hints that:

Analyzes TypeScript source files using ts-morph

Exports a Plugin implementing:




interface Plugin {
  name: string;
  analyzeFile(meta: FileMeta, ast: SourceFile): PluginResult;
}

> Detects code patterns that may lead to runtime or bundle size issues:

Unused imports

Unused local variables

Dynamic require() or import() without code-splitting

Large object literals or JSON inlined in modules (>50 LOC)

Top-level console.log or debugger statements


For each issue found, return a suggestion like:




interface Suggestion {
  message: string;
  severity: 'warn' | 'info';
  location: { file: string; line: number };
  suggestionType: 'performance';
}

> Designed for incremental and CI-safe runs





---




