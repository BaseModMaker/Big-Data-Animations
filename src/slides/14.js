export default function Slide14({ step }) {
  return (
    <div className="slide technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">System architecture</p>
        <h1>Control flow from hardware event to user-space recovery</h1>
        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          The diagram separates immediate interrupt handling from deferred analysis and user-space policy.
        </p>

        <div className="pipeline">
          <div className={`pipeline-node step-scale ${step >= 2 ? 'is-visible' : ''}`}>
            <span>1</span><strong>Hardware event</strong><p>Timer, fault, I/O interrupt</p>
          </div>
          <div className={`pipeline-arrow step-fade ${step >= 3 ? 'is-visible' : ''}`}>→</div>
          <div className={`pipeline-node step-scale ${step >= 3 ? 'is-visible' : ''}`}>
            <span>2</span><strong>Kernel handler</strong><p>Minimal state capture</p>
          </div>
          <div className={`pipeline-arrow step-fade ${step >= 4 ? 'is-visible' : ''}`}>→</div>
          <div className={`pipeline-node step-scale ${step >= 4 ? 'is-visible' : ''}`}>
            <span>3</span><strong>Scheduler</strong><p>Priority and deadline decision</p>
          </div>
          <div className={`pipeline-arrow step-fade ${step >= 5 ? 'is-visible' : ''}`}>→</div>
          <div className={`pipeline-node step-scale ${step >= 5 ? 'is-visible' : ''}`}>
            <span>4</span><strong>Recovery task</strong><p>Policy outside ISR path</p>
          </div>
        </div>
      </main>
    </div>
  );
}

Slide14.steps = 6;
