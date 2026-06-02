'use client';

import { useEffect } from 'react';

const EDITABLE_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
  'code',
  'pre',
  '.allow-copy',
].join(',');

const INTERACTIVE_SELECTOR = [
  EDITABLE_SELECTOR,
  'a[href]',
  'button',
  'summary',
  'label',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const PROTECTED_SELECTOR = '.dlavie-copy-protected';
const MEDIA_SELECTOR = 'img, svg, canvas, picture, video';

function getElement(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function getSelectionElement() {
  if (typeof window === 'undefined') return null;

  const anchorNode = window.getSelection()?.anchorNode;
  if (!anchorNode) return null;

  return anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
}

function getProtectedCandidate(target: EventTarget | null) {
  const targetElement = getElement(target);
  if (targetElement && targetElement !== document.body && targetElement !== document.documentElement) {
    return targetElement;
  }

  return getSelectionElement() ?? (typeof document === 'undefined' ? null : document.activeElement);
}

function isInsideProtectedSurface(target: EventTarget | null) {
  const candidate = getProtectedCandidate(target);

  if (candidate?.closest(PROTECTED_SELECTOR)) return true;

  return Boolean(document.querySelector(PROTECTED_SELECTOR)) &&
    (candidate === document.body || candidate === document.documentElement);
}

function isEditableOrAllowed(target: EventTarget | null) {
  return Boolean(getProtectedCandidate(target)?.closest(EDITABLE_SELECTOR));
}

function isInteractiveOrAllowed(target: EventTarget | null) {
  return Boolean(getProtectedCandidate(target)?.closest(INTERACTIVE_SELECTOR));
}

function isProtectedMedia(target: EventTarget | null) {
  return Boolean(getElement(target)?.closest(MEDIA_SELECTOR));
}

function isProtectedShortcut(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  const commandKey = event.metaKey || event.ctrlKey;

  if (event.key === 'F12') return true;
  if (!commandKey) return false;

  return (
    key === 'c' ||
    key === 'x' ||
    key === 's' ||
    key === 'p' ||
    key === 'u' ||
    (key === 'i' && event.shiftKey)
  );
}

export function CopyProtection() {
  useEffect(() => {
    const preventIfProtectedSurface = (event: Event) => {
      if (!isInsideProtectedSurface(event.target) || isInteractiveOrAllowed(event.target)) return;
      event.preventDefault();
    };

    const preventCopyCut = (event: ClipboardEvent) => {
      if (!isInsideProtectedSurface(event.target) || isEditableOrAllowed(event.target)) return;
      event.preventDefault();
    };

    const preventDrag = (event: DragEvent) => {
      if (!isInsideProtectedSurface(event.target) || isInteractiveOrAllowed(event.target)) return;
      if (!isProtectedMedia(event.target)) return;
      event.preventDefault();
    };

    const preventProtectedShortcut = (event: KeyboardEvent) => {
      if (!isInsideProtectedSurface(event.target) || isInteractiveOrAllowed(event.target)) return;
      if (!isProtectedShortcut(event)) return;
      event.preventDefault();
    };

    document.addEventListener('contextmenu', preventIfProtectedSurface);
    document.addEventListener('copy', preventCopyCut);
    document.addEventListener('cut', preventCopyCut);
    document.addEventListener('dragstart', preventDrag);
    window.addEventListener('keydown', preventProtectedShortcut);

    return () => {
      document.removeEventListener('contextmenu', preventIfProtectedSurface);
      document.removeEventListener('copy', preventCopyCut);
      document.removeEventListener('cut', preventCopyCut);
      document.removeEventListener('dragstart', preventDrag);
      window.removeEventListener('keydown', preventProtectedShortcut);
    };
  }, []);

  return null;
}
