import { Box, CircularProgress } from "@chakra-ui/react";

const Loader = () => (
	<Box w="100%" h="100%" pos="relative" display="flex" alignItems="center" justifyContent="center">
		<CircularProgress isIndeterminate color="blue.500" />
	</Box>
);

export default Loader;
