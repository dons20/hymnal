import { Button as CoreButton } from "@chakra-ui/react";

type ButtonP<T> = T extends React.ComponentType<infer P> | React.Component<infer P>
	? JSX.LibraryManagedAttributes<T, P>
	: never;

const Button = ({ children, size = "lg", colorScheme = "blue", ...rest }: ButtonP<typeof CoreButton>) => (
	<CoreButton size={size} colorScheme={colorScheme} {...rest}>
		{children}
	</CoreButton>
);

export default Button;
