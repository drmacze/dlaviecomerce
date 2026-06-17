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
