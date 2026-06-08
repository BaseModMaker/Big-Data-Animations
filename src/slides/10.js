const roleColors = {
  proposer1: '#3059ab',
  proposer2: '#e07a5f',
  A1: '#3d9970',
  A2: '#8e44ad',
  A3: '#00a6a6',
  learner: '#f2b134',
};

const states = [
  {
    phase: 'start',
    event: 'A proposer wants value X',
    proposer: 'P1',
    proposal: 'n=1, value=X',
    acceptors: {
      A1: { promised: '-', accepted: '-' },
      A2: { promised: '-', accepted: '-' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [],
    quorum: [],
    learnerValue: null,
    activeLines: [1],
    message:
      'Paxos starts when a proposer wants the system to agree on one value. Here P1 proposes value X.',
  },
  {
    phase: 'prepare',
    event: 'P1 sends PREPARE(1)',
    proposer: 'P1',
    proposal: 'n=1, value=X',
    acceptors: {
      A1: { promised: '-', accepted: '-' },
      A2: { promised: '-', accepted: '-' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [
      { from: 'P1', to: 'A1', label: 'PREPARE(1)' },
      { from: 'P1', to: 'A2', label: 'PREPARE(1)' },
      { from: 'P1', to: 'A3', label: 'PREPARE(1)' },
    ],
    quorum: [],
    learnerValue: null,
    activeLines: [2],
    message:
      'Phase 1 begins. P1 asks acceptors to promise that they will not accept older proposal numbers.',
  },
  {
    phase: 'promise',
    event: 'A1 promises proposal 1',
    proposer: 'P1',
    proposal: 'n=1, value=X',
    acceptors: {
      A1: { promised: '1', accepted: '-' },
      A2: { promised: '-', accepted: '-' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [{ from: 'A1', to: 'P1', label: 'PROMISE(1)' }],
    quorum: ['A1'],
    learnerValue: null,
    activeLines: [3],
    message:
      'A1 promises proposal number 1. One promise is not enough; Paxos needs a quorum.',
  },
  {
    phase: 'promise',
    event: 'A2 promises proposal 1',
    proposer: 'P1',
    proposal: 'n=1, value=X',
    acceptors: {
      A1: { promised: '1', accepted: '-' },
      A2: { promised: '1', accepted: '-' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [{ from: 'A2', to: 'P1', label: 'PROMISE(1)' }],
    quorum: ['A1', 'A2'],
    learnerValue: null,
    activeLines: [3, 4],
    message:
      'A2 also promises. A1 and A2 form a quorum, so P1 can move to the accept phase.',
  },
  {
    phase: 'accept',
    event: 'P1 sends ACCEPT(1, X)',
    proposer: 'P1',
    proposal: 'n=1, value=X',
    acceptors: {
      A1: { promised: '1', accepted: '-' },
      A2: { promised: '1', accepted: '-' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [
      { from: 'P1', to: 'A1', label: 'ACCEPT(1,X)' },
      { from: 'P1', to: 'A2', label: 'ACCEPT(1,X)' },
    ],
    quorum: ['A1', 'A2'],
    learnerValue: null,
    activeLines: [5],
    message:
      'Phase 2 begins. P1 asks the quorum to accept value X with proposal number 1.',
  },
  {
    phase: 'accepted',
    event: 'A1 accepts X',
    proposer: 'P1',
    proposal: 'n=1, value=X',
    acceptors: {
      A1: { promised: '1', accepted: '1:X' },
      A2: { promised: '1', accepted: '-' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [{ from: 'A1', to: 'P1', label: 'ACCEPTED' }],
    quorum: ['A1'],
    learnerValue: null,
    activeLines: [6],
    message:
      'A1 accepts X. The value is not chosen yet because only one acceptor has accepted it.',
  },
  {
    phase: 'chosen',
    event: 'A2 accepts X: quorum reached',
    proposer: 'P1',
    proposal: 'n=1, value=X',
    acceptors: {
      A1: { promised: '1', accepted: '1:X' },
      A2: { promised: '1', accepted: '1:X' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [{ from: 'A2', to: 'P1', label: 'ACCEPTED' }],
    quorum: ['A1', 'A2'],
    learnerValue: null,
    activeLines: [6, 7],
    message:
      'A2 also accepts X. A quorum has accepted the same value, so X is now chosen.',
  },
  {
    phase: 'learn',
    event: 'Learner learns chosen value X',
    proposer: 'P1',
    proposal: 'chosen value=X',
    acceptors: {
      A1: { promised: '1', accepted: '1:X' },
      A2: { promised: '1', accepted: '1:X' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [
      { from: 'A1', to: 'L', label: 'X chosen' },
      { from: 'A2', to: 'L', label: 'X chosen' },
    ],
    quorum: ['A1', 'A2'],
    learnerValue: 'X',
    activeLines: [8],
    message:
      'Learners are told the chosen value. The system has reached consensus on X.',
  },
  {
    phase: 'conflict',
    event: 'Another proposer tries value Y',
    proposer: 'P2',
    proposal: 'n=2, value=Y',
    acceptors: {
      A1: { promised: '1', accepted: '1:X' },
      A2: { promised: '1', accepted: '1:X' },
      A3: { promised: '-', accepted: '-' },
    },
    messages: [
      { from: 'P2', to: 'A2', label: 'PREPARE(2)' },
      { from: 'P2', to: 'A3', label: 'PREPARE(2)' },
    ],
    quorum: [],
    learnerValue: 'X',
    activeLines: [2],
    message:
      'A different proposer P2 may try a newer proposal number. Paxos must still preserve the already chosen value.',
  },
  {
    phase: 'promise',
    event: 'A2 reports it already accepted X',
    proposer: 'P2',
    proposal: 'n=2, must keep X',
    acceptors: {
      A1: { promised: '1', accepted: '1:X' },
      A2: { promised: '2', accepted: '1:X' },
      A3: { promised: '2', accepted: '-' },
    },
    messages: [
      { from: 'A2', to: 'P2', label: 'PROMISE + accepted X' },
      { from: 'A3', to: 'P2', label: 'PROMISE' },
    ],
    quorum: ['A2', 'A3'],
    learnerValue: 'X',
    activeLines: [3, 4],
    message:
      'A2 tells P2 that it already accepted X. Because P2 sees a prior accepted value, it must continue with X, not Y.',
  },
  {
    phase: 'accept',
    event: 'P2 must propose X, not Y',
    proposer: 'P2',
    proposal: 'n=2, value=X',
    acceptors: {
      A1: { promised: '1', accepted: '1:X' },
      A2: { promised: '2', accepted: '1:X' },
      A3: { promised: '2', accepted: '-' },
    },
    messages: [
      { from: 'P2', to: 'A2', label: 'ACCEPT(2,X)' },
      { from: 'P2', to: 'A3', label: 'ACCEPT(2,X)' },
    ],
    quorum: ['A2', 'A3'],
    learnerValue: 'X',
    activeLines: [5],
    message:
      'This is the safety rule: once a value might already be chosen, newer proposals must preserve that value.',
  },
  {
    phase: 'done',
    event: 'Consensus remains X',
    proposer: 'P2',
    proposal: 'chosen value=X',
    acceptors: {
      A1: { promised: '1', accepted: '1:X' },
      A2: { promised: '2', accepted: '2:X' },
      A3: { promised: '2', accepted: '2:X' },
    },
    messages: [{ from: 'P2', to: 'L', label: 'X confirmed' }],
    quorum: ['A2', 'A3'],
    learnerValue: 'X',
    activeLines: [7, 8],
    message:
      'Even with another proposer and a newer proposal number, the consensus value remains X.',
  },
];

const codeLines = [
  'proposer wants to choose a value',
  'phase 1: send PREPARE(n) to acceptors',
  'acceptors promise if n is newest',
  'if promises mention an accepted value, keep that value',
  'phase 2: send ACCEPT(n, value)',
  'acceptors accept if promise is not broken',
  'value is chosen when a quorum accepts it',
  'learners learn the chosen value',
];

const positions = {
  P1: { x: 80, y: 70 },
  P2: { x: 80, y: 250 },
  A1: { x: 270, y: 60 },
  A2: { x: 270, y: 160 },
  A3: { x: 270, y: 260 },
  L: { x: 450, y: 160 },
};

function getNodeLabel(node) {
  if (node === 'P1') return 'P1';
  if (node === 'P2') return 'P2';
  if (node === 'L') return 'Learner';
  return node;
}

function getMessageLine(message) {
  const from = positions[message.from];
  const to = positions[message.to];

  return {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    labelX: (from.x + to.x) / 2,
    labelY: (from.y + to.y) / 2 - 8,
  };
}

function getAcceptorClass(name, state) {
  const hasAccepted = state.acceptors[name].accepted !== '-';
  const inQuorum = state.quorum.includes(name);

  if (inQuorum && hasAccepted) return 'accepted quorum';
  if (inQuorum) return 'quorum';
  if (hasAccepted) return 'accepted';
  return '';
}

export default function Slide10({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Consensus protocol</p>

        <h1>Paxos chooses one value when a quorum accepts it</h1>

        <p className="subtitle">
          Proposers suggest values, acceptors vote safely, and learners observe
          the chosen value.
        </p>

        <div className="paxos-layout">
          <section className="paxos-code">
            <p className="paxos-code-title">Protocol</p>

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

          <section className="paxos-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <svg
              className="paxos-network"
              viewBox="0 0 530 330"
              role="img"
              aria-label="Paxos protocol diagram"
            >
              <rect className="network-bg" x="18" y="18" width="494" height="292" rx="20" />

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

              {['P1', 'P2'].map((node) => {
                const position = positions[node];
                const isActive = currentState.proposer === node;

                return (
                  <g
                    key={node}
                    className={`node proposer-node ${isActive ? 'is-active' : ''}`}
                  >
                    <circle cx={position.x} cy={position.y} r="38" />
                    <text x={position.x} y={position.y - 4} textAnchor="middle">
                      {getNodeLabel(node)}
                    </text>
                    <text x={position.x} y={position.y + 18} textAnchor="middle">
                      proposer
                    </text>
                  </g>
                );
              })}

              {['A1', 'A2', 'A3'].map((node) => {
                const position = positions[node];
                const acceptor = currentState.acceptors[node];

                return (
                  <g
                    key={node}
                    className={`node acceptor-node ${getAcceptorClass(node, currentState)}`}
                  >
                    <circle cx={position.x} cy={position.y} r="38" />
                    <text x={position.x} y={position.y - 11} textAnchor="middle">
                      {node}
                    </text>
                    <text x={position.x} y={position.y + 8} textAnchor="middle">
                      p:{acceptor.promised}
                    </text>
                    <text x={position.x} y={position.y + 25} textAnchor="middle">
                      a:{acceptor.accepted}
                    </text>
                  </g>
                );
              })}

              <g className={`node learner-node ${currentState.learnerValue ? 'has-value' : ''}`}>
                <circle cx={positions.L.x} cy={positions.L.y} r="42" />
                <text x={positions.L.x} y={positions.L.y - 4} textAnchor="middle">
                  L
                </text>
                <text x={positions.L.x} y={positions.L.y + 20} textAnchor="middle">
                  {currentState.learnerValue
                    ? `learned ${currentState.learnerValue}`
                    : 'learner'}
                </text>
              </g>
            </svg>

            <div className="paxos-state-row">
              <div key={`proposal-${currentStep}`} className="state-card">
                <strong>Proposal</strong>
                <span>{currentState.proposal}</span>
              </div>

              <div key={`quorum-${currentStep}`} className="state-card quorum-card">
                <strong>Quorum</strong>
                <span>
                  {currentState.quorum.length > 0
                    ? currentState.quorum.join(' + ')
                    : 'not yet'}
                </span>
              </div>

              <div key={`value-${currentStep}`} className="state-card chosen-card">
                <strong>Chosen value</strong>
                <span>{currentState.learnerValue || 'not learned'}</span>
              </div>
            </div>

            <div className="paxos-message-zone">
              <p key={`message-${currentStep}`}>
                {currentState.message}
              </p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Paxos is difficult because it allows failures and competing proposers,
          while still ensuring that only one value can be chosen.
        </p>
      </main>

      <style>{`
        .paxos-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .paxos-code,
        .paxos-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .paxos-code {
          padding: 22px;
        }

        .paxos-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .paxos-code pre {
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

        .paxos-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto auto 1fr;
          gap: 16px;
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

        .phase-chosen,
        .phase-learn,
        .phase-done {
          background: #3d9970;
        }

        .phase-conflict {
          background: #e07a5f;
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

        .paxos-network {
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
          font-size: 20px;
          font-weight: 900;
        }

        .node text:not(:first-of-type) {
          fill: rgba(17, 17, 17, 0.66);
          font-size: 12px;
          font-weight: 800;
        }

        .proposer-node circle {
          stroke: ${roleColors.proposer1};
        }

        .proposer-node.is-active circle {
          fill: rgba(48, 89, 171, 0.14);
          stroke: #3059ab;
        }

        .acceptor-node.quorum circle {
          fill: rgba(48, 89, 171, 0.12);
          stroke: #3059ab;
        }

        .acceptor-node.accepted circle {
          fill: rgba(61, 153, 112, 0.13);
          stroke: #3d9970;
        }

        .acceptor-node.accepted.quorum circle {
          fill: rgba(61, 153, 112, 0.18);
          stroke: #3d9970;
        }

        .learner-node circle {
          stroke: ${roleColors.learner};
        }

        .learner-node.has-value circle {
          fill: rgba(242, 177, 52, 0.18);
          stroke: #f2b134;
        }

        .paxos-state-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .state-card {
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.055);
          padding: 14px;
          display: grid;
          gap: 4px;
          animation: state-enter 320ms ease both;
        }

        .state-card strong {
          color: #3059ab;
          font-size: 15px;
        }

        .state-card span {
          color: #111;
          font-size: 16px;
          font-weight: 800;
        }

        .quorum-card {
          background: rgba(48, 89, 171, 0.1);
        }

        .chosen-card {
          background: rgba(61, 153, 112, 0.12);
        }

        .paxos-message-zone {
          border-radius: 18px;
          background: rgba(48, 89, 171, 0.1);
          padding: 16px;
          animation: message-enter 320ms ease both;
        }

        .paxos-message-zone p {
          margin: 0;
          font-size: 19px;
          line-height: 1.34;
        }

        @keyframes state-enter {
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

Slide10.steps = states.length;