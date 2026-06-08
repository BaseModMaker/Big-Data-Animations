const observations = ['r1', 'r2', 'r3', 'r4'];
const features = ['f1', 'f2', 'f3', 'f4'];

const states = [
  {
    phase: 'data',
    event: 'Large dataset',
    activeLines: [1],
    rows: [],
    features: [],
    jobs: [],
    models: [],
    message: 'Instead of training one large model, we train smaller models on smaller parts of the data.',
  },
  {
    phase: 'pasting',
    event: 'Pasting: sample rows',
    activeLines: [2, 5],
    rows: ['r1', 'r3'],
    features,
    jobs: [{ id: 'P1', label: 'rows only', model: 'M1' }],
    models: ['M1'],
    message: 'Pasting trains a model on a random subset of observations.',
  },
  {
    phase: 'subspace',
    event: 'Random subspaces: sample features',
    activeLines: [3, 5],
    rows: observations,
    features: ['f1', 'f3'],
    jobs: [{ id: 'P2', label: 'features only', model: 'M2' }],
    models: ['M1', 'M2'],
    message: 'Random subspaces train a model on a random subset of features.',
  },
  {
    phase: 'patches',
    event: 'Random patches: sample rows and features',
    activeLines: [4, 5],
    rows: ['r2', 'r4'],
    features: ['f2', 'f4'],
    jobs: [{ id: 'P3', label: 'rows + features', model: 'M3' }],
    models: ['M1', 'M2', 'M3'],
    message: 'Random patches combine both ideas: fewer rows and fewer features.',
  },
  {
    phase: 'parallel',
    event: 'Train patches independently',
    activeLines: [6],
    rows: [],
    features: [],
    jobs: [
      { id: 'P1', label: 'rows only', model: 'M1' },
      { id: 'P2', label: 'features only', model: 'M2' },
      { id: 'P3', label: 'rows + features', model: 'M3' },
    ],
    models: ['M1', 'M2', 'M3'],
    message: 'Each patch can run on a different machine, so the method is highly parallel.',
  },
  {
    phase: 'vote',
    event: 'Combine predictions',
    activeLines: [7, 8],
    rows: [],
    features: [],
    jobs: [
      { id: 'M1', label: 'vote A', model: 'A' },
      { id: 'M2', label: 'vote B', model: 'B' },
      { id: 'M3', label: 'vote A', model: 'A' },
    ],
    models: ['M1', 'M2', 'M3'],
    prediction: 'class A',
    message: 'The ensemble combines the small models by voting or averaging.',
  },
];

const codeLines = [
  'start with training data',
  'pasting: sample observations',
  'subspaces: sample features',
  'patches: sample both',
  'train one model per subset',
  'run models in parallel',
  'combine predictions',
  'return ensemble output',
];

function isSelected(value, selected) {
  return selected.includes(value);
}

export default function Slide16({ step }) {
  const currentStep = Math.min(step, states.length - 1);
  const state = states[currentStep];

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Distributed ensembles</p>

        <h1>Ensembles reduce memory by training smaller models</h1>

        <p className="subtitle">
          Pasting samples rows, random subspaces sample features, and random
          patches sample both.
        </p>

        <div className="ensemble-layout compact">
          <section className="ensemble-code">
            <p className="ensemble-code-title">Algorithm</p>

            <pre>
              {codeLines.map((line, index) => {
                const lineNumber = index + 1;
                const isActive = state.activeLines.includes(lineNumber);

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

          <section className="ensemble-visual">
            <div className="zone-row">
              <p className="zone-label">{state.event}</p>
              <div className={`phase-pill phase-${state.phase}`}>{state.phase}</div>
            </div>

            <div className="ensemble-top">
              <div className="dataset-mini">
                <p className="mini-label">Dataset</p>

                <div className="matrix compact-matrix">
                  <div className="matrix-corner" />

                  {features.map((feature) => (
                    <div
                      key={feature}
                      className={`matrix-header ${
                        isSelected(feature, state.features) ? 'is-selected-feature' : ''
                      }`}
                    >
                      {feature}
                    </div>
                  ))}

                  {observations.map((row) => (
                    <>
                      <div
                        key={`${row}-label`}
                        className={`matrix-row-label ${
                          isSelected(row, state.rows) ? 'is-selected-row' : ''
                        }`}
                      >
                        {row}
                      </div>

                      {features.map((feature) => (
                        <div
                          key={`${row}-${feature}`}
                          className={`matrix-cell ${
                            isSelected(row, state.rows) ? 'row-selected' : ''
                          } ${
                            isSelected(feature, state.features) ? 'feature-selected' : ''
                          } ${
                            isSelected(row, state.rows) &&
                            isSelected(feature, state.features)
                              ? 'patch-selected'
                              : ''
                          }`}
                        />
                      ))}
                    </>
                  ))}
                </div>
              </div>

              <div className="patch-mini">
                <p className="mini-label">Independent jobs</p>

                <div className="patch-grid compact-patches">
                  {state.jobs.map((job, index) => (
                    <div key={job.id} className={`patch-card patch-${index + 1}`}>
                      <strong>{job.id}</strong>
                      <span>{job.label}</span>
                      <b>{job.model}</b>
                    </div>
                  ))}

                  {state.jobs.length === 0 && (
                    <div className="empty-patch">no subset yet</div>
                  )}
                </div>
              </div>
            </div>

            <div className="ensemble-bottom">
              <div className={`result-card ${state.models.length ? 'is-filled' : ''}`}>
                <strong>Models</strong>
                <span>{state.models.length ? state.models.join(' + ') : 'none yet'}</span>
              </div>

              <div className={`result-card ${state.prediction ? 'final' : ''}`}>
                <strong>Output</strong>
                <span>{state.prediction || 'waiting for votes'}</span>
              </div>
            </div>

            <div className="ensemble-message-zone">
              <p key={`message-${currentStep}`}>{state.message}</p>
            </div>
          </section>
        </div>

        <p className={`small-note step ${step >= states.length - 1 ? 'is-visible' : ''}`}>
          Smaller independent models reduce memory pressure and make training easy to parallelize.
        </p>
      </main>

      <style>{`
        .ensemble-layout.compact {
          display: grid;
          grid-template-columns: 0.85fr 1.35fr;
          gap: 22px;
          margin-top: 22px;
          align-items: stretch;
        }

        .ensemble-code,
        .ensemble-visual {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 18px;
          box-sizing: border-box;
        }

        .ensemble-code {
          padding: 18px;
        }

        .ensemble-code-title,
        .zone-label {
          margin: 0 0 10px;
          color: #3059ab;
          font-size: 17px;
          font-weight: 700;
        }

        .ensemble-code pre {
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.3;
          white-space: pre-wrap;
        }

        .code-line {
          display: grid;
          grid-template-columns: 24px 1fr;
          gap: 10px;
          padding: 6px 8px;
          border-radius: 9px;
          color: rgba(17, 17, 17, 0.58);
          transition: background 260ms ease, color 260ms ease, transform 260ms ease;
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

        .ensemble-visual {
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
          margin-bottom: 10px;
          padding: 6px 11px;
          border-radius: 999px;
          background: #3059ab;
          color: white;
          font-size: 13px;
          font-weight: 800;
        }

        .phase-pasting { background: #3059ab; }
        .phase-subspace { background: #3d9970; }
        .phase-patches { background: #8e44ad; }
        .phase-parallel { background: #e07a5f; }
        .phase-vote { background: #f2b134; color: #111; }

        .ensemble-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .mini-label {
          margin: 0 0 8px;
          color: rgba(17, 17, 17, 0.62);
          font-size: 13px;
          font-weight: 900;
        }

        .matrix {
          display: grid;
          grid-template-columns: 38px repeat(4, 1fr);
          gap: 5px;
        }

        .matrix-corner,
        .matrix-header,
        .matrix-row-label,
        .matrix-cell {
          min-height: 26px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
          transition: background 280ms ease, color 280ms ease, transform 280ms ease;
        }

        .matrix-header,
        .matrix-row-label {
          background: rgba(17, 17, 17, 0.06);
          color: rgba(17, 17, 17, 0.62);
        }

        .matrix-cell {
          background: rgba(17, 17, 17, 0.045);
          border: 2px solid transparent;
        }

        .matrix-header.is-selected-feature {
          background: rgba(61, 153, 112, 0.18);
          color: #3d9970;
          transform: translateY(-2px);
        }

        .matrix-row-label.is-selected-row {
          background: rgba(48, 89, 171, 0.16);
          color: #3059ab;
          transform: translateX(2px);
        }

        .matrix-cell.row-selected {
          background: rgba(48, 89, 171, 0.08);
        }

        .matrix-cell.feature-selected {
          background: rgba(61, 153, 112, 0.08);
        }

        .matrix-cell.patch-selected {
          background: rgba(142, 68, 173, 0.16);
          border-color: rgba(142, 68, 173, 0.34);
        }

        .patch-grid.compact-patches {
          display: grid;
          gap: 8px;
        }

        .patch-card {
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.78);
          border: 2px solid rgba(48, 89, 171, 0.22);
          padding: 10px 12px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
          animation: patch-enter 300ms ease both;
        }

        .patch-card strong {
          color: #3059ab;
          font-size: 15px;
        }

        .patch-card span {
          color: #111;
          font-size: 13px;
          font-weight: 800;
        }

        .patch-card b {
          min-width: 34px;
          min-height: 26px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #3059ab;
          color: white;
          font-size: 13px;
        }

        .patch-2 b { background: #3d9970; }
        .patch-3 b { background: #8e44ad; }

        .empty-patch {
          min-height: 54px;
          border-radius: 14px;
          background: rgba(17, 17, 17, 0.045);
          display: grid;
          place-items: center;
          color: rgba(17, 17, 17, 0.44);
          font-size: 14px;
          font-weight: 900;
        }

        .ensemble-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .result-card {
          min-height: 64px;
          border-radius: 14px;
          background: rgba(17, 17, 17, 0.055);
          padding: 12px;
          display: grid;
          gap: 4px;
          align-content: center;
        }

        .result-card.is-filled {
          background: rgba(48, 89, 171, 0.1);
        }

        .result-card.final {
          background: rgba(242, 177, 52, 0.18);
        }

        .result-card strong {
          color: #3059ab;
          font-size: 14px;
        }

        .result-card span {
          color: #111;
          font-size: 15px;
          font-weight: 900;
        }

        .ensemble-message-zone {
          border-radius: 16px;
          background: rgba(48, 89, 171, 0.1);
          padding: 14px;
        }

        .ensemble-message-zone p {
          margin: 0;
          font-size: 17px;
          line-height: 1.3;
        }

        @keyframes patch-enter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
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

Slide16.steps = states.length;