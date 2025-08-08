You're a senior fullstack software engineer. I want to build a lightweight devtools-like component documentation system inside my app, similar to Storybook Docs, but minimal and embedded.

Constraints:
- I'm using Rollup (not Webpack/Vite)
- Components live in a monorepo
- I want to colocate a `.md` or `.mdx` file next to each component
- In dev mode only, I want a sidebar that imports and renders the markdown or MDX content
- Docs should update on rebuild with zero manual steps
- Bonus: I might want to auto-generate docs from code with AI

Your task:
1. Describe the simplest technical setup using Rollup that loads and renders `.mdx` or `.md` as React in dev mode only
2. Recommend the cleanest way to dynamically import docs per component
3. Include code snippets for React, Rollup config, and loaders/plugins
4. Avoid overengineering or complex toolchains
5. Make it developer-friendly, fast to implement, and low-maintenance

Output: Show only concise explanation + code blocks. No fluff. No analogies. Just engineer-to-engineer.

Sure — here's a clean and focused prompt format you can reuse with any LLM to get a solid, context-aware response to your original question:


---

✅ Prompt: Evaluate a lightweight alternative to Storybook for a module-federated React component library

Context:
I'm a tech lead building a module-federated React component library in a resource-constrained environment.

Current Challenge:
The business requested Storybook, but past experience shows it’s high-maintenance (upgrade issues, dependency bloat, and documentation drift). We have no tools team, tight deadlines, and limited capacity.


---

💡 Proposed Alternative (Custom Component Playground):

1. Route-per-component: /components/Button renders the component in isolation.


2. DevTools sidebar, activated via ?dev=true:

Live prop manipulation

Auto-generated docs from TypeScript types

Toggle between real API and MSW mock data



3. Zero new dependencies: Uses existing app infra (routing, MSW, TS, etc.)




---

❓What I Need From You (LLM):

Please assess this approach across the following dimensions:

1. Strengths:

What advantages does this approach offer given the constraints?



2. Weaknesses/Risks:

What features of Storybook does this approach fail to cover?

What technical or organizational risks should I be aware of?



3. Maintenance:

Does this reduce long-term overhead or just move it elsewhere?



4. Adoption & DX:

How will this impact consumer experience (internal developers)?

Are there discoverability or usability gaps?



5. Scalability:

What happens when the library grows to 50+ components?



6. Improvements:

How could I sustainably extend this approach to match Storybook’s core value?



7. Alternatives (optional):

Are hybrid approaches (e.g., using Storybook in CI only) worth considering?

If advocating for Storybook, explain how to solve the specific maintenance issues (dependency churn, config overhead, API mocking).





---

⚙️ Stack/Assumptions:

TypeScript, React, module federation

MSW for API mocking

No tools team or Storybook maintainers

Priorities: fast iteration, low maintenance, developer-focused DX



---

Let me know if you want this in markdown, plain text, or a .txt export.

