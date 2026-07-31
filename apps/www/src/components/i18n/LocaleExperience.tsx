'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DlavieLocale } from '../../i18n/config';
import { translateKnownPhrase } from '../../i18n/dictionary';

type LocaleContextValue = {
  locale: DlavieLocale;
  setLocale: (locale: DlavieLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA']);
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label'] as const;

function shouldSkip(element: Element | null): boolean {
  if (!element) return false;
  if (SKIP_TAGS.has(element.tagName)) return true;
  if (element.closest('[data-no-auto-translate="true"], [contenteditable="true"]')) return true;
  return false;
}

function translateElement(root: ParentNode, locale: DlavieLocale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent || shouldSkip(parent)) continue;
    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const current = node.nodeValue ?? '';
    const next = translateKnownPhrase(current, locale);
    if (next !== current) node.nodeValue = next;
  });

  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll('*'))] : Array.from(root.querySelectorAll('*'));
  elements.forEach((element) => {
    if (shouldSkip(element)) return;
    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (!current) return;
      const next = translateKnownPhrase(current, locale);
      if (next !== current) element.setAttribute(attribute, next);
    });
  });
}

export function LocaleExperience({
  initialLocale,
  children,
}: {
  initialLocale: DlavieLocale;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState<DlavieLocale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.dlavieLocale = locale;
    translateElement(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const textNode = node as Text;
            if (!shouldSkip(textNode.parentElement)) {
              const current = textNode.nodeValue ?? '';
              const next = translateKnownPhrase(current, locale);
              if (next !== current) textNode.nodeValue = next;
            }
            return;
          }
          if (node instanceof Element) translateElement(node, locale);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useDlavieLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useDlavieLocale must be used inside LocaleExperience.');
  return value;
}
