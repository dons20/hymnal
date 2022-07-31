import React, { useEffect, useMemo } from "react";
import { FaHeart, FaArrowCircleRight, FaArrowCircleLeft, FaBook } from "react-icons/fa";
import { Box, Container, Text, IconButton, SimpleGrid, Icon } from "@chakra-ui/react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useMainContext } from "utils/context";
import { updateFavesDB } from "helpers";
import { Helmet } from "react-helmet";
import { Button } from "components";
import "./SongDisplay.scss";

type ParamTypes = {
	songID?: string;
};

function SongDisplay() {
	const navigate = useNavigate();
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

	// Ensure the route parameter is a number before rendering anything
	useEffect(() => {
		if (!/\d+/.test(songID!)) navigate(-1);
	}, [songID, navigate]);

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

	if (songToRender === null) return <Navigate to="../index" replace />;

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

	const backToIndex = () => navigate("../index");
	const previousSong = () => navigate(`../${songToRender.number - 1}`);
	const nextSong = () => navigate(`../${songToRender.number + 1}`);

	return (
		<Container
			className="container"
			maxW="container.lg"
			bg={songBG}
			shadow={songShadow}
			my={4}
			py="1rem"
			px="1.5rem"
		>
			<Helmet>
				<title>{`Hymns for All Times | ${songToRender!.title}`}</title>
			</Helmet>
			<Box className="header" pos="relative" pr="5">
				<Text># {songToRender!.number}</Text>
				<Text>{songToRender!.title}</Text>
				<Box>
					<IconButton
						colorScheme="gray"
						icon={<FaBook color={favIconColor} />}
						onClick={backToIndex}
						_hover={{ shadow: "md" }}
						bgColor={modalBG}
						aria-label="Back to songs index"
						variant="outline"
						size="lg"
						maxW="60px"
						pr={1}
						mr={5}
					/>
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
			</Box>
			<Box className="body">{songBody}</Box>
			{songToRender.author && (
				<Text className="footer" color={authorColor}>
					{songToRender.author}
				</Text>
			)}
			<SimpleGrid columns={{ sm: 2 }} justifyContent="space-around" mb={5} mt={5} spacing={5}>
				{songToRender.number > 1 && (
					<Button onClick={previousSong} flex="1">
						<Icon as={FaArrowCircleLeft} size={20} mr={3} /> Previous Song
					</Button>
				)}
				{songToRender.number < songs.length - 1 && (
					<Button onClick={nextSong} flex="1">
						Next Song <Icon as={FaArrowCircleRight} size={20} ml={3} />
					</Button>
				)}
			</SimpleGrid>
			<Button onClick={backToIndex} variant="outline">
				Back to Index
			</Button>
		</Container>
	);
}

export default SongDisplay;
