import { gsap } from 'gsap';
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomEase } from 'gsap/CustomEase';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { Draggable } from 'gsap/Draggable';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ExpoScaleEase, RoughEase, SlowMo } from 'gsap/EasePack';
import { Flip } from 'gsap/Flip';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { TextPlugin } from 'gsap/TextPlugin';

let registered = false;

export const productionPlugins = {
  ScrollTrigger,
  ScrollToPlugin,
  Observer,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  Flip,
  Draggable,
  MotionPathPlugin,
  DrawSVGPlugin,
  MorphSVGPlugin,
  CustomEase,
  InertiaPlugin,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  CustomBounce,
  CustomWiggle,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
} as const;

export const skippedPlugins = [
  {
    name: 'ScrollSmoother',
    reason: 'Available in gsap/ScrollSmoother, but intentionally not activated because Lenis is the smooth-scroll engine.',
  },
  {
    name: 'GSDevTools',
    reason: 'Available in gsap/GSDevTools, dev-only and not registered in production bundles.',
  },
  {
    name: 'MotionPathHelper',
    reason: 'Available in gsap/MotionPathHelper, dev-only editor helper and not registered in production bundles.',
  },
  {
    name: 'PixiPlugin',
    reason: 'Available in gsap/PixiPlugin, skipped because PixiJS is not installed and there is no real Pixi feature.',
  },
  {
    name: 'EaselPlugin',
    reason: 'Available in gsap/EaselPlugin, skipped because EaselJS is not installed and there is no real Easel feature.',
  },
] as const;

export function registerDlavieGsap() {
  if (registered) return { gsap, plugins: productionPlugins };

  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    Observer,
    SplitText,
    ScrambleTextPlugin,
    TextPlugin,
    Flip,
    Draggable,
    MotionPathPlugin,
    DrawSVGPlugin,
    MorphSVGPlugin,
    CustomEase,
    InertiaPlugin,
    Physics2DPlugin,
    PhysicsPropsPlugin,
    CustomBounce,
    CustomWiggle,
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
export { gsap, ScrollTrigger, ScrollToPlugin, Observer, SplitText, ScrambleTextPlugin, TextPlugin, Flip, Draggable, MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin, CustomEase };
