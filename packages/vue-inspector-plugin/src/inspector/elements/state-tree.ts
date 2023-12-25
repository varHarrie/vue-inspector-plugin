import { LitElement, TemplateResult, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { StateNode, StateRootNode, formatStateValues } from '../utils';

@customElement('vi-state-tree')
export class VIStateTree extends LitElement {
  @property({ type: Array })
  data: (StateRootNode | StateNode)[] = [];

  @property({ type: Boolean })
  expanded = false;

  handleToggle(node: StateRootNode | StateNode) {
    if (!('children' in node) && !('raw' in node)) return;

    node.expended = !node.expended;

    if (node.expended && !node.children && 'raw' in node) {
      node.children = formatStateValues(node.raw, node.deep + 1);
    }

    this.requestUpdate();
  }

  renderNode(node: StateRootNode | StateNode) {
    const content: TemplateResult[] = [];

    const expandable = 'children' in node || 'raw' in node;
    const expanded = expandable && node.expended;

    content.push(html`
      <div
        class="detail ${classMap({ expandable, expanded })}"
        style=${styleMap({ paddingLeft: 'deep' in node ? node.deep * 12 + 'px' : undefined })}
      >
        <span class="key" @click=${() => this.handleToggle(node)}>
          ${expandable ? html`<span class="arrow"></span>` : html`<span class="space"></span>`}
          ${'title' in node
            ? html`<span class="title">${node.title}</span>`
            : html`<span>${node.key}</span><span class="colon">:</span>`}
        </span>
        ${'type' in node ? html`<span class="value ${node.type}">${node.value}</span>` : ''}
      </div>
    `);

    if ('children' in node && node.children?.length && node.expended) {
      content.push(html` <vi-state-tree .data=${node.children}></vi-state-tree>`);
    }

    return html`<div class="node">${content}</div>`;
  }

  render() {
    return html`${this.data?.map((node) => this.renderNode(node))}`;
  }

  static styles = css`
    .detail {
      line-height: 1.5em;
    }

    .space,
    .arrow {
      display: inline-block;
      width: 12px;
    }

    .arrow::before {
      display: inline-block;
      border-style: solid;
      border-width: 4px 0px 4px 5px;
      border-color: transparent transparent transparent #888;
      transition: transform 0.2s;
      cursor: pointer;
      content: '';
    }

    .expanded .arrow::before {
      transform: rotate(90deg);
    }

    .expandable .key {
      cursor: pointer;
    }

    .key {
      display: inline-flex;
      color: #0550ae;
      word-break: break-all;
      vertical-align: top;
    }

    .title {
      font-weight: bold;
      color: #42b883;
    }

    .colon {
      margin-left: 2px;
    }

    .value {
      color: rgba(0, 0, 0, 0.45);
      word-break: break-all;
    }

    .value.string {
      color: #cf222e;
    }

    .value.number {
      color: #6639ba;
    }

    .value.function,
    .value.object,
    .value.array,
    .value.symbol {
      font-style: italic;
    }
  `;
}
