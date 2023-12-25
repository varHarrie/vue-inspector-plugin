import { LitElement, TemplateResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  getComponentPropTree,
  getComponentDataTree,
  getComponentSetupStateTree,
  ComponentNode,
  getComponentComputedTree,
} from '../utils';

import './state-tree';

@customElement('vi-component-state')
export class VIComponentState extends LitElement {
  @property({ type: Object })
  node?: ComponentNode;

  get props() {
    const tree = this.node ? getComponentPropTree(this.node.vm) : [];
    return tree.length ? [{ title: 'props', children: tree, expended: true }] : [];
  }

  get data() {
    const tree = this.node ? getComponentDataTree(this.node.vm) : [];
    return tree.length ? [{ title: 'data', children: tree, expended: true }] : [];
  }

  get setupState() {
    const tree = this.node ? getComponentSetupStateTree(this.node.vm) : [];
    return tree.length ? [{ title: 'setup', children: tree, expended: true }] : [];
  }

  get computed() {
    const tree = this.node ? getComponentComputedTree(this.node.vm) : [];
    return tree.length ? [{ title: 'computed', children: tree, expended: true }] : [];
  }

  render() {
    const list: TemplateResult[] = [];

    if (this.props.length) {
      list.push(html`<vi-state-tree .data=${this.props}></vi-state-tree>`);
    }

    if (this.setupState.length) {
      list.push(html`<vi-state-tree .data=${this.setupState}></vi-state-tree>`);
    }

    if (this.data.length) {
      list.push(html`<vi-state-tree .data=${this.data}></vi-state-tree>`);
    }

    if (this.computed.length) {
      list.push(html`<vi-state-tree .data=${this.computed}></vi-state-tree>`);
    }

    return html`<div class="list">${list}</div>`;
  }

  static styles = css`
    :host {
      border-left: 1px solid rgba(0, 0, 0, 0.06);
    }

    .list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 300px;
      max-height: 300px;
      overflow: auto;
    }

    .list:empty {
      display: none;
    }
  `;
}
