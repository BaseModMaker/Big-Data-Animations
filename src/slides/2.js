export default function Slide2({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Agenda</p>
        <h1>Today’s Structure</h1>
        <div className="accent-line" />
        <div className="grid-2">
          <div className={`card step-left ${step >= 1 ? 'is-visible' : ''}`}><h3>01 Context</h3><p>What problem are we looking at?</p></div>
          <div className={`card step-right ${step >= 2 ? 'is-visible' : ''}`}><h3>02 Method</h3><p>How did we investigate it?</p></div>
          <div className={`card step-left ${step >= 3 ? 'is-visible' : ''}`}><h3>03 Findings</h3><p>What did we learn?</p></div>
          <div className={`card step-right ${step >= 4 ? 'is-visible' : ''}`}><h3>04 Next</h3><p>What should happen afterwards?</p></div>
        </div>
      </main>
    </div>
  );
}

Slide2.steps = 5;
