import './ui.css';

const ROOT = process.env.__VUE_INSPECTOR_ROOT__;
const MODIFIER_KEY = process.env.__VUE_INSPECTOR_MODIFIER_KEY__;
const SUPPORTED_MODIFIER_KEYS = ['shift', 'ctrl', 'alt', 'meta'];

let $dropdown;
let $overlay;

function findVm(el) {
  while (el) {
    if (el.__vue__) return el.__vue__;
    el = el.parentNode;
  }
}

function getVmChain(vm) {
  const chain = [];

  while (vm) {
    chain.push(vm);
    vm = vm.$parent;
  }

  return chain;
}

function getMatchedRoute(vm) {
  if (!vm.$route) return undefined;

  return vm.$route.matched.find((route) => {
    return Object.keys(route.instances).some((name) => route.instances[name] === vm);
  });
}

function matchModifierKey(e) {
  const conditions = MODIFIER_KEY.split('|');

  return conditions.some((condition) => {
    return condition
      .toLowerCase()
      .split('+')
      .filter((name) => SUPPORTED_MODIFIER_KEYS.includes(name))
      .every((name) => e[name + 'Key']);
  });
}

function clickEffect(e) {
  const $clickEffect = document.createElement('div');

  $clickEffect.className = 'vue-inspector-click-effect';
  $clickEffect.style.left = e.clientX + 'px';
  $clickEffect.style.top = e.clientY + 'px';

  document.body.appendChild($clickEffect);
  setTimeout(() => $clickEffect.remove(), 1000);
}

function showOverlay(el, title) {
  if (!$overlay) {
    $overlay = document.createElement('div');
    $overlay.className = 'vue-inspector-overlay';
    document.body.appendChild($overlay);
  }

  const { top, left, width, height } = el.getBoundingClientRect();

  $overlay.style.top = top + 'px';
  $overlay.style.left = left + 'px';
  $overlay.style.width = width + 'px';
  $overlay.style.height = height + 'px';
  $overlay.setAttribute('data-vue-inspector-overlay-title', `${title} ${width}×${height}`);
}

function hideOverlay() {
  if ($overlay) {
    $overlay.remove();
    $overlay = undefined;
  }
}

function showDropdown(e) {
  const vm = findVm(e.target);
  const vms = getVmChain(vm);
  const point = { x: e.clientX + 1, y: e.clientY + 1 };

  $dropdown = document.createElement('ul');
  $dropdown.className = 'vue-inspector-dropdown';
  $dropdown.style.left = point.x + 'px';
  $dropdown.style.top = point.y + 'px';

  vms.forEach((vm) => {
    const filePath = vm.$options.__file;
    if (!filePath) return;

    const title = vm.$options._componentTag;
    const route = getMatchedRoute(vm);

    // ----- title -----
    const $title = document.createElement('span');

    if (vm.$parent === vm.$root) {
      $title.innerText = 'Root';
      $title.className = 'vue-inspector-blue';
    } else if (route) {
      $title.innerText = 'RouterView';
      $title.className = 'vue-inspector-purple';
      $title.title = route.path;
    } else {
      $title.innerText = title || '?';
      $title.className = 'vue-inspector-green';
      $title.title = title;
    }

    // ----- filePath -----
    const $filePath = document.createElement('span');
    $filePath.innerText = filePath;
    $filePath.title = filePath;

    // ----- item -----
    const $item = document.createElement('li');
    $item.appendChild($title);
    $item.appendChild($filePath);

    $item.addEventListener('click', () => {
      const $link = document.createElement('a');
      $link.href = `vscode://file/${ROOT}/${filePath}`;
      $link.click();
      hideDropdown();
      hideOverlay();
    });

    $item.addEventListener('mouseenter', () => {
      if (vm.$el && vm.$el.nodeType === 1) {
        showOverlay(vm.$el, $title.innerText);
      } else {
        hideDropdown();
      }
    });

    $dropdown.appendChild($item);
  });

  $dropdown.addEventListener('mouseleave', () => {
    hideOverlay();
  });

  if (!$dropdown.childNodes.length) {
    $dropdown = undefined;
    return;
  }

  document.body.appendChild($dropdown);

  if (point.x + $dropdown.offsetWidth > window.innerWidth) {
    $dropdown.style.left = window.innerWidth - $dropdown.offsetWidth - 8 + 'px';
  }

  if (point.y + $dropdown.offsetHeight > window.innerHeight) {
    $dropdown.style.top = window.innerHeight - $dropdown.offsetHeight - 8 + 'px';
  }
}

function hideDropdown() {
  if ($dropdown) {
    $dropdown.remove();
    $dropdown = undefined;
  }
}

document.addEventListener(
  'click',
  (e) => {
    if ($dropdown && $dropdown.contains(e.target)) {
      return;
    }

    hideDropdown();

    if (matchModifierKey(e)) {
      clickEffect(e);
      showDropdown(e);

      e.preventDefault();
      e.stopPropagation();
    }
  },
  { capture: true },
);

window.addEventListener('scroll', hideOverlay);
window.addEventListener('resize', hideOverlay);
