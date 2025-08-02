You're absolutely right — using opacity or transform to "hide" complex components like modals isn't practical in most real-world apps. Especially when:

The modal does data fetching or init logic

It has internal state (e.g. form inputs, navigation)

It's a security-sensitive view (e.g. user tokens or sensitive content)


In those cases, keeping it mounted just to avoid layout cost can backfire — you trade a micro-optimization for complexity, potential bugs, or even security issues.

So yes — use opacity or transform only for purely presentational, lightweight elements like:

Animating a tooltip in/out

Sliding panels that don’t do much inside

Image transitions

Skeleton loaders



---

Now, about other layout (reflow) bottlenecks, beyond modals:

Here’s where layout can hurt you:


---

🔄 DOM-Dependent Calculations

Using layout-dependent properties in JS (like element.offsetTop, getBoundingClientRect(), scrollHeight) causes a forced reflow — the browser must flush any pending changes first to return accurate values.

Example:

const top = element.getBoundingClientRect().top;
element.style.height = top + 'px';

This causes layout thrashing: read → write → read → write.


---

🔁 Animating Layout Properties

Animating properties like:

width

height

margin

padding

top / left


...triggers layout on every frame. This is much more expensive than animating transform or opacity, which only hit the compositor.


---

📐 Deep DOM Trees with Flex/Grid

Modern layout systems like Flexbox or Grid make layout easier, but they expand layout scope. Changing one element's size can bubble up and force layout recalculations throughout a large subtree.

Example: resizing a child inside a deeply nested grid layout can ripple across siblings and parents.


---

📊 Tables and Complex CSS

<table> layouts are notorious for reflow bottlenecks.

Elements with position: sticky or dynamic column widths make it worse.

CSS with calc() depending on other elements can also be problematic.



---

🧠 Font and Content Size Changes

Dynamic font loading, or content injection (e.g. translation strings or async text), can cause unpredictable reflows.


---

🧼 Summary: What to Avoid

Action	Causes Layout?	Better Alternative

Changing width, height, top, left	✅ Yes	Use transform if possible
Accessing layout props (offsetTop)	✅ Yes	Batch reads/writes
Animating size or margins	✅ Yes	Animate scale instead
Changing deeply nested grid/flex children	✅ Yes	Minimize nesting depth



---

Let me know if you want to build a visualizer for layout thrashing or need perf-tuning tips for specific components.

