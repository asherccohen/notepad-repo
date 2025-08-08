Here’s a clean and focused prompt format summarizing your request, optimized for LLMs:


---

Prompt:

> I'm building a web app with React and TypeScript. I use Mock Service Worker (MSW) for API mocking in development.

I want to conditionally enable MSW in production, but only when a specific URL parameter is present (e.g., ?mock=true).

Requirements:

Do not initialize the service worker unless the URL param is present.

Ensure it doesn't bloat the production bundle or interfere with real users.

Ideally lazy-load the MSW setup to avoid unnecessary imports.


Question:
How can I structure my MSW setup so it only activates in production when ?mock=true is in the URL?




---

Let me know if you want a version of this prompt tailored for Next.js or other environments like Vite or React Native.

