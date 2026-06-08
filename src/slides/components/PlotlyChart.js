import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

export default function PlotlyChart({
  data,
  layout = {},
  config = {},
  className = 'plotly-chart',
}) {
  const chartRef = useRef(null);

  useEffect(() => {
    const element = chartRef.current;

    if (!element) {
      return undefined;
    }

    let cancelled = false;

    requestAnimationFrame(() => {
      if (cancelled || !element || !element.isConnected) {
        return;
      }

      Plotly.newPlot(
        element,
        data,
        {
          autosize: true,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          margin: { l: 48, r: 24, t: 24, b: 44 },
          font: {
            family: 'inherit',
            color: '#111',
          },
          ...layout,
        },
        {
          displayModeBar: false,
          responsive: true,
          ...config,
        }
      );
    });

    return () => {
      cancelled = true;

      if (element && element.isConnected) {
        try {
          Plotly.purge(element);
        } catch {
          // Ignore cleanup errors during slide transitions.
        }
      }
    };
  }, [data, layout, config]);

  return <div ref={chartRef} className={className} />;
}