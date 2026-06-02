const nodes = [
  { label: 'Agents', x: 190, y: 76 },
  { label: 'Models', x: 78, y: 180 },
  { label: 'Memory', x: 304, y: 180 },
  { label: 'Workflows', x: 128, y: 304 },
  { label: 'Dashboards', x: 278, y: 304 },
];

export function AgentTopology() {
  return (
    <div className="agent-topology" aria-label="Agent and model topology visual">
      <svg viewBox="0 0 380 380" role="img" aria-label="DlavieOS connects agents, models, memory, workflows, and dashboards">
        <defs><filter id="nodeGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {nodes.slice(1).map((node) => <path key={node.label} className="agent-link" d={`M190 190 L${node.x} ${node.y}`} pathLength="1" />)}
        <circle className="agent-core" cx="190" cy="190" r="58" />
        <text x="190" y="184" textAnchor="middle">DLAVIE</text><text x="190" y="205" textAnchor="middle">AI CORE</text>
        {nodes.map((node) => <g key={node.label} className="agent-node" filter="url(#nodeGlow)"><circle cx={node.x} cy={node.y} r="35"/><text x={node.x} y={node.y + 4} textAnchor="middle">{node.label}</text></g>)}
      </svg>
    </div>
  );
}
