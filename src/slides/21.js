const colors = {
  C1: '#3059ab',
  C2: '#e07a5f',
  point: '#3d9970',
  update: '#8e44ad',
  stream: '#f2b134',
};

const streamPoints = [
  { id: 'p1', x: 105, y: 195, closest: 'C1' },
  { id: 'p2', x: 135, y: 215, closest: 'C1' },
  { id: 'p3', x: 350, y: 92, closest: 'C2' },
  { id: 'p4', x: 380, y: 122, closest: 'C2' },
  { id: 'p5', x: 160, y: 178, closest: 'C1' },
  { id: 'p6', x: 320, y: 140, closest: 'C2' },
  { id: 'p7', x: 190, y: 206, closest: 'C1' },
];

const states = [
  {
    phase: 'init',
    event: 'Initialize centroids',
    activeLines: [1],
    visiblePoints: [],
    currentPoint: null,
    centroids: {
      C1: { x: 90, y: 150 },
      C2: { x: 390, y: 175 },
    },
    previousCentroids: null,
    closest: null,
    learningRate: 'η = 0.25',
    update: 'waiting',
    message:
      'Online k-means starts with initial centroids. It will update them one streaming point at a time.',
  },
  {
    phase: 'stream',
    event: 'New point p1 arrives',
    activeLines: [2],
    visiblePoints: ['p1'],
    currentPoint: 'p1',
    centroids: {
      C1: { x: 90, y: 150 },
      C2: { x: 390, y: 175 },
    },
    previousCentroids: null,
    closest: null,
    learningRate: 'η = 0.25',
    update: 'compare distances',
    message:
      'A new point arrives from the stream. The algorithm compares it to the current centroids.',
  },
  {
    phase: 'assign',
    event: 'p1 is closest to C1',
    activeLines: [3],
    visiblePoints: ['p1'],
    currentPoint: 'p1',
    centroids: {
      C1: { x: 90, y: 150 },
      C2: { x: 390, y: 175 },
    },
    previousCentroids: null,
    closest: 'C1',
    learningRate: 'η = 0.25',
    update: 'winner = C1',
    message:
      'Only the closest centroid is selected. Unlike batch k-means, all other centroids stay unchanged.',
  },
  {
    phase: 'update',
    event: 'Move C1 slightly toward p1',
    activeLines: [4],
    visiblePoints: ['p1'],
    currentPoint: 'p1',
    centroids: {
      C1: { x: 94, y: 161 },
      C2: { x: 390, y: 175 },
    },
    previousCentroids: {
      C1: { x: 90, y: 150 },
      C2: { x: 390, y: 175 },
    },
    closest: 'C1',
    learningRate: 'η = 0.25',
    update: 'C1 ← C1 + η(p1 − C1)',
    message:
      'C1 moves a small step toward p1. The learning rate controls how large this step is.',
  },
  {
    phase: 'stream',
    event: 'New point p2 arrives',
    activeLines: [2, 3],
    visiblePoints: ['p1', 'p2'],
    currentPoint: 'p2',
    centroids: {
      C1: { x: 94, y: 161 },
      C2: { x: 390, y: 175 },
    },
    previousCentroids: null,
    closest: 'C1',
    learningRate: 'η = 0.25',
    update: 'winner = C1',
    message:
      'p2 is also closest to C1, so C1 will be updated again.',
  },
  {
    phase: 'update',
    event: 'Move C1 toward p2',
    activeLines: [4],
    visiblePoints: ['p1', 'p2'],
    currentPoint: 'p2',
    centroids: {
      C1: { x: 104, y: 174 },
      C2: { x: 390, y: 175 },
    },
    previousCentroids: {
      C1: { x: 94, y: 161 },
      C2: { x: 390, y: 175 },
    },
    closest: 'C1',
    learningRate: 'η = 0.25',
    update: 'C1 moves again',
    message:
      'The same centroid can move repeatedly as more nearby points arrive.',
  },
  {
    phase: 'stream',
    event: 'New point p3 arrives',
    activeLines: [2, 3],
    visiblePoints: ['p1', 'p2', 'p3'],
    currentPoint: 'p3',
    centroids: {
      C1: { x: 104, y: 174 },
      C2: { x: 390, y: 175 },
    },
    previousCentroids: null,
    closest: 'C2',
    learningRate: 'η = 0.25',
    update: 'winner = C2',
    message:
      'p3 is closer to C2. Online k-means updates only C2 this time.',
  },
  {
    phase: 'update',
    event: 'Move C2 toward p3',
    activeLines: [4],
    visiblePoints: ['p1', 'p2', 'p3'],
    currentPoint: 'p3',
    centroids: {
      C1: { x: 104, y: 174 },
      C2: { x: 380, y: 154 },
    },
    previousCentroids: {
      C1: { x: 104, y: 174 },
      C2: { x: 390, y: 175 },
    },
    closest: 'C2',
    learningRate: 'η = 0.25',
    update: 'C2 ← C2 + η(p3 − C2)',
    message:
      'C2 moves toward p3, while C1 remains fixed.',
  },
  {
    phase: 'stream',
    event: 'More stream points arrive',
    activeLines: [2, 3, 4],
    visiblePoints: ['p1', 'p2', 'p3', 'p4', 'p5'],
    currentPoint: 'p5',
    centroids: {
      C1: { x: 118, y: 175 },
      C2: { x: 380, y: 146 },
    },
    previousCentroids: {
      C1: { x: 104, y: 174 },
      C2: { x: 380, y: 154 },
    },
    closest: 'C1',
    learningRate: 'η = 0.25',
    update: 'incremental adaptation',
    message:
      'As the stream continues, centroids gradually track the structure of the data without storing all points.',
  },
  {
    phase: 'adapt',
    event: 'Centroids adapt continuously',
    activeLines: [4, 5],
    visiblePoints: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
    currentPoint: 'p6',
    centroids: {
      C1: { x: 118, y: 175 },
      C2: { x: 365, y: 145 },
    },
    previousCentroids: {
      C1: { x: 118, y: 175 },
      C2: { x: 380, y: 146 },
    },
    closest: 'C2',
    learningRate: 'η = 0.25',
    update: 'C2 adapts',
    message:
      'This is useful for streaming data because the model can adapt without rerunning full batch k-means.',
  },
  {
    phase: 'done',
    event: 'Streaming version of batch k-means',
    activeLines: [6],
    visiblePoints: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
    currentPoint: 'p7',
    centroids: {
      C1: { x: 136, y: 183 },
      C2: { x: 365, y: 145 },
    },
    previousCentroids: {
      C1: { x: 118, y: 175 },
      C2: { x: 365, y: 145 },
    },
    closest: 'C1',
    learningRate: 'η = 0.25',
    update: 'online clustering',
    message:
      'Online k-means is the streaming version of k-means: each point updates only its closest centroid.',
  },
];

const codeLines = [
  'initialize centroids C₁, ..., Ck',
  'when a new point xₜ arrives:',
  '  find closest centroid Cj',
  '  update only Cj toward xₜ',
  '  Cj ← Cj + ηₜ(xₜ − Cj)',
  'repeat for the stream',
];

function getPointById(id) {
  return streamPoints.find((point) => point.id === id);
}

function getPointClass(point, state) {
  const visible = state.visiblePoints.includes(point.id);
  const current = state.currentPoint === point.id;

  if (!visible) return 'stream-point is-hidden';

  return [
    'stream-point',
    point.closest === 'C1' ? 'near-c1' : 'near-c2',
    current ? 'is-current' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export default function Slide21({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];
  const currentPoint = currentState.currentPoint
    ? getPointById(currentState.currentPoint)
    : null;

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Online clustering</p>

        <h1>Online k-means updates only the closest centroid</h1>

        <p className="subtitle">
          Each incoming point chooses its nearest centroid, and that centroid
          moves slightly toward the point.
        </p>

        <div className="okm-layout">
          <section className="okm-code">
            <p className="okm-code-title">Algorithm</p>

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

          <section className="okm-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="okm-main">
              <svg
                className="okm-plot"
                viewBox="0 0 460 300"
                role="img"
                aria-label="Online k-means centroid update animation"
              >
                <rect className="plot-bg" x="20" y="18" width="420" height="254" rx="18" />

                <line className="axis" x1="48" y1="254" x2="420" y2="254" />
                <line className="axis" x1="48" y1="254" x2="48" y2="42" />

                {currentState.previousCentroids && (
                  <>
                    <line
                      className={`move-line ${
                        currentState.closest === 'C1' ? 'is-active-c1' : ''
                      }`}
                      x1={currentState.previousCentroids.C1.x}
                      y1={currentState.previousCentroids.C1.y}
                      x2={currentState.centroids.C1.x}
                      y2={currentState.centroids.C1.y}
                    />

                    <line
                      className={`move-line ${
                        currentState.closest === 'C2' ? 'is-active-c2' : ''
                      }`}
                      x1={currentState.previousCentroids.C2.x}
                      y1={currentState.previousCentroids.C2.y}
                      x2={currentState.centroids.C2.x}
                      y2={currentState.centroids.C2.y}
                    />
                  </>
                )}

                {streamPoints.map((point) => (
                  <circle
                    key={point.id}
                    className={getPointClass(point, currentState)}
                    cx={point.x}
                    cy={point.y}
                    r="9"
                  />
                ))}

                {currentPoint && currentState.closest && (
                  <line
                    key={`nearest-${currentStep}`}
                    className={`nearest-line nearest-${currentState.closest.toLowerCase()}`}
                    x1={currentPoint.x}
                    y1={currentPoint.y}
                    x2={currentState.centroids[currentState.closest].x}
                    y2={currentState.centroids[currentState.closest].y}
                  />
                )}

                <g className={`centroid centroid-c1 ${currentState.closest === 'C1' ? 'is-winner' : ''}`}>
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

                <g className={`centroid centroid-c2 ${currentState.closest === 'C2' ? 'is-winner' : ''}`}>
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

              <div className="okm-state-panel">
                <div className="state-card">
                  <strong>Current point</strong>
                  <span>{currentState.currentPoint || 'none'}</span>
                </div>

                <div className={`state-card ${currentState.closest ? 'winner-card' : ''}`}>
                  <strong>Closest centroid</strong>
                  <span>{currentState.closest || 'not selected'}</span>
                </div>

                <div className="state-card">
                  <strong>Learning rate</strong>
                  <span>{currentState.learningRate}</span>
                </div>

                <div className="state-card">
                  <strong>Update</strong>
                  <span>{currentState.update}</span>
                </div>
              </div>
            </div>

            <div className="formula-row">
              <div className="formula-card">
                <strong>Update rule</strong>
                <span>Cj ← Cj + ηₜ(xₜ − Cj)</span>
              </div>

              <div className={`formula-card ${currentState.phase === 'done' ? 'is-filled' : ''}`}>
                <strong>Streaming idea</strong>
                <span>one point → one closest centroid update</span>
              </div>
            </div>

            <div className="okm-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Online k-means is useful when points arrive continuously and batch
          clustering would be too expensive to rerun.
        </p>
      </main>

      <style>{`
        .okm-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.35fr;
          gap: 22px;
          margin-top: 20px;
          align-items: stretch;
        }

        .okm-code,
        .okm-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .okm-code {
          padding: 18px;
        }

        .okm-code-title,
        .zone-label {
          margin: 0 0 12px;
          color: #3059ab;
          font-size: 17px;
          font-weight: 700;
        }

        .okm-code pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.36;
          white-space: pre-wrap;
        }

        .code-line {
          display: grid;
          grid-template-columns: 26px 1fr;
          gap: 9px;
          padding: 7px 8px;
          border-radius: 9px;
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

        .okm-visual {
          padding: 18px;
          display: grid;
          grid-template-rows: auto auto auto 1fr;
          gap: 12px;
        }

        .zone-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .phase-pill {
          margin-bottom: 12px;
          padding: 6px 11px;
          border-radius: 999px;
          background: #3059ab;
          color: white;
          font-size: 13px;
          font-weight: 800;
          animation: pill-enter 280ms ease both;
        }

        .phase-stream {
          background: #3059ab;
        }

        .phase-assign {
          background: #3d9970;
        }

        .phase-update {
          background: #8e44ad;
        }

        .phase-adapt,
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

        .okm-main {
          display: grid;
          grid-template-columns: 1fr 0.58fr;
          gap: 12px;
        }

        .okm-plot {
          width: 100%;
          height: 300px;
          display: block;
        }

        .plot-bg {
          fill: rgba(255, 255, 255, 0.54);
          stroke: rgba(17, 17, 17, 0.1);
          stroke-width: 2;
        }

        .axis {
          stroke: rgba(17, 17, 17, 0.44);
          stroke-width: 2;
          stroke-linecap: round;
        }

        .stream-point {
          opacity: 1;
          fill: rgba(17, 17, 17, 0.3);
          stroke: white;
          stroke-width: 3;
          animation: point-enter 300ms ease both;
        }

        .stream-point.is-hidden {
          opacity: 0;
        }

        .stream-point.near-c1 {
          fill: rgba(48, 89, 171, 0.7);
        }

        .stream-point.near-c2 {
          fill: rgba(224, 122, 95, 0.72);
        }

        .stream-point.is-current {
          fill: #3d9970;
          stroke-width: 4;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.2));
        }

        @keyframes point-enter {
          from {
            opacity: 0;
            transform: scale(0.72);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
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

        .centroid.is-winner circle {
          fill: rgba(242, 177, 52, 0.24);
          stroke: #f2b134;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.18));
        }

        .nearest-line {
          stroke-width: 3;
          stroke-dasharray: 7 7;
          stroke-linecap: round;
          animation: nearest-enter 360ms ease both;
        }

        .nearest-c1 {
          stroke: #3059ab;
        }

        .nearest-c2 {
          stroke: #e07a5f;
        }

        @keyframes nearest-enter {
          from {
            opacity: 0;
          }

          to {
            opacity: 0.8;
          }
        }

        .move-line {
          stroke: rgba(17, 17, 17, 0.2);
          stroke-width: 3;
          stroke-dasharray: 7 7;
          stroke-linecap: round;
          animation: move-enter 420ms ease both;
        }

        .move-line.is-active-c1 {
          stroke: #3059ab;
        }

        .move-line.is-active-c2 {
          stroke: #e07a5f;
        }

        @keyframes move-enter {
          from {
            opacity: 0;
          }

          to {
            opacity: 0.85;
          }
        }

        .okm-state-panel {
          display: grid;
          gap: 9px;
        }

        .state-card {
          border-radius: 14px;
          background: rgba(17, 17, 17, 0.055);
          padding: 12px;
          display: grid;
          gap: 4px;
          animation: card-enter 300ms ease both;
        }

        .winner-card {
          background: rgba(242, 177, 52, 0.18);
        }

        .state-card strong {
          color: #3059ab;
          font-size: 14px;
        }

        .state-card span {
          color: #111;
          font-size: 14px;
          line-height: 1.25;
          font-weight: 900;
        }

        .formula-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .formula-card {
          min-height: 62px;
          border-radius: 14px;
          background: rgba(17, 17, 17, 0.055);
          padding: 12px;
          display: grid;
          gap: 4px;
          animation: card-enter 300ms ease both;
        }

        .formula-card.is-filled {
          background: rgba(242, 177, 52, 0.18);
        }

        .formula-card strong {
          color: #3059ab;
          font-size: 14px;
        }

        .formula-card span {
          color: #111;
          font-size: 14px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        @keyframes card-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .okm-message-zone {
          border-radius: 16px;
          background: rgba(48, 89, 171, 0.1);
          padding: 13px 15px;
          animation: message-enter 320ms ease both;
        }

        .okm-message-zone p {
          margin: 0;
          font-size: 17px;
          line-height: 1.3;
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

Slide21.steps = states.length;