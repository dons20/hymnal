import React from 'react';
import { Box, Text } from '@mantine/core';

/**
 * Helper function to render chorus with vocal parts and indicators
 */
export const renderChorusWithParts = (song: Song, isDark: boolean) => {
  if (!song.chorusParts || song.chorusParts.length === 0) {
    // Fallback to regular chorus rendering
    return <Text className="song-text">{song.chorus}</Text>;
  }

  return (
    <Box className="chorus-parts">
      {song.chorusParts.map((part, index) => (
        <Box
          key={index}
          className="chorus-part"
          style={{ position: 'relative', marginBottom: '0.5rem' }}
        >
          {part.part && (
            <Text
              component="span"
              className="part-indicator-regular"
              style={
                {
                  '--part-indicator-color':
                    part.part === 'soprano'
                      ? isDark
                        ? '#74c0fc'
                        : '#1c7ed6' // Blue for soprano
                      : isDark
                        ? '#ffec99'
                        : '#fd7e14', // Orange for baritone
                  '--part-indicator-bg':
                    part.part === 'soprano'
                      ? isDark
                        ? 'rgba(116, 192, 252, 0.15)'
                        : 'rgba(28, 126, 214, 0.08)'
                      : isDark
                        ? 'rgba(255, 236, 153, 0.15)'
                        : 'rgba(253, 126, 20, 0.08)',
                  '--part-indicator-border':
                    part.part === 'soprano'
                      ? isDark
                        ? 'rgba(116, 192, 252, 0.3)'
                        : 'rgba(28, 126, 214, 0.25)'
                      : isDark
                        ? 'rgba(255, 236, 153, 0.3)'
                        : 'rgba(253, 126, 20, 0.25)',
                } as React.CSSProperties
              }
            >
              {part.part === 'soprano' ? 'A' : part.part === 'baritone' ? 'B' : '♪'}
            </Text>
          )}
          <Text
            className="song-text"
            style={
              {
                paddingLeft: part.part ? '0' : '0',
                fontWeight: part.part === 'soprano' ? 500 : 400,
                '--part-text-color':
                  part.part === 'soprano'
                    ? isDark
                      ? '#e9ecef'
                      : '#212529' // Standard text color for soprano
                    : isDark
                      ? '#ced4da'
                      : '#495057', // Slightly muted for baritone
                color: 'var(--part-text-color)',
              } as React.CSSProperties
            }
          >
            {part.text}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

/**
 * Helper function to render presentation slide content (verses or chorus with vocal parts)
 */
export const renderPresentationContent = (content: string | VocalPart[], isDark: boolean) => {
  if (typeof content === 'string') {
    return <Text className="presentation-text">{content}</Text>;
  }

  // Handle VocalPart[] for presentation mode with larger styling
  return (
    <Box className="presentation-content-container">
      {content.map((part, index) => {
        // Check if this is the end of a B part followed by an A part (new pair starting)
        const isEndOfPair =
          part.part === 'baritone' &&
          index < content.length - 1 &&
          content[index + 1]?.part === 'soprano';

        return (
          <React.Fragment key={index}>
            <Box
              className="presentation-part-container"
              style={{
                marginBottom: isEndOfPair ? '2rem' : '1.5rem',
              }}
            >
              {part.part && (
                <Text
                  component="span"
                  className="part-indicator-presentation"
                  style={
                    {
                      '--part-indicator-color':
                        part.part === 'soprano'
                          ? isDark
                            ? '#74c0fc'
                            : '#1c7ed6' // Blue for soprano
                          : isDark
                            ? '#ffec99'
                            : '#fd7e14', // Orange for baritone
                      '--part-indicator-bg':
                        part.part === 'soprano'
                          ? isDark
                            ? 'rgba(116, 192, 252, 0.15)'
                            : 'rgba(28, 126, 214, 0.08)'
                          : isDark
                            ? 'rgba(255, 236, 153, 0.15)'
                            : 'rgba(253, 126, 20, 0.08)',
                      '--part-indicator-border':
                        part.part === 'soprano'
                          ? isDark
                            ? 'rgba(116, 192, 252, 0.3)'
                            : 'rgba(28, 126, 214, 0.25)'
                          : isDark
                            ? 'rgba(255, 236, 153, 0.3)'
                            : 'rgba(253, 126, 20, 0.25)',
                    } as React.CSSProperties
                  }
                >
                  {part.part === 'soprano' ? 'A' : part.part === 'baritone' ? 'B' : '♪'}
                </Text>
              )}
              <Text
                className="presentation-part-text"
                style={
                  {
                    fontWeight: part.part === 'soprano' ? 600 : 400,
                    '--part-text-color':
                      part.part === 'soprano'
                        ? isDark
                          ? '#e9ecef'
                          : '#212529' // Standard text color for soprano
                        : isDark
                          ? '#ced4da'
                          : '#495057', // Slightly muted for baritone
                  } as React.CSSProperties
                }
              >
                {part.text}
              </Text>
            </Box>
            {isEndOfPair && (
              <Box
                className="pair-divider"
                style={
                  {
                    '--divider-color': isDark
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.15)',
                  } as React.CSSProperties
                }
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};
