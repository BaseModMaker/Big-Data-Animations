const itemColors = {
  A: '#3059ab',
  B: '#3d9970',
  C: '#e07a5f',
  D: '#8e44ad',
  Q: '#f2b134',
  X: '#c44569',
};

const states = [
  {
    item: 'A',
    type: 'insert',
    vector: [1, 1, 0, 1, 0, 0],
    signature: '110',
    bucket: 'B1',
    buckets: {
      B1: ['A'],
      B2: [],
      B3: [],
    },
    activeLines: [2, 3, 4],
    message:
      'A is inserted. Its locality-sensitive hash signature sends it to bucket B1.',
  },
  {
    item: 'B',
    type: 'insert',
    vector: [1, 1, 0, 1, 1, 0],
    signature: '110',
    bucket: 'B1',
    buckets: {
      B1: ['A', 'B'],
      B2: [],
      B3: [],
    },
    activeLines: [2, 3, 4],
    message:
      'B is similar to A, so it receives the same signature and lands in the same bucket.',
  },
  {
    item: 'C',
    type: 'insert',
    vector: [0, 0, 1, 0, 1, 1],
    signature: '001',
    bucket: 'B2',
    buckets: {
      B1: ['A', 'B'],
      B2: ['C'],
      B3: [],
    },
    activeLines: [2, 3, 4],
    message:
      'C is different from A and B, so it hashes to another bucket.',
  },
  {
    item: 'D',
    type: 'insert',
    vector: [0, 1, 1, 0, 1, 1],
    signature: '011',
    bucket: 'B3',
    buckets: {
      B1: ['A', 'B'],
      B2: ['C'],
      B3: ['D'],
    },
    activeLines: [2, 3, 4],
    message:
      'D shares some features with C, but not enough to get the same signature in this simplified example.',
  },
  {
    item: 'Q',
    type: 'query',
    vector: [1, 1, 0, 1, 0, 1],
    signature: '110',
    bucket: 'B1',
    buckets: {
      B1: ['A', 'B'],
      B2: ['C'],
      B3: ['D'],
    },
    candidates: ['A', 'B'],
    activeLines: [5, 6],
    message:
      'The query object Q hashes to B1, so the search only compares Q with A and B instead of every object.',
  },
  {
    item: 'Q',
    type: 'compare',
    vector: [1, 1, 0, 1, 0, 1],
    signature: '110',
    bucket: 'B1',
    buckets: {
      B1: ['A', 'B'],
      B2: ['C'],
      B3: ['D'],
    },
    candidates: ['A', 'B'],
    scores: [
      { item: 'A', score: 'high' },
      { item: 'B', score: 'high' },
    ],
    activeLines: [7],
    message:
      'Only the candidates in the same bucket are checked more carefully. Both A and B are likely similar to Q.',
  },
  {
    item: 'X',
    type: 'query',
    vector: [0, 0, 1, 0, 1, 0],
    signature: '001',
    bucket: 'B2',
    buckets: {
      B1: ['A', 'B'],
      B2: ['C'],
      B3: ['D'],
    },
    candidates: ['C'],
    activeLines: [5, 6],
    message:
      'A different query X hashes to B2, so the candidate set is only C.',
  },
  {
    item: 'X',
    type: 'compare',
    vector: [0, 0, 1, 0, 1, 0],
    signature: '001',
    bucket: 'B2',
    buckets: {
      B1: ['A', 'B'],
      B2: ['C'],
      B3: ['D'],
    },
    candidates: ['C'],
    scores: [{ item: 'C', score: 'high' }],
    activeLines: [7],
    message:
      'LSH is probabilistic: bucket matches are candidates, not proof. A final comparison confirms the best matches.',
  },
];

const codeLines = [
  'for object x:',
  '  compute locality-sensitive signature s(x)',
  '  place x into bucket s(x)',
  'for query q:',
  '  compute signature s(q)',
  '  retrieve only objects in bucket s(q)',
  '  compare candidates with q more carefully',
];

function getFeatureClass(value, isActive) {
  if (!value) return 'feature-off';
  return isActive ? 'feature-on is-active' : 'feature-on';
}

export default function Slide8({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];
  const visibleObjects = states
    .slice(0, currentStep + 1)
    .filter((state) => state.type === 'insert');

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Similarity search</p>

        <h1>Locality-Sensitive Hashing groups similar objects into buckets</h1>

        <p className="subtitle">
          Similar objects should collide with high probability, so search can
          focus on a small candidate bucket.
        </p>

        <div className="lsh-layout">
          <section className="lsh-code">
            <p className="lsh-code-title">Algorithm</p>

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

          <section className="lsh-visual">
            <div className="object-zone">
              <div className="zone-row">
                <p className="zone-label">
                  {currentState.type === 'insert' ? 'Insert object' : 'Query object'}
                </p>

                <div className={`mode-pill mode-${currentState.type}`}>
                  {currentState.type === 'insert' && 'index'}
                  {currentState.type === 'query' && 'retrieve candidates'}
                  {currentState.type === 'compare' && 'verify similarity'}
                </div>
              </div>

              <div className="current-object-row">
                <div
                  key={`token-${currentStep}`}
                  className={`object-token ${
                    currentState.type !== 'insert' ? 'query-token' : ''
                  }`}
                  style={{ '--item-color': itemColors[currentState.item] }}
                >
                  {currentState.item}
                </div>

                <div key={`features-${currentStep}`} className="feature-vector">
                  {currentState.vector.map((value, index) => (
                    <span
                      key={index}
                      className={getFeatureClass(value, index < 3)}
                    >
                      {value}
                    </span>
                  ))}
                </div>

                <div key={`signature-${currentStep}`} className="signature-box">
                  <span>signature</span>
                  <strong>{currentState.signature}</strong>
                </div>

                <div className="hash-arrow">→</div>

                <div key={`bucket-${currentStep}`} className="target-bucket">
                  <span>bucket</span>
                  <strong>{currentState.bucket}</strong>
                </div>
              </div>
            </div>

            <div className="bucket-zone">
              <p className="zone-label">Index buckets</p>

              <div className="bucket-grid">
                {Object.entries(currentState.buckets).map(([bucketName, items]) => {
                  const isTarget = bucketName === currentState.bucket;

                  return (
                    <div
                      key={bucketName}
                      className={`bucket-card ${isTarget ? 'is-target' : ''}`}
                    >
                      <strong>{bucketName}</strong>

                      <div className="bucket-items">
                        {items.map((item) => {
                          const isCandidate =
                            currentState.candidates?.includes(item) || false;

                          return (
                            <span
                              key={item}
                              className={`bucket-token ${
                                isCandidate ? 'is-candidate' : ''
                              }`}
                              style={{ '--item-color': itemColors[item] }}
                            >
                              {item}
                            </span>
                          );
                        })}

                        {items.length === 0 && (
                          <span className="empty-bucket">empty</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="candidate-zone">
              <div key={`message-${currentStep}`} className="lsh-message">
                <strong>
                  {currentState.type === 'insert' && 'Bucket assignment'}
                  {currentState.type === 'query' && 'Candidate retrieval'}
                  {currentState.type === 'compare' && 'Candidate verification'}
                </strong>

                <p>{currentState.message}</p>
              </div>

              {currentState.scores && (
                <div className="score-row">
                  {currentState.scores.map((score) => (
                    <div
                      key={score.item}
                      className="score-card"
                      style={{ '--item-color': itemColors[score.item] }}
                    >
                      <strong>{score.item}</strong>
                      <span>{score.score} similarity</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Definition: Locality-Sensitive Hashing is an indexing technique for
          similarity search. Similar objects should hash to the same bucket with
          high probability.
        </p>
      </main>

      <style>{`
        .lsh-layout {
          display: grid;
          grid-template-columns: 0.92fr 1.3fr;
          gap: 28px;
          margin-top: 28px;
          align-items: stretch;
        }

        .lsh-code,
        .lsh-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 20px;
          box-sizing: border-box;
        }

        .lsh-code {
          padding: 22px;
        }

        .lsh-code-title,
        .zone-label {
          margin: 0 0 14px;
          color: #3059ab;
          font-size: 18px;
          font-weight: 700;
        }

        .lsh-code pre {
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

        .lsh-visual {
          padding: 24px;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 22px;
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

        .mode-query {
          background: #3059ab;
        }

        .mode-compare {
          background: #8e44ad;
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

        .current-object-row {
          display: grid;
          grid-template-columns: auto 1fr auto auto auto;
          gap: 14px;
          align-items: center;
        }

        .object-token {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--item-color);
          color: white;
          font-size: 24px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
          animation: object-enter 360ms ease both;
        }

        .query-token {
          border: 4px solid rgba(255, 255, 255, 0.9);
          outline: 4px solid rgba(48, 89, 171, 0.18);
        }

        @keyframes object-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.82);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .feature-vector {
          display: flex;
          gap: 6px;
          align-items: center;
          animation: vector-enter 320ms ease both;
        }

        .feature-vector span {
          width: 32px;
          height: 38px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 17px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .feature-off {
          background: rgba(17, 17, 17, 0.06);
          color: rgba(17, 17, 17, 0.38);
        }

        .feature-on {
          background: rgba(48, 89, 171, 0.13);
          color: #3059ab;
        }

        .feature-on.is-active {
          background: #3059ab;
          color: white;
        }

        @keyframes vector-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .signature-box,
        .target-bucket {
          min-width: 82px;
          min-height: 58px;
          border-radius: 16px;
          background: rgba(17, 17, 17, 0.06);
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 4px;
          padding: 8px 10px;
          box-sizing: border-box;
          animation: box-enter 320ms ease both;
        }

        .signature-box span,
        .target-bucket span {
          color: rgba(17, 17, 17, 0.54);
          font-size: 12px;
          font-weight: 800;
        }

        .signature-box strong,
        .target-bucket strong {
          color: #3059ab;
          font-size: 20px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .hash-arrow {
          color: rgba(17, 17, 17, 0.5);
          font-size: 24px;
          font-weight: 900;
        }

        @keyframes box-enter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.92);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .bucket-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .bucket-card {
          min-height: 112px;
          border-radius: 18px;
          background: rgba(17, 17, 17, 0.055);
          border: 2px solid rgba(17, 17, 17, 0.08);
          padding: 14px;
          box-sizing: border-box;
          transition:
            border-color 300ms ease,
            background 300ms ease,
            transform 300ms ease,
            box-shadow 300ms ease;
        }

        .bucket-card.is-target {
          background: rgba(48, 89, 171, 0.09);
          border-color: #3059ab;
          transform: translateY(-4px);
          box-shadow: 0 12px 22px rgba(48, 89, 171, 0.16);
        }

        .bucket-card > strong {
          display: block;
          margin-bottom: 12px;
          color: #3059ab;
          font-size: 18px;
        }

        .bucket-items {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .bucket-token {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--item-color);
          color: white;
          font-size: 17px;
          font-weight: 900;
          animation: token-enter 320ms ease both;
        }

        .bucket-token.is-candidate {
          outline: 4px solid rgba(48, 89, 171, 0.18);
          transform: scale(1.08);
        }

        .empty-bucket {
          color: rgba(17, 17, 17, 0.38);
          font-size: 15px;
          font-weight: 800;
        }

        @keyframes token-enter {
          from {
            opacity: 0;
            transform: scale(0.82);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .candidate-zone {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .lsh-message {
          border-radius: 18px;
          background: rgba(48, 89, 171, 0.1);
          padding: 16px;
          animation: message-enter 320ms ease both;
        }

        .lsh-message strong {
          display: block;
          margin-bottom: 6px;
          color: #3059ab;
          font-size: 17px;
        }

        .lsh-message p {
          margin: 0;
          font-size: 19px;
          line-height: 1.34;
        }

        .score-row {
          display: flex;
          gap: 12px;
        }

        .score-card {
          min-width: 120px;
          border-radius: 16px;
          background: white;
          border: 2px solid var(--item-color);
          padding: 12px;
          display: grid;
          gap: 4px;
          animation: score-enter 320ms ease both;
        }

        .score-card strong {
          color: var(--item-color);
          font-size: 20px;
        }

        .score-card span {
          color: #111;
          font-size: 15px;
          font-weight: 800;
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

        @keyframes score-enter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.94);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

Slide8.steps = states.length;