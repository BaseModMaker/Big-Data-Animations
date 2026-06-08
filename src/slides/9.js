export default function Slide9({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Timeline</p>
        <h1>Timeline template</h1>
        <div style={{ display: 'grid', gap: 18, marginTop: 34 }}>
          {['Phase 1 — Discover', 'Phase 2 — Design', 'Phase 3 — Test', 'Phase 4 — Scale'].map((item, index) => (
            <div key={item} className={`card step-left ${step >= index + 1 ? 'is-visible' : ''}`}>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

Slide9.steps = 5;
