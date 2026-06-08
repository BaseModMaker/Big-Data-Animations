const colors = {
  query: '#f2b134',
  classA: '#3059ab',
  classB: '#e07a5f',
  M1: '#3d9970',
  M2: '#8e44ad',
  M3: '#00a6a6',
  reducer: '#c44569',
};

const trainingPoints = [
  { id: 'p1', x: 95, y: 205, label: 'A', mapper: 'M1' },
  { id: 'p2', x: 130, y: 178, label: 'A', mapper: 'M1' },
  { id: 'p3', x: 165, y: 225, label: 'A', mapper: 'M1' },

  { id: 'p4', x: 315, y: 96, label: 'B', mapper: 'M2' },
  { id: 'p5', x: 360, y: 135, label: 'B', mapper: 'M2' },
  { id: 'p6', x: 398, y: 88, label: 'B', mapper: 'M2' },

  { id: 'p7', x: 245, y: 175, label: 'A', mapper: 'M3' },
  { id: 'p8', x: 285, y: 190, label: 'B', mapper: 'M3' },
  { id: 'p9', x: 220, y: 232, label: 'A', mapper: 'M3' },
];

const queryPoint = { id: 'q', x: 250, y: 205 };

const states = [
  {
    phase: 'lazy',
    event: 'Training data is stored, not modeled',
    activeLines: [1],
    queryVisible: false,
    activeMapper: null,
    localNeighbors: {},
    reducerNeighbors: [],
    finalNeighbors: [],
    prediction: null,
    messages: [],
    message:
      'K-nearest neighbors is lazy: there is almost no training. The training samples are kept for later comparisons.',
  },
  {
    phase: 'broadcast',
    event: 'Broadcast the test query to all mappers',
    activeLines: [2],
    queryVisible: true,
    activeMapper: null,
    localNeighbors: {},
    reducerNeighbors: [],
    finalNeighbors: [],
    prediction: null,
    messages: [
      { from: 'Q', to: 'M1', label: 'query q' },
      { from: 'Q', to: 'M2', label: 'query q' },
      { from: 'Q', to: 'M3', label: 'query q' },
    ],
    message:
      'In a MapReduce version, the test query is broadcast so every mapper can compare it with its local training samples.',
  },
  {
    phase: 'local',
    event: 'Mapper M1 finds local nearest neighbors',
    activeLines: [3, 4],
    queryVisible: true,
    activeMapper: 'M1',
    localNeighbors: {
      M1: ['p2', 'p3'],
    },
    reducerNeighbors: [],
    finalNeighbors: [],
    prediction: null,
    messages: [],
    message:
      'M1 compares q with its local samples and keeps only its closest local candidates.',
  },
  {
    phase: 'local',
    event: 'Mapper M2 finds local nearest neighbors',
    activeLines: [3, 4],
    queryVisible: true,
    activeMapper: 'M2',
    localNeighbors: {
      M1: ['p2', 'p3'],
      M2: ['p5', 'p4'],
    },
    reducerNeighbors: [],
    finalNeighbors: [],
    prediction: null,
    messages: [],
    message:
      'M2 does the same on its partition. Prediction is expensive because distance computations happen at query time.',
  },
  {
    phase: 'local',
    event: 'Mapper M3 finds local nearest neighbors',
    activeLines: [3, 4],
    queryVisible: true,
    activeMapper: 'M3',
    localNeighbors: {
      M1: ['p2', 'p3'],
      M2: ['p5', 'p4'],
      M3: ['p7', 'p9'],
    },
    reducerNeighbors: [],
    finalNeighbors: [],
    prediction: null,
    messages: [],
    message:
      'M3 also returns its closest local points. Each mapper emits a short neighbor list instead of all distances.',
  },
  {
    phase: 'shuffle',
    event: 'Local neighbor lists are sent to reducer',
    activeLines: [5],
    queryVisible: true,
    activeMapper: null,
    localNeighbors: {
      M1: ['p2', 'p3'],
      M2: ['p5', 'p4'],
      M3: ['p7', 'p9'],
    },
    reducerNeighbors: ['p2', 'p3', 'p5', 'p4', 'p7', 'p9'],
    finalNeighbors: [],
    prediction: null,
    messages: [
      { from: 'M1', to: 'R', label: 'local top-k' },
      { from: 'M2', to: 'R', label: 'local top-k' },
      { from: 'M3', to: 'R', label: 'local top-k' },
    ],
    message:
      'The reducer receives the local top-k lists and merges them into one candidate list.',
  },
  {
    phase: 'merge',
    event: 'Reducer selects the global nearest neighbors',
    activeLines: [6],
    queryVisible: true,
    activeMapper: null,
    localNeighbors: {
      M1: ['p2', 'p3'],
      M2: ['p5', 'p4'],
      M3: ['p7', 'p9'],
    },
    reducerNeighbors: ['p2', 'p3', 'p5', 'p4', 'p7', 'p9'],
    finalNeighbors: ['p7', 'p9', 'p3'],
    prediction: null,
    messages: [],
    message:
      'The reducer compares the candidate distances and chooses the final nearest neighbors globally.',
  },
  {
    phase: 'vote',
    event: 'Neighbors vote for the final prediction',
    activeLines: [7],
    queryVisible: true,
    activeMapper: null,
    localNeighbors: {
      M1: ['p2', 'p3'],
      M2: ['p5', 'p4'],
      M3: ['p7', 'p9'],
    },
    reducerNeighbors: ['p2', 'p3', 'p5', 'p4', 'p7', 'p9'],
    finalNeighbors: ['p7', 'p9', 'p3'],
    prediction: 'A',
    messages: [],
    message:
      'The final nearest neighbors vote. Here the closest three points are all class A, so q is classified as A.',
  },
  {
    phase: 'cost',
    event: 'Main trade-off: cheap training, expensive prediction',
    activeLines: [8],
    queryVisible: true,
    activeMapper: null,
    localNeighbors: {
      M1: ['p2', 'p3'],
      M2: ['p5', 'p4'],
      M3: ['p7', 'p9'],
    },
    reducerNeighbors: ['p2', 'p3', 'p5', 'p4', 'p7', 'p9'],
    finalNeighbors: ['p7', 'p9', 'p3'],
    prediction: 'A',
    messages: [],
    message:
      'KNN has almost no training cost, but each prediction may require many comparisons. MapReduce parallelizes those comparisons.',
  },
];

const codeLines = [
  'store training samples',
  'broadcast test query q to mappers',
  'each mapper computes distances to local samples',
  'each mapper emits local nearest neighbors',
  'send local neighbor lists to reducer',
  'reducer merges lists and selects global k nearest',
  'predict by majority vote or average',
  'cost: cheap training, expensive prediction',
];

const nodePositions = {
  Q: { x: 250, y: 58 },
  M1: { x: 110, y: 245 },
  M2: { x: 250, y: 245 },
  M3: { x: 390, y: 245 },
  R: { x: 250, y: 150 },
};

function getMessageLine(message) {
  const from = nodePositions[message.from];
  const to = nodePositions[message.to];

  return {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    labelX: (from.x + to.x) / 2,
    labelY: (from.y + to.y) / 2 - 10,
  };
}

function getPointById(id) {
  return trainingPoints.find((point) => point.id === id);
}

function getPointClass(point, state) {
  const localSelected = Object.values(state.localNeighbors)
    .flat()
    .includes(point.id);

  const reducerSelected = state.reducerNeighbors.includes(point.id);
  const finalSelected = state.finalNeighbors.includes(point.id);

  const className = point.label === 'A' ? 'class-a' : 'class-b';

  if (finalSelected) return `training-point ${className} is-final`;
  if (reducerSelected) return `training-point ${className} is-reducer-candidate`;
  if (localSelected) return `training-point ${className} is-local-neighbor`;
  if (state.activeMapper && point.mapper !== state.activeMapper) {
    return `training-point ${className} is-muted`;
  }

  return `training-point ${className}`;
}

function getMapperOutput(mapper, state) {
  return state.localNeighbors[mapper] || [];
}

export default function Slide15({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distributed prediction</p>

        <h1>K-nearest neighbors is lazy: training is cheap, prediction is expensive</h1>

        <p className="subtitle">
          Mappers search locally, reducers merge neighbor lists, and the final
          prediction is made from the global nearest neighbors.
        </p>

        <div className="knn-layout">
          <section className="knn-code">
            <p className="knn-code-title">Algorithm</p>

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

          <section className="knn-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="knn-main">
              <div className="plot-panel">
                <svg
                  className="knn-plot"
                  viewBox="0 0 500 300"
                  role="img"
                  aria-label="K-nearest neighbors plot"
                >
                  <rect className="plot-bg" x="18" y="18" width="464" height="264" rx="18" />

                  {trainingPoints.map((point) => (
                    <g key={point.id}>
                      <circle
                        className={getPointClass(point, currentState)}
                        cx={point.x}
                        cy={point.y}
                        r="10"
                      />

                      <text
                        className="point-label"
                        x={point.x}
                        y={point.y - 14}
                        textAnchor="middle"
                      >
                        {point.id}
                      </text>

                      {currentState.finalNeighbors.includes(point.id) && (
                        <line
                          className="neighbor-line"
                          x1={queryPoint.x}
                          y1={queryPoint.y}
                          x2={point.x}
                          y2={point.y}
                        />
                      )}
                    </g>
                  ))}

                  {currentState.queryVisible && (
                    <g className="query-point">
                      <circle cx={queryPoint.x} cy={queryPoint.y} r="15" />
                      <text x={queryPoint.x} y={queryPoint.y + 5} textAnchor="middle">
                        q
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              <div className="network-panel">
                <svg
                  className="knn-network"
                  viewBox="0 0 500 320"
                  role="img"
                  aria-label="MapReduce KNN diagram"
                >
                  <rect className="network-bg" x="18" y="18" width="464" height="284" rx="18" />

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

                  <g className={`network-node query-node ${
                    currentState.queryVisible ? 'is-active' : ''
                  }`}>
                    <circle cx={nodePositions.Q.x} cy={nodePositions.Q.y} r="40" />
                    <text x={nodePositions.Q.x} y={nodePositions.Q.y - 4} textAnchor="middle">
                      q
                    </text>
                    <text x={nodePositions.Q.x} y={nodePositions.Q.y + 18} textAnchor="middle">
                      test query
                    </text>
                  </g>

                  {['M1', 'M2', 'M3'].map((mapper) => (
                    <g
                      key={mapper}
                      className={`network-node mapper-node ${
                        currentState.activeMapper === mapper ? 'is-active' : ''
                      }`}
                    >
                      <circle
                        cx={nodePositions[mapper].x}
                        cy={nodePositions[mapper].y}
                        r="36"
                      />
                      <text
                        x={nodePositions[mapper].x}
                        y={nodePositions[mapper].y - 4}
                        textAnchor="middle"
                      >
                        {mapper}
                      </text>
                      <text
                        x={nodePositions[mapper].x}
                        y={nodePositions[mapper].y + 18}
                        textAnchor="middle"
                      >
                        mapper
                      </text>
                    </g>
                  ))}

                  <g className={`network-node reducer-node ${
                    currentState.reducerNeighbors.length > 0 ||
                    currentState.finalNeighbors.length > 0
                      ? 'is-active'
                      : ''
                  }`}>
                    <circle cx={nodePositions.R.x} cy={nodePositions.R.y} r="42" />
                    <text x={nodePositions.R.x} y={nodePositions.R.y - 4} textAnchor="middle">
                      R
                    </text>
                    <text x={nodePositions.R.x} y={nodePositions.R.y + 18} textAnchor="middle">
                      reducer
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="knn-result-row">
              <div className="result-card">
                <strong>Local nearest neighbors</strong>
                <div className="neighbor-list">
                  {['M1', 'M2', 'M3'].map((mapper) => {
                    const output = getMapperOutput(mapper, currentState);

                    return (
                      <span key={mapper}>
                        {mapper}: {output.length ? output.join(', ') : 'waiting'}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className={`result-card ${
                currentState.finalNeighbors.length > 0 ? 'is-filled' : ''
              }`}>
                <strong>Global top-k</strong>
                <div className="neighbor-list">
                  <span>
                    {currentState.finalNeighbors.length > 0
                      ? currentState.finalNeighbors.join(', ')
                      : 'not merged yet'}
                  </span>
                  <span>
                    {currentState.prediction
                      ? `prediction = class ${currentState.prediction}`
                      : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="knn-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          KNN is easy to distribute at prediction time, but each query can still
          be expensive because it requires many distance comparisons.
        </p>
      </main>

      <style>{`
        .knn-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .knn-code,
        .knn-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .knn-code {
          padding: 22px;
        }

        .knn-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .knn-code pre {
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

        .knn-visual {
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

        .phase-broadcast {
          background: #3059ab;
        }

        .phase-local {
          background: #3d9970;
        }

        .phase-shuffle {
          background: #8e44ad;
        }

        .phase-merge {
          background: #e07a5f;
        }

        .phase-vote,
        .phase-cost {
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

        .knn-main {
          display: grid;
          grid-template-columns: 1fr 0.86fr;
          gap: 14px;
        }

        .plot-panel,
        .network-panel {
          min-height: 250px;
        }

        .knn-plot,
        .knn-network {
          width: 100%;
          height: 260px;
          display: block;
        }

        .plot-bg,
        .network-bg {
          fill: rgba(255, 255, 255, 0.54);
          stroke: rgba(17, 17, 17, 0.1);
          stroke-width: 2;
        }

        .training-point {
          transition:
            fill 300ms ease,
            opacity 300ms ease,
            transform 300ms ease,
            stroke 300ms ease;
        }

        .training-point.class-a {
          fill: rgba(48, 89, 171, 0.78);
        }

        .training-point.class-b {
          fill: rgba(224, 122, 95, 0.78);
        }

        .training-point.is-muted {
          opacity: 0.24;
        }

        .training-point.is-local-neighbor {
          stroke: #111;
          stroke-width: 3;
        }

        .training-point.is-reducer-candidate {
          stroke: #8e44ad;
          stroke-width: 4;
        }

        .training-point.is-final {
          stroke: #f2b134;
          stroke-width: 5;
          filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.22));
        }

        .point-label {
          fill: rgba(17, 17, 17, 0.58);
          font-size: 11px;
          font-weight: 800;
        }

        .query-point {
          animation: query-enter 320ms ease both;
        }

        .query-point circle {
          fill: #f2b134;
          stroke: white;
          stroke-width: 4;
          filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.22));
        }

        .query-point text {
          fill: #111;
          font-size: 14px;
          font-weight: 900;
        }

        @keyframes query-enter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.9);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .neighbor-line {
          stroke: #f2b134;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: neighbor-line-enter 500ms ease forwards;
        }

        @keyframes neighbor-line-enter {
          to {
            stroke-dashoffset: 0;
          }
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
          animation-delay: 120ms;
        }

        .message-line-3 {
          animation-delay: 240ms;
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
          animation-delay: 520ms;
        }

        .message-label-3 {
          animation-delay: 640ms;
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

        .network-node circle {
          fill: white;
          stroke: rgba(17, 17, 17, 0.2);
          stroke-width: 3;
          transition:
            fill 300ms ease,
            stroke 300ms ease,
            transform 300ms ease;
        }

        .network-node text:first-of-type {
          fill: #111;
          font-size: 20px;
          font-weight: 900;
        }

        .network-node text:last-of-type {
          fill: rgba(17, 17, 17, 0.66);
          font-size: 12px;
          font-weight: 800;
        }

        .query-node.is-active circle {
          fill: rgba(242, 177, 52, 0.22);
          stroke: #f2b134;
        }

        .mapper-node.is-active circle {
          fill: rgba(61, 153, 112, 0.16);
          stroke: #3d9970;
        }

        .reducer-node.is-active circle {
          fill: rgba(142, 68, 173, 0.14);
          stroke: #8e44ad;
        }

        .knn-result-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .result-card {
          min-height: 104px;
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.055);
          padding: 14px;
          display: grid;
          gap: 6px;
          align-content: start;
          animation: result-enter 320ms ease both;
        }

        .result-card.is-filled {
          background: rgba(242, 177, 52, 0.18);
        }

        .result-card strong {
          color: #3059ab;
          font-size: 15px;
        }

        .neighbor-list {
          display: grid;
          gap: 4px;
        }

        .neighbor-list span {
          color: #111;
          font-size: 14px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .knn-message-zone {
          border-radius: 18px;
          background: rgba(48, 89, 171, 0.1);
          padding: 16px;
          animation: message-enter 320ms ease both;
        }

        .knn-message-zone p {
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

Slide15.steps = states.length;