import { useEffect } from 'react';

function usePresentationInputs({
  goNext,
  goPrevious,
  goNextSlide,
  goPreviousSlide,
}) {
  useEffect(() => {
    function next(event) {
      if (event?.shiftKey) {
        goNextSlide();
      } else {
        goNext();
      }
    }

    function previous(event) {
      if (event?.shiftKey) {
        goPreviousSlide();
      } else {
        goPrevious();
      }
    }

    function handleKeyDown(event) {
      const nextKeys = [
        'ArrowRight',
        'ArrowUp',
        'Space',
        'Enter',
        'PageDown',
        'KeyN',
      ];

      const previousKeys = [
        'ArrowLeft',
        'ArrowDown',
        'PageUp',
        'Backspace',
        'KeyP',
      ];

      if (nextKeys.includes(event.code)) {
        event.preventDefault();
        next(event);
      }

      if (previousKeys.includes(event.code)) {
        event.preventDefault();
        previous(event);
      }
    }

    function handleClick(event) {
      // left mouse click only
      if (event.button !== 0) return;

      next(event);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, [goNext, goPrevious, goNextSlide, goPreviousSlide]);
}

export default usePresentationInputs;