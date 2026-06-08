export default function Slide11({ step }) {
  const points = [
    { x: 0, y: 0.9 },
    { x: 5, y: 1.1 },
    { x: 10, y: 1.0 },
    { x: 15, y: 4.8 },
    { x: 20, y: 1.2 },
    { x: 25, y: 1.0 },
    { x: 30, y: 0.95 },
  ];

  const width = 820;
  const height = 360;

  const padding = {
    left: 70,
    right: 28,
    top: 28,
    bottom: 58,
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  function scaleX(value) {
    return padding.left + (value / 30) * plotWidth;
  }

  function scaleY(value) {
    return padding.top + plotHeight - (value / 5) * plotHeight;
  }

  const linePath = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${scaleX(point.x)} ${scaleY(point.y)}`;
    })
    .join(' ');

  return (
    <div className="slide slide-center technical-slide">
      <main className="slide-content wide-content">
        <p className="kicker">Measurement</p>

        <h1>
          Interrupt latency is low until a non-resumable section blocks progress
        </h1>

        <p className={`subtitle step ${step >= 1 ? 'is-visible' : ''}`}>
          The important signal is not the average latency, but the rare spike
          that breaks the real-time budget.
        </p>

        <div className="technical-plot latency-plot">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Latency plot"
          >
            <rect
              className={`plot-bg ${step >= 2 ? 'is-visible' : ''}`}
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={plotHeight}
              rx="14"
            />

            <line
              className={`axis axis-y ${step >= 2 ? 'is-visible' : ''}`}
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left}
              y2={padding.top}
            />

            <line
              className={`axis axis-x ${step >= 2 ? 'is-visible' : ''}`}
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
            />

            <line
              className={`budget-line ${step >= 2 ? 'is-visible' : ''}`}
              x1={padding.left}
              y1={scaleY(2)}
              x2={padding.left + plotWidth}
              y2={scaleY(2)}
            />

            <text
              className={`axis-label ${step >= 2 ? 'is-visible' : ''}`}
              x={padding.left + plotWidth / 2}
              y={height - 14}
              textAnchor="middle"
            >
              Time window
            </text>

            <text
              className={`axis-label y-label ${step >= 2 ? 'is-visible' : ''}`}
              x="18"
              y={padding.top + plotHeight / 2}
              textAnchor="middle"
            >
              Latency (ms)
            </text>

            {[0, 5, 10, 15, 20, 25, 30].map((tick) => (
              <g key={tick} className={`tick ${step >= 2 ? 'is-visible' : ''}`}>
                <line
                  x1={scaleX(tick)}
                  y1={padding.top + plotHeight}
                  x2={scaleX(tick)}
                  y2={padding.top + plotHeight + 7}
                />
                <text
                  x={scaleX(tick)}
                  y={padding.top + plotHeight + 26}
                  textAnchor="middle"
                >
                  {tick}
                </text>
              </g>
            ))}

            {[0, 1, 2, 3, 4, 5].map((tick) => (
              <g key={tick} className={`tick ${step >= 2 ? 'is-visible' : ''}`}>
                <line
                  x1={padding.left - 7}
                  y1={scaleY(tick)}
                  x2={padding.left}
                  y2={scaleY(tick)}
                />
                <text
                  x={padding.left - 14}
                  y={scaleY(tick) + 5}
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            ))}

            <path
              className={`latency-line ${step >= 2 ? 'is-visible' : ''}`}
              d={linePath}
            />

            {points.map((point, index) => (
              <circle
                key={`${point.x}-${point.y}`}
                className={`latency-point point-${index + 1} ${
                  step >= 2 ? 'is-visible' : ''
                }`}
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r="7"
              />
            ))}

            <g className={`legend ${step >= 2 ? 'is-visible' : ''}`}>
              <line x1="610" y1="32" x2="650" y2="32" className="legend-line" />
              <text x="660" y="37">Measured latency</text>

              <line x1="610" y1="58" x2="650" y2="58" className="legend-budget" />
              <text x="660" y="63">Budget</text>
            </g>
          </svg>
        </div>

        <p className={`small-note step ${step >= 3 ? 'is-visible' : ''}`}>
          Template use: replace values with measured ISR response times,
          deadline budgets, or jitter samples.
        </p>
      </main>

      <style>{`
        .latency-plot {
          height: 360px;
          margin-top: 28px;
          overflow: hidden;
          background: transparent;
        }

        .latency-plot svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .plot-bg {
          fill: rgba(255, 255, 255, 0.55);
          opacity: 0;
          transition: opacity 360ms ease;
        }

        .plot-bg.is-visible {
          opacity: 1;
        }

        .axis {
          stroke: #111;
          stroke-width: 3;
          stroke-linecap: round;
          transform-box: fill-box;
          transition: transform 650ms ease;
        }

        .axis-x {
          transform-origin: left center;
          transform: scaleX(0);
        }

        .axis-y {
          transform-origin: center bottom;
          transform: scaleY(0);
        }

        .axis.is-visible {
          transform: scale(1);
        }

        .budget-line {
          stroke: #3059ab;
          stroke-width: 3;
          stroke-dasharray: 8 8;
          opacity: 0;
          transition: opacity 400ms ease 500ms;
        }

        .budget-line.is-visible {
          opacity: 0.8;
        }

        .latency-point {
          fill: #111;
          stroke: white;
          stroke-width: 3;
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          transform: scale(0);
          transition:
            opacity 260ms ease,
            transform 260ms ease;
        }

        .latency-point.point-1 {
          transition-delay: 720ms;
        }

        .latency-point.point-2 {
          transition-delay: 900ms;
        }

        .latency-point.point-3 {
          transition-delay: 1080ms;
        }

        .latency-point.point-4 {
          transition-delay: 1260ms;
        }

        .latency-point.point-5 {
          transition-delay: 1440ms;
        }

        .latency-point.point-6 {
          transition-delay: 1620ms;
        }

        .latency-point.point-7 {
          transition-delay: 1800ms;
        }

        .latency-point.is-visible {
          opacity: 1;
          transform: scale(1);
        }

        .latency-line {
          fill: none;
          stroke: #111;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          transition: stroke-dashoffset 900ms ease 2160ms;
        }

        .latency-line.is-visible {
          stroke-dashoffset: 0;
        }

        .tick,
        .axis-label {
          opacity: 0;
          transition: opacity 350ms ease 260ms;
        }

        .tick.is-visible,
        .axis-label.is-visible {
          opacity: 1;
        }

        .legend {
          opacity: 0;
          transition: opacity 350ms ease 3100ms;
        }

        .legend.is-visible {
          opacity: 1;
        }

        .tick line {
          stroke: #111;
          stroke-width: 2;
        }

        .tick text,
        .axis-label,
        .legend text {
          fill: #111;
          font-size: 15px;
        }

        .y-label {
          transform: rotate(-90deg);
          transform-origin: 18px center;
        }

        .legend-line {
          stroke: #111;
          stroke-width: 4;
          stroke-linecap: round;
        }

        .legend-budget {
          stroke: #3059ab;
          stroke-width: 3;
          stroke-dasharray: 8 8;
        }
      `}</style>
    </div>
  );
}

Slide11.steps = 4;