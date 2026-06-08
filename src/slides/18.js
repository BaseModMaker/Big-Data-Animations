const colors = {
  input: '#3059ab',
  output: '#3d9970',
  beta: '#e07a5f',
  uncertainty: '#8e44ad',
  recent: '#f2b134',
};

const observations = [
  { id: 't1', x: 1.0, y: 1.2 },
  { id: 't2', x: 2.0, y: 2.1 },
  { id: 't3', x: 3.0, y: 3.2 },
  { id: 't4', x: 4.0, y: 4.3 },
  { id: 't5', x: 5.0, y: 6.1, changed: true },
  { id: 't6', x: 6.0, y: 7.4, changed: true },
  { id: 't7', x: 7.0, y: 8.7, changed: true },
];

const states = [
  {
    phase: 'init',
    event: 'Initialize estimator',
    activeLines: [1],
    currentObservation: null,
    visibleObservations: [],
    beta: 0.0,
    uncertainty: 1.0,
    gain: null,
    forgetting: null,
    prediction: null,
    message:
      'Recursive least squares starts with an initial parameter estimate and an uncertainty matrix.',
  },
  {
    phase: 'observe',
    event: 'New pair arrives: (x₁, y₁)',
    activeLines: [2],
    currentObservation: observations[0],
    visibleObservations: [observations[0]],
    beta: 0.0,
    uncertainty: 1.0,
    gain: null,
    forgetting: null,
    prediction: 0.0,
    message:
      'The algorithm receives one input-output pair at a time. It does not need the full dataset in memory.',
  },
  {
    phase: 'gain',
    event: 'Compute update gain',
    activeLines: [3],
    currentObservation: observations[0],
    visibleObservations: [observations[0]],
    beta: 0.0,
    uncertainty: 0.72,
    gain: 0.72,
    forgetting: null,
    prediction: 0.0,
    message:
      'The gain controls how strongly the new observation changes the current parameter estimate.',
  },
  {
    phase: 'update',
    event: 'Update parameter estimate',
    activeLines: [4],
    currentObservation: observations[0],
    visibleObservations: [observations[0]],
    beta: 0.86,
    uncertainty: 0.72,
    gain: 0.72,
    forgetting: null,
    prediction: 0.86,
    message:
      'The parameter estimate moves toward the value suggested by the new observation.',
  },
  {
    phase: 'uncertainty',
    event: 'Update uncertainty matrix',
    activeLines: [5],
    currentObservation: observations[0],
    visibleObservations: [observations[0]],
    beta: 0.86,
    uncertainty: 0.46,
    gain: 0.72,
    forgetting: null,
    prediction: 0.86,
    message:
      'After learning from the observation, the uncertainty decreases. The estimator becomes more confident.',
  },
  {
    phase: 'observe',
    event: 'Second pair arrives',
    activeLines: [2, 3, 4],
    currentObservation: observations[1],
    visibleObservations: observations.slice(0, 2),
    beta: 1.02,
    uncertainty: 0.32,
    gain: 0.31,
    forgetting: null,
    prediction: 2.04,
    message:
      'A second observation updates the same parameter vector. The model improves without retraining from scratch.',
  },
  {
    phase: 'observe',
    event: 'Third pair arrives',
    activeLines: [2, 3, 4],
    currentObservation: observations[2],
    visibleObservations: observations.slice(0, 3),
    beta: 1.05,
    uncertainty: 0.24,
    gain: 0.21,
    forgetting: null,
    prediction: 3.15,
    message:
      'As more data arrives, the estimate stabilizes and the uncertainty continues to shrink.',
  },
  {
    phase: 'stable',
    event: 'Estimator has learned the first trend',
    activeLines: [5],
    currentObservation: observations[3],
    visibleObservations: observations.slice(0, 4),
    beta: 1.07,
    uncertainty: 0.18,
    gain: 0.16,
    forgetting: null,
    prediction: 4.28,
    message:
      'The estimator now fits the original process well. Without forgetting, older data keeps strong influence.',
  },
  {
    phase: 'change',
    event: 'The underlying process changes',
    activeLines: [6],
    currentObservation: observations[4],
    visibleObservations: observations.slice(0, 5),
    beta: 1.14,
    uncertainty: 0.18,
    gain: 0.12,
    forgetting: null,
    prediction: 5.7,
    message:
      'A new observation no longer follows the old trend. The process has changed, but the estimator adapts slowly.',
  },
  {
    phase: 'forget',
    event: 'Add forgetting factor λ',
    activeLines: [6],
    currentObservation: observations[4],
    visibleObservations: observations.slice(0, 5),
    beta: 1.14,
    uncertainty: 0.28,
    gain: 0.22,
    forgetting: 0.92,
    prediction: 5.7,
    message:
      'A forgetting factor increases the influence of recent observations by gradually reducing the weight of old data.',
  },
  {
    phase: 'adapt',
    event: 'Recent observations get more weight',
    activeLines: [3, 4, 6],
    currentObservation: observations[5],
    visibleObservations: observations.slice(0, 6),
    beta: 1.23,
    uncertainty: 0.31,
    gain: 0.25,
    forgetting: 0.92,
    prediction: 7.38,
    message:
      'With forgetting, the estimator reacts faster to the new trend. The parameter estimate moves upward.',
  },
  {
    phase: 'adapt',
    event: 'Estimator tracks the changed process',
    activeLines: [3, 4, 5],
    currentObservation: observations[6],
    visibleObservations: observations.slice(0, 7),
    beta: 1.25,
    uncertainty: 0.26,
    gain: 0.22,
    forgetting: 0.92,
    prediction: 8.75,
    message:
      'The model has adapted to the changed process while still updating online, one observation at a time.',
  },
  {
    phase: 'done',
    event: 'Online model is ready for the next pair',
    activeLines: [7],
    currentObservation: observations[6],
    visibleObservations: observations.slice(0, 7),
    beta: 1.25,
    uncertainty: 0.26,
    gain: 0.22,
    forgetting: 0.92,
    prediction: 8.75,
    message:
      'Recursive least squares is useful when data arrives continuously and the system may drift over time.',
  },
];

const codeLines = [
  'initialize parameter β and uncertainty matrix P',
  'when new pair (x, y) arrives:',
  '  compute gain K from P and x',
  '  update β using prediction error y − xᵀβ',
  '  update uncertainty matrix P',
  '  optional: apply forgetting factor λ',
  'return updated online estimator',
];

function scaleX(value) {
  return 48 + (value / 7) * 360;
}

function scaleY(value) {
  return 244 - (value / 9) * 200;
}

function getLinePath(beta) {
  const x1 = 0;
  const x2 = 7.4;
  const y1 = beta * x1;
  const y2 = beta * x2;

  return `M ${scaleX(x1)} ${scaleY(y1)} L ${scaleX(x2)} ${scaleY(y2)}`;
}

export default function Slide18({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Online linear regression</p>

        <h1>Recursive least squares updates the model when each new pair arrives</h1>

        <p className="subtitle">
          It keeps a parameter estimate and an uncertainty matrix, then updates
          both online.
        </p>

        <div className="rls-layout">
          <section className="rls-code">
            <p className="rls-code-title">Algorithm</p>

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

          <section className="rls-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="rls-main">
              <div className="plot-panel">
                <svg
                  className="rls-plot"
                  viewBox="0 0 460 270"
                  role="img"
                  aria-label="Recursive least squares online regression plot"
                >
                  <rect className="plot-bg" x="20" y="18" width="420" height="234" rx="18" />

                  <line className="axis" x1="48" y1="244" x2="420" y2="244" />
                  <line className="axis" x1="48" y1="244" x2="48" y2="36" />

                  <path
                    key={`line-${currentStep}`}
                    className="regression-line"
                    d={getLinePath(currentState.beta)}
                  />

                  {currentState.visibleObservations.map((observation) => (
                    <g key={observation.id}>
                      <circle
                        className={`data-point ${
                          observation.id === currentState.currentObservation?.id
                            ? 'is-current'
                            : ''
                        } ${observation.changed ? 'is-changed' : ''}`}
                        cx={scaleX(observation.x)}
                        cy={scaleY(observation.y)}
                        r="9"
                      />

                      <text
                        className="point-label"
                        x={scaleX(observation.x)}
                        y={scaleY(observation.y) - 14}
                        textAnchor="middle"
                      >
                        {observation.id}
                      </text>
                    </g>
                  ))}

                  {currentState.currentObservation && (
                    <line
                      key={`error-${currentStep}`}
                      className="prediction-error"
                      x1={scaleX(currentState.currentObservation.x)}
                      y1={scaleY(currentState.currentObservation.y)}
                      x2={scaleX(currentState.currentObservation.x)}
                      y2={scaleY(currentState.prediction || 0)}
                    />
                  )}

                  <text className="axis-label" x="220" y="266" textAnchor="middle">
                    input x
                  </text>

                  <text className="axis-label y-label" x="18" y="145" textAnchor="middle">
                    output y
                  </text>
                </svg>
              </div>

              <div className="state-panel">
                <div className="state-card beta-card">
                  <strong>Parameter β</strong>
                  <span>{currentState.beta.toFixed(2)}</span>
                </div>

                <div className="state-card uncertainty-card">
                  <strong>Uncertainty P</strong>
                  <span>{currentState.uncertainty.toFixed(2)}</span>
                </div>

                <div className={`state-card ${currentState.gain ? 'is-active' : ''}`}>
                  <strong>Gain K</strong>
                  <span>
                    {currentState.gain === null ? 'not computed' : currentState.gain.toFixed(2)}
                  </span>
                </div>

                <div className={`state-card ${currentState.forgetting ? 'forgetting-card' : ''}`}>
                  <strong>Forgetting λ</strong>
                  <span>
                    {currentState.forgetting === null
                      ? 'off'
                      : currentState.forgetting.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rls-update-row">
              <div className={`update-card ${currentState.currentObservation ? 'is-filled' : ''}`}>
                <strong>Incoming pair</strong>
                <span>
                  {currentState.currentObservation
                    ? `(${currentState.currentObservation.x}, ${currentState.currentObservation.y})`
                    : 'waiting for data'}
                </span>
              </div>

              <div className={`update-card ${currentState.prediction !== null ? 'is-filled' : ''}`}>
                <strong>Prediction</strong>
                <span>
                  {currentState.prediction === null
                    ? 'not available'
                    : `ŷ = ${currentState.prediction.toFixed(2)}`}
                </span>
              </div>

              <div className={`update-card ${currentState.phase === 'forget' || currentState.phase === 'adapt' ? 'is-filled recent' : ''}`}>
                <strong>Recent data</strong>
                <span>
                  {currentState.forgetting
                    ? 'weighted more'
                    : 'same weight'}
                </span>
              </div>
            </div>

            <div className="rls-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Recursive least squares is online: it updates from each new
          observation instead of repeatedly solving the full regression problem.
        </p>
      </main>

      <style>{`
        .rls-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.35fr;
          gap: 22px;
          margin-top: 20px;
          align-items: stretch;
        }

        .rls-code,
        .rls-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .rls-code {
          padding: 18px;
        }

        .rls-code-title,
        .zone-label {
          margin: 0 0 12px;
          color: #3059ab;
          font-size: 17px;
          font-weight: 700;
        }

        .rls-code pre {
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

        .rls-visual {
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

        .phase-gain {
          background: #8e44ad;
        }

        .phase-update {
          background: #e07a5f;
        }

        .phase-uncertainty {
          background: #3d9970;
        }

        .phase-change {
          background: #e07a5f;
        }

        .phase-forget,
        .phase-adapt {
          background: #f2b134;
          color: #111;
        }

        .phase-done {
          background: #3d9970;
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

        .rls-main {
          display: grid;
          grid-template-columns: 1fr 0.58fr;
          gap: 12px;
        }

        .rls-plot {
          width: 100%;
          height: 270px;
          display: block;
        }

        .plot-bg {
          fill: rgba(255, 255, 255, 0.54);
          stroke: rgba(17, 17, 17, 0.1);
          stroke-width: 2;
        }

        .axis {
          stroke: rgba(17, 17, 17, 0.5);
          stroke-width: 2;
          stroke-linecap: round;
        }

        .axis-label {
          fill: rgba(17, 17, 17, 0.58);
          font-size: 12px;
          font-weight: 800;
        }

        .y-label {
          transform: rotate(-90deg);
          transform-origin: 18px 145px;
        }

        .regression-line {
          fill: none;
          stroke: #3059ab;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: line-enter 520ms ease forwards;
        }

        @keyframes line-enter {
          to {
            stroke-dashoffset: 0;
          }
        }

        .data-point {
          fill: #3059ab;
          stroke: white;
          stroke-width: 3;
          animation: point-enter 300ms ease both;
        }

        .data-point.is-current {
          fill: #3d9970;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.18));
        }

        .data-point.is-changed {
          fill: #e07a5f;
        }

        .point-label {
          fill: rgba(17, 17, 17, 0.58);
          font-size: 11px;
          font-weight: 800;
        }

        @keyframes point-enter {
          from {
            opacity: 0;
            transform: scale(0.7);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .prediction-error {
          stroke: #e07a5f;
          stroke-width: 3;
          stroke-dasharray: 6 6;
          stroke-linecap: round;
          animation: error-enter 360ms ease both;
        }

        @keyframes error-enter {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .state-panel {
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

        .state-card.is-active {
          background: rgba(142, 68, 173, 0.12);
        }

        .beta-card {
          background: rgba(48, 89, 171, 0.1);
        }

        .uncertainty-card {
          background: rgba(142, 68, 173, 0.1);
        }

        .forgetting-card {
          background: rgba(242, 177, 52, 0.18);
        }

        .state-card strong {
          color: #3059ab;
          font-size: 14px;
        }

        .state-card span {
          color: #111;
          font-size: 18px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .rls-update-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .update-card {
          min-height: 68px;
          border-radius: 14px;
          background: rgba(17, 17, 17, 0.055);
          padding: 12px;
          display: grid;
          gap: 4px;
          animation: card-enter 300ms ease both;
        }

        .update-card.is-filled {
          background: rgba(48, 89, 171, 0.1);
        }

        .update-card.recent {
          background: rgba(242, 177, 52, 0.18);
        }

        .update-card strong {
          color: #3059ab;
          font-size: 14px;
        }

        .update-card span {
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

        .rls-message-zone {
          border-radius: 16px;
          background: rgba(48, 89, 171, 0.1);
          padding: 13px 15px;
          animation: message-enter 320ms ease both;
        }

        .rls-message-zone p {
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

Slide18.steps = states.length;