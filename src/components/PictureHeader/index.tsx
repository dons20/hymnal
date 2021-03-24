import React, { useContext, useRef } from "react";
import { Heading, Box } from "@chakra-ui/react";
import { MainContext } from "App";
import "./PictureHeader.scss";

const imgPath = process.env.PUBLIC_URL + "/rainbow/";

function PictureHeader() {
	const { meta } = useContext(MainContext);
	const img = useRef<HTMLImageElement | null>(null);
	const src = useRef("");

	function update(target: HTMLImageElement) {
		img.current = target;
		let thisSrc = img.current.getAttribute("src") || "";
		if (src.current !== thisSrc) {
			src.current = thisSrc;
			img.current.parentElement!.style.backgroundImage = `url("${src.current}")`;
		}
	}

	return (
		<Box className="picture-header">
			<Box className="bgImgCont">
				<img
					sizes="(max-width: 1400px) 100vw, 1400px"
					srcSet={`
                        ${imgPath}rainbow_rg388g_c_scale,w_200.jpg 200w,
                        ${imgPath}rainbow_rg388g_c_scale,w_554.jpg 554w,
                        ${imgPath}rainbow_rg388g_c_scale,w_807.jpg 807w,
                        ${imgPath}rainbow_rg388g_c_scale,w_999.jpg 999w,
                        ${imgPath}rainbow_rg388g_c_scale,w_1177.jpg 1177w,
                        ${imgPath}rainbow_rg388g_c_scale,w_1324.jpg 1324w,
                        ${imgPath}rainbow_rg388g_c_scale,w_1400.jpg 1400w
                    `}
					src={`${imgPath}rainbow_rg388g_c_scale,w_1400.jpg`}
					alt="Rainbow Background"
					className="bgImg"
					onLoad={e => update(e.target as HTMLImageElement)}
				/>
				<Box className="hCont">
					{meta!.title && <Heading className="heading">{meta!.title}</Heading>}
					{meta!.subtitle && <Heading className="heading">{meta!.subtitle}</Heading>}
				</Box>
			</Box>
		</Box>
	);
}

export default PictureHeader;
