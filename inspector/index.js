import '~vue-inspector-plugin/style';
import options from '~vue-inspector-plugin/options';

const SUPPORTED_MODIFIER_KEYS = ['shift', 'ctrl', 'alt', 'meta'];

let $dropdown;
let $overlay;

function findVm(el) {
  while (el) {
    if (el.__vue__) return el.__vue__; // Vue 2
    if (el.__vueParentComponent) return el.__vueParentComponent; // Vue 3
    el = el.parentElement;
  }
}

function getVmChain(vm) {
  const chain = [];

  while (vm) {
    chain.push(vm);
    if (vm.$parent) {
      vm = vm.$parent; // Vue 2
    } else if (vm.parent) {
      vm = vm.parent; // Vue 3
    } else {
      break;
    }
  }

  return chain;
}

function getComponentPath(vm) {
  if (vm.$options) return vm.$options.__file; // Vue 2
  if (vm.type) return (vm.type.__file || '').replace(options.cwd, ''); // Vue 3
  return '';
}

function getComponentName(vm) {
  if (vm.$options) return vm.$options._componentTag; // Vue 2
  if (vm.type) return vm.type.name; // Vue 3
  return '';
}

function getElPosition(el) {
  return el.__vnode?.props?.[`__${options.dataKey}`] || el[`__${options.dataKey}`] || '';
}

function getElName(el) {
  const tag = el.tagName.toLowerCase();
  const classNames = el.className ? '.' + el.className.split(' ').join('.') : '';
  const id = el.id ? '#' + el.id : '';
  return tag + id + classNames;
}

function isRoot(vm) {
  if (vm.$parent) {
    return vm.$parent === vm.$root;
  } else {
    return !vm.parent;
  }
}

function getMatchedRoute(vm) {
  let route;

  if (vm.$route) {
    route = vm.$route; // Vue 2
  } else {
    route = vm.appContext?.config?.globalProperties?.$route; // Vue 3
  }

  if (route) {
    return route.matched.find((route) => {
      return Object.values(route.components).some((component) => {
        return component.__file.replace(options.cwd, '') === getComponentPath(vm);
      });
    });
  }

  return undefined;
}

function matchModifierKey(e) {
  const conditions = options.modifierKey.split('|');

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
  if (!vm || !vms.length) return;

  const point = { x: e.clientX + 1, y: e.clientY + 1 };

  $dropdown = document.createElement('ul');
  $dropdown.className = 'vue-inspector-dropdown';
  $dropdown.style.left = point.x + 'px';
  $dropdown.style.top = point.y + 'px';

  const position = getElPosition(e.target).replace(/^\//, '');

  if (position) {
    // ----- title -----
    const $title = document.createElement('span');
    const title = getElName(e.target);
    $title.innerText = title;
    $title.className = 'vue-inspector-gray';

    // ----- item -----
    const $item = document.createElement('li');
    $item.appendChild($title);

    $item.addEventListener('click', () => {
      const $link = document.createElement('a');
      $link.href = `vscode://file/${position}`;
      $link.click();
      hideDropdown();
      hideOverlay();
    });

    $item.addEventListener('mouseenter', () => {
      const el = e.target;

      if (el && el.nodeType === 1) {
        showOverlay(el, $title.innerText);
      } else {
        hideOverlay();
      }
    });

    $dropdown.appendChild($item);
  }

  vms.forEach((vm) => {
    const filePath = getComponentPath(vm);
    if (!filePath) return;

    // ----- title -----
    const $title = document.createElement('span');
    const title = getComponentName(vm) || filePath.split('/').pop();
    const route = getMatchedRoute(vm);

    if (isRoot(vm)) {
      $title.innerText = 'Root';
      $title.className = 'vue-inspector-blue';
    } else if (route) {
      $title.innerText = title || '?';
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
      const fullPath = `${options.cwd}/${filePath}`.replace(/^\//, '');
      const $link = document.createElement('a');
      $link.href = `vscode://file/${fullPath}`;
      $link.click();
      hideDropdown();
      hideOverlay();
    });

    $item.addEventListener('mouseenter', () => {
      const el = vm.$el || vm.vnode?.el;

      if (el && el.nodeType === 1) {
        showOverlay(el, $title.innerText);
      } else {
        hideOverlay();
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
