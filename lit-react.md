Got it — if you're disabling Shadow DOM (i.e., rendering into light DOM), that changes a few things but also simplifies some others — especially around styling and integration with global CSS.

Here’s how to adapt your Lit + React setup accordingly.


---

✅ Disable Shadow DOM in Lit

You need to override the createRenderRoot() method in your Lit component:

createRenderRoot() {
  return this; // disables Shadow DOM, uses light DOM instead
}

This makes Lit render into the element's own light DOM, so this.querySelector() and global styles work as expected.


---

🔄 Updated Full Example (with createRoot and light DOM)

import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { createRoot, Root } from 'react-dom/client'
import React from 'react'
import MyReactComponent from './MyReactComponent'

@customElement('my-lit-component')
export class MyLitComponent extends LitElement {
  @property({ type: String }) message = ''

  private reactRoot?: Root
  private container?: HTMLDivElement

  // 👇 Disable Shadow DOM
  createRenderRoot() {
    return this
  }

  firstUpdated() {
    this.container = this.querySelector('#react-root') as HTMLDivElement

    if (this.container) {
      this.reactRoot = createRoot(this.container)
      this.renderReact()
    }
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('message')) {
      this.renderReact()
    }
  }

  private renderReact() {
    if (this.reactRoot) {
      this.reactRoot.render(<MyReactComponent message={this.message} />)
    }
  }

  disconnectedCallback() {
    this.reactRoot?.unmount()
    super.disconnectedCallback()
  }

  render() {
    return html`<div id="react-root"></div>`
  }
}


---

⚠️ Notes for Light DOM:

Use this.querySelector() instead of this.shadowRoot?.querySelector().

Global styles and :host selectors won't behave like in Shadow DOM — use normal classes and cascading CSS.

If you're injecting React components that expect isolated styling, be aware that light DOM makes them subject to the page's global styles — you might want to scope them manually or use CSS Modules in React.



---

Let me know if your use case also needs:

multiple React mount points

slotting data from Lit into React

rehydration or SSR considerations


I can give you precise patterns for those.



Yes, 100%. You can absolutely create a base class template for a Lit web component that handles the React mounting logic (createRoot, renderReact, etc.), and then extend it for more specific components with additional reactive properties or custom behavior.

This is a great pattern for reusability, especially when you're embedding React into many Lit-based components.


---

✅ Base Class Template

// base-react-lit.ts
import { LitElement, html } from 'lit'
import { Root, createRoot } from 'react-dom/client'
import React from 'react'

export abstract class BaseReactLit<P = {}> extends LitElement {
  protected reactRoot?: Root
  protected container?: HTMLElement

  // Light DOM, so styles can bleed in
  createRenderRoot() {
    return this
  }

  firstUpdated() {
    this.container = this.querySelector('#react-root') as HTMLElement

    if (this.container) {
      this.reactRoot = createRoot(this.container)
      this.renderReact()
    }
  }

  updated() {
    this.renderReact()
  }

  disconnectedCallback() {
    this.reactRoot?.unmount()
    super.disconnectedCallback()
  }

  /**
   * Implement this in child classes to render the correct React tree
   */
  protected abstract getReactComponent(): React.ReactElement<P>

  protected renderReact() {
    if (this.reactRoot && this.container) {
      this.reactRoot.render(this.getReactComponent())
    }
  }

  render() {
    return html`<div id="react-root"></div>`
  }
}


---

🚀 Extend with Specific Components

// my-lit-wrapper.ts
import { customElement, property } from 'lit/decorators.js'
import React from 'react'
import MyReactComponent from './MyReactComponent'
import { BaseReactLit } from './base-react-lit'

@customElement('my-lit-wrapper')
export class MyLitWrapper extends BaseReactLit<{ message: string }> {
  @property({ type: String }) message = 'default message'

  protected getReactComponent() {
    return <MyReactComponent message={this.message} />
  }
}


---

✅ Benefits

You centralize lifecycle and interop logic.

You can override render() if you want to place <slot>s or other markup outside the React root.

You can add custom scheduling, throttling, memoization, or batching in renderReact in the base class.



---

🧠 Optional Enhancements

Add a shouldRenderReact(changedProps) hook.

Add lifecycle hooks like beforeReactRender() / afterReactRender().

Add a way to pass children via slot and inject them into the React tree.


Let me know if you want a version that supports passing slotted DOM nodes as children into the React component — it's a bit more work but possible.

