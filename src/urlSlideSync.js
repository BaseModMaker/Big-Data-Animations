import { useEffect } from 'react';

export function getSlideIndexFromUrl(totalSlides) {
  const params = new URLSearchParams(window.location.search);
  const slideNumber = Number(params.get('slide'));

  if (!Number.isInteger(slideNumber)) {
    return 0;
  }

  const clampedSlideNumber = Math.min(
    Math.max(slideNumber, 1),
    totalSlides
  );

  return clampedSlideNumber - 1;
}

function setSlideIndexInUrl(slideIndex) {
  const slideNumber = slideIndex + 1;
  const url = new URL(window.location.href);

  url.searchParams.set('slide', String(slideNumber));

  window.history.replaceState({}, '', url);
}

function useUrlSlideSync({ slideIndex, setSlideIndex, totalSlides }) {
  useEffect(() => {
    setSlideIndexInUrl(slideIndex);
  }, [slideIndex]);

  useEffect(() => {
    function handlePopState() {
      setSlideIndex(getSlideIndexFromUrl(totalSlides));
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setSlideIndex, totalSlides]);
}

export default useUrlSlideSync;