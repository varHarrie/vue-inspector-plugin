import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ComponentNode, ElementNode, VueNode, launchEditor } from '../utils';

@customElement('vi-component-stack')
export class VIComponentStack extends LitElement {
  @property({ type: Array })
  stack: VueNode[] = [];

  @property({ type: Object })
  selected?: VueNode;

  handleClick(e: MouseEvent, node: VueNode) {
    if (node.location) {
      launchEditor(node.location);
      this.dispatchEvent(new CustomEvent('click'));
    } else {
      e.stopPropagation();
    }
  }

  handleSelect(node: VueNode) {
    this.dispatchEvent(new CustomEvent('select', { detail: node }));
  }

  renderElement(node: ElementNode) {
    const classes = classMap({
      selected: node === this.selected,
      clickable: !!node.location,
    });

    return html`<li
      class="element ${classes}"
      @click="${(e: MouseEvent) => this.handleClick(e, node)}"
      @mouseenter=${() => this.handleSelect(node)}
    >
      <span class="title">${node.title}</span>
      <span class="location">${node.location}</span>
    </li>`;
  }

  renderComponent(node: ComponentNode) {
    const classes = classMap({
      isRoot: node.isRoot,
      isRoute: node.isRoute,
      selected: node === this.selected,
      clickable: !!node.location,
    });

    return html`<li
      class="component ${classes}"
      @click="${(e: MouseEvent) => this.handleClick(e, node)}"
      @mouseenter=${() => this.handleSelect(node)}
    >
      <span class="title">${node.title}</span>
      <span class="location">${node.location}</span>
    </li>`;
  }

  render() {
    return html`
      <ul>
        ${this.stack.map((node) =>
          node.type === 'element' ? this.renderElement(node) : this.renderComponent(node),
        )}
      </ul>
    `;
  }

  static styles = css`
    :host {
      min-width: 200px;
      max-width: 500px;
      max-height: 300px;
      overflow: auto;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      padding: 0 8px 0 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      line-height: 32px;
      word-break: keep-all;
      white-space: nowrap;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      transition: background 0.2s;
    }

    li.clickable {
      cursor: pointer;
    }

    li.clickable::after {
      margin-left: -4px;
      display: block;
      width: 4px;
      height: 4px;
      border-top: 1px solid rgba(0, 0, 0, 0.3);
      border-right: 1px solid rgba(0, 0, 0, 0.3);
      content: '';
      transform: rotate(45deg);
      opacity: 0.5;
    }

    li.selected {
      background: rgba(0, 0, 0, 0.03);
    }

    li:hover::after {
      opacity: 1;
    }

    li > span {
      color: rgba(0, 0, 0, 0.45);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title {
      max-width: 150px;
    }

    .location {
      margin-right: auto;
      flex: 1;
      min-width: 0;
    }

    li.element .title {
      color: #878b95;
    }

    li.component .title {
      color: #42b883;
    }

    li.component.isRoot .title {
      color: #4b7eff;
    }

    li.component.isRoute .title {
      color: #8e67cd;
    }
  `;
}
