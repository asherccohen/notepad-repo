Here’s the condensed but complete LLM-ready prompt that captures everything from our conversation so far:


---

Prompt: Design a Modular TypeScript Code Analysis Engine Beyond ESLint

> I want to build a TypeScript + Node.js modular code analysis engine that combines:

AST parsing (via ts-morph)

Graph data structures for module/function relationships

Optimized directory scanning (via fdir)

Plugin system for extensibility


Core goals:

1. Traverse a repo (or a folder in a repo) in a highly optimized and abstracted way


2. Provide deep structural and semantic analysis of code, not just linting


3. Output:

Structure and composition of modules

Quality metrics per file/function (complexity, nesting, LOC, fan-in/out)

Audit logs tracking improvements over time

Plugin-defined data (refactor suggestions, optimization hints, graphs, etc.)



4. Support three modes:

CLI (with plugin params, e.g. mytool analyze --plugin=complexity)

Watch mode (incremental re-analysis on file changes, minimal CPU cost)

CI mode (structured outputs for dashboards/reports)



5. Architecture must be polymorphic so core and plugins can be reused in server or browser code.



Why not just ESLint?

ESLint is great for rule-based linting per file but lacks:

Whole-repo graph modeling

Cross-file semantic analysis

Persistent audit logging and metrics

Structural complexity metrics

Flexible structured output for dashboards


This tool complements ESLint, not replaces it.


Architecture requirements:

Core engine:

Scans files with fdir (ignore node_modules, .git, build dirs)

Parses with ts-morph

Maintains CodeGraph of modules, functions, calls, imports/exports

Caches ASTs and type info for speed

Runs plugins and merges their results


Plugin interface:


interface Plugin {
  name: string;
  analyzeFile(meta: FileMeta, ast: SourceFile, graph?: CodeGraph): PluginResult;
}
interface PluginResult {
  file: string;
  diagnostics: Suggestion[];
  metrics?: Record<string, number>;
  graphChanges?: CodeGraphPatch;
}

Built-in plugin examples:

1. complexity-analyzer → Complexity, LOC, nesting, graph edges


2. refactor-hints → AST + type-based refactor suggestions


3. optimization-hints → Detect unused imports, large objects, bad patterns


4. module-graph → Import/export dependency mapping


5. code-audit-log → Store structured historical data for trends



Output formats:

JSON for CI/dashboard

CLI table/graph for dev mode


Watch mode:

Re-analyze only changed files

Update only affected graph nodes

Keep memory footprint low



Task for the LLM:
Based on the above requirements, design the core architecture (data structures, flow, plugin runner), and provide scaffolded TypeScript code for the engine and one sample plugin (complexity-analyzer).




---

If you want, I can now add the base CodeGraph and plugin runner scaffolding so the LLM output is instantly runnable. That would make this prompt actionable for implementation straight away.

