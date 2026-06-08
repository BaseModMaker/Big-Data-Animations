const itemColors = {
  A: '#3059ab',
  B: '#e07a5f',
  C: '#3d9970',
  D: '#8e44ad',
  E: '#f2b134',
  F: '#00a6a6',
  G: '#c44569',
};

const states = [
  {
    item: 'A',
    hash: '10110000',
    trailingZeros: 4,
    maxR: 4,
    estimate: 16,
    activeLines: [2, 3, 4],
    message:
      'A hashes to a value ending in 4 zeros. This is rare, so the estimate jumps to 2⁴ = 16.',
  },
  {
    item: 'B',
    hash: '01101010',
    trailingZeros: 1,
    maxR: 4,
    estimate: 16,
    activeLines: [2, 3],
    message:
      'B has only 1 trailing zero. The maximum stays 4, so the estimate does not change.',
  },
  {
    item: 'C',
    hash: '11011100',
    trailingZeros: 2,
    maxR: 4,
    estimate: 16,
    activeLines: [2, 3],
    message:
      'C ends in 2 zeros. This is not larger than the current maximum, so the sketch stays the same.',
  },
  {
    item: 'A',
    hash: '10110000',
    trailingZeros: 4,
    maxR: 4,
    estimate: 16,
    activeLines: [1, 2, 3],
    message:
      'A appears again, but duplicates hash to the same pattern. The unique-count estimate does not increase.',
  },
  {
    item: 'D',
    hash: '00100000',
    trailingZeros: 5,
    maxR: 5,
    estimate: 32,
    activeLines: [2, 3, 4],
    message:
      'D produces 5 trailing zeros. The maximum increases, so the estimate becomes 2⁵ = 32.',
  },
  {
    item: 'E',
    hash: '11110110',
    trailingZeros: 1,
    maxR: 5,
    estimate: 32,
    activeLines: [2, 3],
    message:
      'E has a common hash pattern with only 1 trailing zero. The maximum remains 5.',
  },
  {
    item: 'F',
    hash: '01001000',
    trailingZeros: 3,
    maxR: 5,
    estimate: 32,
    activeLines: [2, 3],
    message:
      'F has 3 trailing zeros. It supports the idea that there are several unique items, but it does not beat the maximum.',
  },
  {
    item: 'G',
    hash: '10000000',
    trailingZeros: 7,
    maxR: 7,
    estimate: 128,
    activeLines: [2, 3, 4],
    message:
      'G creates a very rare pattern: 7 trailing zeros. The estimate rises sharply to 2⁷ = 128.',
  },
  {
    item: 'B',
    hash: '01101010',
    trailingZeros: 1,
    maxR: 7,
    estimate: 128,
    activeLines: [1, 2, 3],
    message:
      'B appears again. Since it is not a new distinct hash pattern, the estimate stays unchanged.',
  },
];

const codeLines = [
  'for item in stream:',
  '  h = hash(item)',
  '  r = number of trailing zeros in binary h',
  '  keep R = max(R, r)',
  'estimate distinct count as 2ᴿ',
];

function getTrailingPart(hash, trailingZeros) {
  if (trailingZeros === 0) return '';
  return hash.slice(hash.length - trailingZeros);
}

function getLeadingPart(hash, trailingZeros) {
  if (trailingZeros === 0) return hash;
  return hash.slice(0, hash.length - trailingZeros);
}

export default function Slide6({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];
  const visibleStream = states.slice(0, currentStep + 1);

  const leadingBits = getLeadingPart(
    currentState.hash,
    currentState.trailingZeros
  );

  const trailingBits = getTrailingPart(
    currentState.hash,
    currentState.trailingZeros
  );

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distinct counting</p>

        <h1>Flajolet-Martin estimates how many unique items are in a stream</h1>

        <p className="subtitle">
          It hashes each item and looks for rare binary patterns: long runs of
          trailing zeros.
        </p>

        <div className="fm-layout">
          <section className="fm-code">
            <p className="fm-code-title">Algorithm</p>

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

          <section className="fm-visual">
            <div className="stream-zone">
              <div className="zone-row">
                <p className="zone-label">Stream</p>

                <div className="estimate-pill">
                  estimate = 2<sup>{currentState.maxR}</sup> = {currentState.estimate}
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
                <p className="zone-label">Hash value</p>
                <span className="hash-note">binary representation</span>
              </div>

              <div key={`hash-${currentStep}`} className="binary-box">
                {leadingBits.split('').map((bit, index) => (
                  <span key={`lead-${index}`} className="bit">
                    {bit}
                  </span>
                ))}

                {trailingBits.split('').map((bit, index) => (
                  <span key={`trail-${index}`} className="bit trailing">
                    {bit}
                  </span>
                ))}
              </div>

              <div key={`tz-${currentStep}`} className="trailing-zero-box">
                <strong>{currentState.trailingZeros}</strong>
                <span>trailing zeros</span>
              </div>
            </div>

            <div className="register-zone">
              <p className="zone-label">Maximum trailing-zero count</p>

              <div className="register-row">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className={`register-cell ${
                      index < currentState.maxR ? 'is-filled' : ''
                    } ${index === currentState.maxR - 1 ? 'is-current' : ''}`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="fm-message-zone">
              <div key={`result-${currentStep}`} className="result-box">
                <strong>
                  R = {currentState.maxR}
                </strong>
                <span>
                  distinct estimate ≈ {currentState.estimate}
                </span>
              </div>

              <p key={`message-${currentStep}`}>
                {currentState.message}
              </p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Intuition: if a hash ends in many zeros, that pattern is rare. Seeing
          it suggests the stream likely contains many distinct elements.
        </p>
      </main>

      <style>{`
        .fm-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .fm-code,
        .fm-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .fm-code {
          padding: 22px;
        }

        .fm-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .fm-code pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 15px;
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

        .fm-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto auto 1fr;
          gap: 22px;
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

        .estimate-pill sup {
          font-size: 10px;
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

        .hash-note {
          margin-bottom: 14px;
          color: rgba(17, 17, 17, 0.54);
          font-size: 14px;
          font-weight: 800;
        }

        .binary-box {
          display: flex;
          gap: 8px;
          min-height: 62px;
          align-items: center;
          animation: hash-enter 320ms ease both;
        }

        .bit {
          width: 42px;
          height: 48px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(17, 17, 17, 0.07);
          color: #111;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 23px;
          font-weight: 900;
        }

        .bit.trailing {
          background: rgba(48, 89, 171, 0.18);
          color: #3059ab;
          outline: 3px solid rgba(48, 89, 171, 0.26);
          animation: trailing-pulse 520ms ease both;
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

        @keyframes trailing-pulse {
          0% {
            transform: scale(0.86);
          }

          70% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
          }
        }

        .trailing-zero-box {
          margin-top: 12px;
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(48, 89, 171, 0.1);
          animation: result-enter 320ms ease both;
        }

        .trailing-zero-box strong {
          color: #3059ab;
          font-size: 30px;
          line-height: 1;
        }

        .trailing-zero-box span {
          color: rgba(17, 17, 17, 0.7);
          font-size: 16px;
          font-weight: 800;
        }

        .register-row {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;
        }

        .register-cell {
          min-height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(17, 17, 17, 0.06);
          color: rgba(17, 17, 17, 0.46);
          font-size: 15px;
          font-weight: 900;
          transition:
            background 320ms ease,
            color 320ms ease,
            transform 320ms ease,
            box-shadow 320ms ease;
        }

        .register-cell.is-filled {
          background: rgba(48, 89, 171, 0.16);
          color: #3059ab;
        }

        .register-cell.is-current {
          transform: translateY(-6px);
          background: #3059ab;
          color: white;
          box-shadow: 0 12px 20px rgba(48, 89, 171, 0.22);
        }

        .fm-message-zone {
          display: grid;
          grid-template-columns: 0.42fr 1fr;
          gap: 18px;
          align-items: start;
        }

        .fm-message-zone p {
          margin: 0;
          font-size: 20px;
          line-height: 1.36;
        }

        .result-box {
          min-height: 86px;
          border-radius: 18px;
          padding: 16px;
          box-sizing: border-box;
          display: grid;
          align-content: center;
          gap: 6px;
          background: rgba(48, 89, 171, 0.14);
          animation: result-enter 320ms ease both;
        }

        .result-box strong {
          font-size: 20px;
          color: #3059ab;
        }

        .result-box span {
          font-size: 17px;
          font-weight: 800;
          color: #111;
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
      `}</style>
    </div>
  );
}

Slide6.steps = states.length;