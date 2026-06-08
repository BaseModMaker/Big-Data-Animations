const tasks = [
  { name: 'T1', priority: 'High', period: '5 ms', wcet: '1 ms' },
  { name: 'T2', priority: 'Medium', period: '10 ms', wcet: '2 ms' },
  { name: 'T3', priority: 'Low', period: '20 ms', wcet: '4 ms' },
];

export default function Slide12({ step }) {
  return (
    <div className="slide technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">RTOS scheduling</p>
        <h1>Fixed-priority preemptive scheduling</h1>
        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          Higher-priority tasks interrupt lower-priority work, which keeps urgent control loops responsive.
        </p>

        <div className="rtos-layout">
          <div className={`card step-left ${step >= 2 ? 'is-visible' : ''}`}>
            <h3>Task set</h3>
            <table className="technical-table">
              <thead>
                <tr><th>Task</th><th>Priority</th><th>Period</th><th>WCET</th></tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.name}>
                    <td>{task.name}</td><td>{task.priority}</td><td>{task.period}</td><td>{task.wcet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`schedule-card step-right ${step >= 3 ? 'is-visible' : ''}`}>
            <h3>Timeline</h3>
            <div className="schedule-grid">
              <div className="lane-label">T1</div>
              <div className="lane"><span className="job high" style={{ left: '0%', width: '8%' }} /><span className="job high" style={{ left: '25%', width: '8%' }} /><span className="job high" style={{ left: '50%', width: '8%' }} /><span className="job high" style={{ left: '75%', width: '8%' }} /></div>
              <div className="lane-label">T2</div>
              <div className="lane"><span className="job medium" style={{ left: '8%', width: '14%' }} /><span className="job medium" style={{ left: '58%', width: '14%' }} /></div>
              <div className="lane-label">T3</div>
              <div className="lane"><span className="job low" style={{ left: '22%', width: '20%' }} /><span className="job low" style={{ left: '72%', width: '20%' }} /></div>
              <div className="time-axis">0 ms <span>5</span><span>10</span><span>15</span><span>20</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Slide12.steps = 4;
