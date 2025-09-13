import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--body-font), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  headings: {
    fontFamily: 'var(--header-font), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  },
  colors: {
    blue: [
      '#e7f5ff',
      '#d0ebff', 
      '#a5d8ff',
      '#74c0fc',
      '#339af0',
      '#1c7ed6',
      '#1971c2',
      '#1864ab',
      '#145a32',
      '#1890ff'
    ],
  },
  components: {
    Container: {
      defaultProps: {
        sizes: {
          xs: 540,
          sm: 720,
          md: 960,
          lg: 1140,
          xl: 1320,
        }
      }
    }
  },
  breakpoints: {
    xs: '30em',
    sm: '48em', 
    md: '64em',
    lg: '74em',
    xl: '90em',
  },
});

export default theme;
