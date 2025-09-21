import { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router';
import { ButtonProps, Button as MantineButton } from '@mantine/core';

interface ButtonP extends Omit<ButtonProps, 'component'> {
  children: ReactNode;
  to?: string;
  component?: typeof Link;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ children, size = 'lg', color = 'blue', to, component, ...rest }: ButtonP) => {
  if (to && component) {
    // When it's a link, remove onClick and pass to and component
    const { onClick, ...linkProps } = rest;
    return (
      <MantineButton size={size} color={color} component={component} to={to} {...linkProps}>
        {children}
      </MantineButton>
    );
  }

  // When it's a regular button
  return (
    <MantineButton size={size} color={color} {...rest}>
      {children}
    </MantineButton>
  );
};

export default Button;
