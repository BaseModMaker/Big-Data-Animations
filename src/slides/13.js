const nodeColors = {
  M1: '#3059ab',
  M2: '#3d9970',
  M3: '#e07a5f',
  reducer: '#8e44ad',
  model: '#f2b134',
};

const states = [
  {
    phase: 'split',
    event: 'Training data is split across mappers',
    activeLines: [1],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: [],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: [],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: [],
      },
    },
    reducer: [],
    probabilities: [],
    messages: [],
    activeMapper: null,
    message:
      'Naive Bayes can be distributed because training mostly requires counting feature-value and class pairs.',
  },
  {
    phase: 'map',
    event: 'Mapper M1 counts local pairs',
    activeLines: [2, 3],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: ['(weather=sunny, yes): 1', '(weather=rainy, no): 1'],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: [],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: [],
      },
    },
    reducer: [],
    probabilities: [],
    messages: [],
    activeMapper: 'M1',
    message:
      'M1 emits local frequency counts. Each key combines a feature value with a class label.',
  },
  {
    phase: 'map',
    event: 'Mapper M2 counts local pairs',
    activeLines: [2, 3],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: ['(weather=sunny, yes): 1', '(weather=rainy, no): 1'],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: ['(weather=sunny, yes): 1', '(weather=sunny, no): 1'],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: [],
      },
    },
    reducer: [],
    probabilities: [],
    messages: [],
    activeMapper: 'M2',
    message:
      'M2 emits the same kind of counts on another partition. These counts can be computed independently.',
  },
  {
    phase: 'map',
    event: 'Mapper M3 counts local pairs',
    activeLines: [2, 3],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: ['(weather=sunny, yes): 1', '(weather=rainy, no): 1'],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: ['(weather=sunny, yes): 1', '(weather=sunny, no): 1'],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: ['(weather=rainy, no): 1', '(weather=sunny, yes): 1'],
      },
    },
    reducer: [],
    probabilities: [],
    messages: [],
    activeMapper: 'M3',
    message:
      'M3 finishes the local counting. The data rows stay distributed; only compact counts need to move.',
  },
  {
    phase: 'shuffle',
    event: 'Mapper counts are grouped by key',
    activeLines: [4],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: ['(sunny, yes): 1', '(rainy, no): 1'],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: ['(sunny, yes): 1', '(sunny, no): 1'],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: ['(rainy, no): 1', '(sunny, yes): 1'],
      },
    },
    reducer: [],
    probabilities: [],
    messages: [
      { from: 'M1', to: 'R', label: 'counts' },
      { from: 'M2', to: 'R', label: 'counts' },
      { from: 'M3', to: 'R', label: 'counts' },
    ],
    activeMapper: null,
    message:
      'The shuffle groups identical keys, such as all counts for weather=sunny and class=yes.',
  },
  {
    phase: 'reduce',
    event: 'Reducer sums feature-class counts',
    activeLines: [5],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: ['(sunny, yes): 1', '(rainy, no): 1'],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: ['(sunny, yes): 1', '(sunny, no): 1'],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: ['(rainy, no): 1', '(sunny, yes): 1'],
      },
    },
    reducer: [
      '(weather=sunny, yes): 3',
      '(weather=rainy, no): 2',
      '(weather=sunny, no): 1',
    ],
    probabilities: [],
    messages: [],
    activeMapper: null,
    message:
      'Reducers add the local counts. This gives the global frequency table needed by Naive Bayes.',
  },
  {
    phase: 'class-count',
    event: 'Reducer also sums class counts',
    activeLines: [5, 6],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: ['yes: 1', 'no: 1'],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: ['yes: 1', 'no: 1'],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: ['yes: 1', 'no: 1'],
      },
    },
    reducer: [
      'class=yes: 3',
      'class=no: 3',
      '(weather=sunny, yes): 3',
      '(weather=rainy, no): 2',
      '(weather=sunny, no): 1',
    ],
    probabilities: [],
    messages: [],
    activeMapper: null,
    message:
      'Class totals are also needed, because conditional probabilities divide feature-class counts by class counts.',
  },
  {
    phase: 'estimate',
    event: 'Estimate conditional probabilities',
    activeLines: [6, 7],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: ['yes: 1', 'no: 1'],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: ['yes: 1', 'no: 1'],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: ['yes: 1', 'no: 1'],
      },
    },
    reducer: [
      'class=yes: 3',
      'class=no: 3',
      '(weather=sunny, yes): 3',
      '(weather=rainy, no): 2',
      '(weather=sunny, no): 1',
    ],
    probabilities: [
      'P(sunny | yes) = 3 / 3 = 1.00',
      'P(rainy | no) = 2 / 3 = 0.67',
      'P(sunny | no) = 1 / 3 = 0.33',
    ],
    messages: [],
    activeMapper: null,
    message:
      'The final model is built from probabilities estimated from the global counts.',
  },
  {
    phase: 'done',
    event: 'Naive Bayes model is ready',
    activeLines: [8],
    mappers: {
      M1: {
        rows: ['sunny, yes', 'rainy, no'],
        counts: [],
      },
      M2: {
        rows: ['sunny, yes', 'sunny, no'],
        counts: [],
      },
      M3: {
        rows: ['rainy, no', 'sunny, yes'],
        counts: [],
      },
    },
    reducer: [
      'class priors',
      'feature likelihoods',
      'conditional probability tables',
    ],
    probabilities: [
      'P(class)',
      'P(feature value | class)',
      'prediction = argmax class score',
    ],
    messages: [],
    activeMapper: null,
    message:
      'The output is a compact Naive Bayes model. Training was distributed because all required statistics were counts.',
  },
];

const codeLines = [
  'split training rows across mappers',
  'for each row (x, y):',
  '  emit counts for (feature value, class)',
  'shuffle counts by identical keys',
  'reducers sum counts',
  'estimate P(feature value | class)',
  'estimate class priors P(class)',
  'return Naive Bayes model',
];

const positions = {
  M1: { x: 86, y: 72 },
  M2: { x: 86, y: 162 },
  M3: { x: 86, y: 252 },
  R: { x: 320, y: 162 },
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

function MapperCard({ name, state, active }) {
  return (
    <div
      className={`mapper-card ${active ? 'is-active' : ''}`}
      style={{ '--node-color': nodeColors[name] }}
    >
      <strong style={{ marginBottom: "-20px" }}>{name}</strong>

      <div className="row-chips">
        {state.rows.map((row) => (
          <span key={row}>{row}</span>
        ))}
      </div>

      <div className="local-counts">
        {state.counts.length > 0 ? (
          state.counts.map((count) => <span key={count}>{count}</span>)
        ) : (
          <span className="placeholder">waiting</span>
        )}
      </div>
    </div>
  );
}

export default function Slide13({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distributed classification</p>

        <h1 style={{ fontSize: '38px' }}>Naive Bayes training distributes naturally because it counts frequencies</h1>

        <p className="subtitle" style={{ fontSize: '19px' }}>
          Mappers count feature-value and class pairs, reducers sum them, and
          the model estimates conditional probabilities.
        </p>

        <div className="nb-layout">
          <section className="nb-code">
            <p className="nb-code-title">Algorithm</p>

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

          <section className="nb-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="nb-network-wrap">
              <svg
                className="nb-network"
                viewBox="0 0 460 320"
                role="img"
                aria-label="Distributed Naive Bayes training diagram"
              >
                <rect className="network-bg" x="18" y="18" width="424" height="282" rx="20" />

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

                {['M1', 'M2', 'M3'].map((node) => {
                  const position = positions[node];

                  return (
                    <g
                      key={node}
                      className={`diagram-node mapper-node ${
                        currentState.activeMapper === node ? 'is-active' : ''
                      }`}
                    >
                      <circle cx={position.x} cy={position.y} r="35" />
                      <text x={position.x} y={position.y - 3} textAnchor="middle">
                        {node}
                      </text>
                      <text x={position.x} y={position.y + 17} textAnchor="middle">
                        mapper
                      </text>
                    </g>
                  );
                })}

                <g className={`diagram-node reducer-node ${
                  currentState.reducer.length > 0 ? 'is-active' : ''
                }`}>
                  <circle cx={positions.R.x} cy={positions.R.y} r="44" />
                  <text x={positions.R.x} y={positions.R.y - 4} textAnchor="middle">
                    R
                  </text>
                  <text x={positions.R.x} y={positions.R.y + 18} textAnchor="middle">
                    reducer
                  </text>
                </g>
              </svg>

              <div className="mapper-column">
                {['M1', 'M2', 'M3'].map((mapper) => (
                  <MapperCard
                    key={mapper}
                    name={mapper}
                    state={currentState.mappers[mapper]}
                    active={currentState.activeMapper === mapper}
                  />
                ))}
              </div>
            </div>

            <div className="nb-result-row">
              <div className={`result-card ${currentState.reducer.length > 0 ? 'is-filled' : ''}`}>
                <strong>Global counts</strong>

                <div className="result-list">
                  {currentState.reducer.length > 0 ? (
                    currentState.reducer.map((item) => <span key={item}>{item}</span>)
                  ) : (
                    <span>waiting for mapper counts</span>
                  )}
                </div>
              </div>

              <div className={`result-card model-card ${currentState.probabilities.length > 0 ? 'is-filled' : ''}`}>
                <strong>Estimated probabilities</strong>

                <div className="result-list">
                  {currentState.probabilities.length > 0 ? (
                    currentState.probabilities.map((item) => (
                      <span key={item}>{item}</span>
                    ))
                  ) : (
                    <span>not estimated yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="nb-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Naive Bayes scales well in distributed systems because most of the
          training work is just counting frequencies and summing those counts.
        </p>
      </main>

      <style>{`
        .nb-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .nb-code,
        .nb-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .nb-code {
          padding: 22px;
        }

        .nb-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .nb-code pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 14px;
          line-height: 1.45;
          white-space: pre-wrap;
        }

        .code-line {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 10px;
          color: rgba(17, 17, 17, 0.58);
          transition:
            background 260ms ease,
            color 260ms ease,
            transform 260ms ease;
        }

        .code-line.is-active {
          background: rgba(48, 89, 171, 0.14);
          color: #111;
          transform: translateX(4px);
        }

        .line-number {
          color: rgba(17, 17, 17, 0.36);
          text-align: right;
          user-select: none;
        }

        .nb-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto auto 1fr;
          gap: 14px;
        }

        .zone-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .phase-pill {
          margin-bottom: 14px;
          padding: 7px 12px;
          border-radius: 999px;
          background: #3059ab;
          color: white;
          font-size: 14px;
          font-weight: 800;
          animation: pill-enter 280ms ease both;
        }

        .phase-map {
          background: #3d9970;
        }

        .phase-shuffle {
          background: #8e44ad;
        }

        .phase-reduce,
        .phase-class-count {
          background: #3059ab;
        }

        .phase-estimate,
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

        .nb-network-wrap {
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          gap: 14px;
          align-items: stretch;
        }

        .nb-network {
          width: 100%;
          height: 300px;
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
          font-size: 13px;
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
          font-size: 20px;
          font-weight: 900;
        }

        .diagram-node text:last-of-type {
          fill: rgba(17, 17, 17, 0.66);
          font-size: 12px;
          font-weight: 800;
        }

        .mapper-node.is-active circle {
          fill: rgba(48, 89, 171, 0.14);
          stroke: #3059ab;
        }

        .reducer-node.is-active circle {
          fill: rgba(142, 68, 173, 0.14);
          stroke: #8e44ad;
        }

        .mapper-column {
          display: flex;
          gap: 10px;
        }

        .mapper-card {
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.055);
          border: 2px solid rgba(17, 17, 17, 0.08);
          padding: 12px;
          display: grid;
          gap: 8px;
          transition:
            background 280ms ease,
            border-color 280ms ease,
            transform 280ms ease,
            box-shadow 280ms ease;
        }

        .mapper-card.is-active {
          background: rgba(48, 89, 171, 0.1);
          border-color: #3059ab;
          transform: translateY(-3px);
          box-shadow: 0 10px 18px rgba(48, 89, 171, 0.16);
        }

        .mapper-card strong {
          color: var(--node-color);
          font-size: 17px;
        }

        .row-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .row-chips span {
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.07);
          font-size: 13px;
          font-weight: 800;
        }

        .local-counts {
          display: grid;
          gap: 6px;
        }

        .local-counts span {
          min-height: 28px;
          border-radius: 10px;
          background: white;
          display: grid;
          align-items: center;
          padding: 0 8px;
          color: #111;
          font-size: 12px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .local-counts .placeholder {
          color: rgba(17, 17, 17, 0.38);
        }

        .nb-result-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .result-card {
          min-height: 120px;
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.055);
          padding: 14px;
          display: grid;
          gap: 8px;
          align-content: start;
          animation: result-enter 320ms ease both;
        }

        .result-card.is-filled {
          background: rgba(48, 89, 171, 0.1);
        }

        .result-card.model-card.is-filled {
          background: rgba(242, 177, 52, 0.18);
        }

        .result-card strong {
          color: #3059ab;
          font-size: 15px;
        }

        .result-list {
          display: grid;
          gap: 5px;
        }

        .result-list span {
          color: #111;
          font-size: 13px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .nb-message-zone {
          border-radius: 18px;
          background: rgba(48, 89, 171, 0.1);
          padding: 16px;
          animation: message-enter 320ms ease both;
        }

        .nb-message-zone p {
          margin: 0;
          font-size: 19px;
          line-height: 1.34;
        }

        @keyframes result-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes message-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
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

Slide13.steps = states.length;