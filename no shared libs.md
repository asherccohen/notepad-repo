Stop Publishing Internal npm Packages (the wrong way)

Let’s be blunt: internal npm packages are usually a mess.

We don’t hate code reuse. We hate how it’s being done. You’re shipping brittle packages, half-bundled, under-typed, and over-promised. That’s not scalable. That’s not maintainable. That’s not even useful.

Let’s be clear: you are not a library maintainer. And that’s okay—because that’s not your job.

Yet somehow, teams keep shipping shared npm packages across projects like it’s a good idea. It's not. Here’s why:

1. You’re Not a Maintainer

Maintaining a package is a full-time job. It requires attention, responsiveness, versioning discipline, and long-term commitment. You already have a product to ship. Don’t add an OSS project on top.

2. You Don’t Have the Budget

Maintainers need time. Time costs money. Who’s going to triage bugs? Update dependencies? Handle breaking changes in consumers? Not you. Not anyone on your team. So don’t pretend otherwise.

3. You Can’t Control the Consumers

Once you publish to the registry—internal or public—you lose control. Other teams will consume your package, take dependencies on your internal logic, and complain when things break. You'll get blocked from making necessary changes.

4. Your Idea of Open Source Is Probably Wrong

Just because you watched a talk on "inner source" doesn’t mean you're building reusable infra. Sharing code is not the same as publishing it. If your real goal is reuse, use git submodules, monorepos, or workspaces—not npm.

5. You Don’t Know How to Write Library Code

Library code is not app code. It demands clear boundaries, zero side effects, real testing, semantic versioning, and long-term support. Most shared packages we’ve seen are opinionated hacks duct-taped together for one use case.

6. You’re Not Even Shipping Types

If your shared code doesn't have strict TypeScript typings, you're already setting your consumers up to fail. JavaScript-only packages are dead weight in a typed codebase.

7. You Don’t Understand Build Tooling

Bundlers. Transpilers. Compilers. ESM vs CJS. tree-shaking. peer deps. package exports. You're probably configuring all of it wrong, and that's going to break someone's build. That someone is going to be angry.

8. You Won’t Keep Up

The JS ecosystem changes monthly. What’s working today won’t tomorrow. Who’s tracking Rollup plugins? tsc changes? TS bundling quirks? Definitely not the author of your shared package.


---

So What Should You Do Instead?

Use a monorepo with pnpm, nx, or turborepo

Share code through workspaces or internal modules

Use git if it’s truly isolated logic and has to be shared externally

Treat all "shared code" as part of the product, not as a library


Stop creating tech debt under the illusion of reuse. Build for maintainability, not vanity.


The Fix: Share Source, Not Bundles

Here’s a better pattern:

Don’t publish to the npm registry. Keep it in your git monorepo or workspace.

If you must package it, publish source code only: raw .ts files, no build step, no bundler, no transpilation.

Consumers handle their own bundling, TS config, and tooling.

Use exports to expose exactly what’s meant to be used.

Keep the scope minimal—functions, types, and utilities. Not runtime code or framework wiring.

Enforce strict types. No any.


This approach lets you share code without pretending you're writing a general-purpose library. It puts the responsibility of compatibility and bundling where it belongs: in the app repo that consumes it.