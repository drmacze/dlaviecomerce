const loopText = ['AGENTS', 'MODELS', 'MEMORY', 'WORKFLOWS', 'DASHBOARDS', 'ORCHESTRATION'];

export function CurvedLoop() {
  return <div className="curved-loop" aria-hidden="true"><div className="curved-loop-track">{[...loopText, ...loopText, ...loopText].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></div>;
}
