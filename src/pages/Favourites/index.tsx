import { useCallback, useEffect, useRef } from "react";
import { Box, Container, Grid, Link as ChakraLink, Text } from "@chakra-ui/layout";
import { GridChildComponentProps, FixedSizeGrid } from "react-window";
import { useColorModeValue } from "@chakra-ui/color-mode";
import AutoSizer from "react-virtualized-auto-sizer";
import { useMainContext } from "utils/context";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const meta = {
	title: "Favourites",
	page: "Favourites",
};

function Favourites() {
	const history = useHistory();
	const { songs, favourites, dispatch } = useMainContext();
	const finalList = songs.filter(song => favourites.includes(song.number - 1)).sort((a, b) => a.number - b.number);
	const pageBG = useColorModeValue("gray.200", "gray.800");
	const cellBG = useColorModeValue("gray.50", "gray.700");
	const wrapperRef = useRef<HTMLDivElement>(null);
	const numRows = favourites.length;
	const numColumns = useRef(1);

	/** Triggers navigation to a song at a specified index */
	const memoDisplaySong = useCallback(
		e => {
			function displaySong(ev: React.MouseEvent<HTMLDivElement>) {
				const songID = ev.currentTarget.getAttribute("data-song-id");
				history.push(`${process.env.PUBLIC_URL}/songs/${songID}`);
			}

			displaySong(e);
		},
		[history]
	);

	/** Renders a single cell */
	const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
		const itemIndex = rowIndex * numColumns.current + columnIndex;
		if (itemIndex >= finalList.length) return null;
		return (
			<Box
				key={data[itemIndex].number}
				className="gridItemWrapper"
				style={style}
				pl={window.innerWidth * 0.07}
				cursor="default"
			>
				<Grid
					data-song-id={data[itemIndex].number}
					h={100}
					px={3}
					py={3}
					alignItems="center"
					maxW="800px"
					margin="auto"
					bg={cellBG}
					onClick={memoDisplaySong}
					templateColumns="80px 1fr"
					shadow="md"
					borderRadius="md"
					cursor="pointer"
					transition="transform 0.1s ease-in-out"
					willChange="transform"
					_hover={{ transform: "translateY(-2px)" }}
				>
					<Text className="listNumber"># {data[itemIndex].number}</Text>
					<Text className="listTitle">{data[itemIndex].title}</Text>
				</Grid>
			</Box>
		);
	};

	const EmptyListRender = () => (
		<Container centerContent>
			<Text>Sorry, it seems you haven&apos;t added any favourites yet!</Text>
			<ChakraLink as={Link} to="/songs/index" color="blue.500">
				Browse Songs Index
			</ChakraLink>
		</Container>
	);

	useEffect(() => {
		dispatch({ type: "setTitle", payload: meta.title });
	}, [dispatch]);

	return (
		<>
			<Helmet>
				<title>{`Hymns for All Times | ${meta.page}`}</title>
			</Helmet>
			<Grid pt={5} templateRows="1fr" h="100%" bg={pageBG}>
				{finalList.length === 0 && <EmptyListRender />}
				<Box ref={wrapperRef} pos="relative" overflow="hidden" h="100%">
					<AutoSizer>
						{({ height, width }) => (
							<FixedSizeGrid
								height={height}
								width={width}
								rowHeight={120}
								columnWidth={width - window.innerWidth * 0.07}
								columnCount={numColumns.current}
								rowCount={numRows}
								itemData={finalList}
								style={{ overflowX: "hidden" }}
							>
								{Cell}
							</FixedSizeGrid>
						)}
					</AutoSizer>
				</Box>
			</Grid>
		</>
	);
}

export default Favourites;
