Sure! Here's a refined, focused, and powerful prompt format you can use to get better results from an LLM about the receptionist pattern in the actor model:


---

Prompt Format: Understanding and Implementing the Receptionist Pattern in the Actor Model

Role:
You are a senior software engineer with deep expertise in concurrent and distributed systems, specializing in the actor model.

Goal:
Explain the receptionist pattern in the actor model clearly and concisely, emphasizing practical use cases, implementation details, and common pitfalls. Provide code examples or architecture suggestions in TypeScript where applicable.

Context:

The receptionist is a service discovery pattern for dynamically locating actors without tight coupling.

Actors register themselves with the receptionist, which maintains a directory.

Clients query the receptionist to get references to actors dynamically.


Requirements:

1. Define the receptionist pattern and why it matters.


2. Explain typical roles involved (receptionist, service actors, clients).


3. Describe the communication flow with a code snippet or pseudocode in TypeScript.


4. Highlight key benefits and challenges (e.g., stale references, scaling).


5. Mention real-world implementations or analogs in popular actor frameworks.


6. Suggest how this could be modeled or extended in an XState or TypeScript actor system.



Output:
A focused explanation with clear structure, practical examples, and actionable insights suitable for a software engineer aiming to implement or reason about the pattern.


---

You can feed this prompt to an LLM to get clear, code-backed, and engineer-focused answers on the receptionist pattern in the actor model. Want me to help you generate an example response based on this?



Here’s a structured prompt you can feed into an LLM to help you build advanced XState devtools:


---

🧠 Prompt:

You are an expert TypeScript and developer tooling engineer. I want your help building advanced developer tools for XState, focused on improving debugging, inspection, and simulation of complex, async, actor-based state machines used in real-world frontend and backend apps.


---

🎯 Goals

These devtools should go beyond what's currently available in XState DevTools and provide a better experience for modern apps using:

actors, invoked services, and spawned machines

deeply nested machine compositions

real-time debugging of long-running, event-driven workflows



---

✅ Features I want to implement:

1. Actor Tree Timeline + Time Travel

Show a dynamic tree of all active actors and invoked machines.

Log each message sent/received, who sent it, who processed it.

Enable “time travel” and jumping to any state across the full actor tree.


2. Event Flow Visualization

Track how events propagate across actors and machines.

Display event flow in a sequence diagram (like UML).

Allow developers to inspect event origin, path, side effects triggered, and final state.


3. Service and Side Effect Monitoring

Track lifecycle of invoked services (Promise, callback, observable).

Log start, resolve, reject, and duration of effects.

Link side effects to triggering events.


4. Composed Machine Debugging

Show a live tree view of nested machines and their current active states.

Enable zooming into subcharts.

Visualize spawn/invocation relationships between parent and child machines.


5. Interactive Simulation Mode

Create a visual “scenario builder” to define event sequences.

Simulate runtime behavior by dispatching mock events and observing resulting state.

Integrate with Playwright/Cypress to simulate real UI interactions.


6. Test Case Generator

Analyze the machine definition to auto-generate test skeletons (model-based testing).

Show untested transitions and unused paths for better test coverage.


7. Performance + Actor Lifecycle Profiler

Track state transition frequency and hot paths.

Surface long-lived actors and memory-intensive parts of the machine tree.

Show a timeline of actor creation and destruction.


8. Framework Integration (Next.js, Remix, React Native)

Lightweight runtime bridge (e.g. WebSocket or postMessage) to expose interpreter state.

React DevTools-style overlay or VSCode panel.

Enable usage in local dev without needing to eject or instrument production code.



---

🧱 Implementation Notes

Use @xstate/inspect, createInterpreter, and a wrapper around interpret() to inject metadata/logging.

Prefer event-driven architecture (actor observer pattern) for instrumenting the runtime.

Structure devtools backend as a plugin-friendly event recorder with time-travel.

Use source maps (if possible) to link transitions to original TypeScript files.



---

📦 Output I need from you:

Architecture diagram for this devtools system

Recommended data model for recording actor and message history

Runtime instrumentation strategy

UI component suggestions (timeline, sequence view, actor tree)

Optional: TS implementation starter code



---

Let me know if you need my app structure or a sample machine to work with.

