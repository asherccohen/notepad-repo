This is a nuanced architectural decision. You're choosing how to pass cross-cutting context (like segmentId) from a shell app to federated modules in a microfrontend system. The two patterns you describe are:


---

🧩 Pattern 1: Props-based context passing

> Shell passes segmentId as a React prop to the federated module. Module uses it for:

Conditional rendering (e.g., showing a variant)

Including it as a query param or request body when calling APIs





---

🔁 Pattern 2: Contextual fetch abstraction

> Shell provides a fetch wrapper (think preconfigured Axios instance or custom fetch) that:

Injects segmentId (via headers or query)

Federated modules don't receive segmentId directly as a prop

UI rendering becomes data-driven via the fetch response





---

✅ Shared Requirements

Both shell and remote modules are independently developed

You want flexibility in customizing UI and data via segmentId

Modules should be loosely coupled but still driven by shared context



---

⚖️ Analysis

🔹 Pattern 1: Props-based context

✅ Pros

Explicit contract: It's clear which components use segmentId

Easy to test/debug: Segment-driven logic is visible and traceable in React props

Supports rendering variants: You can change UI before even doing a fetch

Framework-native: No abstraction around fetch needed

Composability: Child components can easily inherit/override


❌ Cons

Prop drilling risk: If segmentId is needed deep in the tree

Duplicate logic: Components may both conditionally render and send segmentId in requests

Tight coupling: You now bind every federated app to a shared prop name and shape



---

🔹 Pattern 2: Fetch wrapper with implicit context

✅ Pros

Centralized configuration: Segment logic lives in one place (fetch config)

No prop drilling: Cleaner component APIs

Easier future changes: You can enrich fetch context with more headers (e.g., auth, feature flags)

Encourages data-driven UI: Components react to the data, not environment


❌ Cons

Implicit behavior: Segment influence is hidden inside fetch

Harder to test: You’ll need to mock fetch context to test rendering behavior

Rendering constraints: You can't conditionally render variants before the data fetch resolves

Tighter data-service contract: APIs must return all the conditional logic outcomes



---

👁️ Use Case Implications

Use Case	Best Fit

UI variants before data load (e.g. layout changes by segment)	✅ Props-based
Complex business logic is server-side	✅ Fetch wrapper
Need to audit/log segment usage per render	✅ Props-based
You want zero coupling in module interfaces	✅ Fetch wrapper
Segments are part of broader context (like auth, locale)	✅ Fetch wrapper



---

🧠 Recommendation

Use both but cleanly separated:

Shell injects segmentId into a global context (e.g. via React Context or a SegmentContext.Provider)

Provide:

a custom useSegment() hook for rendering

a custom useSegmentFetch() or createSegmentedFetcher() for data needs



This gives you:

UI logic: const segmentId = useSegment();

Data logic: const fetcher = useSegmentedFetcher();


Modules opt-in to what they need — no prop drilling, no overly implicit behavior.


---

Bonus: Implementation Tips

// shell app
<SegmentContext.Provider value={segmentId}>
  <FederatedModule />
</SegmentContext.Provider>

// fetch wrapper
export const createSegmentedFetcher = (segmentId: string) => {
  return async (url: string, opts?: RequestInit) => {
    return fetch(url, {
      ...opts,
      headers: {
        ...opts?.headers,
        'X-Segment-ID': segmentId,
      },
    });
  };
};

// in federated app
const segmentId = useSegment();
const fetcher = useSegmentedFetcher();

useEffect(() => {
  fetcher('/api/data').then(...);
}, []);


---

Final Verdict

Pattern	UI-driven segments	Data-driven segments	Scalability	DX

Props	✅ Great	⚠️ Limited	⚠️ Manual conventions	✅ Explicit
Fetch	❌ Delayed rendering	✅ Centralized	✅ Scalable	⚠️ Implicit
Context-based hybrid	✅ Best of both	✅ Best of both	✅ Clean boundaries	✅ Clear DX


Use the hybrid. It keeps contracts clean across independently built teams, avoids leaking context into props, and scales better.


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

