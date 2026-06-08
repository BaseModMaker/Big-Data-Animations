export default function Slide6({ step }) {
  const items = ['Research question', 'Hypothesis', 'Test design', 'Interpretation'];
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Process</p>
        <h1>Four-step method</h1>
        <div className="grid-2" style={{ marginTop: 34 }}>
          {items.map((item, index) => (
            <div key={item} className={`card step ${step >= index + 1 ? 'is-visible' : ''}`}>
              <h3>{String(index + 1).padStart(2, '0')}</h3>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

Slide6.steps = 5;
