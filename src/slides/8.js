export default function Slide8({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Three ideas</p>
        <h1>Use cards for parallel concepts</h1>
        <div className="grid-3" style={{ marginTop: 34 }}>
          <div className={`card step ${step >= 1 ? 'is-visible' : ''}`}><h3>Speed</h3><p>One compact explanation.</p></div>
          <div className={`card step ${step >= 2 ? 'is-visible' : ''}`}><h3>Quality</h3><p>One compact explanation.</p></div>
          <div className={`card step ${step >= 3 ? 'is-visible' : ''}`}><h3>Cost</h3><p>One compact explanation.</p></div>
        </div>
      </main>
    </div>
  );
}

Slide8.steps = 4;
