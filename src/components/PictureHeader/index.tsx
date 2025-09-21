import { Box, Title } from '@mantine/core';
import { useMainContext } from '../../utils/context';

import './PictureHeader.scss';

function PictureHeader() {
  const { meta } = useMainContext();

  return (
    <Box className="picture-header">
      <Box className="bgImgCont">
        <div className="overlay" />
        <Box className="hCont">
          {meta.title && <Title className="heading">{meta.title}</Title>}
          {meta.subtitle && <Title className="subheading">{meta.subtitle}</Title>}
        </Box>
      </Box>
    </Box>
  );
}

export default PictureHeader;
