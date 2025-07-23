Great—if you're not worried about prop drilling, and your federated modules act more like container components tightly coupled to their APIs, then you’re in a space where explicitness, scalability, and clear boundaries matter most.

Let’s reframe the comparison now, focusing on your clarified goals.


---

🧠 Revised Principles

Given:

Components are containers tied to their own APIs

No concern over prop drilling

Desire for explicit, scalable, self-contained architecture

Teams are independent, building modules that integrate into a shell



---

🔁 Pattern Comparison (Updated)

Feature	Props-based (segmentId as prop)	Fetch-wrapper (segmentId inside fetch client)

Explicit contract	✅ Clear and visible	❌ Hidden via abstraction
Team independence	✅ Teams define what props they consume	⚠️ Requires shared fetch contract
Scaling with new context (e.g. new params, user flags)	✅ Just add a new prop	⚠️ Wrapper must be extended, maybe centrally
Observability & Testing	✅ Easy: mock props	⚠️ Harder: need to mock internal fetch logic
Data + UI split	✅ Can render conditionally before fetch	❌ Needs to wait for fetch
Consistency across modules	✅ Shell enforces prop shape	⚠️ Teams might use different fetch logic/styles
Reusability inside modules	✅ Components can branch by prop	⚠️ Less so—component is blindly data-driven



---

📌 Conclusion

✅ Pass segmentId as a prop — this is the most explicit, scalable solution in your case.

You get:

Clear ownership: Shell decides what context to pass. Module decides how to use it.

Auditability: Easy to see what’s segment-driven.

Loose coupling: No need to agree on fetch logic, just on prop shape.

Composable behavior: Internal components can refactor freely, decide to use context or not.

Flexibility for UI and data logic: Render variants immediately or defer to data.


You’re embracing the idea that federated modules are smart containers. They should be explicitly told what “world” they live in (via props like segmentId), and own their own data fetching and presentation logic.


---

🧱 Architectural Suggestion

Contract Example:

type ShellToModuleProps = {
  segmentId: string;
  locale?: string;
  featureFlags?: Record<string, boolean>;
};

Shell mounts:

<FederatedModule segmentId="retail" locale="en-CH" />

Federated app owns:

useFetch(segmentId) or useSegmentData()

if (segmentId === 'retail') logic for layout/rendering

No reliance on global context or shared fetch clients



---

Bonus Tip: Define prop contracts per module in the module repo and export TS types via module federation or codegen (e.g. type-safe-mf or shared schema repo).


---

TL;DR

✅ Pass segmentId explicitly as a prop
❌ Avoid fetch wrapper unless you want global hidden behavior
📈 This scales better in multi-team environments with container-style modules and visible API contracts.

