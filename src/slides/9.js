const nodeColors = {
  coordinator: '#3059ab',
  P1: '#3d9970',
  P2: '#e07a5f',
  P3: '#8e44ad',
};

const states = [
  {
    phase: 'start',
    event: 'Transaction starts',
    coordinatorState: 'start',
    participants: {
      P1: 'idle',
      P2: 'idle',
      P3: 'idle',
    },
    messages: [],
    activeLines: [1],
    message:
      'A distributed transaction starts. The coordinator is responsible for making every participant reach the same final decision.',
  },
  {
    phase: 'prepare',
    event: 'Coordinator sends PREPARE',
    coordinatorState: 'waiting',
    participants: {
      P1: 'prepare?',
      P2: 'prepare?',
      P3: 'prepare?',
    },
    messages: [
      { from: 'C', to: 'P1', label: 'PREPARE' },
      { from: 'C', to: 'P2', label: 'PREPARE' },
      { from: 'C', to: 'P3', label: 'PREPARE' },
    ],
    activeLines: [2],
    message:
      'Phase 1 begins. The coordinator asks every participant whether it is ready to commit.',
  },
  {
    phase: 'vote',
    event: 'P1 votes YES',
    coordinatorState: 'waiting',
    participants: {
      P1: 'yes',
      P2: 'prepare?',
      P3: 'prepare?',
    },
    messages: [{ from: 'P1', to: 'C', label: 'YES' }],
    activeLines: [3],
    message:
      'P1 is ready. It promises that it can commit later and replies YES.',
  },
  {
    phase: 'vote',
    event: 'P2 votes YES',
    coordinatorState: 'waiting',
    participants: {
      P1: 'yes',
      P2: 'yes',
      P3: 'prepare?',
    },
    messages: [{ from: 'P2', to: 'C', label: 'YES' }],
    activeLines: [3],
    message:
      'P2 is also ready and votes YES. The coordinator still cannot decide until every participant has replied.',
  },
  {
    phase: 'vote',
    event: 'P3 votes YES',
    coordinatorState: 'all-ready',
    participants: {
      P1: 'yes',
      P2: 'yes',
      P3: 'yes',
    },
    messages: [{ from: 'P3', to: 'C', label: 'YES' }],
    activeLines: [3, 4],
    message:
      'P3 votes YES. Since all participants are ready, the coordinator chooses COMMIT.',
  },
  {
    phase: 'commit',
    event: 'Coordinator sends COMMIT',
    coordinatorState: 'commit',
    participants: {
      P1: 'commit',
      P2: 'commit',
      P3: 'commit',
    },
    messages: [
      { from: 'C', to: 'P1', label: 'COMMIT' },
      { from: 'C', to: 'P2', label: 'COMMIT' },
      { from: 'C', to: 'P3', label: 'COMMIT' },
    ],
    activeLines: [5],
    message:
      'Phase 2 begins. Because everyone voted YES, the coordinator tells all participants to commit.',
  },
  {
    phase: 'done',
    event: 'All participants commit',
    coordinatorState: 'done',
    participants: {
      P1: 'committed',
      P2: 'committed',
      P3: 'committed',
    },
    messages: [],
    activeLines: [6],
    message:
      'The transaction is committed consistently. Every participant reaches the same decision.',
  },
  {
    phase: 'abort-prepare',
    event: 'Alternative path: P2 cannot commit',
    coordinatorState: 'waiting',
    participants: {
      P1: 'yes',
      P2: 'no',
      P3: 'yes',
    },
    messages: [{ from: 'P2', to: 'C', label: 'NO' }],
    activeLines: [3, 7],
    message:
      'If even one participant votes NO, the coordinator must abort the whole transaction.',
  },
  {
    phase: 'abort',
    event: 'Coordinator sends ABORT',
    coordinatorState: 'abort',
    participants: {
      P1: 'abort',
      P2: 'abort',
      P3: 'abort',
    },
    messages: [
      { from: 'C', to: 'P1', label: 'ABORT' },
      { from: 'C', to: 'P2', label: 'ABORT' },
      { from: 'C', to: 'P3', label: 'ABORT' },
    ],
    activeLines: [8],
    message:
      'The coordinator tells everyone to abort. This preserves consistency because nobody commits alone.',
  },
  {
    phase: 'blocked',
    event: 'Failure case: coordinator crashes',
    coordinatorState: 'failed',
    participants: {
      P1: 'uncertain',
      P2: 'uncertain',
      P3: 'uncertain',
    },
    messages: [],
    activeLines: [9],
    message:
      'If the coordinator fails after participants vote YES but before the final decision is known, participants may block.',
  },
  {
    phase: 'blocked',
    event: 'Participants wait for decision',
    coordinatorState: 'failed',
    participants: {
      P1: 'blocked',
      P2: 'blocked',
      P3: 'blocked',
    },
    messages: [],
    activeLines: [9],
    message:
      'This is the main weakness of Two-Phase Commit: it gives consistency, but a bad coordinator failure can leave participants waiting.',
  },
];

const codeLines = [
  'coordinator starts transaction',
  'phase 1: send PREPARE to all participants',
  'participants vote YES or NO',
  'if every vote is YES:',
  '  phase 2: send COMMIT to all',
  '  everyone commits',
  'else:',
  '  phase 2: send ABORT to all',
  'if coordinator fails before decision: participants may block',
];

const nodePositions = {
  C: { x: 250, y: 72 },
  P1: { x: 90, y: 248 },
  P2: { x: 250, y: 248 },
  P3: { x: 410, y: 248 },
};

function getStatusLabel(status) {
  const labels = {
    idle: 'idle',
    'prepare?': 'ready?',
    yes: 'YES',
    no: 'NO',
    commit: 'commit msg',
    committed: 'committed',
    abort: 'abort msg',
    uncertain: 'uncertain',
    blocked: 'blocked',
  };

  return labels[status] || status;
}

function getStatusClass(status) {
  if (status === 'committed' || status === 'yes') return 'good';
  if (status === 'no' || status === 'abort') return 'bad';
  if (status === 'uncertain' || status === 'blocked') return 'warning';
  if (status === 'commit') return 'commit';
  return 'neutral';
}

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

export default function Slide9({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distributed transactions</p>

        <h1>Two-Phase Commit makes every participant commit or abort together</h1>

        <p className="subtitle">
          The coordinator first collects votes, then broadcasts the final
          decision.
        </p>

        <div className="tpc-layout">
          <section className="tpc-code">
            <p className="tpc-code-title">Protocol</p>

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

          <section className="tpc-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <svg
              className="network-diagram"
              viewBox="0 0 500 330"
              role="img"
              aria-label="Two-Phase Commit protocol diagram"
            >
              <rect className="network-bg" x="18" y="18" width="464" height="292" rx="20" />

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

              <g className={`node coordinator-node ${currentState.coordinatorState}`}>
                <circle cx={nodePositions.C.x} cy={nodePositions.C.y} r="42" />
                <text x={nodePositions.C.x} y={nodePositions.C.y - 4} textAnchor="middle">
                  C
                </text>
                <text x={nodePositions.C.x} y={nodePositions.C.y + 20} textAnchor="middle">
                  {currentState.coordinatorState}
                </text>
              </g>

              {['P1', 'P2', 'P3'].map((participant) => {
                const position = nodePositions[participant];
                const status = currentState.participants[participant];

                return (
                  <g
                    key={participant}
                    className={`node participant-node ${getStatusClass(status)}`}
                  >
                    <circle cx={position.x} cy={position.y} r="42" />
                    <text x={position.x} y={position.y - 4} textAnchor="middle">
                      {participant}
                    </text>
                    <text x={position.x} y={position.y + 20} textAnchor="middle">
                      {getStatusLabel(status)}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="tpc-message-zone">
              <div key={`decision-${currentStep}`} className={`decision-box phase-${currentState.phase}`}>
                <strong>
                  {currentState.phase === 'prepare' && 'Phase 1'}
                  {currentState.phase === 'vote' && 'Vote collection'}
                  {currentState.phase === 'commit' && 'Phase 2: commit'}
                  {currentState.phase === 'done' && 'Consistent commit'}
                  {currentState.phase === 'abort-prepare' && 'Abort condition'}
                  {currentState.phase === 'abort' && 'Phase 2: abort'}
                  {currentState.phase === 'blocked' && 'Blocking risk'}
                  {currentState.phase === 'start' && 'Start'}
                </strong>

                <span>
                  {currentState.phase === 'commit' && 'everyone commits'}
                  {currentState.phase === 'abort' && 'everyone aborts'}
                  {currentState.phase === 'blocked' && 'waiting for coordinator'}
                  {currentState.phase !== 'commit' &&
                    currentState.phase !== 'abort' &&
                    currentState.phase !== 'blocked' &&
                    'same final decision'}
                </span>
              </div>

              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Two-Phase Commit gives consistency, but it can block if the coordinator
          fails after participants are prepared and before the final decision is
          known.
        </p>
      </main>

      <style>{`
        .tpc-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .tpc-code,
        .tpc-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .tpc-code {
          padding: 22px;
        }

        .tpc-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .tpc-code pre {
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

        .tpc-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 18px;
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

        .phase-abort,
        .phase-abort-prepare {
          background: #e07a5f;
        }

        .phase-blocked {
          background: #8e44ad;
        }

        .phase-done,
        .phase-commit {
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

        .network-diagram {
          width: 100%;
          height: 330px;
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
          font-size: 15px;
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

        .node circle {
          fill: white;
          stroke: rgba(17, 17, 17, 0.2);
          stroke-width: 3;
          transition:
            fill 300ms ease,
            stroke 300ms ease,
            transform 300ms ease;
        }

        .node text:first-of-type {
          fill: #111;
          font-size: 22px;
          font-weight: 900;
        }

        .node text:last-of-type {
          fill: rgba(17, 17, 17, 0.66);
          font-size: 13px;
          font-weight: 800;
        }

        .coordinator-node circle {
          stroke: ${nodeColors.coordinator};
        }

        .participant-node.good circle,
        .coordinator-node.commit circle,
        .coordinator-node.done circle,
        .coordinator-node.all-ready circle {
          fill: rgba(61, 153, 112, 0.16);
          stroke: #3d9970;
        }

        .participant-node.bad circle,
        .coordinator-node.abort circle {
          fill: rgba(224, 122, 95, 0.16);
          stroke: #e07a5f;
        }

        .participant-node.warning circle,
        .coordinator-node.failed circle {
          fill: rgba(142, 68, 173, 0.14);
          stroke: #8e44ad;
        }

        .participant-node.commit circle {
          fill: rgba(48, 89, 171, 0.12);
          stroke: #3059ab;
        }

        .tpc-message-zone {
          display: grid;
          grid-template-columns: 0.44fr 1fr;
          gap: 18px;
          align-items: start;
        }

        .tpc-message-zone p {
          margin: 0;
          font-size: 20px;
          line-height: 1.36;
          animation: message-enter 320ms ease both;
        }

        .decision-box {
          min-height: 88px;
          border-radius: 18px;
          padding: 16px;
          box-sizing: border-box;
          display: grid;
          align-content: center;
          gap: 6px;
          background: rgba(48, 89, 171, 0.12);
          animation: decision-enter 320ms ease both;
        }

        .decision-box.phase-commit,
        .decision-box.phase-done {
          background: rgba(61, 153, 112, 0.16);
        }

        .decision-box.phase-abort,
        .decision-box.phase-abort-prepare {
          background: rgba(224, 122, 95, 0.18);
        }

        .decision-box.phase-blocked {
          background: rgba(142, 68, 173, 0.14);
        }

        .decision-box strong {
          color: #3059ab;
          font-size: 18px;
        }

        .decision-box span {
          color: #111;
          font-size: 17px;
          font-weight: 800;
        }

        @keyframes decision-enter {
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

Slide9.steps = states.length;