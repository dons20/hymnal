import React from 'react';

export interface PresentationSlide {
  type: string;
  content: string | VocalPart[];
  label: string;
}

/**
 * Creates presentation slides in the correct order (V1 -> C -> V2 -> C -> V3 -> C)
 */
export const createPresentationSlides = (song: Song | null): PresentationSlide[] => {
  if (!song) return [];

  const slides: PresentationSlide[] = [];
  const hasChorus = Boolean(song.chorus);

  song.verse.forEach((verse: string, index: number) => {
    slides.push({
      type: 'verse',
      content: verse,
      label: `Verse ${index + 1}`,
    });

    // Add chorus after each verse
    if (hasChorus) {
      slides.push({
        type: 'chorus',
        content:
          song.chorusParts && song.chorusParts.length > 0 ? song.chorusParts : song.chorus,
        label: 'Chorus',
      });
    }
  });

  return slides;
};

/**
 * Touch event handler for swipe start
 */
export const createTouchStartHandler = (
  setTouchEnd: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>,
  setTouchStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>
) => {
  return (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };
};

/**
 * Touch event handler for swipe move
 */
export const createTouchMoveHandler = (
  setTouchEnd: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>
) => {
  return (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };
};

/**
 * Touch event handler for swipe end with navigation callbacks
 */
export const createTouchEndHandler = (
  touchStart: { x: number; y: number } | null,
  touchEnd: { x: number; y: number } | null,
  nextSlide: () => void,
  previousSlide: () => void,
  minSwipeDistance: number = 50
) => {
  return () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }
  };
};

/**
 * Click handler for directional navigation in presentation mode
 */
export const createPresentationClickHandler = (
  nextSlide: () => void,
  previousSlide: () => void
) => {
  return (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const leftAreaEnd = width * 0.25;

    if (x < leftAreaEnd) {
      previousSlide();
    } else {
      nextSlide();
    }
  };
};
