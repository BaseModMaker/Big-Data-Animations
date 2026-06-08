const itemColors = {
  A: '#3059ab',
  B: '#e07a5f',
  C: '#3d9970',
  D: '#8e44ad',
  E: '#f2b134',
  F: '#d35400',
  G: '#16a085',
  H: '#c0392b',
  I: '#27ae60',
};

const epsilon = 0.25;
const bucketWidth = 4;

const states = [
  {
    item: 'A',
    bucket: 1,
    counters: [{ item: 'A', count: 1, delta: 0 }],
    activeLines: [2, 3],
    message: 'A is new, so it is inserted with count 1 and error Δ = bucket − 1 = 0.',
  },
  {
    item: 'B',
    bucket: 1,
    counters: [
      { item: 'A', count: 1, delta: 0 },
      { item: 'B', count: 1, delta: 0 },
    ],
    activeLines: [2, 3],
    message: 'B is new in the same bucket, so it also gets an approximate counter.',
  },
  {
    item: 'A',
    bucket: 1,
    counters: [
      { item: 'A', count: 2, delta: 0 },
      { item: 'B', count: 1, delta: 0 },
    ],
    activeLines: [1],
    message: 'A already exists, so its approximate count increases.',
  },
  {
    item: 'C',
    bucket: 1,
    boundary: true,
    counters: [
      { item: 'A', count: 2, delta: 0 },
      { item: 'B', count: 1, delta: 0 },
      { item: 'C', count: 1, delta: 0 },
    ],
    activeLines: [2, 3, 4],
    message: 'C is inserted. This reaches a bucket boundary, so the algorithm checks whether anything can be pruned.',
  },
  {
    item: 'A',
    bucket: 2,
    counters: [
      { item: 'A', count: 3, delta: 0 },
      { item: 'B', count: 1, delta: 0 },
      { item: 'C', count: 1, delta: 0 },
    ],
    activeLines: [1],
    message: 'A appears again and keeps growing. Strong items become more stable over time.',
  },
  {
    item: 'D',
    bucket: 2,
    counters: [
      { item: 'A', count: 3, delta: 0 },
      { item: 'B', count: 1, delta: 0 },
      { item: 'C', count: 1, delta: 0 },
      { item: 'D', count: 1, delta: 1 },
    ],
    activeLines: [2, 3],
    message: 'D is new in bucket 2. It is stored with Δ = 1, meaning its true count may be lower than the stored estimate.',
  },
  {
    item: 'A',
    bucket: 2,
    counters: [
      { item: 'A', count: 4, delta: 0 },
      { item: 'B', count: 1, delta: 0 },
      { item: 'C', count: 1, delta: 0 },
      { item: 'D', count: 1, delta: 1 },
    ],
    activeLines: [1],
    message: 'A is incremented again. Its lower bound stays high because its error is still zero.',
  },
  {
    item: 'E',
    bucket: 2,
    boundary: true,
    counters: [
      { item: 'A', count: 4, delta: 0 },
      { item: 'D', count: 1, delta: 1 },
      { item: 'E', count: 1, delta: 1 },
    ],
    removed: ['B', 'C'],
    activeLines: [2, 3, 4, 5],
    message: 'E is inserted, then pruning runs at the bucket boundary. B and C are removed because count + Δ is too small.',
  },
  {
    item: 'D',
    bucket: 3,
    counters: [
      { item: 'A', count: 4, delta: 0 },
      { item: 'D', count: 2, delta: 1 },
      { item: 'E', count: 1, delta: 1 },
    ],
    activeLines: [1],
    message: 'D already exists, so its count increases. It is still only a candidate because it carries error Δ = 1.',
  },
  {
    item: 'B',
    bucket: 3,
    counters: [
      { item: 'A', count: 4, delta: 0 },
      { item: 'D', count: 2, delta: 1 },
      { item: 'E', count: 1, delta: 1 },
      { item: 'B', count: 1, delta: 2 },
    ],
    activeLines: [2, 3],
    message: 'B reappears after being pruned. It gets a new counter, but now with larger error Δ = 2.',
  },
  {
    item: 'A',
    bucket: 3,
    counters: [
      { item: 'A', count: 5, delta: 0 },
      { item: 'D', count: 2, delta: 1 },
      { item: 'E', count: 1, delta: 1 },
      { item: 'B', count: 1, delta: 2 },
    ],
    activeLines: [1],
    message: 'A keeps increasing. It is now clearly frequent in the approximate summary.',
  },
  {
    item: 'F',
    bucket: 3,
    boundary: true,
    counters: [
      { item: 'A', count: 5, delta: 0 },
      { item: 'D', count: 2, delta: 1 },
      { item: 'B', count: 1, delta: 2 },
      { item: 'F', count: 1, delta: 2 },
    ],
    removed: ['E'],
    activeLines: [2, 3, 4, 5],
    message: 'F is inserted at a boundary. E is pruned, but D survives because count + Δ is still large enough.',
  },
  {
    item: 'D',
    bucket: 4,
    counters: [
      { item: 'A', count: 5, delta: 0 },
      { item: 'D', count: 3, delta: 1 },
      { item: 'B', count: 1, delta: 2 },
      { item: 'F', count: 1, delta: 2 },
    ],
    activeLines: [1],
    message: 'D increases again. It becomes a stronger candidate, but its true count still has uncertainty.',
  },
  {
    item: 'G',
    bucket: 4,
    counters: [
      { item: 'A', count: 5, delta: 0 },
      { item: 'D', count: 3, delta: 1 },
      { item: 'B', count: 1, delta: 2 },
      { item: 'F', count: 1, delta: 2 },
      { item: 'G', count: 1, delta: 3 },
    ],
    activeLines: [2, 3],
    message: 'G is new in a later bucket, so it starts with a larger error. Late items can be stored, but with less certainty.',
  },
  {
    item: 'A',
    bucket: 4,
    counters: [
      { item: 'A', count: 6, delta: 0 },
      { item: 'D', count: 3, delta: 1 },
      { item: 'B', count: 1, delta: 2 },
      { item: 'F', count: 1, delta: 2 },
      { item: 'G', count: 1, delta: 3 },
    ],
    activeLines: [1],
    message: 'A increases again. A has a high count and no error, so it is the safest frequent item.',
  },
  {
    item: 'H',
    bucket: 4,
    boundary: true,
    counters: [
      { item: 'A', count: 6, delta: 0 },
      { item: 'D', count: 3, delta: 1 },
      { item: 'G', count: 1, delta: 3 },
      { item: 'H', count: 1, delta: 3 },
    ],
    removed: ['B', 'F'],
    activeLines: [2, 3, 4, 5],
    message: 'H is inserted and pruning runs. B and F are removed, but G and H survive because their error keeps them close to the threshold.',
  },
  {
    item: 'D',
    bucket: 5,
    counters: [
      { item: 'A', count: 6, delta: 0 },
      { item: 'D', count: 4, delta: 1 },
      { item: 'G', count: 1, delta: 3 },
      { item: 'H', count: 1, delta: 3 },
    ],
    activeLines: [1],
    message: 'D increases once more. It is now a plausible frequent item, but the error bound still matters.',
  },
  {
    item: 'A',
    bucket: 5,
    counters: [
      { item: 'A', count: 7, delta: 0 },
      { item: 'D', count: 4, delta: 1 },
      { item: 'G', count: 1, delta: 3 },
      { item: 'H', count: 1, delta: 3 },
    ],
    activeLines: [1],
    message: 'A is incremented again. This shows why truly frequent items are not lost.',
  },
  {
    item: 'I',
    bucket: 5,
    counters: [
      { item: 'A', count: 7, delta: 0 },
      { item: 'D', count: 4, delta: 1 },
      { item: 'G', count: 1, delta: 3 },
      { item: 'H', count: 1, delta: 3 },
      { item: 'I', count: 1, delta: 4 },
    ],
    activeLines: [2, 3],
    message: 'I is new very late in the stream. Its error is large, so it is uncertain.',
  },
  {
    item: 'A',
    bucket: 5,
    boundary: true,
    counters: [
      { item: 'A', count: 8, delta: 0 },
      { item: 'D', count: 4, delta: 1 },
    ],
    removed: ['G', 'H', 'I'],
    activeLines: [1, 4, 5],
    message: 'At the final boundary, weak uncertain items are removed. A is truly frequent; D remains a candidate close to the threshold.',
  },
];

const codeLines = [
  'if item is already stored: count[item] += 1',
  'else:',
  '  store item with count = 1 and Δ = bucket − 1',
  'at each bucket boundary:',
  '  remove item if count[item] + Δ ≤ current bucket',
  'report items whose approximate count may exceed the threshold',
];

function getConfidence(counter) {
  const lower = counter.count - counter.delta;

  if (lower >= 3) return 'sure';
  if (counter.count >= 2) return 'candidate';
  return 'uncertain';
}

export default function Slide4({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];
  const visibleStream = states.slice(0, currentStep + 1);

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Streaming algorithm</p>

        <h1>Lossy Counting stores approximate counts with an error bound</h1>

        <p className="subtitle">
          The algorithm keeps counts plus an error value, then prunes weak
          candidates at bucket boundaries.
        </p>

        <div className="lossy-layout">
          <section className="lossy-code">
            <div className="code-header">
              <p className="lossy-code-title">Algorithm</p>
              <span>ε = {epsilon} → bucket width = {bucketWidth}</span>
            </div>

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

          <section className="lossy-visual">
            <div className="stream-zone">
              <div className="zone-row">
                <p className="zone-label">Stream</p>

                <div className={`bucket-badge ${currentState.boundary ? 'is-boundary' : ''}`}>
                  bucket {currentState.bucket}
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

            <div className="action-zone">
              <div className={`action-pill ${currentState.boundary ? 'action-prune' : 'action-update'}`}>
                {currentState.boundary ? 'bucket boundary: prune candidates' : 'update approximate summary'}
              </div>

              <p>{currentState.message}</p>
            </div>

            <div className="summary-zone">
              <div className="zone-row">
                <p className="zone-label">Approximate summary</p>
                <span className="summary-hint">stored as count ± error</span>
              </div>

              <div className="lossy-counter-row">
                {currentState.counters.map((counter) => {
                  const confidence = getConfidence(counter);

                  return (
                    <div
                      key={counter.item}
                      className={`lossy-counter-card ${confidence}`}
                      style={{ '--item-color': itemColors[counter.item] }}
                    >
                      <span className="counter-item">{counter.item}</span>
                      <span className="counter-main">{counter.count}</span>
                      <span className="counter-error">± {counter.delta}</span>
                      <span className="counter-status">
                        {confidence === 'sure' && 'truly frequent'}
                        {confidence === 'candidate' && 'candidate'}
                        {confidence === 'uncertain' && 'uncertain'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {currentState.removed && (
                <div className="removed-row">
                  {currentState.removed.map((item) => (
                    <div
                      key={item}
                      className="removed-counter"
                      style={{ '--item-color': itemColors[item] }}
                    >
                      {item} pruned
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Lossy Counting reports all truly frequent items. It may also report
          items close to the threshold, because their true count may still be high
          within the allowed error.
        </p>
      </main>

      <style>{`
        .lossy-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .lossy-code,
        .lossy-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .lossy-code {
          padding: 22px;
        }

        .code-header,
        .zone-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .code-header span,
        .summary-hint {
          font-size: 14px;
          color: rgba(17, 17, 17, 0.54);
          font-weight: 700;
        }

        .lossy-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .lossy-code pre {
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

        .lossy-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 22px;
        }

        .bucket-badge {
          margin-bottom: 14px;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.07);
          color: rgba(17, 17, 17, 0.64);
          font-size: 14px;
          font-weight: 800;
          transition:
            background 260ms ease,
            color 260ms ease,
            transform 260ms ease;
        }

        .bucket-badge.is-boundary {
          background: #8e44ad;
          color: white;
          transform: scale(1.05);
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

        .action-update {
          background: #3059ab;
        }

        .action-prune {
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

        .lossy-counter-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .lossy-counter-card {
          min-height: 118px;
          border-radius: 18px;
          background: white;
          border: 2px solid var(--item-color);
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 4px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          animation: counter-enter 320ms ease both;
        }

        .lossy-counter-card.sure {
          background: rgba(48, 89, 171, 0.09);
        }

        .lossy-counter-card.candidate {
          background: rgba(242, 177, 52, 0.16);
        }

        .lossy-counter-card.uncertain {
          background: rgba(255, 255, 255, 0.8);
        }

        .counter-item {
          color: var(--item-color);
          font-size: 26px;
          font-weight: 900;
          line-height: 1;
        }

        .counter-main {
          color: #111;
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
        }

        .counter-error {
          color: rgba(17, 17, 17, 0.52);
          font-size: 16px;
          font-weight: 800;
        }

        .counter-status {
          margin-top: 4px;
          color: rgba(17, 17, 17, 0.62);
          font-size: 13px;
          font-weight: 800;
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

Slide4.steps = states.length;