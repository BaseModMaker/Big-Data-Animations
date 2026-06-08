import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

function PlotlyDivider() {
  const dividerRef = useRef(null);

  useEffect(() => {
    const divider = dividerRef.current;

    if (!divider) {
      return undefined;
    }

    Plotly.newPlot(
      divider,
      [
        {
          x: [0, 1],
          y: [0, 0],
          mode: 'lines',
          line: {
            color: '#3059ab',
            width: 6,
          },
          hoverinfo: 'skip',
        },
      ],
      {
        margin: { l: 0, r: 0, t: 0, b: 0 },
        xaxis: {
          visible: false,
          fixedrange: true,
        },
        yaxis: {
          visible: false,
          fixedrange: true,
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        height: 24,
      },
      {
        displayModeBar: false,
        responsive: true,
      }
    );

    return () => {
      Plotly.purge(divider);
    };
  }, []);

  return (
    <div
      ref={dividerRef}
      className="accent-line"
      aria-hidden="true"
    />
  );
}

export default function Slide11() {
  return (
    <div className="slide slide-center">
      <img id="ulb-seal" className="ulb-seal" alt="" />

      <main className="slide-content">
        <h1>Animations for the course Big Data</h1>

        <p className="subtitle">
          Part 2
        </p>

        <PlotlyDivider />

        <p className="author">Basile Donnay</p>
      </main>

      <style>{`
        .ulb-seal {
          position: absolute;
          right: -200px;
          bottom: -220px;
          width: 920px;
          height: 920px;
          max-width: 920px;
          max-height: 920px;
          opacity: 1;
          transform: rotate(-45deg);
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .author {
          margin: 18px 0 0;
          font-size: 24px;
        }

        .supervisor {
          margin: 10px 0 0;
          font-size: 20px;
          color: #3059ab;
        }
      `}</style>
    </div>
  );
}