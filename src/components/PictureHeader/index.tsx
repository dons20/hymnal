import { Heading, Box, useColorModeValue } from "@chakra-ui/react";
import { useMainContext } from "App";
import "./PictureHeader.scss";

function PictureHeader() {
	const { meta } = useMainContext();
	const headerOverlay = useColorModeValue("gray.800", "gray.800");

	return (
		<Box className="picture-header" bgColor={headerOverlay}>
			<Box className="bgImgCont">
				<Box className="hCont">
					{meta.title && <Heading className="heading">{meta.title}</Heading>}
					{meta.subtitle && <Heading className="heading">{meta.subtitle}</Heading>}
				</Box>
			</Box>
		</Box>
	);
}

export default PictureHeader;
