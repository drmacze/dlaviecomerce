import { MotionLab } from '../../components/motion/MotionLab';
import { SmoothScrollProvider } from '../../components/SmoothScrollProvider';

export const metadata = {
  title: 'Dlavie Motion Lab — Interaction Engine Proof',
  description: 'Internal Dlavie motion engine validation route for GSAP, Lenis, WebGL, and GLSL interactions.',
};

export default function MotionLabPage() {
  return (
    <SmoothScrollProvider>
      <MotionLab />
    </SmoothScrollProvider>
  );
}
