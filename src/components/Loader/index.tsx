import { Box, Loader as MantineLoader } from "@mantine/core";

const Loader = () => (
    <Box w="100%" h="100%" pos="relative" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MantineLoader color="blue" size="xl" />
    </Box>
);

export default Loader;
