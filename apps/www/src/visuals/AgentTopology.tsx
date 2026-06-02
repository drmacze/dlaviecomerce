const nodes = [
  { label: 'Agents', meta: 'Autonomous teams', x: 200, y: 58, anchor: 'middle' },
  { label: 'Models', meta: 'Reasoning layer', x: 68, y: 154, anchor: 'start' },
  { label: 'Memory', meta: 'Context vault', x: 332, y: 154, anchor: 'end' },
  { label: 'Dashboards', meta: 'Live command', x: 92, y: 316, anchor: 'start' },
  { label: 'Workflows', meta: 'Orchestration', x: 308, y: 316, anchor: 'end' },
];

const beams = [
  'M200 200 C188 148 187 96 200 58',
  'M200 200 C154 181 106 176 68 154',
  'M200 200 C246 181 294 176 332 154',
  'M200 200 C151 236 118 270 92 316',
  'M200 200 C249 236 282 270 308 316',
];

export function AgentTopology() {
  return (
    <div className="agent-topology" aria-label="Agent and model topology visual">
      <svg viewBox="0 0 400 400" role="img" aria-label="DlavieOS command mesh connects agents, models, memory, dashboards, and workflows">
        <defs>
          <radialGradient id="agentCoreGlow" cx="50%" cy="45%" r="68%">
            <stop offset="0%" stopColor="#fff4ed" stopOpacity="0.96" />
            <stop offset="36%" stopColor="#feb3ff" stopOpacity="0.46" />
            <stop offset="72%" stopColor="#5e4bff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#050307" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="agentBeam" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#feb3ff" stopOpacity="0.18" />
            <stop offset="52%" stopColor="#fff4ed" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#73ffe3" stopOpacity="0.24" />
          </linearGradient>
          <filter id="agentSoftGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect className="agent-panel" x="24" y="24" width="352" height="352" rx="44" />
        <circle className="agent-halo" cx="200" cy="200" r="144" />
        <circle className="agent-orbit agent-orbit-a" cx="200" cy="200" r="112" pathLength="1" />
        <circle className="agent-orbit agent-orbit-b" cx="200" cy="200" r="154" pathLength="1" />

        {beams.map((beam, index) => (
          <g key={beam}>
            <path className="agent-link agent-link-shadow" d={beam} pathLength="1" />
            <path className="agent-link" d={beam} pathLength="1" />
            <circle className="agent-signal" r="3.2">
              <animateMotion dur={`${3.8 + index * 0.35}s`} repeatCount="indefinite" path={beam} />
            </circle>
          </g>
        ))}

        <g className="agent-core" filter="url(#agentSoftGlow)">
          <circle className="agent-core__aura" cx="200" cy="200" r="76" />
          <circle className="agent-core__plate" cx="200" cy="200" r="58" />
          <path className="agent-core__facet" d="M200 150 L244 184 L227 236 L173 236 L156 184 Z" />
          <text className="agent-core__kicker" x="200" y="190" textAnchor="middle">DLAVIE</text>
          <text className="agent-core__title" x="200" y="212" textAnchor="middle">AI CORE</text>
        </g>

        {nodes.map((node) => (
          <g key={node.label} className="agent-node" filter="url(#agentSoftGlow)">
            <rect x={node.x - 54} y={node.y - 24} width="108" height="48" rx="16" />
            <circle cx={node.x - 37} cy={node.y} r="4" />
            <text className="agent-node__label" x={node.x - 24} y={node.y - 2}>{node.label}</text>
            <text className="agent-node__meta" x={node.x - 24} y={node.y + 13}>{node.meta}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
