export function AutomationOrbit() {
  return (
    <div className="automation-orbit" aria-hidden="true">
      <svg viewBox="0 0 420 420">
        <circle className="orbit-base" cx="210" cy="210" r="150" />
        <circle className="orbit-progress" cx="210" cy="210" r="150" pathLength="1" />
        <g className="orbit-satellite"><circle cx="210" cy="60" r="14"/><circle cx="360" cy="210" r="10"/><circle cx="210" cy="360" r="12"/><circle cx="60" cy="210" r="10"/></g>
        <text x="210" y="202" textAnchor="middle">CONNECTED</text><text x="210" y="230" textAnchor="middle">ECOSYSTEM</text>
      </svg>
    </div>
  );
}
