import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

function DeadlinePlot({ visible }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!visible || !element) {
      return undefined;
    }

    let cancelled = false;
    let frameId = window.requestAnimationFrame(() => {
      if (cancelled || !element.isConnected) {
        return;
      }

      Plotly.newPlot(
        element,
        [
          {
            x: ['A', 'B', 'C', 'D', 'E'],
            y: [1.1, 1.4, 1.7, 2.1, 2.8],
            type: 'bar',
            name: 'Response time',
          },
          {
            x: ['A', 'B', 'C', 'D', 'E'],
            y: [2, 2, 2, 2, 2],
            mode: 'lines',
            line: {
              width: 4,
              dash: 'dash',
            },
            name: 'Deadline',
          },
        ],
        {
          margin: { l: 56, r: 24, t: 14, b: 42 },
          height: 350,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(255,255,255,0.55)',
          xaxis: {
            title: 'Experiment',
            fixedrange: true,
          },
          yaxis: {
            title: 'Time (ms)',
            fixedrange: true,
          },
          legend: {
            orientation: 'h',
            y: -0.28,
          },
        },
        {
          displayModeBar: false,
          responsive: true,
        }
      );
    });

    return () => {
      cancelled = true;

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      if (element && element.isConnected) {
        try {
          Plotly.purge(element);
        } catch {
          // Ignore Plotly cleanup errors during slide transitions.
        }
      }
    };
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`technical-plot step-scale ${visible ? 'is-visible' : ''}`}
    />
  );
}

export default function Slide17({ step }) {
  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Deadline testing</p>

        <h1>
          Stress conditions expose the first missed deadlines
        </h1>

        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          The transition from experiment C to D marks the point where the
          implementation stops being schedulable.
        </p>

        <DeadlinePlot visible={step >= 2} />

        <p className={`small-note step ${step >= 3 ? 'is-visible' : ''}`}>
          Use this slide to compare baseline, logging enabled, nested
          interrupts, and recovery mode.
        </p>
      </main>
    </div>
  );
}

Slide17.steps = 4;