export default function Slide7({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Quote</p>
        <blockquote className={`quote step-scale ${step >= 1 ? 'is-visible' : ''}`}>
          “A clear template reduces design decisions and keeps attention on the story.”
        </blockquote>
        <p className={`small-note step ${step >= 2 ? 'is-visible' : ''}`}>Use this slide for a key citation, principle, or statement.</p>
      </main>
    </div>
  );
}

Slide7.steps = 3;
