import { useContext, useEffect, Fragment, useMemo } from "react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useHistory, useParams } from "react-router-dom";
import { Box, Container, Text } from "@chakra-ui/layout";
import { Helmet } from "react-helmet";
import { Button } from "components";
import { MainContext } from "App";
import "./SongDisplay.scss";

type ParamTypes = {
	songID?: string;
};

function SongDisplay() {
	const history = useHistory();
	const { songs, dispatch } = useContext(MainContext);
	const { songID } = useParams<ParamTypes>();
	const authorColor = useColorModeValue("#555555", "gray.300");
	const songBG = useColorModeValue("white", "inherit");
	const songShadow = useColorModeValue("md", undefined);
	const songIndex = parseInt(songID || "1") - 1;
	const songToRender = songs!.find(song => song.number === songIndex + 1);

	const songBody = useMemo(() => {
		return (
			songs!.length > 1 &&
			songToRender!.verse.map((verse, i) => {
				if (i === 1 && songToRender!.chorus) {
					return (
						<Fragment key={i}>
							<Box className="chorus">
								<span className="label">Chorus</span>
								{songToRender!.chorus}
							</Box>
							<Box className="verse">
								<span className="label">Verse {i + 1}</span>
								{verse}
							</Box>
						</Fragment>
					);
				}

				return (
					<Box className="verse" key={i}>
						<span className="label">Verse {i + 1}</span>
						{verse}
					</Box>
				);
			})
		);
	}, [songs, songToRender]);

	const backToIndex = () => history.push(`${process.env.PUBLIC_URL}/songs/index`);

	useEffect(() => {
		if (songs!.length > 1) dispatch!({ type: "setTitle", payload: songToRender!.title });
	}, [dispatch, songs, songToRender]);

	return (
		<Container className="container" bg={songBG} shadow={songShadow} my={4} py="1rem" px="1.5rem">
			<Helmet>
				<title>{`Hymns | ${songToRender!.title}`}</title>
			</Helmet>
			<Button onClick={backToIndex} pos="fixed" left={-5} top="18%" zIndex={100}>
				Index
			</Button>
			<Box className="header">
				<Text># {songToRender!.number}</Text>
				<Text>{songToRender!.title}</Text>
			</Box>
			<Box className="body">{songBody}</Box>
			{songToRender!.author && (
				<Text className="footer" color={authorColor}>
					{songToRender!.author}
				</Text>
			)}
		</Container>
	);
}

export default SongDisplay;
