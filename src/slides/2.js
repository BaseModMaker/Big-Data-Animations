const topics = [
  'Karp frequent items',
  'Lossy Counting',
  'Bloom filters',
  'Flajolet-Martin',
  'HyperLogLog',
  'Locality-Sensitive Hashing',
  'Random hyperplane LSH',
  'Two-Phase Commit',
  'Paxos consensus',
  'Distributed least squares',
  'Distributed Naive Bayes',
  'Distributed K-means',
  'K-nearest neighbors',
  'Randomized ensembles',
  'Recursive least squares',
  'Online gradient descent',
  'Perceptron',
  'Online K-means',
];

export default function Slide2({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content wide-content">

        <h1>Table of Contents</h1>

        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          From streaming sketches to distributed protocols and online
          learning algorithms.
        </p>

        <div className="accent-line" />

        <div className={`agenda-grid ${step >= 1 ? 'is-visible' : ''}`}>
          {topics.map((topic, index) => (
            <div
              key={topic}
              className="agenda-item"
              style={{ '--delay': `${120 + index * 75}ms` }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{topic}</strong>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        .agenda-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 26px;
        }

        .agenda-item {
          min-height: 58px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.68);
          border: 1px solid rgba(17, 17, 17, 0.1);
          padding: 12px 14px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: center;
          opacity: 0;
          transform: translateY(16px) scale(0.97);
          transition:
            opacity 320ms ease var(--delay),
            transform 320ms ease var(--delay),
            border-color 320ms ease var(--delay),
            background 320ms ease var(--delay);
        }

        .agenda-grid.is-visible .agenda-item {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .agenda-item span {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(48, 89, 171, 0.12);
          color: #3059ab;
          font-size: 13px;
          font-weight: 900;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .agenda-item strong {
          color: #111;
          font-size: 17px;
          line-height: 1.18;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}

Slide2.steps = 2;
