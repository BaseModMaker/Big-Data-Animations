export default function Slide22({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Closing</p>
        <h1>Thank you</h1>
        <div className={`accent-line step-scale ${step >= 1 ? 'is-visible' : ''}`} />
        <p className={`small-note step ${step >= 2 ? 'is-visible' : ''}`}>Basile Donnay</p>
      </main>
    </div>
  );
}

Slide22.steps = 4;
