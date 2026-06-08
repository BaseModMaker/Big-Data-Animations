import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';


function ComparisonPlot({ visible }) {
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
            type: 'scatterpolar',
            r: [4, 3, 5, 2, 4],
            theta: ['Latency', 'Memory', 'Isolation', 'Complexity', 'Portability'],
            fill: 'toself',
            name: 'Prototype score',
          },
        ],
        {
          margin: { l: 42, r: 42, t: 20, b: 20 },
          height: 380,
          paper_bgcolor: 'rgba(0,0,0,0)',
          polar: {
            radialaxis: {
              visible: true,
              range: [0, 5],
            },
          },
          showlegend: false,
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

  return <div ref={ref} className={`technical-plot step-scale ${visible ? 'is-visible' : ''}`} />;
}

export default function Slide19({ step }) {
  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Technical trade-off</p>
        <h1>The prototype is feasible, but the cost moves into implementation discipline</h1>
        <div className="grid-2" style={{ marginTop: 28 }}>
          <ComparisonPlot visible={step >= 1} />
          <div className="tradeoff-list">
            <div className={`card step-right ${step >= 2 ? 'is-visible' : ''}`}><h3>Strong</h3><p>Latency and isolation can be bounded with a narrow kernel path.</p></div>
            <div className={`card step-right ${step >= 3 ? 'is-visible' : ''}`}><h3>Weak</h3><p>Complexity rises when every non-resumable section needs explicit reasoning.</p></div>
            <div className={`card step-right ${step >= 4 ? 'is-visible' : ''}`}><h3>Next</h3><p>Validate on more hardware and compare against a resumable baseline.</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}

Slide19.steps = 5;
