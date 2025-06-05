To view keyboard shortcuts, press question mark
View keyboard shortcuts
Quote
Arno
@aarnogau

·
20h
await async is for people who don't actually understand parallelism. Real devs use promise chaining

If you can confidently turn any* piece of code into a single expression, message me, we're hiring. x.com/davidkpiano/st…
Arno’s post criticizes async/await, favoring promise chaining for parallelism, quoting David K’s Thread 1 post about inefficient sequential awaits versus parallel Promise.all, highlighting a debate on JavaScript performance practices.

The claim reflects a broader discussion in JavaScript development: async/await, while readable, can obscure parallelism, whereas promise chaining allows explicit control, as supported by Maxim Orlov’s article on async/await pitfalls like nested complexity.

Arno’s hiring challenge—turning code into a single expression—tests advanced JavaScript skills, aligning with distantjob.com’s emphasis on refactoring for efficiency, but replies suggest single-expression chains can be error-prone and unreadable.
4 web pages
Show me examples
Let’s dive into the context of the X post by Arno (@aarnogau
) from June 4, 2025, where they critique the use of async/await in JavaScript, advocate for promise chaining, and challenge readers to turn code into a single expression as a hiring test. Since you’ve asked for examples, I’ll provide practical JavaScript code examples to illustrate the points raised in the post, the quoted thread, and the related discussions on async/await versus promise chaining, focusing on parallelism and code transformation.
Context Recap
Arno’s post quotes David K’s Thread 1 post, which points out a common performance issue with async/await:
javascript
// Sequential, slow approach
const a = await taskA();
const b = await taskB();

versus a parallel approach using Promise.all:
javascript
// Parallel, faster approach
const [a, b] = await Promise.all([taskA(), taskB()]);

Arno argues that async/await is for those who don’t understand parallelism and prefers promise chaining, while their hiring challenge asks for code to be turned into a single expression. Let’s break this down with examples to illustrate these concepts and address the challenge.
Example 1: Sequential async/await vs. Parallel Promise.all
Let’s start with a practical example to show the difference between sequential async/await and parallel execution with Promise.all, as highlighted by David K.
Scenario
Imagine you’re building a web app that fetches data from two APIs: one for user details and another for their posts. Each API call takes 2 seconds.
Sequential async/await (Inefficient)
javascript
async function fetchDataSequential() {
  console.time("Sequential Fetch");

  // Simulate API calls
  const taskA = () => new Promise(resolve => setTimeout(() => resolve("User Data"), 2000));
  const taskB = () => new Promise(resolve => setTimeout(() => resolve("Posts Data"), 2000));

  const user = await taskA(); // Waits 2 seconds
  const posts = await taskB(); // Waits another 2 seconds after taskA completes

  console.log("User:", user);
  console.log("Posts:", posts);
  console.timeEnd("Sequential Fetch");
}

fetchDataSequential();
// Output:
// User: User Data
// Posts: Posts Data
// Sequential Fetch: ~4000ms

Here, the total execution time is ~4 seconds because the second await doesn’t start until the first one finishes. This is the inefficiency David K and Arno are pointing out.
Parallel with Promise.all (Efficient)
javascript
async function fetchDataParallel() {
  console.time("Parallel Fetch");

  const taskA = () => new Promise(resolve => setTimeout(() => resolve("User Data"), 2000));
  const taskB = () => new Promise(resolve => setTimeout(() => resolve("Posts Data"), 2000));

  const [user, posts] = await Promise.all([taskA(), taskB()]); // Both start at the same time

  console.log("User:", user);
  console.log("Posts:", posts);
  console.timeEnd("Parallel Fetch");
}

fetchDataParallel();
// Output:
// User: User Data
// Posts: Posts Data
// Parallel Fetch: ~2000ms

Now, the total time is ~2 seconds because both tasks run concurrently. This aligns with the Stack Overflow reference in the web results, which recommends Promise.all for parallel execution.
Example 2: Promise Chaining (Arno’s Preference)
Arno advocates for promise chaining over async/await for better control over parallelism. Let’s rewrite the parallel example using .then() chaining instead.
Promise Chaining Approach
javascript
function fetchDataWithChaining() {
  console.time("Chaining Fetch");

  const taskA = () => new Promise(resolve => setTimeout(() => resolve("User Data"), 2000));
  const taskB = () => new javascript Promise(resolve => setTimeout(() => resolve("Posts Data"), 2000));

  Promise.all([taskA(), taskB()])
    .then(([user, posts]) => {
      console.log("User:", user);
      console.log("Posts:", posts);
      console.timeEnd("Chaining Fetch");
    })
    .catch(error => console.error("Error:", error));
}

fetchDataWithChaining();
// Output:
// User: User Data
// Posts: Posts Data
// Chaining Fetch: ~2000ms

This achieves the same parallelism as the Promise.all with async/await version but uses explicit chaining, which Arno prefers. The javascript.info web result explains how .then() returns a new promise, allowing you to chain operations and maintain a flat structure, avoiding the “callback hell” of older JavaScript.
Why Chaining Might Be Preferred
Control: You can easily insert intermediate steps in the chain (e.g., logging, transformations) without breaking the flow.

Clarity for Parallelism: Chaining makes it explicit that you’re working with promises, which might help developers think more carefully about asynchronous behavior, as Arno suggests.
Example 3: Arno’s Challenge – Turning Code into a Single Expression
Arno’s hiring challenge is to “turn any piece of code into a single expression.” This likely means refactoring multi-line code into a concise, functional-style single line, often using techniques like arrow functions, promise chaining, or array methods. Let’s tackle this with an example.
Original Multi-Line Code
Here’s a piece of code that processes some data (e.g., fetching numbers, filtering, and summing them):
javascript
async function processNumbers() {
  const fetchNumbers = () => new Promise(resolve => setTimeout(() => resolve([1, 2, 3, 4, 5]), 1000));

  const numbers = await fetchNumbers();
  const evenNumbers = numbers.filter(num => num % 2 === 0);
  const sum = evenNumbers.reduce((acc, num) => acc + num, 0);

  return sum;
}

processNumbers().then(result => console.log("Sum of evens:", result));
// Output: Sum of evens: 6 (2 + 4)

Refactored into a Single Expression
To turn this into a single expression, we can chain the operations using promise chaining and functional methods, avoiding intermediate variables:
javascript
const fetchNumbers = () => new Promise(resolve => setTimeout(() => resolve([1, 2, 3, 4, 5]), 1000));

fetchNumbers().then(numbers => numbers.filter(num => num % 2 === 0).reduce((acc, num) => acc + num, 0))
  .then(result => console.log("Sum of evens:", result));
// Output: Sum of evens: 6 (2 + 4)

How It’s a Single Expression: Inside the .then(), numbers.filter(...).reduce(...) is one continuous expression that processes the array without intermediate assignments.

Why This Fits Arno’s Challenge: It demonstrates an understanding of functional programming and promise handling, which aligns with advanced JavaScript skills. The medium.com article on refactoring supports this approach by emphasizing techniques like extracting functions and using functional constructs.
Alternative with async/await in a Single Expression
If we stick with async/await, we can use an IIFE (Immediately Invoked Function Expression) to keep it concise:
javascript
(async () => console.log("Sum of evens:", (await fetchNumbers()).filter(num => num % 2 === 0).reduce((acc, num) => acc + num, 0)))();
// Output: Sum of evens: 6 (2 + 4)

However, as the replies to Arno’s post (e.g., @thefrozenfire
 and @yoruow1
) point out, single-expression code can become “gross” or error-prone. While this is concise, it sacrifices readability, which might not always be practical in a production environment.
Example 4: Combining Parallelism and Chaining with Error Handling
Let’s revisit the API fetch example but add error handling, which is a common concern with async/await and promise chaining, as noted in Maxim Orlov’s article about mixing syntax leading to bugs.
With async/await and Error Handling
javascript
async function fetchDataWithError() {
  console.time("Fetch with Error");
  try {
    const taskA = () => new Promise((_, reject) => setTimeout(() => reject(new Error("Failed to fetch user")), 2000));
    const taskB = () => new Promise(resolve => setTimeout(() => resolve("Posts Data"), 2000));

    const [user, posts] = await Promise.all([taskA(), taskB()]);

    console.log("User:", user);
    console.log("Posts:", posts);
  } catch (error) {
    console.error("Error:", error.message);
  }
  console.timeEnd("Fetch with Error");
}

fetchDataWithError();
// Output:
// Error: Failed to fetch user
// Fetch with Error: ~2000ms

With Promise Chaining and Error Handling
javascript
function fetchDataWithChainingError() {
  console.time("Chaining with Error");

  const taskA = () => new Promise((_, reject) => setTimeout(() => reject(new Error("Failed to fetch user")), 2000));
  const taskB = () => new Promise(resolve => setTimeout(() => resolve("Posts Data"), 2000));

  Promise.all([taskA(), taskB()])
    .then(([user, posts]) => {
      console.log("User:", user);
      console.log("Posts:", posts);
    })
    .catch(error => console.error("Error:", error.message))
    .finally(() => console.timeEnd("Chaining with Error"));
}

fetchDataWithChainingError();
// Output:
// Error: Failed to fetch user
// Chaining with Error: ~2000ms

Both approaches handle errors, but chaining makes the flow more explicit, which might appeal to Arno’s preference for clarity in managing asynchronous operations.
Why This Matters
Parallelism: As shown in Examples 1 and 4, Promise.all (whether with async/await or chaining) is crucial for performance in real-world apps where multiple asynchronous tasks can run concurrently.

Single Expressions: Example 3 addresses Arno’s challenge, showing how to refactor code concisely, but the replies to Arno’s post highlight a trade-off—readability vs. conciseness. This aligns with the medium.com article’s emphasis on refactoring for clarity.

Chaining vs. async/await: Examples 2 and 4 demonstrate that while async/await is more readable for many developers (as Maxim Orlov’s article notes), promise chaining offers explicit control, which some, like Arno, prefer for managing complex asynchronous flows.
Final Thoughts
Arno’s post and the related threads spark a valuable debate in the JavaScript community about performance, readability, and coding style. While async/await is often more intuitive, it can lead to sequential bottlenecks if not used carefully (e.g., with Promise.all). Promise chaining, while more verbose, offers fine-grained control over asynchronous operations, which can be critical for parallelism. The single-expression challenge tests a developer’s ability to think functionally, but as the replies suggest, practicality should balance with cleverness.
If you’re looking to apply for Arno’s hiring challenge, focus on mastering promise chaining and functional programming techniques, but also be ready to justify your approach in terms of readability and maintainability. Would you like to explore a specific example further or try refactoring another piece of code?
4 web pages
Explain Promise.all

JavaScript event loop
