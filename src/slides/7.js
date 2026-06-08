const itemColors = {
  A: '#3059ab',
  B: '#e07a5f',
  C: '#3d9970',
  D: '#8e44ad',
  E: '#f2b134',
  F: '#00a6a6',
  G: '#c44569',
  H: '#6c5ce7',
  I: '#2d3436',
};

const registerCount = 8;

const states = [
  {
    item: 'A',
    hash: '00110100',
    register: 1,
    suffix: '10100',
    rank: 2,
    registers: [0, 2, 0, 0, 0, 0, 0, 0],
    estimate: 7,
    activeLines: [2, 3, 4],
    message:
      'A is hashed. The first bits choose register 1, and the remaining bits give rank 2.',
  },
  {
    item: 'B',
    hash: '10101000',
    register: 5,
    suffix: '01000',
    rank: 3,
    registers: [0, 2, 0, 0, 0, 3, 0, 0],
    estimate: 9,
    activeLines: [2, 3, 4],
    message:
      'B updates register 5 to rank 3. HyperLogLog keeps only the maximum rank per register.',
  },
  {
    item: 'C',
    hash: '01100000',
    register: 3,
    suffix: '00000',
    rank: 5,
    registers: [0, 2, 0, 5, 0, 3, 0, 0],
    estimate: 15,
    activeLines: [2, 3, 4],
    message:
      'C creates a rare pattern with many leading zeros in its suffix, so register 3 jumps to 5.',
  },
  {
    item: 'A',
    hash: '00110100',
    register: 1,
    suffix: '10100',
    rank: 2,
    registers: [0, 2, 0, 5, 0, 3, 0, 0],
    estimate: 15,
    activeLines: [1, 2, 3],
    message:
      'A appears again. The same register and rank are produced, so the sketch does not change.',
  },
  {
    item: 'D',
    hash: '11110000',
    register: 7,
    suffix: '10000',
    rank: 4,
    registers: [0, 2, 0, 5, 0, 3, 0, 4],
    estimate: 20,
    activeLines: [2, 3, 4],
    message:
      'D updates register 7. More non-zero registers usually means the distinct-count estimate increases.',
  },
  {
    item: 'E',
    hash: '00001010',
    register: 0,
    suffix: '01010',
    rank: 1,
    registers: [1, 2, 0, 5, 0, 3, 0, 4],
    estimate: 22,
    activeLines: [2, 3, 4],
    message:
      'E updates register 0, but only with rank 1. Small ranks give limited evidence of many distinct items.',
  },
  {
    item: 'F',
    hash: '10000100',
    register: 4,
    suffix: '00100',
    rank: 2,
    registers: [1, 2, 0, 5, 2, 3, 0, 4],
    estimate: 25,
    activeLines: [2, 3, 4],
    message:
      'F fills another register. HyperLogLog spreads items across registers to reduce variance.',
  },
  {
    item: 'G',
    hash: '01000000',
    register: 2,
    suffix: '00000',
    rank: 5,
    registers: [1, 2, 5, 5, 2, 3, 0, 4],
    estimate: 37,
    activeLines: [2, 3, 4],
    message:
      'G creates a high rank in register 2. A rare suffix pattern strongly raises the estimate.',
  },
  {
    item: 'H',
    hash: '11010000',
    register: 6,
    suffix: '10000',
    rank: 4,
    registers: [1, 2, 5, 5, 2, 3, 4, 4],
    estimate: 48,
    activeLines: [2, 3, 4],
    message:
      'H updates the last empty register. Now every register contains some evidence.',
  },
  {
    item: 'I',
    hash: '01110000',
    register: 3,
    suffix: '10000',
    rank: 4,
    registers: [1, 2, 5, 5, 2, 3, 4, 4],
    estimate: 48,
    activeLines: [2, 3, 4],
    message:
      'I maps to register 3, but rank 4 is lower than the stored maximum 5, so the register does not change.',
  },
  {
    item: 'B',
    hash: '10101000',
    register: 5,
    suffix: '01000',
    rank: 3,
    registers: [1, 2, 5, 5, 2, 3, 4, 4],
    estimate: 48,
    activeLines: [1, 2, 3],
    message:
      'B appears again. Duplicates do not inflate the estimate because they repeat the same hash behavior.',
  },
  {
    item: 'D',
    hash: '11110000',
    register: 7,
    suffix: '10000',
    rank: 4,
    registers: [1, 2, 5, 5, 2, 3, 4, 4],
    estimate: 48,
    activeLines: [1, 2, 3],
    message:
      'D is another duplicate. The sketch stays compact: one register value is enough.',
  },
];

const codeLines = [
  'for item in stream:',
  '  h = hash(item)',
  '  j = first bits of h          // choose register',
  '  r = rank(remaining bits)     // rare zero pattern',
  '  M[j] = max(M[j], r)',
  'estimate distinct count from all registers M',
];

function getRegisterBars(registers) {
  const max = Math.max(...registers, 1);

  return registers.map((value, index) => ({
    index,
    value,
    height: 18 + (value / max) * 92,
  }));
}

export default function Slide7({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];
  const visibleStream = states.slice(0, currentStep + 1);
  const registerBars = getRegisterBars(currentState.registers);

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distinct counting</p>

        <h1 style={{ maxWidth: '100%', fontSize: '40px' }}>HyperLogLog estimates distinct items with tiny memory</h1>

        <p className="subtitle" style={{ maxWidth: '100%' }}>
          It splits the stream into registers and keeps only the strongest rare
          hash pattern seen in each register.
        </p>

        <div className="hll-layout">
          <section className="hll-code">
            <p className="hll-code-title">Algorithm</p>

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

          <section className="hll-visual">
            <div className="stream-zone">
              <div className="zone-row">
                <p className="zone-label">Stream</p>

                <div className="estimate-pill">
                  estimate ≈ {currentState.estimate}
                </div>
              </div>

              <div className="stream-items">
                {visibleStream.map((state, index) => (
                  <div
                    key={`${state.item}-${index}`}
                    className={`stream-token ${
                      index === currentStep ? 'is-current' : ''
                    }`}
                    style={{ '--item-color': itemColors[state.item] }}
                  >
                    {state.item}
                  </div>
                ))}
              </div>
            </div>

            <div className="hash-zone">
              <div className="zone-row">
                <p className="zone-label">Hash split</p>
                <span className="hash-note">register index + rank suffix</span>
              </div>

              <div key={`hash-${currentStep}`} className="hash-split">
                <div className="hash-part register-part">
                  <span>register</span>
                  <strong>{currentState.register}</strong>
                </div>

                <div className="hash-arrow">→</div>

                <div className="hash-part suffix-part">
                  <span>suffix</span>
                  <strong>{currentState.suffix}</strong>
                </div>

                <div className="hash-arrow">→</div>

                <div className="hash-part rank-part">
                  <span>rank</span>
                  <strong>{currentState.rank}</strong>
                </div>
              </div>

              <p key={`message-${currentStep}`} className="hll-message">
                {currentState.message}
              </p>
            </div>

            <div className="register-zone">
              <div className="zone-row">
                <p className="zone-label">Registers M</p>
                <span className="register-hint">one small value per register</span>
              </div>

              <div className="register-chart">
                {registerBars.map((bar) => (
                  <div
                    key={bar.index}
                    className={`register-column ${
                      bar.index === currentState.register ? 'is-active' : ''
                    }`}
                  >
                    <div
                      className={`register-bar ${bar.value > 0 ? 'is-filled' : ''}`}
                      style={{ height: `${bar.height}px` }}
                    >
                      <span>{bar.value}</span>
                    </div>
                    <strong>{bar.index}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="hll-summary-row">
              <div className="summary-card">
                <strong>Memory</strong>
                <span>{registerCount} registers</span>
              </div>

              <div className="summary-card">
                <strong>Update</strong>
                <span>constant time</span>
              </div>

              <div className="summary-card">
                <strong>Result</strong>
                <span>approximate</span>
              </div>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`} style={{ maxWidth: '100%' }}>
          Definition: HyperLogLog is a compact sketch for estimating the number
          of distinct items in a stream. It uses very little memory and constant
          update time, but the result is approximate.
        </p>
      </main>

      <style>{`
        .hll-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .hll-code,
        .hll-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .hll-code {
          padding: 22px;
        }

        .hll-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .hll-code pre {
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

        .hll-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto auto auto;
          gap: 20px;
        }

        .zone-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .estimate-pill {
          margin-bottom: 14px;
          padding: 7px 12px;
          border-radius: 999px;
          background: #3059ab;
          color: white;
          font-size: 14px;
          font-weight: 800;
          animation: pill-enter 280ms ease both;
        }

        .stream-items {
          display: flex;
          gap: 12px;
          min-height: 58px;
          align-items: center;
          flex-wrap: wrap;
        }

        .stream-token {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--item-color);
          color: white;
          font-size: 22px;
          font-weight: 800;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
          animation: token-enter 360ms ease both;
        }

        .stream-token.is-current {
          outline: 4px solid rgba(48, 89, 171, 0.18);
          transform: scale(1.08);
        }

        @keyframes token-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.82);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
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

        .hash-note,
        .register-hint {
          margin-bottom: 14px;
          color: rgba(17, 17, 17, 0.54);
          font-size: 14px;
          font-weight: 800;
        }

        .hash-split {
          display: grid;
          grid-template-columns: 1fr auto 1.4fr auto 1fr;
          gap: 12px;
          align-items: center;
          animation: hash-enter 320ms ease both;
        }

        .hash-part {
          min-height: 70px;
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.06);
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 5px;
          padding: 10px;
          box-sizing: border-box;
        }

        .hash-part span {
          color: rgba(17, 17, 17, 0.54);
          font-size: 13px;
          font-weight: 800;
        }

        .hash-part strong {
          color: #111;
          font-size: 23px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .register-part,
        .rank-part {
          background: rgba(48, 89, 171, 0.14);
        }

        .register-part strong,
        .rank-part strong {
          color: #3059ab;
        }

        .hash-arrow {
          color: rgba(17, 17, 17, 0.5);
          font-size: 26px;
          font-weight: 900;
        }

        @keyframes hash-enter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hll-message {
          margin: 14px 0 0;
          font-size: 19px;
          line-height: 1.34;
          animation: message-enter 320ms ease both;
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

        .register-chart {
          height: 142px;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 10px;
          align-items: end;
        }

        .register-column {
          display: grid;
          grid-template-rows: 1fr auto;
          gap: 7px;
          align-items: end;
          justify-items: center;
        }

        .register-column strong {
          color: rgba(17, 17, 17, 0.54);
          font-size: 13px;
        }

        .register-bar {
          width: 100%;
          min-height: 18px;
          border-radius: 12px 12px 8px 8px;
          background: rgba(17, 17, 17, 0.08);
          display: grid;
          place-items: center;
          transition:
            height 420ms ease,
            background 320ms ease,
            transform 320ms ease,
            box-shadow 320ms ease;
        }

        .register-bar.is-filled {
          background: rgba(48, 89, 171, 0.22);
        }

        .register-column.is-active .register-bar {
          background: #3059ab;
          color: white;
          transform: translateY(-6px);
          box-shadow: 0 12px 20px rgba(48, 89, 171, 0.22);
        }

        .register-bar span {
          font-size: 15px;
          font-weight: 900;
          color: inherit;
        }

        .hll-summary-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .summary-card {
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.055);
          padding: 14px;
          display: grid;
          gap: 4px;
          animation: summary-enter 320ms ease both;
        }

        .summary-card strong {
          color: #3059ab;
          font-size: 16px;
        }

        .summary-card span {
          color: #111;
          font-size: 17px;
          font-weight: 800;
        }

        @keyframes summary-enter {
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

Slide7.steps = states.length;