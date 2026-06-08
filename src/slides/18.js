const rows = [
  ['Trap entry', 'Save minimal registers', 'Bounded'],
  ['Classify event', 'Fault, timer, I/O', 'Constant'],
  ['Mark region', 'Resumable or non-resumable', 'Critical'],
  ['Dispatch policy', 'Resume, retry, isolate', 'Deferred'],
];

export default function Slide18({ step }) {
  return (
    <div className="slide technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Execution path</p>
        <h1>Keep the synchronous path deterministic</h1>
        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          Recovery decisions can be complex, but the trap path should remain short, bounded, and measurable.
        </p>

        <div className="sequence-diagram">
          <div className={`sequence-column step ${step >= 2 ? 'is-visible' : ''}`}><strong>CPU</strong><span>trap</span><span>resume</span></div>
          <div className={`sequence-column step ${step >= 3 ? 'is-visible' : ''}`}><strong>Kernel</strong><span>capture</span><span>classify</span></div>
          <div className={`sequence-column step ${step >= 4 ? 'is-visible' : ''}`}><strong>Scheduler</strong><span>prioritize</span><span>dispatch</span></div>
          <div className={`sequence-column step ${step >= 5 ? 'is-visible' : ''}`}><strong>Task</strong><span>retry</span><span>continue</span></div>
        </div>

        <table className={`technical-table wide-table step-scale ${step >= 6 ? 'is-visible' : ''}`}>
          <thead><tr><th>Phase</th><th>Responsibility</th><th>Timing property</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </main>
    </div>
  );
}

Slide18.steps = 7;
