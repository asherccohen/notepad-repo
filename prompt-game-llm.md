Sure — here’s a summary prompt that captures your full intent, constraints, and expectations, phrased in a way an LLM can immediately act on with relevant and optimized answers:


---

🧠 Prompt: LLM Integration in Client-Side Browser Game (React + Rsbuild)

I’m building a browser-based game using React + TypeScript, bundled with Rsbuild (Rspack). I want to integrate a local LLM (Language Model) that runs fully client-side, without any server dependency.

Requirements:

Use @xenova/transformers for LLM execution (WebAssembly/WebGPU backend).

Load and run the model inside a Web Worker to prevent blocking the UI.

Use comlink for communication between main thread and the worker.

The model should support text generation, e.g. distilgpt2.

It must be usable across multiple game systems, not just for NPC dialogs.

Integration must support lazy model loading, async inference, and be performance-aware.

The final structure should be modular, ideally exposing a generic LLM service to the rest of the game logic.

The build system is Rsbuild so the setup must be compatible with modern WASM/WebWorker support via import.meta.url and type: 'module'.


Example question:

> Show me how to implement this architecture end-to-end, including:

Rsbuild configuration

Web Worker code

Comlink bridge

TypeScript types

React usage example




Also explain any performance concerns (memory, cold start, compatibility), and propose alternatives like lighter models for classification instead of generation.


---

This prompt gives another LLM everything it needs to answer clearly and directly, whether it’s for implementation, validation, or design discussion. Let me know if you'd like it tuned for GitHub Copilot, Claude, or another engine.

