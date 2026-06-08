const nodeColors = {
  W1: '#3059ab',
  W2: '#3d9970',
  W3: '#e07a5f',
  reducer: '#8e44ad',
  solver: '#f2b134',
};

const states = [
  {
    phase: 'split',
    event: 'Dataset is split by rows',
    activeLines: [1],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: null, xty: null },
      W2: { rows: ['r3', 'r4'], xtx: null, xty: null },
      W3: { rows: ['r5', 'r6'], xtx: null, xty: null },
    },
    reducer: { xtx: null, xty: null },
    beta: null,
    messages: [],
    message:
      'The dataset is distributed by rows. This works because XᵀX and XᵀY are sums over rows.',
  },
  {
    phase: 'local',
    event: 'Worker W1 computes local contributions',
    activeLines: [2, 3],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: null, xty: null },
      W3: { rows: ['r5', 'r6'], xtx: null, xty: null },
    },
    reducer: { xtx: null, xty: null },
    beta: null,
    messages: [],
    activeWorker: 'W1',
    message:
      'W1 computes its local part: X₁ᵀX₁ and X₁ᵀY₁. It never needs the full dataset.',
  },
  {
    phase: 'local',
    event: 'Worker W2 computes local contributions',
    activeLines: [2, 3],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: 'A₂', xty: 'b₂' },
      W3: { rows: ['r5', 'r6'], xtx: null, xty: null },
    },
    reducer: { xtx: null, xty: null },
    beta: null,
    messages: [],
    activeWorker: 'W2',
    message:
      'W2 does the same computation on another block of rows. The result has size depending only on the number of features.',
  },
  {
    phase: 'local',
    event: 'Worker W3 computes local contributions',
    activeLines: [2, 3],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: 'A₂', xty: 'b₂' },
      W3: { rows: ['r5', 'r6'], xtx: 'A₃', xty: 'b₃' },
    },
    reducer: { xtx: null, xty: null },
    beta: null,
    messages: [],
    activeWorker: 'W3',
    message:
      'W3 produces the last local matrix and vector. All workers can do this in parallel.',
  },
  {
    phase: 'shuffle',
    event: 'Workers send local results to reducer',
    activeLines: [4],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: 'A₂', xty: 'b₂' },
      W3: { rows: ['r5', 'r6'], xtx: 'A₃', xty: 'b₃' },
    },
    reducer: { xtx: null, xty: null },
    beta: null,
    messages: [
      { from: 'W1', to: 'R', label: 'A₁, b₁' },
      { from: 'W2', to: 'R', label: 'A₂, b₂' },
      { from: 'W3', to: 'R', label: 'A₃, b₃' },
    ],
    message:
      'Only compact summaries are sent across the network, not all original rows.',
  },
  {
    phase: 'reduce',
    event: 'Reducer sums XᵀX',
    activeLines: [5],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: 'A₂', xty: 'b₂' },
      W3: { rows: ['r5', 'r6'], xtx: 'A₃', xty: 'b₃' },
    },
    reducer: { xtx: 'A = A₁ + A₂ + A₃', xty: null },
    beta: null,
    messages: [],
    message:
      'The reducer adds the local matrices to get the global XᵀX.',
  },
  {
    phase: 'reduce',
    event: 'Reducer sums XᵀY',
    activeLines: [6],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: 'A₂', xty: 'b₂' },
      W3: { rows: ['r5', 'r6'], xtx: 'A₃', xty: 'b₃' },
    },
    reducer: {
      xtx: 'A = A₁ + A₂ + A₃',
      xty: 'b = b₁ + b₂ + b₃',
    },
    beta: null,
    messages: [],
    message:
      'The reducer also adds the local vectors to get the global XᵀY.',
  },
  {
    phase: 'solve',
    event: 'One machine solves the normal equations',
    activeLines: [7],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: 'A₂', xty: 'b₂' },
      W3: { rows: ['r5', 'r6'], xtx: 'A₃', xty: 'b₃' },
    },
    reducer: {
      xtx: 'A = XᵀX',
      xty: 'b = XᵀY',
    },
    beta: 'β = A⁻¹b',
    messages: [{ from: 'R', to: 'S', label: 'A, b' }],
    message:
      'Because the number of features is small, the final solve can happen on one machine.',
  },
  {
    phase: 'done',
    event: 'Final model parameters are produced',
    activeLines: [8],
    workers: {
      W1: { rows: ['r1', 'r2'], xtx: 'A₁', xty: 'b₁' },
      W2: { rows: ['r3', 'r4'], xtx: 'A₂', xty: 'b₂' },
      W3: { rows: ['r5', 'r6'], xtx: 'A₃', xty: 'b₃' },
    },
    reducer: {
      xtx: 'A = XᵀX',
      xty: 'b = XᵀY',
    },
    beta: 'β = [β₁, β₂, ..., βd]',
    messages: [],
    message:
      'The output is the parameter vector β. The heavy row-wise computation was distributed; only the small final system was solved centrally.',
  },
];

const codeLines = [
  'split dataset by rows across workers',
  'worker i computes Aᵢ = XᵢᵀXᵢ',
  'worker i computes bᵢ = XᵢᵀYᵢ',
  'send local Aᵢ and bᵢ to reducer',
  'reducer computes A = Σ Aᵢ',
  'reducer computes b = Σ bᵢ',
  'solve β = A⁻¹b on one machine',
  'return final parameter vector β',
];

const positions = {
  W1: { x: 86, y: 72 },
  W2: { x: 86, y: 162 },
  W3: { x: 86, y: 252 },
  R: { x: 300, y: 162 },
  S: { x: 455, y: 162 },
};

function getMessageLine(message) {
  const from = positions[message.from];
  const to = positions[message.to];

  return {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    labelX: (from.x + to.x) / 2,
    labelY: (from.y + to.y) / 2 - 10,
  };
}

function WorkerCard({ name, state, active }) {
  return (
    <div
      className={`worker-card ${active ? 'is-active' : ''}`}
      style={{ '--node-color': nodeColors[name] }}
    >
      <strong>{name}</strong>

      <div className="row-chips">
        {state.rows.map((row) => (
          <span key={row}>{row}</span>
        ))}
      </div>

      <div className="local-values">
        <span>{state.xtx || 'XᵢᵀXᵢ'}</span>
        <span>{state.xty || 'XᵢᵀYᵢ'}</span>
      </div>
    </div>
  );
}

export default function Slide12({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distributed linear algebra</p>

        <h1 style={{fontSize: '39px'}}>Least-squares regression can be distributed by summing local matrices</h1>

        <p className="subtitle" style={{ fontSize: '19px' }}>
          Workers compute local contributions to XᵀX and XᵀY, reducers sum them,
          and one machine solves the final small system.
        </p>

        <div className="ls-layout">
          <section className="ls-code">
            <p className="ls-code-title">Algorithm</p>

            <pre>
              {codeLines.map((line, index) => {
                const lineNumber = index + 1;
                const isActive = currentState.activeLines.includes(lineNumber);

                return (
                  <div
                    key={lineNumber}
                    className={`code-line ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="line-number">{lineNumber}</span>
                    <code>{line}</code>
                  </div>
                );
              })}
            </pre>
          </section>

          <section className="ls-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="ls-network-wrap">
              <svg
                className="ls-network"
                viewBox="0 0 540 330"
                role="img"
                aria-label="Distributed least-squares regression diagram"
              >
                <rect className="network-bg" x="18" y="18" width="504" height="292" rx="20" />

                {currentState.messages.map((message, index) => {
                  const line = getMessageLine(message);

                  return (
                    <g key={`${message.from}-${message.to}-${message.label}-${index}`}>
                      <line
                        className={`message-line message-line-${index + 1}`}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                      />

                      <text
                        className={`message-label message-label-${index + 1}`}
                        x={line.labelX}
                        y={line.labelY}
                        textAnchor="middle"
                      >
                        {message.label}
                      </text>
                    </g>
                  );
                })}

                {['W1', 'W2', 'W3'].map((node) => {
                  const position = positions[node];

                  return (
                    <g
                      key={node}
                      className={`diagram-node worker-node ${
                        currentState.activeWorker === node ? 'is-active' : ''
                      }`}
                    >
                      <circle cx={position.x} cy={position.y} r="35" />
                      <text x={position.x} y={position.y - 3} textAnchor="middle">
                        {node}
                      </text>
                      <text x={position.x} y={position.y + 17} textAnchor="middle">
                        worker
                      </text>
                    </g>
                  );
                })}

                <g className={`diagram-node reducer-node ${
                  currentState.reducer.xtx || currentState.reducer.xty ? 'is-active' : ''
                }`}>
                  <circle cx={positions.R.x} cy={positions.R.y} r="42" />
                  <text x={positions.R.x} y={positions.R.y - 4} textAnchor="middle">
                    R
                  </text>
                  <text x={positions.R.x} y={positions.R.y + 18} textAnchor="middle">
                    reducer
                  </text>
                </g>

                <g className={`diagram-node solver-node ${currentState.beta ? 'is-active' : ''}`}>
                  <circle cx={positions.S.x} cy={positions.S.y} r="42" />
                  <text x={positions.S.x} y={positions.S.y - 4} textAnchor="middle">
                    S
                  </text>
                  <text x={positions.S.x} y={positions.S.y + 18} textAnchor="middle">
                    solver
                  </text>
                </g>
              </svg>

              <div className="worker-column">
                {['W1', 'W2', 'W3'].map((worker) => (
                  <WorkerCard
                    key={worker}
                    name={worker}
                    state={currentState.workers[worker]}
                    active={currentState.activeWorker === worker}
                  />
                ))}
              </div>
            </div>

            <div className="result-row">
              <div className={`result-card ${currentState.reducer.xtx ? 'is-filled' : ''}`}>
                <strong>XᵀX</strong>
                <span>{currentState.reducer.xtx || 'waiting for local Aᵢ'}</span>
              </div>

              <div className={`result-card ${currentState.reducer.xty ? 'is-filled' : ''}`}>
                <strong>XᵀY</strong>
                <span>{currentState.reducer.xty || 'waiting for local bᵢ'}</span>
              </div>

              <div className={`result-card beta-card ${currentState.beta ? 'is-filled' : ''}`}>
                <strong>β</strong>
                <span>{currentState.beta || 'not solved yet'}</span>
              </div>
            </div>

            <div className="ls-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .ls-layout {
          display: grid;
          grid-template-columns: 0.86fr 1.34fr;
          gap: 20px;
          margin-top: 18px;
          align-items: stretch;
        }

        .ls-code,
        .ls-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .ls-code {
          padding: 16px;
        }

        .ls-code-title,
        .zone-label {
          margin: 0 0 10px;
          color: #3059ab;
          font-size: 16px;
          font-weight: 700;
        }

        .ls-code pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          line-height: 1.32;
          white-space: pre-wrap;
        }

        .code-line {
          display: grid;
          grid-template-columns: 24px 1fr;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 8px;
          color: rgba(17, 17, 17, 0.58);
          transition:
            background 260ms ease,
            color 260ms ease,
            transform 260ms ease;
        }

        .code-line.is-active {
          background: rgba(48, 89, 171, 0.14);
          color: #111;
          transform: translateX(3px);
        }

        .line-number {
          color: rgba(17, 17, 17, 0.36);
          text-align: right;
          user-select: none;
        }

        .ls-visual {
          padding: 16px;
          display: grid;
          grid-template-rows: auto auto auto;
          gap: 10px;
        }

        .zone-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .phase-pill {
          margin-bottom: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          background: #3059ab;
          color: white;
          font-size: 12px;
          font-weight: 800;
          animation: pill-enter 280ms ease both;
        }

        .phase-local {
          background: #3d9970;
        }

        .phase-shuffle {
          background: #8e44ad;
        }

        .phase-reduce {
          background: #3059ab;
        }

        .phase-solve,
        .phase-done {
          background: #f2b134;
          color: #111;
        }

        @keyframes pill-enter {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .ls-network-wrap {
          display: grid;
          grid-template-columns: 1fr 0.72fr;
          gap: 10px;
          align-items: stretch;
        }

        .ls-network {
          width: 100%;
          height: 220px;
          display: block;
        }

        .network-bg {
          fill: rgba(255, 255, 255, 0.54);
          stroke: rgba(17, 17, 17, 0.1);
          stroke-width: 2;
        }

        .message-line {
          stroke: #3059ab;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 420;
          stroke-dashoffset: 420;
          animation: message-line-enter 520ms ease forwards;
        }

        .message-line-2 {
          animation-delay: 100ms;
        }

        .message-line-3 {
          animation-delay: 200ms;
        }

        .message-label {
          fill: #3059ab;
          font-size: 12px;
          font-weight: 900;
          opacity: 0;
          animation: message-label-enter 260ms ease forwards;
          animation-delay: 400ms;
        }

        .message-label-2 {
          animation-delay: 500ms;
        }

        .message-label-3 {
          animation-delay: 600ms;
        }

        @keyframes message-line-enter {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes message-label-enter {
          to {
            opacity: 1;
          }
        }

        .diagram-node circle {
          fill: white;
          stroke: rgba(17, 17, 17, 0.2);
          stroke-width: 3;
          transition:
            fill 300ms ease,
            stroke 300ms ease,
            transform 300ms ease;
        }

        .diagram-node text:first-of-type {
          fill: #111;
          font-size: 18px;
          font-weight: 900;
        }

        .diagram-node text:last-of-type {
          fill: rgba(17, 17, 17, 0.66);
          font-size: 11px;
          font-weight: 800;
        }

        .worker-node.is-active circle {
          fill: rgba(48, 89, 171, 0.14);
          stroke: #3059ab;
        }

        .reducer-node.is-active circle {
          fill: rgba(142, 68, 173, 0.14);
          stroke: #8e44ad;
        }

        .solver-node.is-active circle {
          fill: rgba(242, 177, 52, 0.2);
          stroke: #f2b134;
        }

        .worker-column {
          display: grid;
          gap: 7px;
        }

        .worker-card {
          border-radius: 13px;
          background: rgba(17, 17, 17, 0.055);
          border: 2px solid rgba(17, 17, 17, 0.08);
          padding: 8px;
          display: grid;
          gap: 6px;
          transition:
            background 280ms ease,
            border-color 280ms ease,
            transform 280ms ease,
            box-shadow 280ms ease;
        }

        .worker-card.is-active {
          background: rgba(48, 89, 171, 0.1);
          border-color: #3059ab;
          transform: translateY(-2px);
          box-shadow: 0 8px 14px rgba(48, 89, 171, 0.14);
        }

        .worker-card strong {
          color: var(--node-color);
          font-size: 14px;
        }

        .row-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .row-chips span {
          padding: 3px 7px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.07);
          font-size: 11px;
          font-weight: 800;
        }

        .local-values {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }

        .local-values span {
          min-height: 24px;
          border-radius: 8px;
          background: white;
          display: grid;
          place-items: center;
          color: #111;
          font-size: 11px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .result-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .result-card {
          min-height: 56px;
          border-radius: 13px;
          background: rgba(17, 17, 17, 0.055);
          padding: 9px 10px;
          display: grid;
          gap: 3px;
          animation: result-enter 320ms ease both;
        }

        .result-card.is-filled {
          background: rgba(48, 89, 171, 0.1);
        }

        .result-card.beta-card.is-filled {
          background: rgba(242, 177, 52, 0.18);
        }

        .result-card strong {
          color: #3059ab;
          font-size: 13px;
        }

        .result-card span {
          color: #111;
          font-size: 12px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .ls-message-zone {
          border-radius: 14px;
          background: rgba(48, 89, 171, 0.1);
          padding: 11px 13px;
          animation: message-enter 320ms ease both;
        }

        .ls-message-zone p {
          margin: 0;
          font-size: 15px;
          line-height: 1.26;
        }

        @keyframes result-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes message-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

Slide12.steps = states.length;