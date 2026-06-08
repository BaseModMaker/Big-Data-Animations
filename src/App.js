import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import SharedSlideUI, { backgroundColor, fontFamily } from './slides/_SharedSlideUI_.js';
import usePresentationInputs from './inputs.js';
import useUrlSlideSync, { getSlideIndexFromUrl } from './urlSlideSync.js';

const slideContext = require.context('./slides', false, /^\.\/\d+\.js$/);

const slides = slideContext
  .keys()
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((path) => {
    const SlideComponent = slideContext(path).default;

    return {
      path,
      Component: SlideComponent,
      steps: SlideComponent.steps || 1,
    };
  });

const publicPath = process.env.PUBLIC_URL || '';
const SLIDE_TRANSITION_MS = 500;

function getPublicUrl(path) {
  const base = publicPath.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');

  return `${base}/${cleanPath}`;
}

function hydrateSlideImages(root) {
  const images = Array.from(root.querySelectorAll('img'));

  images.forEach((image) => {
    if (image.getAttribute('src')) {
      return;
    }

    const imageName = image.dataset.src || image.dataset.image || image.id;

    if (!imageName) {
      return;
    }

    const hasExtension = /\.[a-z0-9]+$/i.test(imageName);
    const fileName = hasExtension ? imageName : `${imageName}.png`;

    image.src = getPublicUrl(fileName);

    image.onerror = () => {
      const fallbackName = fileName.replaceAll('-', '_');

      if (fallbackName !== fileName) {
        image.onerror = null;
        image.src = getPublicUrl(fallbackName);
      }
    };
  });
}

function getLastStepIndex(slideIndex) {
  const stepCount = slides[slideIndex]?.steps || 1;
  return Math.max(0, stepCount - 1);
}

function App() {
  const containerRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const pendingStepIndexRef = useRef(0);

  const initialSlideIndex = getSlideIndexFromUrl(slides.length);

  const [slideIndex, setSlideIndex] = useState(initialSlideIndex);
  const [renderedSlideIndex, setRenderedSlideIndex] = useState(initialSlideIndex);
  const [stepIndex, setStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const renderedSlide = slides[renderedSlideIndex];

  const CurrentSlide = useMemo(() => {
    return renderedSlide?.Component || null;
  }, [renderedSlide]);

  const currentStepCount = renderedSlide?.steps || 1;

  useEffect(() => {
    const previousHtmlBackground = document.documentElement.style.backgroundColor;
    const previousBodyBackground = document.body.style.backgroundColor;
    const previousFontFamily = document.body.style.fontFamily;

    document.documentElement.style.backgroundColor = backgroundColor;
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.fontFamily = fontFamily;

    return () => {
      document.documentElement.style.backgroundColor = previousHtmlBackground;
      document.body.style.backgroundColor = previousBodyBackground;
      document.body.style.fontFamily = previousFontFamily;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    hydrateSlideImages(containerRef.current);
  }, [renderedSlideIndex]);

  useEffect(() => {
    if (slideIndex === renderedSlideIndex) {
      return undefined;
    }

    if (isTransitioningRef.current) {
      return undefined;
    }

    isTransitioningRef.current = true;
    setIsExiting(true);

    const timeoutId = window.setTimeout(() => {
      setRenderedSlideIndex(slideIndex);
      setStepIndex(pendingStepIndexRef.current);
      setIsExiting(false);
      isTransitioningRef.current = false;
    }, SLIDE_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeoutId);
      isTransitioningRef.current = false;
    };
  }, [slideIndex, renderedSlideIndex]);

  useUrlSlideSync({
    slideIndex,
    setSlideIndex: (nextSlideIndex) => {
      pendingStepIndexRef.current = 0;
      setSlideIndex(nextSlideIndex);
    },
    totalSlides: slides.length,
  });

  function goToSlide(nextSlideIndex, nextStepIndex = 0) {
    if (isTransitioningRef.current) {
      return;
    }

    const clampedSlideIndex = Math.max(
      0,
      Math.min(nextSlideIndex, slides.length - 1)
    );

    const clampedStepIndex = Math.max(
      0,
      Math.min(nextStepIndex, getLastStepIndex(clampedSlideIndex))
    );

    if (clampedSlideIndex === slideIndex) {
      setStepIndex(clampedStepIndex);
      return;
    }

    pendingStepIndexRef.current = clampedStepIndex;
    setSlideIndex(clampedSlideIndex);
  }

  function goNext() {
    if (isTransitioningRef.current) {
      return;
    }

    if (stepIndex < currentStepCount - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    goToSlide(slideIndex + 1, 0);
  }

  function goPrevious() {
    if (isTransitioningRef.current) {
      return;
    }

    if (stepIndex > 0) {
      setStepIndex((current) => current - 1);
      return;
    }

    const previousSlideIndex = slideIndex - 1;

    if (previousSlideIndex < 0) {
      return;
    }

    goToSlide(previousSlideIndex, getLastStepIndex(previousSlideIndex));
  }

  function goNextSlide() {
    goToSlide(slideIndex + 1, 0);
  }

  function goPreviousSlide() {
    goToSlide(slideIndex - 1, 0);
  }

  usePresentationInputs({
    goNext,
    goPrevious,
    goNextSlide,
    goPreviousSlide,
  });

  return (
    <div className="App">
      <div ref={containerRef} className="slide-container">
        <div className={`slide-renderer ${isExiting ? 'is-exiting' : ''}`}>
          {CurrentSlide ? <CurrentSlide step={stepIndex} /> : null}
        </div>
      </div>

      <SharedSlideUI
        currentSlide={slideIndex + 1}
        totalSlides={slides.length}
      />
    </div>
  );
}

export default App;