import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { VueNode } from '../utils';

@customElement('vi-active-overlay')
export class ViActiveOverlay extends LitElement {
  @property({ type: Object })
  node?: VueNode;

  updated(): void {
    const el = this.node?.el;

    if (this.node && el?.nodeType === Node.ELEMENT_NODE) {
      const { top, left, width, height } = el.getBoundingClientRect();

      this.style.display = 'block';
      this.style.top = `${top}px`;
      this.style.left = `${left}px`;
      this.style.width = `${width}px`;
      this.style.height = `${height}px`;
      this.setAttribute('data-title', this.node.title);
    } else {
      this.style.display = 'none';
      this.removeAttribute('data-title');
    }
  }

  static styles = css`
    :host {
      position: fixed;
      z-index: 100000;
      padding: 4px;
      border: 1px solid rgba(66, 184, 131, 0.8);
      background: rgba(66, 184, 131, 0.2);
      pointer-events: none;
      box-sizing: border-box;
    }

    :host::before {
      position: sticky;
      top: 4px;
      left: 4px;
      padding: 0 4px;
      display: inline-block;
      max-width: 100%;
      border-radius: 2px;
      border: 1px solid rgba(66, 184, 131, 0.8);
      background: rgba(255, 255, 255, 0.8);
      color: #42b883;
      content: attr(data-title);
      font-size: 12px;
      line-height: 1.5em;
      word-break: keep-all;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
    }
  `;
}
