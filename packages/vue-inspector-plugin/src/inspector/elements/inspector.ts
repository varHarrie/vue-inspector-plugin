import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { ComponentNode, VueNode, getVueNodeStack } from '../utils';

import './component-stack';
import './component-state';
import './active-overlay';
import './dropdown';

@customElement('vi-inspector')
export class VueInspector extends LitElement {
  @state()
  private point: { x: number; y: number };

  @state()
  stack: VueNode[] = [];

  @state()
  selectedNode?: VueNode;

  constructor(event: MouseEvent) {
    super();

    this.point = { x: event.clientX + 2, y: event.clientY + 2 };
    this.stack = getVueNodeStack(event.target as HTMLElement);
  }

  handleHide() {
    this.dispatchEvent(new CustomEvent('hide'));
  }

  handleSelect(e: CustomEvent<VueNode>) {
    this.selectedNode = e.detail;
  }

  handleSelectCancel() {
    this.selectedNode = undefined;
  }

  render() {
    if (!this.stack.length) return html``;

    return html`
      <vi-dropdown .point=${this.point}>
        <div class="container" @mouseleave=${this.handleSelectCancel}>
          <vi-component-stack
            .stack=${this.stack}
            .selected=${this.selectedNode}
            @click=${this.handleHide}
            @select=${this.handleSelect}
          ></vi-component-stack>
          ${when(
            this.selectedNode?.type === 'component',
            () =>
              html`<vi-component-state
                .node=${this.selectedNode as ComponentNode}
              ></vi-component-state>`,
          )}
        </div>
      </vi-dropdown>
      ${when(
        this.selectedNode?.el,
        () => html`<vi-active-overlay .node=${this.selectedNode}></vi-active-overlay>`,
      )}
    `;
  }

  static styles = css`
    .container {
      display: flex;
    }
  `;
}
