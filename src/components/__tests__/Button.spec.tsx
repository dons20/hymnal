import { Suspense } from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter, Link } from 'react-router';
import { MantineProvider } from '@mantine/core';
import Button from '@/components/Button';

describe('#Button', () => {
  it('should render the provided children', () => {
    const Child = <p data-testid="child">This is a sample child</p>;
    render(
      <MantineProvider defaultColorScheme="light">
        <Button data-testid="button">{Child}</Button>
      </MantineProvider>
    );
    const button = screen.getByTestId('button');
    const childRendered = within(button).getByTestId('child');
    expect(childRendered).toBeInTheDocument();
  });
  it("should render an anchor element when 'Link' is passed to the 'as' prop", () => {
    render(
      <MantineProvider defaultColorScheme="light">
        <BrowserRouter>
          <Suspense fallback={<></>}>
            <Button component={Link} to="/" data-testid="button">
              Sample Button Text
            </Button>
          </Suspense>
        </BrowserRouter>
      </MantineProvider>
    );

    const button = screen.getByTestId('button');
    expect(button.nodeName).toBe('A');
    expect(button.getAttribute('href')).toBe('/');
  });
});
