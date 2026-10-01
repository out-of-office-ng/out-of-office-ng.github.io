// Keep keyboard focus in an open dialog and return it to its trigger. --codex
export function dialogFocus(node) {
  const trigger = document.activeElement;
  const overflow = document.body.style.overflow;
  const siblings = [];
  for (let current = node; current.parentElement && current !== document.body; current = current.parentElement) {
    for (const sibling of current.parentElement.children) {
      if (sibling !== current && sibling instanceof HTMLElement) {
        siblings.push([sibling, sibling.inert]);
        sibling.inert = true;
      }
    }
  }
  document.body.style.overflow = 'hidden';
  const focusable = () => [...node.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
    .filter(element => !element.closest('[inert]') && element.getClientRects().length > 0);
  queueMicrotask(() => { if (node.isConnected) (focusable()[0] || node).focus({ preventScroll: true }); });
  function onKeydown(event) {
    if (event.key !== 'Tab') return;
    const items = focusable();
    const first = items[0] || node;
    const last = items.at(-1) || node;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === node)) {
      event.preventDefault(); first.focus();
    }
  }
  node.addEventListener('keydown', onKeydown);
  return {
    destroy() {
      node.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = overflow;
      for (const [element, inert] of siblings) element.inert = inert;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    },
  };
}
