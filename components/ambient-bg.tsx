import dynamic from 'next/dynamic';

const Aurora = dynamic(() => import('@/components/Aurora'), { ssr: false });

export function AmbientBg() {
  return (
    <div aria-hidden="true" className="ambient-bg">
      <div className="ambient-base" />
      <Aurora colorStops={["#7cff67", "#B497CF", "#5227FF"]} blend={0.55} amplitude={1.05} speed={0.45} />
      <div className="ambient-grid" />
    </div>
  );
}
