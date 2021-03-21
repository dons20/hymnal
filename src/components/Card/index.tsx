import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Button } from "components";

interface CardBase {
	/** A title for the card */
	title: string;
	/** A subtitle to display next to the title */
	subtitle: string;
	/** The label for the primary link */
	primaryLabel: string;
	/** A route to navigate to when clicking the primary button */
	primaryLink: string;
}

interface CardWithImage extends CardBase {
	/** The source for the card image */
	imageSrc: string;
	/** The alt text for the image (accessibility) */
	imageAlt: string;
}

interface CardWithoutImage extends CardBase {
	imageSrc?: never;
	imageAlt?: never;
}

type CardP = CardWithImage | CardWithoutImage;

const Card = ({ title, subtitle, primaryLink, primaryLabel, imageSrc, imageAlt }: CardP) => {
	const boxBG = useColorModeValue("white", "gray.600");
	const subtitleColor = useColorModeValue("gray.500", "gray.200");

	return (
		<Box className="card" bg={boxBG} p="4" shadow="md" borderRadius="sm">
			<Box d="flex" justifyContent="space-between" alignItems="center">
				<Box>{title}</Box>
				<Box color={subtitleColor} fontSize="sm" as="span">
					{subtitle}
				</Box>
			</Box>
			{imageSrc && <Image alt={imageAlt} src={imageSrc} h="100%" w="100%" marginBottom="6" />}
			<Button size="md" colorScheme="blue" as={Link} to={primaryLink}>
				{primaryLabel}
			</Button>
		</Box>
	);
};

export default Card;
