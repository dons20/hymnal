import { useCallback, useContext, useRef, useState } from "react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { GridChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useDebouncedCallback } from "use-debounce";
import { IconButton } from "@chakra-ui/button";
import { Box, Container, Grid, Text } from "@chakra-ui/layout";
import { FixedSizeGrid } from "react-window";
import { useHistory } from "react-router";
import { FaSearch } from "react-icons/fa";
import { useQuery } from "helpers";
import { MainContext } from "App";
import Fuse from "fuse.js";
import "./Search.scss";

function Search() {
	const history = useHistory();
	const routerQuery = useQuery();
	const { songs } = useContext(MainContext);
	const fuse = new Fuse(songs!, { keys: ["number", "title"] });
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Fuse.FuseResult<Song>[]>(
		fuse.search(routerQuery.get("query") || "")
	);
	const pageBG = useColorModeValue("gray.200", "gray.800");
	const cellBG = useColorModeValue("gray.100", "gray.700");
	const wrapperRef = useRef<HTMLDivElement>(null);
	const numRows = searchResults.length;
	const numColumns = useRef(1);

	const submitQuery = (e: React.FormEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (searchQuery.length > 0) handleSearch(searchQuery);
	};

	const searchQueryChange = (e: React.ChangeEvent<any>) => {
		const searchValue = e.target.value;
		setSearchQuery(searchValue);
		if (searchValue.length > 0) handleSearch(searchValue);
	};

	const handleSearch = useDebouncedCallback((value: string) => {
		const result = fuse.search(value);
		setSearchResults(result);
	}, 300);

	/** Triggers navigation to a song at a specified index */
	const memoDisplaySong = useCallback(
		e => {
			function displaySong(e: MouseEventInit & { currentTarget: { getAttribute: (arg0: string) => String } }) {
				const songID = e.currentTarget.getAttribute("data-song-id");
				history.push(`${process.env.PUBLIC_URL}/songs/${songID}`);
			}

			displaySong(e);
		},
		[history]
	);

	/** Renders a single cell */
	const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
		const itemIndex = rowIndex * numColumns.current + columnIndex;
		if (itemIndex >= searchResults.length) return null;
		return (
			<Box
				key={data[itemIndex].item.number}
				data-song-id={data[itemIndex].item.number}
				className="gridItemWrapper"
				style={style}
				py={5}
				pl={window.innerWidth * 0.07}
				cursor="default"
			>
				<Grid
					maxW="800px"
					margin="auto"
					p={5}
					bg={cellBG}
					onClick={memoDisplaySong}
					templateColumns="80px 1fr"
					shadow="md"
					borderRadius="md"
					className="gridItem"
				>
					<Text className="listNumber">{data[itemIndex].item.number}</Text>
					<Text className="listTitle">{data[itemIndex].item.title}</Text>
				</Grid>
			</Box>
		);
	};

	return (
		<Grid pt="10" templateRows="auto 1fr" h="100%" bg={pageBG}>
			<Container centerContent>
				<InputGroup size="lg" as="form" onSubmit={submitQuery} w="90%" mb="5">
					<Input
						value={searchQuery}
						onChange={searchQueryChange}
						type="search"
						placeholder="Search songs..."
						pr="4.5rem"
						backgroundColor={cellBG}
					/>
					<InputRightElement>
						<IconButton
							size="sm"
							h="1.75rem"
							icon={<FaSearch />}
							aria-label="Search Song Database"
							onClick={searchQueryChange}
						/>
					</InputRightElement>
				</InputGroup>
			</Container>

			<Box ref={wrapperRef} pos="relative" overflow="hidden" h="100%">
				<AutoSizer>
					{({ height, width }) => (
						<FixedSizeGrid
							height={height}
							width={width}
							rowHeight={100}
							columnWidth={width - window.innerWidth * 0.07}
							columnCount={numColumns.current}
							rowCount={numRows}
							itemData={searchResults}
							style={{ overflowX: "hidden" }}
						>
							{Cell}
						</FixedSizeGrid>
					)}
				</AutoSizer>
			</Box>
		</Grid>
	);
}

export default Search;
