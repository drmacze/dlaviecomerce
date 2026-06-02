const paths = [
  'M36 92 C150 34 250 34 364 92 S590 150 704 92',
  'M36 210 C160 278 248 278 364 210 S584 142 704 210',
  'M62 326 C190 210 300 210 380 326 S570 450 710 326',
];

export function CommerceRails() {
  return (
    <div className="commerce-rails" aria-label="Commerce transaction rail visual">
      <svg viewBox="0 0 740 430" role="img" aria-label="PPOB, storefront, transaction rails, settlement path, and automation move through DLavie Commerce">
        <defs><linearGradient id="railGradient" x1="0" x2="1"><stop offset="0%" stopColor="#b77cff"/><stop offset="52%" stopColor="#ff5edb"/><stop offset="100%" stopColor="#7be9ff"/></linearGradient></defs>
        {paths.map((path, index) => <path key={path} className="commerce-path" d={path} pathLength="1" style={{ animationDelay: `${index * 0.4}s` }} />)}
        {paths.map((path, index) => <circle key={`${path}-pulse`} className="commerce-pulse" r="8" style={{ offsetPath: `path('${path}')`, animationDelay: `${index * 0.24}s` }} />)}
        {['PPOB products', 'Storefront flow', 'Transaction rails', 'Settlement path'].map((label, index) => <g key={label} className="rail-node"><circle cx={120 + index * 160} cy={216 + (index % 2 ? -96 : 96)} r="34"/><text x={120 + index * 160} y={221 + (index % 2 ? -96 : 96)} textAnchor="middle">{label}</text></g>)}
      </svg>
    </div>
  );
}
