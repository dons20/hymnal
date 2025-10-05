import { useEffect, useMemo, useState } from 'react';
import { createPresentationSlides, PresentationSlide } from './presentationUtils';

interface UsePresentationModeProps {
  song: Song | null;
  reducedMotion: boolean;
}

interface UsePresentationModeReturn {
  presentationMode: boolean;
  currentSlide: number;
  slideTransitioning: boolean;
  presentationSlides: PresentationSlide[];
  touchStart: { x: number; y: number } | null;
  touchEnd: { x: number; y: number } | null;
  setTouchStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setTouchEnd: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  togglePresentationMode: () => void;
  closePresentationMode: () => void;
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
}

/**
 * Custom hook to manage presentation mode state and navigation
 */
export const usePresentationMode = ({
  song,
  reducedMotion,
}: UsePresentationModeProps): UsePresentationModeReturn => {
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideTransitioning, setSlideTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Create presentation slides
  const presentationSlides = useMemo(() => createPresentationSlides(song), [song]);

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
    setCurrentSlide(0);
  };

  const closePresentationMode = () => {
    setPresentationMode(false);
    setCurrentSlide(0);
    setSlideTransitioning(false);
  };

  const nextSlide = () => {
    if (reducedMotion) {
      if (currentSlide < presentationSlides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        setCurrentSlide(0);
      }
    } else {
      setSlideTransitioning(true);
      setTimeout(() => {
        if (currentSlide < presentationSlides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        } else {
          setCurrentSlide(0);
        }
        setSlideTransitioning(false);
      }, 150);
    }
  };

  const previousSlide = () => {
    if (reducedMotion) {
      if (currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      } else {
        setCurrentSlide(presentationSlides.length - 1);
      }
    } else {
      setSlideTransitioning(true);
      setTimeout(() => {
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        } else {
          setCurrentSlide(presentationSlides.length - 1);
        }
        setSlideTransitioning(false);
      }, 150);
    }
  };

  const goToSlide = (index: number) => {
    if (!reducedMotion) {
      setSlideTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setSlideTransitioning(false);
      }, 150);
    } else {
      setCurrentSlide(index);
    }
  };

  // ESC key handler for presentation mode
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && presentationMode) {
        closePresentationMode();
      }
    };

    if (presentationMode) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [presentationMode]);

  // Arrow key navigation for presentation mode
  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (!presentationMode) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousSlide();
      }
    };

    if (presentationMode) {
      document.addEventListener('keydown', handleArrowKeys);
    }

    return () => {
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [presentationMode, currentSlide, presentationSlides.length, reducedMotion]);

  return {
    presentationMode,
    currentSlide,
    slideTransitioning,
    presentationSlides,
    touchStart,
    touchEnd,
    setTouchStart,
    setTouchEnd,
    togglePresentationMode,
    closePresentationMode,
    nextSlide,
    previousSlide,
    goToSlide,
  };
};
