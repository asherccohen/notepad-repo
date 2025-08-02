Creating a curriculum for a class on programming semantics tailored to junior developers, using TypeScript, and designed for someone like you—a tech lead frontend developer with a passion for language semantics but without a deep mathematical background—is a fantastic idea! Given your context, we’ll focus on an approachable, practical introduction to concepts like denotational semantics, keeping it simple yet insightful. The curriculum will leverage your strengths in frontend development and TypeScript, while gradually introducing semantic ideas through relatable examples. Below is a proposed 8-week curriculum, with each session lasting about 1.5–2 hours, suitable for juniors and manageable for you to teach.

---

### Curriculum: Introduction to Programming Semantics with TypeScript
**Target Audience:** Junior Developers  
**Instructor Background:** Tech Lead Frontend Developer (non-CS degree, passionate about semantics)  
**Language:** TypeScript  
**Goal:** Build intuition about how programming languages work, focusing on semantics (e.g., denotational semantics), and apply it to real-world coding practices.

---

#### Week 1: What Are Semantics and Why Should We Care?
- **Objective:** Introduce the idea of semantics in a non-technical way and connect it to everyday coding.
- **Content:**
  - Define semantics simply: "Semantics is about what a piece of code *means*—not just what it does, but how we understand it."
  - Relate to natural language: Compare "The cat sleeps" (meaning) vs. "cat sleeps" (syntax) to "let x = 5" (meaning: x holds 5) vs. the syntax itself.
  - Introduce the idea that programming languages have "meanings" we can map, inspired by Aram Hăvărneanu’s post.
- **Activity (TypeScript Focus):**
  - Write a simple TypeScript function: `function add(a: number, b: number): number { return a + b; }`.
  - Discuss: What does this function *mean*? (It takes two numbers and returns their sum.)
  - Extend it with a type error (e.g., `add("5", 3)`), and let juniors explain the "broken meaning."
- **Takeaway:** Semantics helps us reason about code meaning, and TypeScript’s type system is a tool to enforce it.
- **Preparation for You:** Review basic TypeScript types (e.g., `number`, `string`) and how they guide meaning.

---

#### Week 2: Mapping Code to Meaning (Intro to Denotational Semantics)
- **Objective:** Introduce denotational semantics as "mapping code to what it does" without heavy math.
- **Content:**
  - Explain denotational semantics as assigning a "value" or "result" to every piece of code (e.g., a function maps inputs to outputs).
  - Use Hăvărneanu’s natural language analogy: Just as words map to ideas, code maps to actions or values.
  - Avoid domains/math; focus on intuition: "What does this code *represent*?"
- **Activity (TypeScript Focus):**
  - Define a function: `function greet(name: string): string { return `Hello, ${name}!`; }`.
  - Ask: What’s the "meaning" of `greet("Alice")`? (It represents "Hello, Alice!").
  - Create a table: Input (e.g., "Bob") → Output (e.g., "Hello, Bob!").
  - Discuss how TypeScript ensures the "meaning" stays consistent (e.g., no numbers as names).
- **Takeaway:** Code has a "meaning map" we can predict, and types help enforce it.
- **Preparation for You:** Practice mapping simple functions to outputs; skim Wikipedia’s denotational semantics page for high-level ideas (skip the math).

---

#### Week 3: Building Blocks of Meaning with Types
- **Objective:** Explore how TypeScript types shape semantics.
- **Content:**
  - Discuss how types (e.g., `string`, `number`, `boolean`) define what code can "mean."
  - Introduce unions and interfaces: e.g., `type Result = string | number;` or `interface User { name: string; }`.
  - Relate to semantics: Types are like rules that ensure the "meaning" aligns with intent.
- **Activity (TypeScript Focus):**
  - Create an interface: `interface Product { name: string; price: number; }`.
  - Write a function: `function describeProduct(p: Product): string { return `${p.name} costs ${p.price}`; }`.
  - Test with valid data (`{ name: "Book", price: 10 }`) and invalid data (`{ name: 5, price: "cheap" }`) to see TypeScript’s feedback.
  - Discuss: How does this enforce meaning?
- **Takeaway:** Types are a practical way to control and understand code meaning.
- **Preparation for You:** Review TypeScript documentation on interfaces and unions (keep it basic).

---

#### Week 4: From Simple to Complex Meanings
- **Objective:** Show how semantics scales with program complexity.
- **Content:**
  - Introduce nesting: Functions calling functions, or objects with nested properties.
  - Relate to denotational semantics: The "meaning" of a big program is built from smaller meanings.
- **Activity (TypeScript Focus):**
  - Build a nested structure: `interface Order { items: Product[]; total: number; }`.
  - Write: `function calculateTotal(order: Order): number { return order.items.reduce((sum, p) => sum + p.price, 0); }`.
  - Trace the "meaning": Each `item.price` contributes to `total`.
  - Debug a type error (e.g., missing `price` in an item) and discuss its impact on meaning.
- **Takeaway:** Semantics composes—small meanings build big ones, guided by types.
- **Preparation for You:** Test the code beforehand; focus on explaining step-by-step.

---

#### Week 5: Handling Uncertainty (Optional Semantics)
- **Objective:** Introduce cases where meaning isn’t fixed (e.g., null, undefined).
- **Content:**
  - Discuss how real-world code has "uncertain meanings" (e.g., a user might not provide data).
  - Relate to denotational semantics: Sometimes the "map" includes no value (e.g., partial functions).
- **Activity (TypeScript Focus):**
  - Use optional types: `interface User { name?: string; age?: number; }`.
  - Write: `function greetUser(u: User): string { return u.name ? `Hi, ${u.name}!` : "Hi, stranger!"; }`.
  - Test with `{ name: "Alice" }` and `{}`; discuss how the meaning adapts.
- **Takeaway:** Semantics can handle flexibility with proper design.
- **Preparation for You:** Explore TypeScript’s optional chaining (`?.`) for extra depth.

---

#### Week 6: Comparing Semantics Across Languages
- **Objective:** Broaden perspective by comparing TypeScript/JavaScript with other languages.
- **Content:**
  - Briefly contrast TypeScript’s static types with JavaScript’s dynamic nature, or Python’s simplicity.
  - Relate to Hăvărneanu’s idea: Different languages map meanings differently.
- **Activity (TypeScript Focus):**
  - Write a TypeScript function: `function multiply(a: number, b: number): number { return a * b; }`.
  - Compare with raw JavaScript (no types) and discuss how meaning might break (e.g., `multiply("2", 3)`).
  - Optional: Show a Python equivalent for fun.
- **Takeaway:** Semantics varies by language, but TypeScript gives us control.
- **Preparation for You:** Write simple examples in JavaScript/Python; keep it light.

---

#### Week 7: Applying Semantics to Design
- **Objective:** Use semantic understanding for better code design.
- **Content:**
  - Inspired by Hăvărneanu’s design point, show how mapping meaning helps structure code.
  - Example: Designing a reusable component with clear "meaning."
- **Activity (TypeScript Focus):**
  - Design a `Button` component: `interface ButtonProps { label: string; onClick: () => void; }`.
  - Implement: `function Button({ label, onClick }: ButtonProps) { return <button onClick={onClick}>{label}</button>; }`.
  - Discuss: How does the interface define the button’s "meaning"?
- **Takeaway:** Semantics guides clean, predictable code.
- **Preparation for You:** Test the React-like example; ensure it works in your setup.

---

#### Week 8: Capstone Project and Reflection
- **Objective:** Apply learned concepts to a small project.
- **Content:**
  - Juniors build a mini-app (e.g., a product list with totals) using semantic principles.
  - Reflect on how types and mappings improved their understanding.
- **Activity (TypeScript Focus):**
  - Provide a starter: `interface Item { name: string; price: number; }` and a function skeleton.
  - Let them complete it, encouraging type safety and clear "meanings."
  - Group discussion: What worked? What was hard?
- **Takeaway:** Semantics is a tool for better coding and teamwork.
- **Preparation for You:** Prepare a rubric (e.g., type usage, clarity) and sample solution.

---

### Tips for You as the Instructor
1. **Keep It Practical:** Focus on TypeScript’s type system as your "semantic engine"—it’s familiar and avoids math-heavy domains.
2. **Leverage Your Passion:** Share your excitement about language similarities (e.g., TypeScript vs. natural language) to engage juniors.
3. **Simplify Hăvărneanu’s Ideas:** Frame denotational semantics as "predicting what code does" with examples, not formulas.
4. **Resources:**
   - TypeScript Docs (typescriptlang.org) for reference.
   - Skim “Denotational Semantics” on Wikipedia for inspiration (skip technical sections).
   - Watch a beginner video on YouTube about programming language design for context.
5. **Iterate:** After the first run, ask for feedback to adjust complexity.

---

### Why This Works for You
- **No Math Expertise Needed:** The curriculum avoids domains and continuous functions, focusing on intuitive mapping and TypeScript types.
- **Leverages Your Skills:** As a frontend tech lead, you can tie semantics to UI/UX (e.g., component design) and TypeScript, your comfort zone.
- **Junior-Friendly:** Starts simple, builds gradually, and uses hands-on coding to keep engagement high.
- **Aligns with Your Passion:** Explores language semantics and comparisons, fulfilling your interest while teaching.

Let me know if you’d like to tweak any week or add more examples! I’m here to help refine this as you go. 😄