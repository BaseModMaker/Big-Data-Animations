const itemColors = {
  A: '#3059ab',
  B: '#e07a5f',
  C: '#3d9970',
  D: '#8e44ad',
  E: '#f2b134',
};

const states = [
  {
    item: 'A',
    action: 'add',
    counters: [{ item: 'A', count: 1 }],
    activeLines: [3, 4],
    message: 'A has no counter and there is free space, so A is added.',
  },
  {
    item: 'B',
    action: 'add',
    counters: [
      { item: 'A', count: 1 },
      { item: 'B', count: 1 },
    ],
    activeLines: [3, 4],
    message: 'B is new and the summary still has space, so B is added.',
  },
  {
    item: 'A',
    action: 'increment',
    counters: [
      { item: 'A', count: 2 },
      { item: 'B', count: 1 },
    ],
    activeLines: [2],
    message: 'A already has a counter, so its counter increases.',
  },
  {
    item: 'C',
    action: 'add',
    counters: [
      { item: 'A', count: 2 },
      { item: 'B', count: 1 },
      { item: 'C', count: 1 },
    ],
    activeLines: [3, 4],
    message: 'C is new and this is the last free counter slot.',
  },
  {
    item: 'D',
    action: 'decrement',
    counters: [{ item: 'A', count: 1 }],
    removed: ['B', 'C'],
    activeLines: [5, 6, 7],
    message: 'D is new, but the summary is full. All counters decrease; B and C reach zero and are removed.',
  },
  {
    item: 'A',
    action: 'increment',
    counters: [{ item: 'A', count: 2 }],
    activeLines: [2],
    message: 'A is still present, so its counter increases again.',
  },
  {
    item: 'B',
    action: 'add',
    counters: [
      { item: 'A', count: 2 },
      { item: 'B', count: 1 },
    ],
    activeLines: [3, 4],
    message: 'B returns later. Since there is free space, B gets a new counter.',
  },
  {
    item: 'E',
    action: 'add',
    counters: [
      { item: 'A', count: 2 },
      { item: 'B', count: 1 },
      { item: 'E', count: 1 },
    ],
    activeLines: [3, 4],
    message: 'E is new and fills the summary again.',
  },
  {
    item: 'A',
    action: 'increment',
    counters: [
      { item: 'A', count: 3 },
      { item: 'B', count: 1 },
      { item: 'E', count: 1 },
    ],
    activeLines: [2],
    message: 'A appears often, so it survives the reductions and remains in the summary.',
  },
];

const codeLines = [
  'for item in stream:',
  '  if item has a counter: counter[item] += 1',
  '  else if there is free space:',
  '    counter[item] = 1',
  '  else:',
  '    decrease every counter by 1',
  '    remove counters that are now 0',
];

export default function Slide3({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];
  const visibleStream = states.slice(0, currentStep + 1);

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Streaming algorithm</p>

        <h1>Karp’s algorithm keeps only the counters that matter</h1>

        <p className="subtitle">
          Each new stream item either increments an existing counter, creates a
          new counter, or triggers a global decrease.
        </p>

        <div className="karp-layout">
          <section className="karp-code">
            <p className="karp-code-title">Algorithm</p>

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

          <section className="karp-visual">
            <div className="stream-zone">
              <p className="zone-label">Stream</p>

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

            <div className="action-zone">
              <div className={`action-pill action-${currentState.action}`}>
                {currentState.action === 'increment' && 'increment existing counter'}
                {currentState.action === 'add' && 'add new counter'}
                {currentState.action === 'decrement' && 'summary full: decrease all'}
              </div>

              <p>{currentState.message}</p>
            </div>

            <div className="summary-zone">
              <p className="zone-label">Counter summary</p>

              <div className="counter-row">
                {currentState.counters.map((counter) => (
                  <div
                    key={counter.item}
                    className="counter-card"
                    style={{ '--item-color': itemColors[counter.item] }}
                  >
                    <span className="counter-item">{counter.item}</span>
                    <span className="counter-value">{counter.count}</span>
                  </div>
                ))}

                {Array.from({
                  length: Math.max(0, 3 - currentState.counters.length),
                }).map((_, index) => (
                  <div key={`empty-${index}`} className="counter-card empty">
                    empty
                  </div>
                ))}
              </div>

              {currentState.removed && (
                <div className="removed-row">
                  {currentState.removed.map((item) => (
                    <div
                      key={item}
                      className="removed-counter"
                      style={{ '--item-color': itemColors[item] }}
                    >
                      {item} removed
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Final idea: Karp’s algorithm gives no false negatives, but it can
          return false positives unless a second pass verifies the counts.
        </p>
      </main>

      <style>{`
        .karp-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .karp-code,
        .karp-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .karp-code {
          padding: 22px;
        }

        .karp-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .karp-code pre {
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

        .karp-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 22px;
        }

        .stream-items {
          display: flex;
          gap: 12px;
          min-height: 58px;
          align-items: center;
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

        .action-zone {
          min-height: 92px;
        }

        .action-zone p {
          margin: 12px 0 0;
          font-size: 20px;
          line-height: 1.36;
        }

        .action-pill {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          color: white;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.01em;
          animation: action-enter 280ms ease both;
        }

        .action-increment {
          background: #3059ab;
        }

        .action-add {
          background: #3d9970;
        }

        .action-decrement {
          background: #8e44ad;
        }

        @keyframes action-enter {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .counter-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .counter-card {
          min-height: 96px;
          border-radius: 18px;
          background: white;
          border: 2px solid var(--item-color);
          display: grid;
          place-items: center;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          animation: counter-enter 320ms ease both;
        }

        .counter-card.empty {
          border: 2px dashed rgba(17, 17, 17, 0.18);
          color: rgba(17, 17, 17, 0.34);
          font-size: 18px;
          box-shadow: none;
        }

        .counter-item {
          color: var(--item-color);
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
        }

        .counter-value {
          color: #111;
          font-size: 26px;
          font-weight: 900;
          line-height: 1;
        }

        @keyframes counter-enter {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.92);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .removed-row {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }

        .removed-counter {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.06);
          color: var(--item-color);
          font-size: 15px;
          font-weight: 800;
          text-decoration: line-through;
          animation: removed-enter 320ms ease both;
        }

        @keyframes removed-enter {
          from {
            opacity: 0;
            transform: translateY(-8px);
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

Slide3.steps = states.length;