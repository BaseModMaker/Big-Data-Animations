export default function Slide16({ step }) {
  return (
    <div className="slide technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Memory model</p>
        <h1>Non-resumable regions must be small and explicit</h1>
        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          This template shows where protected state sits relative to stacks, heaps, and device buffers.
        </p>

        <div className="memory-map">
          <div className={`memory-block kernel step-left ${step >= 2 ? 'is-visible' : ''}`}><strong>Kernel text</strong><span>Interrupt handlers, scheduler</span></div>
          <div className={`memory-block protected step-left ${step >= 3 ? 'is-visible' : ''}`}><strong>Protected state</strong><span>Non-resumable metadata</span></div>
          <div className={`memory-block stack step-left ${step >= 4 ? 'is-visible' : ''}`}><strong>Task stacks</strong><span>T1 / T2 / T3 contexts</span></div>
          <div className={`memory-block heap step-left ${step >= 5 ? 'is-visible' : ''}`}><strong>Heap and buffers</strong><span>Dynamic objects, queues</span></div>
          <div className={`memory-block io step-left ${step >= 6 ? 'is-visible' : ''}`}><strong>MMIO</strong><span>Device registers</span></div>
        </div>
      </main>
    </div>
  );
}

Slide16.steps = 7;
