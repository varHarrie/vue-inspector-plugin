import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('vi-dropdown')
export class VIDropdown extends LitElement {
  @property({ type: Object })
  point: { x: number; y: number } = { x: 0, y: 0 };

  observer?: ResizeObserver;

  updatePosition() {
    if (this.point.x + this.offsetWidth > window.innerWidth - 8) {
      this.point.x = window.innerWidth - this.offsetWidth - 8;
    }

    if (this.point.y + this.offsetHeight > window.innerHeight - 8) {
      this.point.y = window.innerHeight - this.offsetHeight - 8;
    }

    this.style.left = `${this.point.x}px`;
    this.style.top = `${this.point.y}px`;
  }

  connectedCallback() {
    super.connectedCallback();

    this.observer = new ResizeObserver(() => this.updatePosition());
    this.observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      position: fixed;
      z-index: 100001;
      border-radius: 4px;
      font-size: 12px;
      box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
        0px 3px 6px -4px rgba(0, 0, 0, 0.12);
      background: #fff;
      transition: top 0.2s, left 0.2s;
    }
  `;
}
