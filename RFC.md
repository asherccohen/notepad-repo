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

