RFC: A New Runtime Model for Interactive Web Applications

Overview

This document proposes a new architecture and runtime model for building highly interactive, stateful, and real-time web applications. The intent is to move beyond the limitations of component-centric frameworks like React, and address fundamental problems in state orchestration, event handling, and rendering scheduling.

Motivation

Modern apps—especially dashboards, canvases, games, editors, and collaborative tools—face challenges:

State is distributed, yet not shared reliably across views.

Temporal logic (e.g. async, cancelation, sequencing) is fragmented across useEffect, sagas, and event handlers.

Interactions are hard to compose or coordinate. There is no clear notion of UI modes, blocking operations, or mutual exclusivity.

Most rendering frameworks tie state to rendering tightly, limiting performance and portability.


What We Like (and Want to Keep)

While this RFC proposes moving beyond current paradigms, there are several powerful ideas from the current ecosystem worth preserving:

Composition: Being able to build features by combining smaller pieces.

JSX: A powerful and expressive syntax for UI declaration.

Declarative syntax: Declaring "what" should happen rather than imperatively specifying "how".

Hooks-like systems: Encapsulating logic and lifecycle into composable, reusable functions — but without the gotchas and timing issues of useEffect.


The goal is to carry forward these ergonomics and strengths while removing the architectural constraints.

Goals

Decouple behavior, state, and rendering.

Model interactions, sequencing, and UI modes explicitly.

Enable fine-grained reactivity for both state and event flows.

Support multiple rendering targets: DOM, Canvas, WebGL, React, etc.

Provide composable primitives for interlocks, transitions, and undo/redo.


Core Concepts

1. Reactive State Mesh

Application state is modeled as a graph of reactive nodes (atoms/signals). Components or systems subscribe to slices of the graph.

Reactive by default.

Graph-based instead of tree-based.

Supports local, remote, shared, and derived state.


2. Actors as Behavioral Units

Each feature or system is encapsulated in an actor:

Owns its local state.

Handles events through message queues.

Communicates via commands/intents.

Manages its own lifecycle (start, stop, reset).


Actors expose send, receive, update, and render.

3. State Machines & UI Modes

UI behavior is modeled using explicit state machines:

Modes like select, draw, editing, preview.

Guards to block transitions.

Side effects tied to transitions (not renders).


This enables:

Blocking operations (e.g., prevent edits during upload).

Mutual exclusions (e.g., only one tool active).

Clear undo/redo boundaries.


4. Event-Command Pipeline

All interactions are routed through an orchestrator:

Events are dispatched as commands.

Commands are matched to handlers by context and state.

Handlers may be async, cancelable, and interlocked.


Built-in primitives:

sequence, race, lock, guard, retry, cancel

onEnter, onExit, onIdle, onFrame


5. Pluggable Rendering Drivers

Rendering is decoupled from behavior:

Views are pure functions of state.

Scheduled by runtime, not tied to event loops.

Adapters exist for DOM/Canvas/WebGL/etc.


Example:

const View = createView((data) => {
  return html`<div>${data.name}</div>`;
});

6. Systems as Composable Units

Systems provide higher-order behaviors:

useSystem('collaboration')

useSystem('form-validation')

useSystem('undo-redo')


Each system exposes:

Hooks and event listeners.

State subscriptions.

Command handlers.


Use Cases

Dashboards: shared filters, cross-widget updates.

Chat/AI apps: input throttling, optimistic updates.

Canvases: multi-modal editing, async sync.

Games: frame-based updates, entity orchestration.

Animation tools: scrubbing, timelines, transitions.

Forms: validation, blocking submission, rollback.

Search inputs: debounce, cancel, interlock on fetch.

Collaboration: presence, locking, sync conflicts.


Comparison to Existing Tools

Open Questions

Should this be a library or a framework?

What is the minimal kernel to support actors/modes/commands?

How should devtools and runtime inspection work?

Can it interop with React cleanly?


Next Steps

Define a core runtime: actors, state mesh, command bus.

Build a DOM adapter and Canvas adapter.

Prototype key systems: mode manager, scheduler, undo/redo.

Collect more use cases.

Iterate on DSL/API ergonomics.



---

This RFC is open for feedback and contributions.

RFC: A New Paradigm for Interactive Web Apps

Introduction

This RFC proposes a new architectural model for building highly interactive, data-rich web applications. It draws on the strengths of modern frontend tooling (React, state libraries, routers), but introduces new primitives for handling state, events, and async flow in a more robust and composable way.

We are targeting use cases where current component-based models break down:

Dashboards: Many widgets with local+remote state and tight interdependencies.

Chat apps: Optimistic updates, fast feedback loops, complex async events.

Canvas / diagramming / whiteboard: High event rate, real-time precision.

Animated scenes / games: Frame-based updates, entity systems, input coordination.


What We Like About Current Paradigms

Despite their shortcomings, modern tools got many things right:

Composition: Component trees and hooks make colocating logic intuitive.

JSX: A great declarative DSL for describing views.

Declarative programming: Thinking in "what" instead of "how" reduces bugs.

Hooks (conceptually): Being able to subscribe to state/lifecycle locally is powerful.


Core Problems with Current Paradigms

Sequencing async interactions: useEffect and Redux middleware are poor at modeling input sequences, blocking, or cancellation.

Orchestration of events: Handling modes, modal flows, async guards is still hand-rolled.

Tight coupling of rendering and logic: Many solutions mix DOM updates with side-effect logic.

Excessive re-renders: Triggering full rerenders from any data change is wasteful for high-frequency use cases.

Inversion of control: The rendering engine often takes over as the orchestrator of business logic.


Task Trees and Structured Concurrency

To address the core issue of async signal handling and interlocks, we propose adopting structured concurrency as a first-class primitive.

What is Structured Concurrency?

Structured concurrency means async operations form a tree:

Tasks are nested in parent/child relationships.

Cancelling a parent cancels all children.

Tasks can block, race, or sequence based on the tree structure.

Failures can bubble up or be caught locally.


This gives us better control over when and how state transitions happen.

Benefits for Frontend

Clean cancellation: No more tracking AbortControllers or custom isMounted checks.

Scoped orchestration: Setup a task tree for each domain (e.g., dashboard, chat, session), supervise its async flows.

UI modes and interlocks: Represent as concurrent tasks that suspend/resume others.

Backpressure / debounce / queueing: Built-in async flow control.

Improved testing: Tasks can be simulated, stepped, and inspected like state machines.


Example

function* authFlow() {
  while (true) {
    const login = yield* take("LOGIN")
    const token = yield* call(fetchToken, login.payload)
    const logout = yield* take("LOGOUT")
    yield* call(clearToken)
  }
}

This task:

Waits for LOGIN

Calls fetchToken

Waits for LOGOUT

Resets state


You can model real user flows this way without effect soup.

Next Steps

Define the primitive runtime for task trees (similar to async generators or observables).

Define interop boundaries: React, Canvas, Workers, etc.

Define the data graph model (recursive DAGs).

List use cases and validate the API with real problems.

Design devtools/debugging tools for task graph introspection.



---

Let’s continue expanding this as we formalize the model. Next section could be on Event Graphs and Gatekeeping Logic.

RFC: A New Paradigm for Interactive Web Apps

Introduction

This RFC explores a new architecture for building interactive, high-performance web apps that are increasingly common: dashboards, collaborative tools, real-time editors, animated canvases, and games.

We aim to go beyond the traditional component model (React et al.) and propose a more capable, composable, and scalable model that centers around:

Structured concurrency for sequencing and control

Event-first design for coordination

Fine-grained reactivity without rendering bottlenecks

Clear separation between view, state, and orchestration


This isn’t just about improving rendering – it’s about fixing event handling, sequencing, and side-effect orchestration.

Use Cases

This model targets apps with high interactivity, concurrent flows, and complex dependencies:

Dashboards: Multiple widgets, each reacting to shared/remote state. Fetch-on-demand or fat-data model, cross-component coordination.

Chatbots: Optimistic updates, key-by-key response reactivity, partial invalidation, async feedback.

Canvas apps / whiteboarding: High input frequency, precision rendering, undo stacks, history replay, multiplayer state.

Animated scenes: Frame-based rendering, interpolation, input-driven changes.

Games: Entity systems, real-time input, rendering loops, physics, AI, asset loading, concurrent logic.


These cases stress the limits of current frontend paradigms.

What We Like (And Want to Keep)

We’re not throwing everything out. Here’s what we want to preserve:

Composition: Building UIs from smaller parts is essential.

JSX (or similar DSL): Expressive declarative templating.

Hooks-like APIs: Local subscriptions to state, effects, etc.

Declarative view logic: Describe “what,” not “how.”


We just want to unbundle these ideas from the limitations of the component/render-first mindset.

What's Not Working

These are recurring problems in modern UI frameworks:

Sequencing async effects: Neither useEffect nor Redux middleware help manage conflicting inputs or control flow.

Poor orchestration: Most apps hand-roll state machines or effect queues.

Render-as-orchestrator: Rendering kicks off side-effects; components handle business logic; this tight coupling creates race conditions.

Over-rendering / memo hell: Rendering on every state change is wasteful in high-frequency scenarios.

Lack of coordination / locking: You can't easily declare: "this task must finish before others start."


Foundational Concepts

1. Structured Concurrency

We want to manage a task tree:

Tasks form a hierarchy (parent/child).

Cancel a parent, cancel its children.

Supervise, restart, or isolate failures.

Use well-known control flows (while, if, for).


This gives us:

Cancelation

Flow control (blocking, racing, batching)

Supervision boundaries

Isolation of responsibility


Example

function* authFlow() {
  while (true) {
    const login = yield* take("LOGIN")
    const token = yield* call(fetchToken, login.payload)
    const logout = yield* take("LOGOUT")
    yield* call(clearToken)
  }
}

You can model real-world flows declaratively.

2. Event Graphs and Coordination

Events and state transitions live in a dependency graph:

Each node has inputs (events/state), outputs (state/events).

Events may suspend, sequence, or cancel downstream nodes.

Nodes are like "actors" that react to events and emit side-effects.


Why a Graph, not a Tree?

Components form a tree, but real dependencies form a recursive DAG (or graph of DAGs).

Subgraphs can represent substates/modes (e.g., auth, editor, canvas).

This model allows shared dependencies and avoids prop drilling.


3. Event-First Design

This system prioritizes handling input, not rendering output. Events are first-class citizens:

Inputs are "traps" or "signals".

State is updated in response.

Rendering is just a subscriber.


React inverted the model by letting render start the chain. We want to invert it again.

4. Render is External

Rendering should not control state.

State should be readable now, always consistent.

The render system (React, canvas, DOM, WebGL) is a driver.

Developers should be able to opt into rendering via JSX, Canvas, or imperative modes.


5. Modes, Mutexes, and Interlocks

Apps operate in modes. For example:

When dragging, you can't pan or zoom.

While submitting, don’t allow editing.

On error, suppress inputs.


We want primitives to:

Declare blocking/priority.

Temporarily suppress event handlers.

Queue or reject events.


This is similar to OS-level trap handling or cooperative multitasking.

6. Colocation, but not Coupling

Component models promote colocating state+logic, but it often leads to tight coupling with rendering. We want:

Logic to live near the domain it handles.

UI to be a consumer, not the orchestrator.

A system that enables hooks-style ergonomics without tying to render lifecycles.


7. Developer Experience First

Type-safe task trees and state graphs.

Great tooling for event inspection, graph exploration.

Hooks-like ergonomics with better guarantees.

Compatible with React/Vite/Next for adoption.

Support headless mode for non-DOM targets.


Runtime Model

Task supervisors: define, spawn, cancel, supervise async logic.

Event graph: each node is reactive to inputs.

Signals or observable primitives for fine-grained reactivity.

Render integration: subscribe to state, rerender only when needed.

Scheduler: controls ticks, animation frames, transitions.


What This Isn't

Not a new rendering engine (though we support multiple targets).

Not a replacement for React (we want React interop).

Not a "yet another state management lib" – this is an orchestration and event model.


Next Steps

Define the runtime task model: spawn, cancel, block, race, wait.

Define a reactive graph structure for dependencies.

Draft API sketches for hooks/interops/rendering.

Explore integrations: React, canvas, workers.

Dogfood with real apps (chat, dashboard, canvas).

Build devtools to inspect task graph and state tree.


Final Thoughts

The component tree was a great model for rendering static or lightly interactive UIs. But modern apps are concurrent, eventful, async-heavy systems that demand better primitives.

We believe structured concurrency, event graphs, and task-based orchestration can power the next wave of interactive web experiences.

Let’s build it.



