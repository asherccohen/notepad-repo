Sure! Here’s a refined, focused, and powerful prompt format designed to get precise, expert-level responses from an LLM acting like a senior software engineer. It’s tailored to the event-driven React state management pattern we discussed:


---

Prompt for LLM: Build Imperative Event-Driven State Logic in React

Context:
I’m building a React app using a custom hook useEventState that manages a single primitive state plus an extended context object, modeled after finite state machines but without libraries like XState or reducers.

API:

useEventState<State extends string, Context, Event extends { type: string; payload: unknown }>(
  initialState: State,
  initialContext: Context,
  options: {
    guards?: Record<string, (ctx: Context, payload: unknown) => boolean>;
    actions?: Record<string, (ctx: Context, payload: unknown, send: (event: Event) => void) => void>;
  }
): [state: State, context: Context, send: (event: Event) => void, setContext: React.Dispatch<React.SetStateAction<Context>>, setState: React.Dispatch<React.SetStateAction<State>>];

How I use it:

State transitions and side effects are handled manually in nested switch statements:

Outer switch on state

Inner switch on event.type


Guards and actions are pure functions called explicitly inside these cases.

Side effects (e.g., fetch calls) happen inside actions, which can send new events.

context is a single mutable object held via useState.

send() is called only in response to user events or actions — never during render.


You should:

Help me write event handlers that follow this imperative pattern.

Validate correct usage of guards, actions, setState, setContext, and send.

Warn me about common mistakes: calling send during render or effects without proper deps, race conditions, state/context inconsistency.

Help me refactor or add complex flows: retries, cancellations, optimistic updates.

Provide clear, minimal, idiomatic TypeScript+React examples using this pattern.

Never suggest reducers, XState, or libraries that abstract away state handling.


If I describe an event/state flow:

Return a fully typed code snippet for the handler(s) with proper guards and actions calls.

Point out potential concurrency or React rendering issues in my approach.

Suggest improvements for robustness and maintainability.


If I ask for debugging:

Diagnose what’s likely wrong based on symptoms (e.g., infinite renders, desynced state/context).

Suggest concrete fixes.



---

This prompt keeps the assistant sharply focused on manual, imperative event handling in React with your exact hook API, making sure it doesn’t drift to reducers or state machines but stays practical and actionable. It also primes the model to watch out for React concurrency gotchas and developer experience.

Want me to help you generate variants for specific use cases?



Got it.

You're enforcing:

All events must be { type: string, payload: unknown }

No extra shape — just a discriminated union based on type

Devs handle all transitions imperatively inside switch(state), then switch(event.type)

context is a single mutable object (like XState's context)

You want a utility hook like:


const [state, context, send, setContext] = useEventState(...)


---

✅ Updated Type Definitions

type EventObject<T extends string = string, P = unknown> = {
  type: T;
  payload: P;
};

type Send<E extends EventObject> = (event: E) => void;

export function useEventState<
  State extends string,
  Context,
  E extends EventObject
>(
  initialState: State,
  initialContext: Context,
  options: {
    guards?: Record<string, (ctx: Context, payload: unknown) => boolean>;
    actions?: Record<string, (ctx: Context, payload: unknown, send: Send<E>) => void>;
  }
): [State, Context, Send<E>, React.Dispatch<React.SetStateAction<Context>>, React.Dispatch<React.SetStateAction<State>>] {
  const [state, setState] = useState<State>(initialState);
  const [context, setContext] = useState<Context>(initialContext);
  const { guards = {}, actions = {} } = options;

  const send: Send<E> = (event) => {
    // no logic here – dev handles everything outside
  };

  return [state, context, send, setContext, setState];
}


---

✅ Example Usage (fully typed, no abstractions)

type State = 'idle' | 'loading' | 'success' | 'error';

type Context = {
  data: unknown | null;
  error: unknown | null;
};

type Events =
  | { type: 'LOAD'; payload: null }
  | { type: 'SUCCESS'; payload: unknown }
  | { type: 'ERROR'; payload: unknown };

const guards = {
  canLoad: (ctx: Context, _payload: unknown) => ctx.data == null,
};

const actions = {
  fetchData: (_ctx: Context, _payload: unknown, send: (event: Events) => void) => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => send({ type: 'SUCCESS', payload: data }))
      .catch(err => send({ type: 'ERROR', payload: err }));
  },
  logLoadStart: () => console.log('Starting load'),
};

function Example() {
  const [state, context, send, setContext, setState] = useEventState<State, Context, Events>(
    'idle',
    { data: null, error: null },
    { guards, actions }
  );

  const handleEvent = (event: Events) => {
    switch (state) {
      case 'idle': {
        switch (event.type) {
          case 'LOAD': {
            if (!guards.canLoad(context, event.payload)) return;

            actions.logLoadStart(context, event.payload, send);
            actions.fetchData(context, event.payload, send);
            setState('loading');
            return;
          }
        }
        break;
      }

      case 'loading': {
        switch (event.type) {
          case 'SUCCESS': {
            setContext(prev => ({ ...prev, data: event.payload, error: null }));
            setState('success');
            return;
          }

          case 'ERROR': {
            setContext(prev => ({ ...prev, error: event.payload, data: null }));
            setState('error');
            return;
          }
        }
        break;
      }

      case 'success':
      case 'error': {
        switch (event.type) {
          case 'LOAD': {
            setContext({ data: null, error: null });
            actions.fetchData(context, event.payload, send);
            setState('loading');
            return;
          }
        }
        break;
      }
    }
  };

  return (
    <div>
      {state === 'idle' && <button onClick={() => handleEvent({ type: 'LOAD', payload: null })}>Load</button>}
      {state === 'loading' && <p>Loading...</p>}
      {state === 'success' && <pre>{JSON.stringify(context.data, null, 2)}</pre>}
      {state === 'error' && (
        <div>
          <p style={{ color: 'red' }}>{String(context.error)}</p>
          <button onClick={() => handleEvent({ type: 'LOAD', payload: null })}>Retry</button>
        </div>
      )}
    </div>
  );
}


---

💡 Notes

All events follow the { type, payload } pattern.

Type-safe — send() and event.payload are correctly inferred.

You write manual transitions, close to setState, setContext, guard, action.

You still get strong typing and structure without any abstraction or runtime magic.


Want a generic helper like createEventMap() to generate types from event declarations automatically? I can add that too.




This pattern you've defined — a manual, imperative event-state machine built with useState, guards, and actions — is elegant for senior developers with mental models shaped by state machines or message passing. But let’s analyze it deeply through three lenses:


---

1. ✅ Developer Experience & Learning Curve

Pros

Fully explicit control flow:
Devs can see every state transition and side effect happening inline — no hidden logic, no abstraction layers.

Testable in isolation:
Since actions and guards are external functions, they can be tested independently without mocking React internals.

No dependency on XState, Redux, etc.:
It keeps the dependency tree small and gives teams full control over logic without committing to a complex framework.

Composable mental model:
For experienced devs, this is the closest you can get to Elm-style or actor-model logic within React, while still staying React-native.


Cons

Verbosity and boilerplate:
For devs unfamiliar with event-driven design, this introduces unfamiliar ceremony:

Event types

Discriminated unions

Guard pattern

Externalized actions


Error-prone for junior devs:
Having to manually manage setState, setContext, and manually ensure correct effects run makes it very easy to mess up transitions:

You can forget to call setContext

You can conditionally fire actions and introduce bugs that are harder to debug than declarative useEffect-style flows


No fallback mental model:
There’s no reducer or hook pattern to fall back to. If the logic becomes complex or stateful actions require retries/cancellation/debouncing, junior devs may not know how to adapt this model.



---

2. ⚛️ React’s Rendering Model & Potential Pitfalls

This is critical to consider.

Safe Areas

✅ useState calls are side-effect free

✅ setContext and setState calls are React-compliant

✅ No mutations of state objects

✅ Side effects (like fetch) are fired in response to events — not directly during render


So from a React perspective, this pattern won’t break anything by default.

Risk Areas

2.1: Inconsistent state after concurrent updates

If you trigger multiple send() calls in quick succession (e.g. via button spam, retries), context and state may desync. Example:

setContext(prev => ({ ...prev, data: A }));
setState('success');

// in another tick:
setContext(prev => ({ ...prev, data: B }));
setState('success');

If these two are fired concurrently, React may batch them in unexpected ways, leading to UI showing a state (success) with the wrong data (B from a race condition).

✅ Fix: wrap both in a single transition function and avoid race conditions — or, for high concurrency scenarios, you'll need a reducer-style atomic update or useTransition.

2.2: Side-effects fired outside of useEffect

You're calling fetch() directly in actions — not inside useEffect.

That’s OK if those actions are only called inside send() (triggered by user events or internal logic), not during render.

🚨 But it becomes dangerous if a dev calls send(...) in render accidentally — it would cause side effects during render, which is a strict violation in concurrent React.

✅ Fix: make a rule in your team that no send() calls are allowed in render or lifecycle setup.


---

3. 🔮 Future-Proofing & Scalability

This pattern is great for localized flows (modals, forms, single-page wizards), but if the app grows:

✅ Scales well for:

UI components with finite control states

Data fetchers with retry logic

UIs where you want event logs for debugging


⚠️ Starts to break down when:

You need parallel states (e.g. two flows active at once)

You want to pause/cancel effects (like aborting fetch or debounce)

You want built-in history, undo, devtools, replay

You want to track state transitions outside of components (e.g. global store)


At that point, the verbosity becomes a bottleneck, and introducing a state-machine engine or custom event bus might become necessary.


---

🧠 Conclusion

This is a well-reasoned pattern for:

Local state machines

Devs who value control

Scenarios where XState or reducers feel too abstract


But you should:

1. Enforce strong conventions (e.g. never call send() in render, always co-update state + context).


2. Educate junior devs on event-driven patterns and finite state modeling.


3. Avoid uncontrolled concurrency (use debouncing/throttling/cancellation for async actions).


4. Consider wrapping the pattern later with utilities (transition, match, etc.) to reduce manual boilerplate when scaling.



Would you like me to build a dev-mode logger or visualizer for transitions (state + context) to help less experienced devs understand what’s happening?



Absolutely. Misusing send in React — especially in this low-abstraction, imperative state model — can easily introduce subtle bugs, side effects during render, and state inconsistency.

Here are realistic misuse cases that can break the app or violate React's rendering model:


---

❌ 1. Calling send() inside render

return (
  <div>
    {someCondition && send({ type: 'LOAD', payload: null })} // 🚨
  </div>
);

🧨 Why it's bad:

This triggers an update during render — forbidden in React.

You’ll get an error like:
“Cannot update a component (X) while rendering a different component (X).”

It breaks React’s assumption of a pure render phase.



---

❌ 2. Calling send() during useState initializer

const [state] = useEventState(...);
const [count, setCount] = useState(() => {
  send({ type: 'INCREMENT', payload: 1 }); // 🚨
  return 0;
});

🧨 Why it's bad:

React will call the initializer during render.

You're again triggering a state change during render.

React's concurrent renderer might call it multiple times — leading to multiple send() calls unexpectedly.



---

❌ 3. Calling send() in top-level code

const [state, context, send] = useEventState(...);

send({ type: 'INIT', payload: null }); // 🚨

🧨 Why it's bad:

This will run on every render.

Infinite loop guaranteed if send() causes a state change → re-render → send() again.



---

❌ 4. Calling send() inside an uncontrolled useEffect (no deps)

useEffect(() => {
  send({ type: 'LOAD', payload: null }); // 🚨 will re-run every render
});

🧨 Why it's bad:

Without a [] dependency array or a once guard, this will re-run every render.

Results in an infinite effect/send loop if not carefully handled.


✅ Correct version:

useEffect(() => {
  send({ type: 'LOAD', payload: null });
}, []);

Or conditionally:

useEffect(() => {
  if (state === 'idle') {
    send({ type: 'LOAD', payload: null });
  }
}, [state]);


---

❌ 5. Calling send() inside derived render logic

if (context.needsRetry) {
  send({ type: 'RETRY', payload: null }); // 🚨
}

Even though this looks like logic, if it's inside render (not in a hook), it breaks React's rules.


---

✅ Safe places to call send():

Inside event handlers (onClick, onChange, etc.)

Inside controlled useEffect

Inside actions (if those are invoked imperatively from events)

Inside custom lifecycle wrappers (e.g. useLayoutEffect, useEffect with care)



---

🧠 Best Practice: Add a runtime check in dev

Add this utility:

let isRendering = false;

export function markRenderStart() {
  isRendering = true;
}
export function markRenderEnd() {
  isRendering = false;
}

export function safeSend<E extends EventObject>(send: (e: E) => void): (e: E) => void {
  return (event: E) => {
    if (isRendering) {
      console.warn('[send] was called during render. This is forbidden.');
    }
    send(event);
  };
}

Use in your component:

markRenderStart();
const output = (
  <div> ... </div>
);
markRenderEnd();

return output;


---

✅ Want to prevent this at compile time?

It’s possible to build a small linter rule or wrap send() calls in a proxy that tracks usage during render. Let me know and I’ll show you how.

Here's a detailed prompt you can use to instruct an LLM (like ChatGPT or a local code assistant) to help you build imperative, event-driven logic in your React app using the design we discussed:


---

🔧 Prompt for LLM: Help Me Build Event-Driven State Logic in React

I’m building an event-driven state logic system using React’s useState, without abstractions like reducers or XState.

The system should:


---

✅ API & Architecture

I have a custom React hook:

useEventState<State, Context, Event>(
  initialState: State,
  initialContext: Context,
  {
    guards: Record<string, (ctx: Context, payload: unknown) => boolean>,
    actions: Record<string, (ctx: Context, payload: unknown, send: (event: Event) => void) => void>
  }
): [state, context, send, setContext, setState]

Where:

State is a string union of states (e.g. "idle" | "loading" | "error")

Context is an object with extended state (e.g. { data: any; error: any })

Event is a discriminated union of { type: string; payload: unknown } — this gives me full type safety for event handling.



---

✅ I want to build logic like this:

switch (state) {
  case 'idle':
    switch (event.type) {
      case 'LOAD':
        if (!guards.canLoad(context, event.payload)) return;
        actions.logStart(context, event.payload, send);
        actions.fetchData(context, event.payload, send);
        setState('loading');
        return;
    }
    break;

  case 'loading':
    switch (event.type) {
      case 'SUCCESS':
        setContext(prev => ({ ...prev, data: event.payload }));
        setState('success');
        return;
    }
    break;
}

I handle all state transitions and side effects inline, using switch(state) and switch(event.type), manually invoking:

guards to decide if a transition should proceed

actions to perform side effects (e.g. fetch, log, track)

setContext to mutate extended state

setState to transition between states


I expect to call send({ type: ..., payload: ... }) from event handlers or actions — but never during render.


---

🧠 Rules & Gotchas to Avoid

Tell me when I misuse this model. Warn me if:

1. I call send() inside render — this will break React.


2. I call send() in a useState initializer or top-level code — same problem.


3. I forget to update context + state together, causing desync.


4. I fire send() multiple times in parallel without guards, which can cause race conditions.


5. I write guards or actions that mutate context — they must be pure (no direct mutation).


6. I put long-running effects directly in render — these must live inside actions or effects.




---

🚧 Help me debug if:

I get a React error like “Cannot update a component while rendering”

My component re-renders infinitely

State and context seem "out of sync"

Actions run multiple times unexpectedly



---

🤖 What You Should Help Me Do

Write new event-driven logic using this API

Add new states, events, guards, and actions

Help model complex flows like:

retry loops

optimistic updates

fetch cancellations


Keep everything imperative and inside React


Always assume I want full control — no libraries, no useReducer, no XState. Just useState, switch statements, and safe, imperative event handling.


---

Let me know if you'd like this wrapped into a reusable doc, snippet package, or even ESLint rules to enforce safe usage.



