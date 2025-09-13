import { Title, Box, useMantineColorScheme } from "@mantine/core";
import { useMainContext } from "../../utils/context";
import "./PictureHeader.scss";

function PictureHeader() {
    const { meta } = useMainContext();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Box className="picture-header" bg={isDark ? '#061a2b' : '#0d222f'}>
            <Box className="bgImgCont">
                <Box className="hCont">
                    {meta.title && <Title className="heading">{meta.title}</Title>}
                    {meta.subtitle && <Title className="heading">{meta.subtitle}</Title>}
                </Box>
            </Box>
        </Box>
    );
}

export default PictureHeader;
