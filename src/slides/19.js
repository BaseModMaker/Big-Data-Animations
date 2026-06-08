const colors = {
  batch: '#3059ab',
  online: '#3d9970',
  slow: '#8e44ad',
  fast: '#e07a5f',
  adam: '#f2b134',
};

const points = [
  { id: 'z1', x: 82, y: 210 },
  { id: 'z2', x: 135, y: 168 },
  { id: 'z3', x: 190, y: 130 },
  { id: 'z4', x: 245, y: 112 },
  { id: 'z5', x: 305, y: 96 },
  { id: 'z6', x: 365, y: 84 },
];

const states = [
  {
    phase: 'batch',
    event: 'Batch gradient descent uses the whole dataset',
    activeLines: [1],
    visiblePoints: points,
    theta: { x: 80, y: 72 },
    path: [{ x: 80, y: 72 }],
    gradient: 'average gradient over all examples',
    learningRate: 'α = fixed',
    method: 'Batch GD',
    message:
      'Batch gradient descent computes one average gradient using all training examples before updating the parameters.',
  },
  {
    phase: 'batch',
    event: 'One batch update',
    activeLines: [2],
    visiblePoints: points,
    theta: { x: 145, y: 118 },
    path: [
      { x: 80, y: 72 },
      { x: 145, y: 118 },
    ],
    gradient: '∇L over full dataset',
    learningRate: 'α = fixed',
    method: 'Batch GD',
    message:
      'The update is stable because it uses all samples, but each step can be expensive on large data.',
  },
  {
    phase: 'online',
    event: 'Online gradient descent receives one sample',
    activeLines: [3],
    visiblePoints: [points[0]],
    currentPoint: 'z1',
    theta: { x: 100, y: 88 },
    path: [{ x: 100, y: 88 }],
    gradient: '∇L(z₁, θ₀)',
    learningRate: 'α₁',
    method: 'Online GD',
    message:
      'Online gradient descent updates immediately from one incoming sample instead of waiting for the full dataset.',
  },
  {
    phase: 'online',
    event: 'Update θ using z₁',
    activeLines: [4],
    visiblePoints: [points[0]],
    currentPoint: 'z1',
    theta: { x: 135, y: 132 },
    path: [
      { x: 100, y: 88 },
      { x: 135, y: 132 },
    ],
    gradient: 'θ₁ = θ₀ − α₁∇L(z₁, θ₀)',
    learningRate: 'α₁ = moderate',
    method: 'Online GD',
    message:
      'The parameter estimate moves in the direction suggested by the current sample.',
  },
  {
    phase: 'online',
    event: 'Next sample gives a new update',
    activeLines: [3, 4],
    visiblePoints: points.slice(0, 2),
    currentPoint: 'z2',
    theta: { x: 175, y: 158 },
    path: [
      { x: 100, y: 88 },
      { x: 135, y: 132 },
      { x: 175, y: 158 },
    ],
    gradient: 'θ₂ = θ₁ − α₂∇L(z₂, θ₁)',
    learningRate: 'α₂ = moderate',
    method: 'Online GD',
    message:
      'Each sample can change the direction of learning, so online updates are cheaper but noisier.',
  },
  {
    phase: 'slow',
    event: 'Learning rate too small',
    activeLines: [5],
    visiblePoints: points.slice(0, 4),
    theta: { x: 155, y: 128 },
    path: [
      { x: 100, y: 88 },
      { x: 115, y: 99 },
      { x: 130, y: 110 },
      { x: 143, y: 120 },
      { x: 155, y: 128 },
    ],
    gradient: 'small steps',
    learningRate: 'α too small',
    method: 'Slow learning',
    message:
      'If the learning rate is too small, the model reacts weakly to new observations and learning is slow.',
  },
  {
    phase: 'fast',
    event: 'Learning rate too large',
    activeLines: [6],
    visiblePoints: points.slice(0, 4),
    theta: { x: 260, y: 68 },
    path: [
      { x: 100, y: 88 },
      { x: 210, y: 220 },
      { x: 150, y: 72 },
      { x: 295, y: 205 },
      { x: 260, y: 68 },
    ],
    gradient: 'overshooting',
    learningRate: 'α too large',
    method: 'Unstable learning',
    message:
      'If the learning rate is too large, updates can overshoot the optimum and oscillate or diverge.',
  },
  {
    phase: 'adaptive',
    event: 'Adaptive methods use previous gradients',
    activeLines: [7],
    visiblePoints: points.slice(0, 5),
    theta: { x: 235, y: 142 },
    path: [
      { x: 100, y: 88 },
      { x: 140, y: 125 },
      { x: 178, y: 148 },
      { x: 210, y: 151 },
      { x: 235, y: 142 },
    ],
    gradient: 'past gradients adjust α',
    learningRate: 'AdaGrad / RMSProp',
    method: 'Adaptive rate',
    message:
      'AdaGrad and RMSProp adapt the learning rate using information from previous gradients.',
  },
  {
    phase: 'adam',
    event: 'Adam adds momentum',
    activeLines: [8],
    visiblePoints: points,
    theta: { x: 306, y: 108 },
    path: [
      { x: 100, y: 88 },
      { x: 145, y: 125 },
      { x: 190, y: 145 },
      { x: 232, y: 140 },
      { x: 270, y: 122 },
      { x: 306, y: 108 },
    ],
    gradient: 'adaptive rate + momentum',
    learningRate: 'Adam',
    method: 'Adam',
    message:
      'Adam adapts the learning rate and uses momentum, which helps move through flat regions of the optimization landscape.',
  },
  {
    phase: 'note',
    event: 'Learning rate is critical',
    activeLines: [9],
    visiblePoints: points,
    theta: { x: 306, y: 108 },
    path: [
      { x: 100, y: 88 },
      { x: 145, y: 125 },
      { x: 190, y: 145 },
      { x: 232, y: 140 },
      { x: 270, y: 122 },
      { x: 306, y: 108 },
    ],
    gradient: 'controls reaction strength',
    learningRate: 'α decides update size',
    method: 'Learning rate',
    message:
      'The learning rate is one of the most important parameters in online learning: it decides how strongly the model reacts to each new observation.',
  },
];

const codeLines = [
  'batch GD: compute average gradient over all examples',
  'update θ once using the batch gradient',
  'online GD: receive one sample zₜ',
  'θₜ = θₜ₋₁ − αₜ ∇θ L(zₜ, θₜ₋₁)',
  'if α is too small: learning is slow',
  'if α is too large: oscillation or divergence',
  'AdaGrad / RMSProp adapt α using past gradients',
  'Adam adapts α and adds momentum',
  'learning rate controls reaction to new data',
];

function buildPath(points) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export default function Slide19({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Online optimization</p>

        <h1>Online gradient descent updates the model one sample at a time</h1>

        <p className="subtitle">
          Batch methods average gradients over all data, while online methods
          update immediately from the current observation.
        </p>

        <div className="gd-layout">
          <section className="gd-code">
            <p className="gd-code-title">Algorithm</p>

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

          <section className="gd-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="gd-main">
              <svg
                className="gd-plot"
                viewBox="0 0 460 280"
                role="img"
                aria-label="Gradient descent parameter update animation"
              >
                <rect className="plot-bg" x="20" y="18" width="420" height="244" rx="18" />

                <path
                  className="loss-contour contour-1"
                  d="M 115 210 C 80 160, 120 82, 220 70 C 345 55, 392 130, 342 198 C 295 262, 170 270, 115 210"
                />
                <path
                  className="loss-contour contour-2"
                  d="M 155 195 C 130 158, 160 105, 230 98 C 315 88, 345 136, 315 180 C 280 230, 195 235, 155 195"
                />
                <path
                  className="loss-contour contour-3"
                  d="M 202 178 C 188 155, 205 126, 242 122 C 284 118, 302 143, 286 167 C 267 195, 225 198, 202 178"
                />

                {currentState.visiblePoints.map((point) => (
                  <circle
                    key={point.id}
                    className={`sample-point ${
                      point.id === currentState.currentPoint ? 'is-current' : ''
                    }`}
                    cx={point.x}
                    cy={point.y}
                    r="8"
                  />
                ))}

                {currentState.path.length > 1 && (
                  <path
                    key={`path-${currentStep}`}
                    className={`update-path path-${currentState.phase}`}
                    d={buildPath(currentState.path)}
                  />
                )}

                <circle
                  key={`theta-${currentStep}`}
                  className={`theta-point theta-${currentState.phase}`}
                  cx={currentState.theta.x}
                  cy={currentState.theta.y}
                  r="13"
                />

                <text
                  className="theta-label"
                  x={currentState.theta.x}
                  y={currentState.theta.y - 18}
                  textAnchor="middle"
                >
                  θ
                </text>

                <text className="optimum-label" x="248" y="164" textAnchor="middle">
                  optimum
                </text>
              </svg>

              <div className="gd-state-panel">
                <div className="state-card">
                  <strong>Method</strong>
                  <span>{currentState.method}</span>
                </div>

                <div className="state-card">
                  <strong>Gradient</strong>
                  <span>{currentState.gradient}</span>
                </div>

                <div className={`state-card rate-card phase-${currentState.phase}`}>
                  <strong>Learning rate</strong>
                  <span>{currentState.learningRate}</span>
                </div>
              </div>
            </div>

            <div className="formula-row">
              <div className="formula-card">
                <strong>Online update</strong>
                <span>θ̂ₜ = θ̂ₜ₋₁ − αₜ ∇θ L(zₜ, θ̂ₜ₋₁)</span>
              </div>

              <div className={`formula-card ${currentState.phase === 'adam' ? 'is-filled' : ''}`}>
                <strong>Adaptive methods</strong>
                <span>AdaGrad · RMSProp · Adam</span>
              </div>
            </div>

            <div className="gd-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Learning rate Note 3.1: the learning rate decides how strongly the
          model reacts to each new observation.
        </p>
      </main>

      <style>{`
        .gd-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.35fr;
          gap: 22px;
          margin-top: 20px;
          align-items: stretch;
        }

        .gd-code,
        .gd-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .gd-code {
          padding: 18px;
        }

        .gd-code-title,
        .zone-label {
          margin: 0 0 12px;
          color: #3059ab;
          font-size: 17px;
          font-weight: 700;
        }

        .gd-code pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.34;
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

        .gd-visual {
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

        .phase-batch {
          background: #3059ab;
        }

        .phase-online {
          background: #3d9970;
        }

        .phase-slow {
          background: #8e44ad;
        }

        .phase-fast {
          background: #e07a5f;
        }

        .phase-adaptive,
        .phase-adam,
        .phase-note {
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

        .gd-main {
          display: grid;
          grid-template-columns: 1fr 0.55fr;
          gap: 12px;
        }

        .gd-plot {
          width: 100%;
          height: 280px;
          display: block;
        }

        .plot-bg {
          fill: rgba(255, 255, 255, 0.54);
          stroke: rgba(17, 17, 17, 0.1);
          stroke-width: 2;
        }

        .loss-contour {
          fill: none;
          stroke: rgba(17, 17, 17, 0.16);
          stroke-width: 2;
        }

        .contour-2 {
          stroke: rgba(17, 17, 17, 0.22);
        }

        .contour-3 {
          stroke: rgba(17, 17, 17, 0.28);
        }

        .sample-point {
          fill: rgba(17, 17, 17, 0.32);
          stroke: white;
          stroke-width: 2;
          animation: point-enter 280ms ease both;
        }

        .sample-point.is-current {
          fill: #3d9970;
          stroke: white;
          stroke-width: 3;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.18));
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

        .update-path {
          fill: none;
          stroke: #3059ab;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 700;
          stroke-dashoffset: 700;
          animation: path-enter 620ms ease forwards;
        }

        .path-online {
          stroke: #3d9970;
        }

        .path-slow {
          stroke: #8e44ad;
        }

        .path-fast {
          stroke: #e07a5f;
        }

        .path-adaptive,
        .path-adam {
          stroke: #f2b134;
        }

        @keyframes path-enter {
          to {
            stroke-dashoffset: 0;
          }
        }

        .theta-point {
          fill: #3059ab;
          stroke: white;
          stroke-width: 4;
          filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.18));
          animation: theta-enter 320ms ease both;
        }

        .theta-online {
          fill: #3d9970;
        }

        .theta-slow {
          fill: #8e44ad;
        }

        .theta-fast {
          fill: #e07a5f;
        }

        .theta-adaptive,
        .theta-adam,
        .theta-note {
          fill: #f2b134;
        }

        @keyframes theta-enter {
          from {
            opacity: 0;
            transform: scale(0.76);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .theta-label,
        .optimum-label {
          fill: rgba(17, 17, 17, 0.62);
          font-size: 12px;
          font-weight: 900;
        }

        .gd-state-panel {
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

        .rate-card.phase-slow {
          background: rgba(142, 68, 173, 0.12);
        }

        .rate-card.phase-fast {
          background: rgba(224, 122, 95, 0.16);
        }

        .rate-card.phase-adaptive,
        .rate-card.phase-adam,
        .rate-card.phase-note {
          background: rgba(242, 177, 52, 0.18);
        }

        .formula-row {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
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

        .gd-message-zone {
          border-radius: 16px;
          background: rgba(48, 89, 171, 0.1);
          padding: 13px 15px;
          animation: message-enter 320ms ease both;
        }

        .gd-message-zone p {
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

Slide19.steps = states.length;