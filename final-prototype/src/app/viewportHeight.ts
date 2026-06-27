function isTextEntryFocused() {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) return false;
  return element.matches('input, textarea, [contenteditable="true"]');
}

function getVisibleViewportHeight() {
  const visualHeight = window.visualViewport?.height;

  if (Number.isFinite(visualHeight) && visualHeight && visualHeight > 0) {
    return Math.max(320, Math.floor(visualHeight));
  }

  return Math.max(320, Math.floor(window.innerHeight));
}

export function setStableAppHeight() {
  if (isTextEntryFocused()) return;
  document.documentElement.style.setProperty('--app-height', `${getVisibleViewportHeight()}px`);
}

export function bindStableAppHeight() {
  const update = () => {
    window.requestAnimationFrame(setStableAppHeight);
  };

  setStableAppHeight();
  window.addEventListener('resize', update);
  window.visualViewport?.addEventListener('resize', update);
  window.visualViewport?.addEventListener('scroll', update);
  window.addEventListener('orientationchange', update);

  return () => {
    window.removeEventListener('resize', update);
    window.visualViewport?.removeEventListener('resize', update);
    window.visualViewport?.removeEventListener('scroll', update);
    window.removeEventListener('orientationchange', update);
  };
}
