import { matchModifierKey } from './utils';
import { VueInspector } from './elements/inspector';
import { ClickEffect } from './elements/click-effect';

let inspector: VueInspector | undefined;

function showClickEffect(e: MouseEvent) {
  const effect = new ClickEffect(e);
  document.body.appendChild(effect);
  setTimeout(() => effect.remove(), 1000);
}

function showDropdown(e: MouseEvent) {
  inspector = new VueInspector(e);
  inspector.addEventListener('hide', () => hideDropdown());
  document.body.appendChild(inspector);
}

function hideDropdown() {
  if (inspector) {
    document.body.removeChild(inspector);
    inspector = undefined;
  }
}

function handleClick(e: MouseEvent) {
  if (inspector?.contains(e.target as Node)) {
    return;
  }

  hideDropdown();

  if (matchModifierKey(e)) {
    e.preventDefault();
    e.stopPropagation();

    showClickEffect(e);
    showDropdown(e);
  }
}

document.addEventListener('click', handleClick, { capture: true });
window.addEventListener('resize', hideDropdown);
