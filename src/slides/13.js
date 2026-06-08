import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

function UtilizationPlot({ visible }) {
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
            type: 'bar',
            x: ['T1', 'T2', 'T3', 'ISR', 'Idle'],
            y: [20, 25, 18, 7, 30],
            text: ['20%', '25%', '18%', '7%', '30%'],
            textposition: 'auto',
          },
        ],
        {
          margin: { l: 52, r: 24, t: 14, b: 42 },
          height: 350,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(255,255,255,0.55)',
          xaxis: {
            fixedrange: true,
          },
          yaxis: {
            title: 'CPU share (%)',
            range: [0, 40],
            fixedrange: true,
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

export default function Slide13({ step }) {
  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Schedulability</p>

        <h1>
          CPU utilization leaves enough slack for exceptional paths
        </h1>

        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          A feasible real-time design needs spare capacity for interrupts,
          cache effects, and recovery routines.
        </p>

        <UtilizationPlot visible={step >= 2} />

        <div className={`technical-callout step ${step >= 3 ? 'is-visible' : ''}`}>
          Rule of thumb: the idle margin is not wasted time; it is protection
          against worst-case interference.
        </div>
      </main>
    </div>
  );
}

Slide13.steps = 4;