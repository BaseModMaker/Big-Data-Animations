import './_SharedSlideUI_.css';

export const backgroundColor = 'rgb(255, 255, 255)';
export const blue = '#3059ab';
// set font to roboto mono for all slides
// export const fontFamily = '"Roboto Mono", monospace';
// set font to fira sans for all slides
export const fontFamily = '"Times New Roman", serif';

function SharedSlideUI({ currentSlide, totalSlides }) {
  const progress =
    totalSlides <= 1
      ? 100
      : ((currentSlide - 1) / (totalSlides - 1)) * 100;

  return (
    <div className="shared-slide-ui">
      <header className="slide-header" style={{ background: blue }}>
        <span> </span>
        <span>
          {currentSlide} / {totalSlides}
        </span>
      </header>

      <div className="slide-progress-bar">
        <div
          className="slide-progress-bar-fill"
          style={{
            width: `${progress}%`,
            background: blue,
          }}
        />
      </div>
    </div>
  );
}

export default SharedSlideUI;