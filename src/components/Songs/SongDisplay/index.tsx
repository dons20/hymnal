import React, { useEffect, useMemo } from "react";
import { Box, Container, Text, IconButton } from "@chakra-ui/react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useMainContext } from "utils/context";
import { FaHeart } from "react-icons/fa";
import { updateFavesDB } from "helpers";
import { Helmet } from "react-helmet";
import { Button } from "components";
import "./SongDisplay.scss";

type ParamTypes = {
	songID?: string;
};

function SongDisplay() {
	const history = useHistory();
	const { songID } = useParams<ParamTypes>();
	const { songs, favourites, setFavourites, dispatch } = useMainContext();
	const authorColor = useColorModeValue("#555555", "gray.300");
	const songBG = useColorModeValue("gray.50", "inherit");
	const songShadow = useColorModeValue("md", undefined);
	const modalBG = useColorModeValue("gray.100", "gray.800");
	const favActiveIconColor = useColorModeValue("var(--chakra-colors-red-500)", "var(--chakra-colors-red-300)");
	const favIconColor = useColorModeValue("var(--chakra-colors-gray-600)", "var(--chakra-colors-gray-500)");
	const favActiveIconBG = useColorModeValue("var(--chakra-colors-red-50)", "");
	const songIndex = parseInt(songID || "1", 10) - 1;
	const songToRender = songs.find(song => song.number === songIndex + 1) || null;

	useEffect(() => {
		if (songs.length > 1) dispatch!({ type: "setTitle", payload: songToRender?.title || "" });
	}, [dispatch, songs, songToRender]);

	const songBody = useMemo(
		() =>
			songs.length > 1 &&
			React.Children.toArray(
				songToRender?.verse.map((verse, i) => {
					if (i === 1 && songToRender.chorus) {
						return (
							<>
								<Box className="chorus">
									<span className="label">Chorus</span>
									{songToRender.chorus}
								</Box>
								<Box className="verse">
									<span className="label">Verse {i + 1}</span>
									{verse}
								</Box>
							</>
						);
					}

					return (
						<Box className="verse">
							<span className="label">Verse {i + 1}</span>
							{verse}
						</Box>
					);
				})
			),
		[songs, songToRender]
	);

	if (songToRender === null) return <Redirect to="songs/index" />;

	const isFavourite = favourites.includes(songToRender.number - 1);

	const toggleFavourite = (number: number) => {
		let faves = [];
		if (favourites.includes(number - 1)) {
			faves = favourites.filter(fave => fave !== number - 1);
			setFavourites(faves);
		} else {
			faves = [...favourites, number - 1];
			setFavourites(faves);
		}
		updateFavesDB(faves);
	};

	const backToIndex = () => history.push(`${process.env.PUBLIC_URL}/songs/index`);

	return (
		<Container className="container" bg={songBG} shadow={songShadow} my={4} py="1rem" px="1.5rem">
			<Helmet>
				<title>{`Hymns for All Times | ${songToRender!.title}`}</title>
			</Helmet>
			<Button onClick={backToIndex} pos="absolute" left={-5} top="10%" zIndex={100} pr={1}>
				Index
			</Button>
			<Box className="header" pos="relative" pr="5">
				<Text># {songToRender!.number}</Text>
				<Text>{songToRender!.title}</Text>
				<IconButton
					colorScheme={isFavourite ? "red" : "gray"}
					bgColor={isFavourite ? favActiveIconBG : modalBG}
					_hover={{ shadow: "md" }}
					icon={<FaHeart color={isFavourite ? favActiveIconColor : favIconColor} />}
					aria-label="Add to Favourites"
					size="lg"
					variant="outline"
					className="faveIcon"
					onClick={() => toggleFavourite(songToRender.number)}
					maxW="60px"
				/>
			</Box>
			<Box className="body">{songBody}</Box>
			{songToRender.author && (
				<Text className="footer" color={authorColor}>
					{songToRender.author}
				</Text>
			)}
		</Container>
	);
}

export default SongDisplay;
