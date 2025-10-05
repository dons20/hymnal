import React from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ActionIcon, Box, Container, Group, Portal, Text, Transition } from '@mantine/core';
import { renderPresentationContent } from './helpers';
import { PresentationSlide } from './presentationUtils';

interface PresentationModeProps {
  presentationMode: boolean;
  presentationSlides: PresentationSlide[];
  currentSlide: number;
  slideTransitioning: boolean;
  isDark: boolean;
  reducedMotion: boolean;
  songTitle: string;
  onClose: () => void;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onSlideClick: (index: number) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  presentationMode,
  presentationSlides,
  currentSlide,
  slideTransitioning,
  isDark,
  reducedMotion,
  songTitle,
  onClose,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onSlideClick,
}) => {
  if (!presentationMode || presentationSlides.length === 0) return null;

  const currentSlideData = presentationSlides[currentSlide];

  return (
    <>
      {/* Render regular content but hidden */}
      <div style={{ display: 'none' }}>
        <Container className="container" size="lg" my="md" py="lg" px="xl">
          <Helmet>
            <title>{`Hymns for All Times | ${songTitle}`}</title>
          </Helmet>
        </Container>
      </div>

      {/* Portal for presentation mode - rendered outside component tree */}
      <Portal>
        <Transition
          mounted={presentationMode}
          transition="fade"
          duration={reducedMotion ? 0 : 300}
        >
          {(styles) => (
            <Box
              className="presentation-mode-overlay presentation-mode"
              bg={isDark ? 'gray.9' : 'white'}
              style={{
                ...styles,
              }}
              onClick={onClick}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Close button - positioned safely at top right */}
              <ActionIcon
                className="presentation-close-button"
                variant="outline"
                size="lg"
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                ✕
              </ActionIcon>

              {/* Slide content with transition */}
              <Transition
                mounted={!slideTransitioning}
                transition="fade"
                duration={reducedMotion ? 0 : 150}
              >
                {(contentStyles) => (
                  <Box
                    className="presentation-slide-content"
                    style={{
                      ...contentStyles,
                    }}
                  >
                    <Text
                      className="presentation-slide-label"
                      size="lg"
                      fw={600}
                      mb="lg"
                      c={isDark ? 'blue.4' : 'blue.6'}
                    >
                      {currentSlideData.label}
                    </Text>
                    {renderPresentationContent(currentSlideData.content, isDark)}
                  </Box>
                )}
              </Transition>

              {/* Navigation indicators - positioned safely at bottom */}
              <Group
                className="presentation-indicators"
                style={
                  {
                    '--indicators-bg': isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    '--indicators-border': isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)',
                  } as React.CSSProperties
                }
              >
                {presentationSlides.map((_, index) => (
                  <Box
                    key={index}
                    className="presentation-indicator-dot"
                    style={
                      {
                        '--dot-color':
                          index === currentSlide
                            ? 'var(--mantine-color-blue-5)'
                            : isDark
                              ? 'var(--mantine-color-gray-5)'
                              : 'var(--mantine-color-gray-4)',
                      } as React.CSSProperties
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlideClick(index);
                    }}
                  />
                ))}
              </Group>
            </Box>
          )}
        </Transition>
      </Portal>
    </>
  );
};
