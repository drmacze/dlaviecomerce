import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Draggable } from 'gsap/Draggable';
import { ExpoScaleEase, RoughEase, SlowMo } from 'gsap/EasePack';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

type SplitTextTarget = string | Element | ArrayLike<Element>;

type SplitTextOptions = {
  type?: string;
  charsClass?: string;
  wordsClass?: string;
};

let registered = false;

export const productionPlugins = {
  ScrollTrigger,
  ScrollToPlugin,
  Observer,
  TextPlugin,
  Flip,
  Draggable,
  MotionPathPlugin,
  CustomEase,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
} as const;

/**
 * Lightweight SplitText-compatible fallback.
 *
 * GSAP's official SplitText plugin is a paid Club GSAP plugin, so it cannot be
 * imported from the OSS animation package. This class provides the tiny subset
 * the DLavie UI needs: split selected text nodes into word/char spans, expose
 * `chars` and `words`, and restore the original markup on cleanup.
 */
export class SplitText {
  public chars: HTMLElement[] = [];
  public words: HTMLElement[] = [];

  private readonly originals = new Map<HTMLElement, string>();

  constructor(target: SplitTextTarget, options: SplitTextOptions = {}) {
    this.resolveTargets(target).forEach((element) => this.splitElement(element, options));
  }

  public revert(): void {
    this.originals.forEach((html, element) => {
      element.innerHTML = html;
    });
    this.originals.clear();
    this.chars = [];
    this.words = [];
  }

  private resolveTargets(target: SplitTextTarget): HTMLElement[] {
    if (typeof window === 'undefined' || typeof document === 'undefined') return [];

    if (typeof target === 'string') {
      return Array.from(document.querySelectorAll<HTMLElement>(target));
    }

    if (target instanceof HTMLElement) {
      return [target];
    }

    return Array.from(target).filter((element): element is HTMLElement => element instanceof HTMLElement);
  }

  private splitElement(element: HTMLElement, options: SplitTextOptions): void {
    const originalHtml = element.innerHTML;
    const text = element.textContent ?? '';
    const shouldSplitWords = options.type?.includes('words') ?? true;
    const shouldSplitChars = options.type?.includes('chars') ?? true;
    const wordClass = options.wordsClass ?? '';
    const charClass = options.charsClass ?? '';

    this.originals.set(element, originalHtml);
    element.replaceChildren();

    const tokens = text.split(/(\s+)/);

    tokens.forEach((token) => {
      if (!token) return;

      if (/^\s+$/.test(token)) {
        element.append(document.createTextNode(token));
        return;
      }

      const word = document.createElement('span');
      if (wordClass) word.className = wordClass;
      word.style.display = 'inline-block';
      word.style.whiteSpace = 'pre';

      if (shouldSplitWords) this.words.push(word);

      if (shouldSplitChars) {
        Array.from(token).forEach((char) => {
          const charElement = document.createElement('span');
          if (charClass) charElement.className = charClass;
          charElement.textContent = char;
          charElement.style.display = 'inline-block';
          word.append(charElement);
          this.chars.push(charElement);
        });
      } else {
        word.textContent = token;
      }

      element.append(word);
    });
  }
}

export function registerDlavieGsap() {
  if (registered) return { gsap, plugins: productionPlugins };

  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    Observer,
    TextPlugin,
    Flip,
    Draggable,
    MotionPathPlugin,
    CustomEase,
    RoughEase,
    ExpoScaleEase,
    SlowMo,
  );

  if (!CustomEase.get('dlaviePremium')) {
    CustomEase.create('dlaviePremium', 'M0,0 C0.16,1 0.3,1 1,1');
  }
  if (!CustomEase.get('dlavieText')) {
    CustomEase.create('dlavieText', 'M0,0 C0.22,0.72 0.16,1 1,1');
  }

  registered = true;
  return { gsap, plugins: productionPlugins };
}

export type DlavieGsap = typeof gsap;
export { gsap, ScrollTrigger, ScrollToPlugin, Observer, TextPlugin, Flip, Draggable, MotionPathPlugin, CustomEase };
