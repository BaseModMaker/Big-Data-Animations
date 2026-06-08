export default function Slide4({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Big number</p>
        <span className={`big-number step-scale ${step >= 1 ? 'is-visible' : ''}`}>73%</span>
        <h1 className={`step ${step >= 2 ? 'is-visible' : ''}`}>Use a single number to focus attention.</h1>
        <p className={`subtitle step ${step >= 3 ? 'is-visible' : ''}`}>Add one sentence explaining what the number means.</p>
      </main>
    </div>
  );
}

Slide4.steps = 4;
