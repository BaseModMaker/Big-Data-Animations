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
    phase: 'hashing',
    event: 'Ordinary hashing maps objects to buckets',
    activeLines: [1],
    current: 'A',
    objects: ['A'],
    vectors: {
      A: [1, 1, 0, 1],
    },
    hyperplanes: [],
    codes: {
      A: '—',
    },
    buckets: {
      '101': ['A'],
      '110': [],
      '001': [],
    },
    highlightedBuckets: ['101'],
    comparisons: 'all pairs still possible',
    message:
      'Hashing maps an object to a bucket. Normal hashing is useful for lookup, but it does not necessarily preserve similarity.',
  },
  {
    phase: 'similarity',
    event: 'Similar objects should land together',
    activeLines: [2],
    current: 'B',
    objects: ['A', 'B'],
    vectors: {
      A: [1, 1, 0, 1],
      B: [1, 1, 0, 0],
    },
    hyperplanes: [],
    codes: {
      A: '101',
      B: '101',
    },
    buckets: {
      '101': ['A', 'B'],
      '110': [],
      '001': [],
    },
    highlightedBuckets: ['101'],
    comparisons: 'compare inside bucket 101',
    message:
      'Locality-sensitive hashing is different: similar objects should collide with high probability.',
  },
  {
    phase: 'dissimilar',
    event: 'Dissimilar objects should usually separate',
    activeLines: [2],
    current: 'C',
    objects: ['A', 'B', 'C'],
    vectors: {
      A: [1, 1, 0, 1],
      B: [1, 1, 0, 0],
      C: [0, 0, 1, 1],
    },
    hyperplanes: [],
    codes: {
      A: '101',
      B: '101',
      C: '001',
    },
    buckets: {
      '101': ['A', 'B'],
      '110': [],
      '001': ['C'],
    },
    highlightedBuckets: ['001'],
    comparisons: 'skip A/B when searching for C',
    message:
      'C is less similar to A and B, so it is placed in a different bucket. This avoids unnecessary comparisons.',
  },
  {
    phase: 'hyperplane',
    event: 'Random hyperplanes create binary codes',
    activeLines: [3],
    current: 'Q',
    objects: ['A', 'B', 'C', 'Q'],
    vectors: {
      A: [1, 1, 0, 1],
      B: [1, 1, 0, 0],
      C: [0, 0, 1, 1],
      Q: [1, 1, 0, 1],
    },
    hyperplanes: ['h1', 'h2', 'h3'],
    codes: {
      A: '101',
      B: '101',
      C: '001',
      Q: '101',
    },
    buckets: {
      '101': ['A', 'B', 'Q'],
      '110': [],
      '001': ['C'],
    },
    highlightedBuckets: ['101'],
    comparisons: 'query Q checks bucket 101',
    message:
      'For cosine similarity, random hyperplanes turn high-dimensional vectors into compact binary codes.',
  },
  {
    phase: 'code',
    event: 'Each hyperplane contributes one bit',
    activeLines: [4],
    current: 'Q',
    objects: ['A', 'B', 'C', 'Q'],
    vectors: {
      A: [1, 1, 0, 1],
      B: [1, 1, 0, 0],
      C: [0, 0, 1, 1],
      Q: [1, 1, 0, 1],
    },
    hyperplanes: ['h1', 'h2', 'h3'],
    activeBits: [0, 1, 2],
    codes: {
      A: '101',
      B: '101',
      C: '001',
      Q: '101',
    },
    buckets: {
      '101': ['A', 'B', 'Q'],
      '110': [],
      '001': ['C'],
    },
    highlightedBuckets: ['101'],
    comparisons: 'binary code(Q) = 101',
    message:
      'A vector gets one bit per hyperplane. On one side of the hyperplane the bit is 1; on the other side it is 0.',
  },
  {
    phase: 'query',
    event: 'Approximate nearest-neighbor search',
    activeLines: [5, 6],
    current: 'Q',
    objects: ['A', 'B', 'C', 'D', 'Q'],
    vectors: {
      A: [1, 1, 0, 1],
      B: [1, 1, 0, 0],
      C: [0, 0, 1, 1],
      D: [0, 1, 1, 0],
      Q: [1, 1, 0, 1],
    },
    hyperplanes: ['h1', 'h2', 'h3'],
    activeBits: [0, 1, 2],
    codes: {
      A: '101',
      B: '101',
      C: '001',
      D: '110',
      Q: '101',
    },
    buckets: {
      '101': ['A', 'B', 'Q'],
      '110': ['D'],
      '001': ['C'],
    },
    highlightedBuckets: ['101'],
    candidates: ['A', 'B'],
    comparisons: 'compare Q only with A and B',
    message:
      'For a huge dataset, the query only compares against objects in the same or similar buckets instead of comparing all pairs.',
  },
  {
    phase: 'candidate',
    event: 'Candidate matches are checked more carefully',
    activeLines: [7],
    current: 'Q',
    objects: ['A', 'B', 'C', 'D', 'Q'],
    vectors: {
      A: [1, 1, 0, 1],
      B: [1, 1, 0, 0],
      C: [0, 0, 1, 1],
      D: [0, 1, 1, 0],
      Q: [1, 1, 0, 1],
    },
    hyperplanes: ['h1', 'h2', 'h3'],
    activeBits: [0, 1, 2],
    codes: {
      A: '101',
      B: '101',
      C: '001',
      D: '110',
      Q: '101',
    },
    buckets: {
      '101': ['A', 'B', 'Q'],
      '110': ['D'],
      '001': ['C'],
    },
    highlightedBuckets: ['101'],
    candidates: ['A', 'B'],
    scores: [
      { item: 'A', score: 'very close' },
      { item: 'B', score: 'close' },
    ],
    comparisons: 'final check inside candidate set',
    message:
      'LSH gives candidates, not guaranteed exact answers. A final similarity check ranks the candidates.',
  },
  {
    phase: 'definition',
    event: 'Definition',
    activeLines: [8],
    current: 'Q',
    objects: ['A', 'B', 'C', 'D', 'Q'],
    vectors: {
      A: [1, 1, 0, 1],
      B: [1, 1, 0, 0],
      C: [0, 0, 1, 1],
      D: [0, 1, 1, 0],
      Q: [1, 1, 0, 1],
    },
    hyperplanes: ['h1', 'h2', 'h3'],
    activeBits: [0, 1, 2],
    codes: {
      A: '101',
      B: '101',
      C: '001',
      D: '110',
      Q: '101',
    },
    buckets: {
      '101': ['A', 'B', 'Q'],
      '110': ['D'],
      '001': ['C'],
    },
    highlightedBuckets: ['101'],
    candidates: ['A', 'B'],
    scores: [
      { item: 'A', score: 'very close' },
      { item: 'B', score: 'close' },
    ],
    comparisons: 'approximate nearest-neighbor search',
    message:
      'Definition: locality-sensitive hashing is a hashing method where similar objects are likely to receive the same or similar hash codes.',
  },
];

const codeLines = [
  'hash object x into a bucket',
  'choose hash functions that preserve similarity',
  'for cosine similarity: sample random hyperplanes',
  'convert each vector into a binary hash code',
  'for query q: compute code(q)',
  'retrieve objects in same or nearby buckets',
  'compare only the candidate objects',
  'return approximate nearest neighbors',
];

function getFeatureClass(value, isHighlighted) {
  if (!value) return 'feature-off';
  return isHighlighted ? 'feature-on is-highlighted' : 'feature-on';
}

function getObjectOpacity(item, state) {
  if (state.current === item) return 1;
  if (state.candidates?.includes(item)) return 1;
  if (state.highlightedBuckets?.some((bucket) => state.buckets[bucket]?.includes(item))) return 0.9;
  return 0.42;
}

export default function Slide17({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const currentState = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Approximate similarity search</p>

        <h1>Locality-sensitive hashing avoids comparing every pair</h1>

        <p className="subtitle">
          Similar objects should receive the same or similar hash codes, so the
          search can focus on likely candidates.
        </p>

        <div className="lsh2-layout">
          <section className="lsh2-code">
            <p className="lsh2-code-title">Algorithm</p>

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

          <section className="lsh2-visual">
            <div className="zone-row">
              <p className="zone-label">{currentState.event}</p>

              <div className={`phase-pill phase-${currentState.phase}`}>
                {currentState.phase}
              </div>
            </div>

            <div className="lsh2-main">
              <div className="vector-zone">
                <p className="mini-label">Objects as vectors</p>

                <div className="vector-list">
                  {currentState.objects.map((item) => (
                    <div
                      key={item}
                      className={`vector-row ${currentState.current === item ? 'is-current' : ''}`}
                      style={{
                        '--item-color': itemColors[item],
                        opacity: getObjectOpacity(item, currentState),
                      }}
                    >
                      <div className="object-token">
                        {item}
                      </div>

                      <div className="feature-vector">
                        {currentState.vectors[item].map((value, index) => (
                          <span
                            key={index}
                            className={getFeatureClass(
                              value,
                              currentState.activeBits?.includes(index)
                            )}
                          >
                            {value}
                          </span>
                        ))}
                      </div>

                      <div className="code-box">
                        {currentState.codes[item] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bucket-zone">
                <div className="zone-row compact">
                  <p className="mini-label">Hash buckets</p>
                  <span className="comparison-pill">{currentState.comparisons}</span>
                </div>

                <div className="bucket-grid">
                  {Object.entries(currentState.buckets).map(([bucketName, items]) => {
                    const isHighlighted = currentState.highlightedBuckets?.includes(bucketName);

                    return (
                      <div
                        key={bucketName}
                        className={`bucket-card ${isHighlighted ? 'is-highlighted' : ''}`}
                      >
                        <strong>{bucketName}</strong>

                        <div className="bucket-items">
                          {items.length > 0 ? (
                            items.map((item) => (
                              <span
                                key={item}
                                className={`bucket-token ${
                                  currentState.candidates?.includes(item) ? 'is-candidate' : ''
                                } ${currentState.current === item ? 'is-current' : ''}`}
                                style={{ '--item-color': itemColors[item] }}
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <em>empty</em>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {currentState.hyperplanes.length > 0 && (
                  <div className="hyperplane-row">
                    {currentState.hyperplanes.map((hyperplane, index) => (
                      <span
                        key={hyperplane}
                        className={currentState.activeBits?.includes(index) ? 'is-active' : ''}
                      >
                        {hyperplane}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="candidate-row">
              <div className={`result-card ${currentState.candidates ? 'is-filled' : ''}`}>
                <strong>Candidate set</strong>

                <div className="candidate-list">
                  {currentState.candidates ? (
                    currentState.candidates.map((item) => (
                      <span
                        key={item}
                        style={{ '--item-color': itemColors[item] }}
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <em>not selected yet</em>
                  )}
                </div>
              </div>

              <div className={`result-card ${currentState.scores ? 'is-filled final' : ''}`}>
                <strong>Final comparison</strong>

                <div className="score-list">
                  {currentState.scores ? (
                    currentState.scores.map((score) => (
                      <span key={score.item}>
                        {score.item}: {score.score}
                      </span>
                    ))
                  ) : (
                    <em>waiting for candidate check</em>
                  )}
                </div>
              </div>
            </div>

            <div className="lsh2-message-zone">
              <p key={`message-${currentStep}`}>{currentState.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Locality-sensitive hashing is used for approximate nearest-neighbor
          search: it reduces candidate pairs before doing expensive similarity
          comparisons.
        </p>
      </main>

      <style>{`
        .lsh2-layout {
          display: grid;
          grid-template-columns: 0.84fr 1.36fr;
          gap: 20px;
          margin-top: 18px;
          align-items: stretch;
        }

        .lsh2-code,
        .lsh2-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .lsh2-code {
          padding: 16px;
        }

        .lsh2-code-title,
        .zone-label {
          margin: 0 0 10px;
          color: #3059ab;
          font-size: 16px;
          font-weight: 700;
        }

        .lsh2-code pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          line-height: 1.32;
          white-space: pre-wrap;
        }

        .code-line {
          display: grid;
          grid-template-columns: 24px 1fr;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 8px;
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

        .lsh2-visual {
          padding: 16px;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 10px;
        }

        .zone-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .zone-row.compact {
          margin-bottom: 6px;
        }

        .mini-label {
          margin: 0 0 6px;
          color: rgba(17, 17, 17, 0.62);
          font-size: 12px;
          font-weight: 900;
        }

        .phase-pill {
          margin-bottom: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          background: #3059ab;
          color: white;
          font-size: 12px;
          font-weight: 800;
          animation: pill-enter 280ms ease both;
        }

        .phase-similarity,
        .phase-query,
        .phase-candidate {
          background: #3d9970;
        }

        .phase-dissimilar {
          background: #e07a5f;
        }

        .phase-hyperplane,
        .phase-code {
          background: #8e44ad;
        }

        .phase-definition {
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

        .lsh2-main {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 10px;
        }

        .vector-list {
          display: grid;
          gap: 5px;
        }

        .vector-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 7px;
          align-items: center;
          min-height: 34px;
          padding: 5px 7px;
          border-radius: 11px;
          background: rgba(17, 17, 17, 0.045);
          transition:
            opacity 260ms ease,
            background 260ms ease,
            transform 260ms ease;
          animation: row-enter 280ms ease both;
        }

        .vector-row.is-current {
          background: rgba(48, 89, 171, 0.1);
          transform: translateX(3px);
        }

        .object-token {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--item-color);
          color: white;
          font-size: 13px;
          font-weight: 900;
        }

        .feature-vector {
          display: flex;
          gap: 4px;
        }

        .feature-vector span {
          width: 22px;
          height: 25px;
          border-radius: 7px;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .feature-off {
          background: rgba(17, 17, 17, 0.06);
          color: rgba(17, 17, 17, 0.38);
        }

        .feature-on {
          background: rgba(48, 89, 171, 0.12);
          color: #3059ab;
        }

        .feature-on.is-highlighted {
          background: #3059ab;
          color: white;
        }

        .code-box {
          min-width: 42px;
          min-height: 26px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: white;
          color: #111;
          font-size: 12px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        @keyframes row-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .comparison-pill {
          margin-bottom: 6px;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(48, 89, 171, 0.1);
          color: #3059ab;
          font-size: 11px;
          font-weight: 900;
        }

        .bucket-grid {
          display: grid;
          gap: 7px;
        }

        .bucket-card {
          min-height: 50px;
          border-radius: 13px;
          background: rgba(17, 17, 17, 0.05);
          border: 2px solid rgba(17, 17, 17, 0.08);
          padding: 8px;
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 8px;
          align-items: center;
          transition:
            background 280ms ease,
            border-color 280ms ease,
            transform 280ms ease,
            box-shadow 280ms ease;
        }

        .bucket-card.is-highlighted {
          background: rgba(48, 89, 171, 0.09);
          border-color: #3059ab;
          transform: translateY(-2px);
          box-shadow: 0 8px 14px rgba(48, 89, 171, 0.12);
        }

        .bucket-card strong {
          color: #3059ab;
          font-size: 13px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .bucket-items {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .bucket-items em {
          color: rgba(17, 17, 17, 0.36);
          font-style: normal;
          font-weight: 800;
          font-size: 12px;
        }

        .bucket-token {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--item-color);
          color: white;
          font-size: 12px;
          font-weight: 900;
          animation: token-enter 260ms ease both;
        }

        .bucket-token.is-current {
          outline: 3px solid rgba(48, 89, 171, 0.22);
          transform: scale(1.08);
        }

        .bucket-token.is-candidate {
          outline: 3px solid rgba(242, 177, 52, 0.46);
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

        .hyperplane-row {
          margin-top: 7px;
          display: flex;
          gap: 6px;
        }

        .hyperplane-row span {
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.06);
          color: rgba(17, 17, 17, 0.55);
          font-size: 11px;
          font-weight: 900;
        }

        .hyperplane-row span.is-active {
          background: rgba(142, 68, 173, 0.16);
          color: #8e44ad;
        }

        .candidate-row {
          display: none;
        }

        .lsh2-message-zone {
          border-radius: 15px;
          background: rgba(48, 89, 171, 0.1);
          padding: 12px 14px;
          animation: message-enter 320ms ease both;
        }

        .lsh2-message-zone p {
          margin: 0;
          font-size: 16px;
          line-height: 1.28;
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

Slide17.steps = states.length;