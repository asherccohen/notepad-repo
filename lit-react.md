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

