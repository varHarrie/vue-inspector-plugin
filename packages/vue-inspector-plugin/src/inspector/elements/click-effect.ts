import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('vi-click-effect')
export class ClickEffect extends LitElement {
  constructor(event: MouseEvent) {
    super();
    this.style.top = `${event.clientY}px`;
    this.style.left = `${event.clientX}px`;
  }

  render() {
    return html``;
  }

  static styles = css`
    @keyframes zoom-in {
      from {
        opacity: 0.5;
        transform: scale(0.5);
      }
      to {
        opacity: 0;
        transform: scale(1);
      }
    }

    @keyframes zoom-out {
      to {
        transform: scale(0);
      }
      from {
        transform: scale(0.3);
      }
    }

    :host {
      position: fixed;
      z-index: 100001;
      pointer-events: none;
    }

    :host::before,
    :host::after {
      position: absolute;
      top: -30px;
      left: -30px;
      display: block;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #42b883;
      content: '';
      opacity: 0;
    }

    :host::before {
      animation: zoom-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    :host::after {
      animation: zoom-out 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0.2;
      transform: scale(0.3);
    }
  `;
}
