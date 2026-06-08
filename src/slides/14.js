const colors = {
  C1: '#3059ab',
  C2: '#e07a5f',
  W1: '#3d9970',
  W2: '#8e44ad',
  reducer: '#f2b134',
};

const points = [
  { id: 'p1', x: 70, y: 210, worker: 'W1' },
  { id: 'p2', x: 110, y: 180, worker: 'W1' },
  { id: 'p3', x: 145, y: 225, worker: 'W1' },
  { id: 'p4', x: 320, y: 88, worker: 'W2' },
  { id: 'p5', x: 370, y: 130, worker: 'W2' },
  { id: 'p6', x: 410, y: 82, worker: 'W2' },
];

const states = [
  {
    phase: 'start',
    event: 'Choose initial centroids',
    activeLines: [1],
    centroids: {
      C1: { x: 110, y: 90 },
      C2: { x: 355, y: 225 },
    },
    assignments: {},
    workerOutputs: {},
    reducerOutput: null,
    message:
      'K-means starts with initial centroids. These are only guesses and will move after each iteration.',
  },
  {
    phase: 'broadcast',
    event: 'Broadcast centroids to workers',
    activeLines: [2],
    centroids: {
      C1: { x: 110, y: 90 },
      C2: { x: 355, y: 225 },
    },
    assignments: {},
    workerOutputs: {},
    reducerOutput: null,
    messages: [
      { from: 'C', to: 'W1', label: 'C1, C2' },
      { from: 'C', to: 'W2', label: 'C1, C2' },
    ],
    message:
      'The current centroids are sent to all workers. Every worker can now classify its local points independently.',
  },
  {
    phase: 'assign',
    event: 'Worker W1 assigns its local points',
    activeLines: [3],
    centroids: {
      C1: { x: 110, y: 90 },
      C2: { x: 355, y: 225 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
    },
    activeWorker: 'W1',
    workerOutputs: {},
    reducerOutput: null,
    message:
      'W1 assigns p1, p2, and p3 to the nearest centroid. In this iteration, they are closest to C1.',
  },
  {
    phase: 'assign',
    event: 'Worker W2 assigns its local points',
    activeLines: [3],
    centroids: {
      C1: { x: 110, y: 90 },
      C2: { x: 355, y: 225 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
      p4: 'C2',
      p5: 'C2',
      p6: 'C2',
    },
    activeWorker: 'W2',
    workerOutputs: {},
    reducerOutput: null,
    message:
      'W2 assigns p4, p5, and p6 to C2. The assignment step is embarrassingly parallel.',
  },
  {
    phase: 'emit',
    event: 'Workers emit sums and counts',
    activeLines: [4],
    centroids: {
      C1: { x: 110, y: 90 },
      C2: { x: 355, y: 225 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
      p4: 'C2',
      p5: 'C2',
      p6: 'C2',
    },
    workerOutputs: {
      W1: ['C1: sum(p1,p2,p3), count=3'],
      W2: ['C2: sum(p4,p5,p6), count=3'],
    },
    reducerOutput: null,
    messages: [
      { from: 'W1', to: 'R', label: 'sum,count' },
      { from: 'W2', to: 'R', label: 'sum,count' },
    ],
    message:
      'Workers do not send all raw points. They emit compact sums and counts for each cluster.',
  },
  {
    phase: 'reduce',
    event: 'Reducers average assigned points',
    activeLines: [5],
    centroids: {
      C1: { x: 110, y: 90 },
      C2: { x: 355, y: 225 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
      p4: 'C2',
      p5: 'C2',
      p6: 'C2',
    },
    workerOutputs: {
      W1: ['C1: sum(p1,p2,p3), count=3'],
      W2: ['C2: sum(p4,p5,p6), count=3'],
    },
    reducerOutput: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    message:
      'The reducer averages the points assigned to each cluster. These averages become the next centroids.',
  },
  {
    phase: 'update',
    event: 'Centroids move to new averages',
    activeLines: [6],
    centroids: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    previousCentroids: {
      C1: { x: 110, y: 90 },
      C2: { x: 355, y: 225 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
      p4: 'C2',
      p5: 'C2',
      p6: 'C2',
    },
    workerOutputs: {
      W1: ['C1: sum(p1,p2,p3), count=3'],
      W2: ['C2: sum(p4,p5,p6), count=3'],
    },
    reducerOutput: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    message:
      'The centroids move strongly. Since they changed a lot, another iteration is needed.',
  },
  {
    phase: 'broadcast',
    event: 'Broadcast updated centroids',
    activeLines: [2],
    centroids: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    assignments: {},
    workerOutputs: {},
    reducerOutput: null,
    messages: [
      { from: 'C', to: 'W1', label: 'new C1,C2' },
      { from: 'C', to: 'W2', label: 'new C1,C2' },
    ],
    message:
      'The updated centroids are broadcast again. K-means repeats the same distributed loop.',
  },
  {
    phase: 'assign',
    event: 'Workers assign points again',
    activeLines: [3],
    centroids: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
      p4: 'C2',
      p5: 'C2',
      p6: 'C2',
    },
    activeWorker: 'W1+W2',
    workerOutputs: {},
    reducerOutput: null,
    message:
      'With better centroids, the assignments are stable: the left group stays with C1 and the right group stays with C2.',
  },
  {
    phase: 'emit',
    event: 'Workers emit the same sums and counts',
    activeLines: [4],
    centroids: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
      p4: 'C2',
      p5: 'C2',
      p6: 'C2',
    },
    workerOutputs: {
      W1: ['C1: sum(p1,p2,p3), count=3'],
      W2: ['C2: sum(p4,p5,p6), count=3'],
    },
    reducerOutput: null,
    messages: [
      { from: 'W1', to: 'R', label: 'sum,count' },
      { from: 'W2', to: 'R', label: 'sum,count' },
    ],
    message:
      'The compact outputs are the same as before, which suggests the centroids are stabilizing.',
  },
  {
    phase: 'converge',
    event: 'Centroids stop changing',
    activeLines: [5, 6, 7],
    centroids: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    assignments: {
      p1: 'C1',
      p2: 'C1',
      p3: 'C1',
      p4: 'C2',
      p5: 'C2',
      p6: 'C2',
    },
    workerOutputs: {
      W1: ['C1: sum(p1,p2,p3), count=3'],
      W2: ['C2: sum(p4,p5,p6), count=3'],
    },
    reducerOutput: {
      C1: { x: 108, y: 205 },
      C2: { x: 367, y: 100 },
    },
    message:
      'The recomputed centroids are unchanged. The algorithm has converged.',
  },
];

const codeLines = [
  'choose initial centroids',
  'broadcast centroids to workers',
  'workers assign local points to nearest centroid',
  'workers emit sums and counts per cluster',
  'reducers sum and average assigned points',
  'update centroids',
  'repeat until centroids stop changing',
];

const nodePositions = {
  C: { x: 250, y: 56 },
  W1: { x: 110, y: 250 },
  W2: { x: 250, y: 250 },
  R: { x: 390, y: 250 },
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

function getPointClass(point, assignments) {
  const assignment = assignments[point.id];

  if (assignment === 'C1') return 'point c1';
  if (assignment === 'C2') return 'point c2';

  return 'point';
}

export default function Slide14({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distributed clustering</p>

        <h1>K-means repeats assignment and averaging until centroids stabilize</h1>

        <p className="subtitle">
          Workers assign local points to the nearest centroid, reducers average
          the assigned points, and the loop repeats.
        </p>

        <div className="km-layout">
          <section className="km-code">
            <p className="km-code-title">Algorithm</p>

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

          <section className="km-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="km-main">
              <div className="plot-panel">
                <svg
                  className="cluster-plot"
                  viewBox="0 0 500 300"
                  role="img"
                  aria-label="K-means clustering plot"
                >
                  <rect className="plot-bg" x="18" y="18" width="464" height="264" rx="18" />

                  {currentState.previousCentroids && (
                    <>
                      <line
                        className="centroid-move c1-line"
                        x1={currentState.previousCentroids.C1.x}
                        y1={currentState.previousCentroids.C1.y}
                        x2={currentState.centroids.C1.x}
                        y2={currentState.centroids.C1.y}
                      />
                      <line
                        className="centroid-move c2-line"
                        x1={currentState.previousCentroids.C2.x}
                        y1={currentState.previousCentroids.C2.y}
                        x2={currentState.centroids.C2.x}
                        y2={currentState.centroids.C2.y}
                      />
                    </>
                  )}

                  {points.map((point) => (
                    <circle
                      key={point.id}
                      className={getPointClass(point, currentState.assignments)}
                      cx={point.x}
                      cy={point.y}
                      r="10"
                    />
                  ))}

                  <g className="centroid centroid-c1">
                    <circle
                      cx={currentState.centroids.C1.x}
                      cy={currentState.centroids.C1.y}
                      r="15"
                    />
                    <text
                      x={currentState.centroids.C1.x}
                      y={currentState.centroids.C1.y + 5}
                      textAnchor="middle"
                    >
                      C1
                    </text>
                  </g>

                  <g className="centroid centroid-c2">
                    <circle
                      cx={currentState.centroids.C2.x}
                      cy={currentState.centroids.C2.y}
                      r="15"
                    />
                    <text
                      x={currentState.centroids.C2.x}
                      y={currentState.centroids.C2.y + 5}
                      textAnchor="middle"
                    >
                      C2
                    </text>
                  </g>
                </svg>
              </div>

              <div className="network-panel">
                <svg
                  className="km-network"
                  viewBox="0 0 500 320"
                  role="img"
                  aria-label="Distributed K-means computation diagram"
                >
                  <rect className="network-bg" x="18" y="18" width="464" height="284" rx="18" />

                  {currentState.messages?.map((message, index) => {
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

                  <g className="network-node centroid-node">
                    <circle cx={nodePositions.C.x} cy={nodePositions.C.y} r="42" />
                    <text x={nodePositions.C.x} y={nodePositions.C.y - 4} textAnchor="middle">
                      C
                    </text>
                    <text x={nodePositions.C.x} y={nodePositions.C.y + 18} textAnchor="middle">
                      centroids
                    </text>
                  </g>

                  <g className={`network-node worker-node ${
                    currentState.activeWorker === 'W1' || currentState.activeWorker === 'W1+W2'
                      ? 'is-active'
                      : ''
                  }`}>
                    <circle cx={nodePositions.W1.x} cy={nodePositions.W1.y} r="38" />
                    <text x={nodePositions.W1.x} y={nodePositions.W1.y - 4} textAnchor="middle">
                      W1
                    </text>
                    <text x={nodePositions.W1.x} y={nodePositions.W1.y + 18} textAnchor="middle">
                      worker
                    </text>
                  </g>

                  <g className={`network-node worker-node ${
                    currentState.activeWorker === 'W2' || currentState.activeWorker === 'W1+W2'
                      ? 'is-active'
                      : ''
                  }`}>
                    <circle cx={nodePositions.W2.x} cy={nodePositions.W2.y} r="38" />
                    <text x={nodePositions.W2.x} y={nodePositions.W2.y - 4} textAnchor="middle">
                      W2
                    </text>
                    <text x={nodePositions.W2.x} y={nodePositions.W2.y + 18} textAnchor="middle">
                      worker
                    </text>
                  </g>

                  <g className={`network-node reducer-node ${
                    currentState.reducerOutput ? 'is-active' : ''
                  }`}>
                    <circle cx={nodePositions.R.x} cy={nodePositions.R.y} r="38" />
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

            <div className="km-result-row">
              <div className={`result-card ${currentState.workerOutputs.W1 ? 'is-filled' : ''}`}>
                <strong>Worker outputs</strong>
                <span>{currentState.workerOutputs.W1?.[0] || 'waiting for assignments'}</span>
                <span>{currentState.workerOutputs.W2?.[0] || ''}</span>
              </div>

              <div className={`result-card ${currentState.reducerOutput ? 'is-filled' : ''}`}>
                <strong>Reducer averages</strong>
                <span>
                  {currentState.reducerOutput
                    ? `C1 → (${currentState.reducerOutput.C1.x}, ${currentState.reducerOutput.C1.y})`
                    : 'waiting for sums/counts'}
                </span>
                <span>
                  {currentState.reducerOutput
                    ? `C2 → (${currentState.reducerOutput.C2.x}, ${currentState.reducerOutput.C2.y})`
                    : ''}
                </span>
              </div>
            </div>

            <div className="km-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          K-means is iterative: broadcast centroids, assign points, average
          assigned points, then repeat until the centroids stop changing.
        </p>
      </main>

      <style>{`
        .km-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .km-code,
        .km-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .km-code {
          padding: 22px;
        }

        .km-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .km-code pre {
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

        .km-visual {
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

        .phase-assign {
          background: #3d9970;
        }

        .phase-emit {
          background: #8e44ad;
        }

        .phase-reduce {
          background: #e07a5f;
        }

        .phase-update,
        .phase-converge {
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

        .km-main {
          display: grid;
          grid-template-columns: 1fr 0.86fr;
          gap: 14px;
        }

        .plot-panel,
        .network-panel {
          min-height: 250px;
        }

        .cluster-plot,
        .km-network {
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

        .point {
          fill: rgba(17, 17, 17, 0.45);
          transition:
            fill 300ms ease,
            transform 300ms ease,
            stroke 300ms ease;
        }

        .point.c1 {
          fill: rgba(48, 89, 171, 0.78);
          stroke: #3059ab;
          stroke-width: 3;
        }

        .point.c2 {
          fill: rgba(224, 122, 95, 0.78);
          stroke: #e07a5f;
          stroke-width: 3;
        }

        .centroid circle {
          fill: white;
          stroke-width: 4;
          transition:
            cx 420ms ease,
            cy 420ms ease,
            transform 320ms ease;
        }

        .centroid text {
          font-size: 12px;
          font-weight: 900;
          fill: #111;
        }

        .centroid-c1 circle {
          stroke: #3059ab;
        }

        .centroid-c2 circle {
          stroke: #e07a5f;
        }

        .centroid-move {
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 10 8;
          opacity: 0;
          animation: move-line-enter 520ms ease forwards;
        }

        .c1-line {
          stroke: #3059ab;
        }

        .c2-line {
          stroke: #e07a5f;
        }

        @keyframes move-line-enter {
          to {
            opacity: 0.8;
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

        .centroid-node circle {
          stroke: #3059ab;
        }

        .worker-node.is-active circle {
          fill: rgba(61, 153, 112, 0.16);
          stroke: #3d9970;
        }

        .reducer-node.is-active circle {
          fill: rgba(142, 68, 173, 0.14);
          stroke: #8e44ad;
        }

        .km-result-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .result-card {
          min-height: 86px;
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.055);
          padding: 14px;
          display: grid;
          gap: 4px;
          animation: result-enter 320ms ease both;
        }

        .result-card.is-filled {
          background: rgba(48, 89, 171, 0.1);
        }

        .result-card strong {
          color: #3059ab;
          font-size: 15px;
        }

        .result-card span {
          color: #111;
          font-size: 14px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .km-message-zone {
          border-radius: 18px;
          background: rgba(48, 89, 171, 0.1);
          padding: 16px;
          animation: message-enter 320ms ease both;
        }

        .km-message-zone p {
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

Slide14.steps = states.length;