import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

function JitterScatter({ visible }) {
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
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            y: [0.2, 0.1, 0.3, 0.2, 0.4, 0.3, 0.2, 1.4, 0.3, 0.2, 0.4, 0.3, 1.1, 0.2, 0.3],
            mode: 'markers',
            marker: {
              size: [10, 9, 11, 9, 12, 10, 9, 18, 10, 9, 11, 10, 16, 9, 10],
            },
            name: 'Jitter sample',
          },
        ],
        {
          margin: { l: 56, r: 24, t: 14, b: 48 },
          height: 350,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(255,255,255,0.55)',
          xaxis: {
            title: 'Activation',
            fixedrange: true,
          },
          yaxis: {
            title: 'Jitter (ms)',
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

export default function Slide15({ step }) {
  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Timing analysis</p>

        <h1>
          Jitter is concentrated in a few high-interference activations
        </h1>

        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          The outliers usually reveal lock contention, disabled interrupts, or
          cache-heavy code paths.
        </p>

        <JitterScatter visible={step >= 2} />

        <div className="grid-3" style={{ marginTop: 22 }}>
          <div className={`metric-card step ${step >= 3 ? 'is-visible' : ''}`}>
            <strong>0.33 ms</strong>
            <span>median jitter</span>
          </div>

          <div className={`metric-card step ${step >= 4 ? 'is-visible' : ''}`}>
            <strong>1.4 ms</strong>
            <span>worst sample</span>
          </div>

          <div className={`metric-card step ${step >= 5 ? 'is-visible' : ''}`}>
            <strong>2 ms</strong>
            <span>budget</span>
          </div>
        </div>
      </main>
    </div>
  );
}

Slide15.steps = 6;