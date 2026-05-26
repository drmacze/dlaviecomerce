import dynamic from 'next/dynamic';

const DlavieHolographicScene = dynamic(
  () => import('@/components/dlavie-holographic-scene').then((mod) => mod.DlavieHolographicScene),
  { ssr: false }
);

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
      <DlavieHolographicScene />
      <div className="ambient-grid" />
      <div className="dlavie-holo-noise" />
      <div className="dlavie-scanline" />
    </div>
  );
}
