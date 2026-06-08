export default function Slide10({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Image slide</p>
        <h1>Image with automatic public import</h1>
        <p className="subtitle">The image below has no src. It resolves from its id.</p>
        <img id="placeholder-image" className={`step-scale ${step >= 1 ? 'is-visible' : ''}`} alt="" style={{ width: 520, maxHeight: 300, objectFit: 'contain', marginTop: 36 }} />
        <p className={`small-note step ${step >= 2 ? 'is-visible' : ''}`}>Expected file: public/placeholder-image.png or public/placeholder_image.png</p>
      </main>
    </div>
  );
}

Slide10.steps = 3;
