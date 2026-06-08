const colors = {
  positive: '#3059ab',
  negative: '#e07a5f',
  correct: '#3d9970',
  mistake: '#8e44ad',
  boundary: '#f2b134',
};

const points = [
  { id: 'p1', x: 110, y: 95, label: '+1' },
  { id: 'p2', x: 145, y: 130, label: '+1' },
  { id: 'p3', x: 185, y: 105, label: '+1' },
  { id: 'p4', x: 315, y: 210, label: '-1' },
  { id: 'p5', x: 350, y: 170, label: '-1' },
  { id: 'p6', x: 390, y: 220, label: '-1' },
];

const states = [
  {
    phase: 'init',
    event: 'Initialize linear classifier',
    activeLines: [1],
    visiblePoints: [],
    currentPoint: null,
    boundary: {
      x1: 92,
      y1: 238,
      x2: 390,
      y2: 72,
    },
    weights: 'w = [0, 0]',
    prediction: 'none',
    update: 'waiting',
    mistake: false,
    message:
      'The perceptron starts with an initial separating line. It will update only when it makes a mistake.',
  },
  {
    phase: 'sample',
    event: 'First example arrives: p1 has label +1',
    activeLines: [2],
    visiblePoints: ['p1'],
    currentPoint: 'p1',
    boundary: {
      x1: 92,
      y1: 238,
      x2: 390,
      y2: 72,
    },
    weights: 'w₀',
    prediction: '+1',
    update: 'no update',
    mistake: false,
    message:
      'The model predicts p1 correctly. Since there is no mistake, the parameters stay unchanged.',
  },
  {
    phase: 'correct',
    event: 'Correct prediction: no parameter update',
    activeLines: [3, 4],
    visiblePoints: ['p1'],
    currentPoint: 'p1',
    boundary: {
      x1: 92,
      y1: 238,
      x2: 390,
      y2: 72,
    },
    weights: 'w₀',
    prediction: '+1',
    update: 'unchanged',
    mistake: false,
    message:
      'This is the key online behavior: correct examples do not change the model.',
  },
  {
    phase: 'sample',
    event: 'Second example arrives: p4 has label -1',
    activeLines: [2],
    visiblePoints: ['p1', 'p4'],
    currentPoint: 'p4',
    boundary: {
      x1: 92,
      y1: 238,
      x2: 390,
      y2: 72,
    },
    weights: 'w₀',
    prediction: '+1',
    update: 'mistake detected',
    mistake: true,
    message:
      'The current line classifies p4 incorrectly. The perceptron must update its parameters.',
  },
  {
    phase: 'update',
    event: 'Mistake: update parameters',
    activeLines: [5],
    visiblePoints: ['p1', 'p4'],
    currentPoint: 'p4',
    boundary: {
      x1: 80,
      y1: 200,
      x2: 420,
      y2: 118,
    },
    previousBoundary: {
      x1: 92,
      y1: 238,
      x2: 390,
      y2: 72,
    },
    weights: 'w₁ = w₀ + yx',
    prediction: '-1',
    update: 'line moves',
    mistake: true,
    message:
      'The update moves the separating line so that future negative examples are more likely to be classified correctly.',
  },
  {
    phase: 'sample',
    event: 'Third example arrives: p2 has label +1',
    activeLines: [2, 3],
    visiblePoints: ['p1', 'p4', 'p2'],
    currentPoint: 'p2',
    boundary: {
      x1: 80,
      y1: 200,
      x2: 420,
      y2: 118,
    },
    weights: 'w₁',
    prediction: '+1',
    update: 'no update',
    mistake: false,
    message:
      'p2 is classified correctly, so the perceptron does nothing.',
  },
  {
    phase: 'sample',
    event: 'Fourth example arrives: p5 has label -1',
    activeLines: [2, 3],
    visiblePoints: ['p1', 'p4', 'p2', 'p5'],
    currentPoint: 'p5',
    boundary: {
      x1: 80,
      y1: 200,
      x2: 420,
      y2: 118,
    },
    weights: 'w₁',
    prediction: '-1',
    update: 'no update',
    mistake: false,
    message:
      'p5 is also classified correctly. Again, no update is made.',
  },
  {
    phase: 'sample',
    event: 'Fifth example arrives: p3 has label +1',
    activeLines: [2],
    visiblePoints: ['p1', 'p4', 'p2', 'p5', 'p3'],
    currentPoint: 'p3',
    boundary: {
      x1: 80,
      y1: 200,
      x2: 420,
      y2: 118,
    },
    weights: 'w₁',
    prediction: '-1',
    update: 'mistake detected',
    mistake: true,
    message:
      'p3 is positive, but the model predicts negative. Another update is needed.',
  },
  {
    phase: 'update',
    event: 'Mistake: move the hyperplane again',
    activeLines: [5],
    visiblePoints: ['p1', 'p4', 'p2', 'p5', 'p3'],
    currentPoint: 'p3',
    boundary: {
      x1: 96,
      y1: 176,
      x2: 410,
      y2: 154,
    },
    previousBoundary: {
      x1: 80,
      y1: 200,
      x2: 420,
      y2: 118,
    },
    weights: 'w₂ = w₁ + yx',
    prediction: '+1',
    update: 'line moves',
    mistake: true,
    message:
      'The model updates toward the misclassified positive example. The boundary becomes closer to a separator.',
  },
  {
    phase: 'sample',
    event: 'Final example arrives: p6 has label -1',
    activeLines: [2, 3],
    visiblePoints: ['p1', 'p4', 'p2', 'p5', 'p3', 'p6'],
    currentPoint: 'p6',
    boundary: {
      x1: 96,
      y1: 176,
      x2: 410,
      y2: 154,
    },
    weights: 'w₂',
    prediction: '-1',
    update: 'no update',
    mistake: false,
    message:
      'p6 is correctly classified. The current hyperplane separates the visible examples.',
  },
  {
    phase: 'separable',
    event: 'Linearly separable data can be solved',
    activeLines: [6],
    visiblePoints: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
    currentPoint: null,
    boundary: {
      x1: 96,
      y1: 176,
      x2: 410,
      y2: 154,
    },
    weights: 'w*',
    prediction: 'separator found',
    update: 'converged',
    mistake: false,
    message:
      'If the data is linearly separable, the perceptron can find a separating hyperplane after enough updates.',
  },
];

const codeLines = [
  'initialize parameters w',
  'for each labeled example (x, y):',
  '  predict sign(w · x)',
  '  if prediction is correct: do nothing',
  '  if prediction is wrong: w ← w + yx',
  'if data is linearly separable: find a separator',
];

function getPointById(id) {
  return points.find((point) => point.id === id);
}

function getPointClass(point, state) {
  const isVisible = state.visiblePoints.includes(point.id);
  const isCurrent = state.currentPoint === point.id;
  const isPositive = point.label === '+1';

  if (!isVisible) return 'data-point is-hidden';

  return [
    'data-point',
    isPositive ? 'positive' : 'negative',
    isCurrent ? 'is-current' : '',
    state.mistake && isCurrent ? 'is-mistake' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export default function Slide20({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];
  const currentPoint = currentState.currentPoint
    ? getPointById(currentState.currentPoint)
    : null;

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Online classification</p>

        <h1>The perceptron updates only when it makes a mistake</h1>

        <p className="subtitle">
          It processes labeled examples one by one and moves the separating
          hyperplane only after a wrong prediction.
        </p>

        <div className="perceptron-layout">
          <section className="perceptron-code">
            <p className="perceptron-code-title">Algorithm</p>

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

          <section className="perceptron-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="perceptron-main">
              <svg
                className="perceptron-plot"
                viewBox="0 0 460 300"
                role="img"
                aria-label="Perceptron online classification animation"
              >
                <rect className="plot-bg" x="20" y="18" width="420" height="254" rx="18" />

                <line className="axis" x1="48" y1="254" x2="420" y2="254" />
                <line className="axis" x1="48" y1="254" x2="48" y2="42" />

                {currentState.previousBoundary && (
                  <line
                    className="old-boundary"
                    x1={currentState.previousBoundary.x1}
                    y1={currentState.previousBoundary.y1}
                    x2={currentState.previousBoundary.x2}
                    y2={currentState.previousBoundary.y2}
                  />
                )}

                <line
                  key={`boundary-${currentStep}`}
                  className="decision-boundary"
                  x1={currentState.boundary.x1}
                  y1={currentState.boundary.y1}
                  x2={currentState.boundary.x2}
                  y2={currentState.boundary.y2}
                />

                {points.map((point) => (
                  <g key={point.id}>
                    <circle
                      className={getPointClass(point, currentState)}
                      cx={point.x}
                      cy={point.y}
                      r="10"
                    />

                    {currentState.visiblePoints.includes(point.id) && (
                      <text
                        className="point-label"
                        x={point.x}
                        y={point.y - 15}
                        textAnchor="middle"
                      >
                        {point.label}
                      </text>
                    )}
                  </g>
                ))}

                {currentPoint && (
                  <g key={`prediction-${currentStep}`} className="prediction-marker">
                    <line
                      x1={currentPoint.x}
                      y1={currentPoint.y}
                      x2={currentPoint.x + 44}
                      y2={currentPoint.y - 34}
                    />
                    <text
                      x={currentPoint.x + 52}
                      y={currentPoint.y - 39}
                    >
                      predicted {currentState.prediction}
                    </text>
                  </g>
                )}
              </svg>

              <div className="perceptron-state-panel">
                <div className="state-card">
                  <strong>Prediction</strong>
                  <span>{currentState.prediction}</span>
                </div>

                <div className={`state-card ${currentState.mistake ? 'mistake-card' : 'correct-card'}`}>
                  <strong>Decision</strong>
                  <span>{currentState.mistake ? 'mistake → update' : 'correct → no update'}</span>
                </div>

                <div className="state-card">
                  <strong>Parameters</strong>
                  <span>{currentState.weights}</span>
                </div>

                <div className="state-card">
                  <strong>Update</strong>
                  <span>{currentState.update}</span>
                </div>
              </div>
            </div>

            <div className="perceptron-update-row">
              <div className="formula-card">
                <strong>Update rule</strong>
                <span>w ← w + yx only if y(w · x) ≤ 0</span>
              </div>

              <div className={`formula-card ${currentState.phase === 'separable' ? 'is-filled' : ''}`}>
                <strong>Guarantee</strong>
                <span>linearly separable data → separator can be found</span>
              </div>
            </div>

            <div className="perceptron-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          The perceptron is an online binary classifier: it reacts only to
          mistakes, which makes learning simple and incremental.
        </p>
      </main>

      <style>{`
        .perceptron-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.35fr;
          gap: 22px;
          margin-top: 20px;
          align-items: stretch;
        }

        .perceptron-code,
        .perceptron-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .perceptron-code {
          padding: 18px;
        }

        .perceptron-code-title,
        .zone-label {
          margin: 0 0 12px;
          color: #3059ab;
          font-size: 17px;
          font-weight: 700;
        }

        .perceptron-code pre {
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

        .perceptron-visual {
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

        .phase-correct,
        .phase-separable {
          background: #3d9970;
        }

        .phase-update {
          background: #8e44ad;
        }

        .phase-sample {
          background: #3059ab;
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

        .perceptron-main {
          display: grid;
          grid-template-columns: 1fr 0.58fr;
          gap: 12px;
        }

        .perceptron-plot {
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

        .decision-boundary {
          stroke: #111;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: boundary-enter 520ms ease forwards;
        }

        .old-boundary {
          stroke: rgba(17, 17, 17, 0.24);
          stroke-width: 3;
          stroke-dasharray: 8 8;
          stroke-linecap: round;
        }

        @keyframes boundary-enter {
          to {
            stroke-dashoffset: 0;
          }
        }

        .data-point {
          opacity: 1;
          stroke: white;
          stroke-width: 3;
          animation: point-enter 300ms ease both;
        }

        .data-point.is-hidden {
          opacity: 0;
        }

        .data-point.positive {
          fill: #3059ab;
        }

        .data-point.negative {
          fill: #e07a5f;
        }

        .data-point.is-current {
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.22));
          stroke-width: 4;
        }

        .data-point.is-mistake {
          stroke: #8e44ad;
          stroke-width: 5;
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

        .point-label {
          fill: rgba(17, 17, 17, 0.66);
          font-size: 12px;
          font-weight: 900;
        }

        .prediction-marker {
          animation: prediction-enter 300ms ease both;
        }

        .prediction-marker line {
          stroke: #8e44ad;
          stroke-width: 2;
          stroke-dasharray: 5 5;
        }

        .prediction-marker text {
          fill: #8e44ad;
          font-size: 12px;
          font-weight: 900;
        }

        @keyframes prediction-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .perceptron-state-panel {
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

        .correct-card {
          background: rgba(61, 153, 112, 0.14);
        }

        .mistake-card {
          background: rgba(142, 68, 173, 0.14);
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

        .perceptron-update-row {
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

        .perceptron-message-zone {
          border-radius: 16px;
          background: rgba(48, 89, 171, 0.1);
          padding: 13px 15px;
          animation: message-enter 320ms ease both;
        }

        .perceptron-message-zone p {
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

Slide20.steps = states.length;