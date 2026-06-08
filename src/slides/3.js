export default function Slide3({ step }) {
  return (
    <div className="slide slide-center">
      <main className="slide-content">
        <p className="kicker">Problem</p>
        <h1>The core issue is not technical only.</h1>
        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>It also depends on constraints, habits, incentives, and implementation cost.</p>
        <ul className="clean-list" style={{ marginTop: 32 }}>
          <li className={`step ${step >= 2 ? 'is-visible' : ''}`}>Constraint one can be introduced here.</li>
          <li className={`step ${step >= 3 ? 'is-visible' : ''}`}>Constraint two can be introduced here.</li>
          <li className={`step ${step >= 4 ? 'is-visible' : ''}`}>Constraint three can be introduced here.</li>
        </ul>
      </main>
    </div>
  );
}

Slide3.steps = 5;
