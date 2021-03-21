import { useContext, useEffect, Fragment, useMemo } from "react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Text } from "@chakra-ui/layout";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { MainContext } from "App";
import "./SongDisplay.scss";

type ParamTypes = {
	songID?: string;
};

function SongDisplay() {
	const { songs, dispatch } = useContext(MainContext);
	const { songID } = useParams<ParamTypes>();
	const authorColor = useColorModeValue("#555555", "gray.300");

	const songIndex = parseInt(songID || "1") - 1;
	const songBody = useMemo(() => {
		return (
			songs!.length > 1 &&
			songs![songIndex].verse.map((verse, i) => {
				if (i === 1 && songs![songIndex].chorus) {
					return (
						<Fragment key={i}>
							<div className="chorus">
								<span className="label">Chorus</span>
								{songs![songIndex].chorus}
							</div>
							<div className="verse">
								<span className="label">Verse {i + 1}</span>
								{verse}
							</div>
						</Fragment>
					);
				}

				return (
					<div className="verse" key={i}>
						<span className="label">Verse {i + 1}</span>
						{verse}
					</div>
				);
			})
		);
	}, [songIndex, songs]);

	useEffect(() => {
		if (songs!.length > 1) dispatch!({ type: "setTitle", payload: songs![songIndex].title });
	}, [dispatch, songs, songIndex]);

	return (
		<Box className="container">
			<Helmet>
				<title>{`Hymns | ${songs![songIndex].title}`}</title>
			</Helmet>
			<Box className="header">
				<Text># {songs![songIndex].number}</Text>
				<Text>{songs![songIndex].title}</Text>
			</Box>
			<Box className="body">{songBody}</Box>
			{songs![songIndex].author && (
				<Text className="footer" color={authorColor}>
					{songs![songIndex].author}
				</Text>
			)}
		</Box>
	);
}

export default SongDisplay;
