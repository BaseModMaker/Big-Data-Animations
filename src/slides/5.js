export default function Slide5({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Comparison</p>
        <h1>Before and after</h1>
        <div className="accent-line" />
        <div className="grid-2">
          <div className={`card step-left ${step >= 1 ? 'is-visible' : ''}`}><h3>Before</h3><p>Describe the old situation, current limitation, or baseline.</p></div>
          <div className={`card step-right ${step >= 2 ? 'is-visible' : ''}`}><h3>After</h3><p>Describe the improved state, target behaviour, or proposed solution.</p></div>
        </div>
      </main>
    </div>
  );
}

Slide5.steps = 3;
