import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

export const renderWithRouter = (
  ui: React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>,
  { route = '/' } = {}
) => {
  window.history.pushState({}, 'Test page', route);

  return render(ui, { wrapper: BrowserRouter });
};

export default renderWithRouter;
