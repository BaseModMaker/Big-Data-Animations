export default function Slide20({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Closing</p>
        <h1>Thank you</h1>
        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>Questions and discussion.</p>
        <div className={`accent-line step-scale ${step >= 2 ? 'is-visible' : ''}`} />
        <p className={`small-note step ${step >= 3 ? 'is-visible' : ''}`}>contact@example.com</p>
      </main>
    </div>
  );
}

Slide20.steps = 4;
