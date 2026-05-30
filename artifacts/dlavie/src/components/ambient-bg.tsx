import { lazy, Suspense, Component, type ReactNode } from 'react';

const DlavieHolographicScene = lazy(
  () => import('@/components/dlavie-holographic-scene').then((mod) => ({ default: mod.DlavieHolographicScene }))
);

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function AmbientBg() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-base" />
      <div className="dlavie-prism-field">
        <span />
        <span />
        <span />
        <span />
      </div>
      <WebGLErrorBoundary>
        <Suspense fallback={null}>
          <DlavieHolographicScene />
        </Suspense>
      </WebGLErrorBoundary>
      <div className="ambient-grid" />
      <div className="dlavie-holo-noise" />
      <div className="dlavie-scanline" />
    </div>
  );
}
