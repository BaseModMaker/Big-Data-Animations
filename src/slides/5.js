const itemColors = {
  A: '#3059ab',
  B: '#e07a5f',
  C: '#3d9970',
  D: '#8e44ad',
  E: '#f2b134',
  X: '#c44569',
};

const bitCount = 12;

const states = [
  {
    mode: 'insert',
    item: 'A',
    hashes: [2, 5, 9],
    bits: [2, 5, 9],
    activeLines: [2, 3],
    message: 'Insert A: the hash functions point to positions 2, 5, and 9. These bits are set to 1.',
  },
  {
    mode: 'insert',
    item: 'B',
    hashes: [1, 5, 8],
    bits: [1, 2, 5, 8, 9],
    activeLines: [2, 3],
    message: 'Insert B: position 5 was already 1, but the other hash positions are also set.',
  },
  {
    mode: 'query-present',
    item: 'A',
    hashes: [2, 5, 9],
    bits: [1, 2, 5, 8, 9],
    activeLines: [4, 5],
    result: 'possibly in set',
    resultType: 'positive',
    message: 'Query A: all three hash positions are 1, so A is reported as possibly present.',
  },
  {
    mode: 'query-absent',
    item: 'C',
    hashes: [0, 4, 10],
    bits: [1, 2, 5, 8, 9],
    activeLines: [4, 6],
    result: 'definitely not in set',
    resultType: 'negative',
    message: 'Query C: at least one required bit is 0, so C is definitely not in the set.',
  },
  {
    mode: 'insert',
    item: 'D',
    hashes: [0, 5, 10],
    bits: [0, 1, 2, 5, 8, 9, 10],
    activeLines: [2, 3],
    message: 'Insert D: more bits become 1. As the filter fills, false positives become more likely.',
  },
  {
    mode: 'insert',
    item: 'E',
    hashes: [3, 7, 9],
    bits: [0, 1, 2, 3, 5, 7, 8, 9, 10],
    activeLines: [2, 3],
    message: 'Insert E: several positions are now occupied. The bit array is compact, but it loses exact identity.',
  },
  {
    mode: 'query-present',
    item: 'X',
    hashes: [1, 7, 10],
    bits: [0, 1, 2, 3, 5, 7, 8, 9, 10],
    activeLines: [4, 5],
    result: 'possibly in set',
    resultType: 'false-positive',
    message: 'Query X: all its hash positions are 1, even though X was never inserted. This is a false positive.',
  },
  {
    mode: 'query-absent',
    item: 'C',
    hashes: [0, 4, 10],
    bits: [0, 1, 2, 3, 5, 7, 8, 9, 10],
    activeLines: [4, 6],
    result: 'definitely not in set',
    resultType: 'negative',
    message: 'Query C again: bit 4 is still 0, so the answer is definitely not present. Bloom filters have no false negatives.',
  },
];

const codeLines = [
  'To insert item x:',
  '  compute h1(x), h2(x), ..., hk(x)',
  '  set each selected bit to 1',
  'To query item x:',
  '  if all selected bits are 1: return possibly present',
  '  else: return definitely absent',
];

function isHashActive(state, bitIndex) {
  return state.hashes.includes(bitIndex);
}

function isBitSet(state, bitIndex) {
  return state.bits.includes(bitIndex);
}

export default function Slide5({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Probabilistic data structure</p>

        <h1>A Bloom filter answers membership queries with a compact bit array</h1>

        <p className="subtitle">
          It never misses an inserted item, but it can say “possibly present” for
          an item that was never inserted.
        </p>

        <div className="bloom-layout">
          <section className="bloom-code">
            <p className="bloom-code-title">Algorithm</p>

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

          <section className="bloom-visual">
            <div className="bloom-top-row">
              <div className="incoming-item">
                <p className="zone-label">
                  {currentState.mode === 'insert' ? 'Insert item' : 'Query item'}
                </p>

                <div
                  key={`item-${currentStep}`}
                  className={`bloom-token ${
                    currentState.mode === 'insert' ? 'insert-mode' : 'query-mode'
                  }`}
                  style={{ '--item-color': itemColors[currentState.item] }}
                >
                  {currentState.item}
                </div>
              </div>

              <div className="hash-zone">
                <p className="zone-label">Hash functions</p>

                <div className="hash-row">
                  {currentState.hashes.map((hash, index) => (
                    <div
                      key={`${currentState.item}-${hash}-${index}`}
                      className={`hash-pill hash-pill-${index + 1}`}
                    >
                      h{index + 1} → {hash}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bit-array-zone">
              <div className="zone-row">
                <p className="zone-label">Bit array</p>

                <div className={`mode-pill mode-${currentState.mode}`}>
                  {currentState.mode === 'insert' && 'set selected bits to 1'}
                  {currentState.mode !== 'insert' && 'check selected bits'}
                </div>
              </div>

              <div className="bit-array">
                {Array.from({ length: bitCount }).map((_, bitIndex) => {
                  const active = isHashActive(currentState, bitIndex);
                  const set = isBitSet(currentState, bitIndex);

                  return (
                    <div
                      key={bitIndex}
                      className={`bit-cell ${set ? 'is-set' : ''} ${
                        active ? 'is-active' : ''
                      }`}
                    >
                      <span className="bit-index">{bitIndex}</span>
                      <span className="bit-value">{set ? 1 : 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bloom-message-zone">
              <div
                key={`message-${currentStep}`}
                className={`result-box ${
                  currentState.resultType ? currentState.resultType : 'insert'
                }`}
              >
                <strong>
                  {currentState.mode === 'insert' && 'Update'}
                  {currentState.resultType === 'positive' && 'Membership test'}
                  {currentState.resultType === 'false-positive' && 'False positive'}
                  {currentState.resultType === 'negative' && 'No false negative'}
                </strong>

                <span>
                  {currentState.result || 'bits updated'}
                </span>
              </div>

              <p key={`text-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Definition: a Bloom filter is compact and probabilistic. It has no
          false negatives, but it can have false positives.
        </p>
      </main>

      <style>{`
        .bloom-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .bloom-code,
        .bloom-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .bloom-code {
          padding: 22px;
        }

        .bloom-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .bloom-code pre {
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

        .bloom-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 24px;
        }

        .bloom-top-row {
          display: grid;
          grid-template-columns: 0.6fr 1.4fr;
          gap: 24px;
          align-items: start;
        }

        .bloom-token {
          width: 58px;
          height: 58px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--item-color);
          color: white;
          font-size: 26px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
          animation: bloom-token-enter 360ms ease both;
        }

        .bloom-token.query-mode {
          border: 4px solid rgba(255, 255, 255, 0.9);
          outline: 4px solid rgba(48, 89, 171, 0.18);
        }

        @keyframes bloom-token-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.82);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hash-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hash-pill {
          min-width: 82px;
          min-height: 38px;
          padding: 0 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(17, 17, 17, 0.08);
          color: #111;
          font-size: 17px;
          font-weight: 800;
          opacity: 0;
          transform: translateY(10px);
          animation: hash-enter 300ms ease both;
        }

        .hash-pill-1 {
          animation-delay: 140ms;
        }

        .hash-pill-2 {
          animation-delay: 280ms;
        }

        .hash-pill-3 {
          animation-delay: 420ms;
        }

        @keyframes hash-enter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .zone-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .mode-pill {
          margin-bottom: 14px;
          padding: 7px 12px;
          border-radius: 999px;
          color: white;
          font-size: 14px;
          font-weight: 800;
          animation: mode-enter 280ms ease both;
        }

        .mode-insert {
          background: #3d9970;
        }

        .mode-query-present,
        .mode-query-absent {
          background: #3059ab;
        }

        @keyframes mode-enter {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .bit-array {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 8px;
        }

        .bit-cell {
          min-height: 72px;
          border-radius: 14px;
          background: rgba(17, 17, 17, 0.06);
          border: 2px solid rgba(17, 17, 17, 0.08);
          display: grid;
          grid-template-rows: auto 1fr;
          align-items: center;
          justify-items: center;
          padding: 7px 4px;
          box-sizing: border-box;
          transition:
            background 320ms ease,
            border-color 320ms ease,
            transform 320ms ease,
            box-shadow 320ms ease;
        }

        .bit-cell.is-set {
          background: rgba(48, 89, 171, 0.12);
          border-color: rgba(48, 89, 171, 0.32);
        }

        .bit-cell.is-active {
          transform: translateY(-8px);
          border-color: #3059ab;
          box-shadow: 0 12px 22px rgba(48, 89, 171, 0.18);
        }

        .bit-cell.is-active.is-set {
          background: rgba(48, 89, 171, 0.2);
        }

        .bit-index {
          color: rgba(17, 17, 17, 0.45);
          font-size: 12px;
          font-weight: 800;
        }

        .bit-value {
          color: #111;
          font-size: 25px;
          font-weight: 900;
        }

        .bloom-message-zone {
          display: grid;
          grid-template-columns: 0.46fr 1fr;
          gap: 18px;
          align-items: start;
        }

        .bloom-message-zone p {
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
          animation: result-enter 320ms ease both;
        }

        .result-box strong {
          font-size: 17px;
        }

        .result-box span {
          font-size: 18px;
          font-weight: 800;
        }

        .result-box.insert {
          background: rgba(61, 153, 112, 0.16);
          color: #111;
        }

        .result-box.positive {
          background: rgba(48, 89, 171, 0.14);
          color: #111;
        }

        .result-box.false-positive {
          background: rgba(224, 122, 95, 0.2);
          color: #111;
        }

        .result-box.negative {
          background: rgba(61, 153, 112, 0.18);
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

Slide5.steps = states.length;