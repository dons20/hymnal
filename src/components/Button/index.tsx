import { Button as CoreButton, ButtonProps } from "@chakra-ui/react";
import { Link, LinkProps } from "react-router-dom";

interface ButtonLink extends ButtonProps {
	as: Link;
}

type ButtonP = ButtonProps | (ButtonLink & LinkProps);

const Button = ({ children, size = "lg", colorScheme = "blue", ...rest }: ButtonP) => (
	<CoreButton size={size} colorScheme={colorScheme} {...rest}>
		{children}
	</CoreButton>
);

export default Button;
