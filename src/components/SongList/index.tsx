import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { FaSortAlphaDown, FaSortAlphaDownAlt, FaSortNumericDown, FaSortNumericDownAlt } from "react-icons/fa";
import { DEFAULT_ALPHA_PROPS, DEFAULT_FILTER_PROPS, DEFAULT_NUM_PROPS } from "./defaults";
import { FixedSizeGrid, GridChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "components";
import { MainContext } from "App";
import {
	Icon,
	Box,
	Text,
	useDisclosure,
	Stack,
	Checkbox,
	RadioGroup,
	Radio,
	Heading,
	Slide,
	VStack,
	Flex,
	useColorModeValue,
	CloseButton,
	Portal,
	useMediaQuery,
} from "@chakra-ui/react";
import "./SongList.scss";

enum FILTER_TYPES {
	FAVE = "Favourites",
	ALPHA = "Alphabetically",
	NUM = "Numerically",
}

enum FILTER_DIRS {
	ASCENDING = "Ascending",
	DESCENDING = "Descending",
}

type MenuOptionsFnT = [string[], number[][]];

type FilterSongT =
	| { type: "numbers"; value: number }
	| { type: "range"; value: number[] }
	| { type: "letters"; value: string };

type FilterT = FILTER_TYPES.FAVE | FILTER_TYPES.ALPHA | FILTER_TYPES.NUM;

const meta = {
	title: "Hymns Index",
	page: "Hymns Index",
};

const SortAlphaDownIcon: typeof Icon = () => <Icon as={FaSortAlphaDown} />;
const SortAlphaUpIcon: typeof Icon = () => <Icon as={FaSortAlphaDownAlt} />;
const SortNumericDownIcon: typeof Icon = () => <Icon as={FaSortNumericDown} />;
const SortNumericUpIcon: typeof Icon = () => <Icon as={FaSortNumericDownAlt} />;

function SongList() {
	/** Core, Context, Routing */
	const history = useHistory();
	const { songs, dispatch } = useContext(MainContext);

	// TODO: Sync all filter options with local storage as preferences

	/** Local State to handle list behaviour */
	const [sortAlphaProps, setSortAlphaProps] = useState(DEFAULT_ALPHA_PROPS);
	const [sortNumberProps, setSortNumberProps] = useState(DEFAULT_NUM_PROPS);
	const [filterLetterProps, setFilterLetterProps] = useState(DEFAULT_FILTER_PROPS);
	const [filterNumberProps, setFilterNumberProps] = useState(DEFAULT_FILTER_PROPS);
	const [finalList, setFinalList] = useState<Song[]>(
		sortList(sortAlphaProps.enabled, sortNumberProps.sortDescending, songs, true)
	); // Contains a copy of songs from the context

	/** Virtualized list props */
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [dualColumns] = useMediaQuery("(min-width: 951px)");
	const numColumns = dualColumns ? 2 : 1;
	const numRows = useRef(0);

	if (numColumns === 2) numRows.current = Math.ceil(finalList.length / 2);
	else numRows.current = finalList.length;

	/** Handles Filter Drawer display */
	const { isOpen, onOpen, onToggle } = useDisclosure();
	const modalBG = useColorModeValue("gray.100", "gray.800");
	const modalColors = useColorModeValue("gray.800", "gray.100");

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

	/** Generates category labels from all available letters and numbers */
	const createMenu = useCallback(() => {
		let characters = [],
			numbers = [];
		// Ensure we're getting numbers in order for later
		let songsCopy = [...songs!].sort((a, b) => a.number - b.number);
		for (let i = 0; i < songsCopy.length; i++) {
			characters.push(songsCopy[i].title.charAt(0));
			numbers.push(songsCopy[i].number);
		}
		return { letters: String.prototype.concat(...new Set(characters)), numbers: numbers };
	}, [songs]);

	const generateMenuOptions = useCallback((): MenuOptionsFnT => {
		const menuValues = createMenu();
		let letters = menuValues.letters.replace(/\W/, "").split("").sort();
		let numbers = [];
		for (let i = 0; i < menuValues.numbers.length; i += 100) {
			numbers.push(menuValues.numbers.slice(i, i + 100));
		}

		let finalNumbers = numbers.map(n => {
			return [n[0], n[n.length - 1]];
		});

		return [letters, finalNumbers];
	}, [createMenu]);

	const [letters, numbers] = generateMenuOptions();

	const createLetters = () =>
		letters.map(letter => ({
			callback: () => filterSongs({ type: "letters", value: letter }),
			value: letter,
		}));

	const createNumbers = () =>
		numbers.map(num => ({
			callback: () => filterSongs({ type: "range", value: [num[0], num[1]] }),
			start: num[0],
			end: num[1],
		}));

	/** Filters list of songs by criteria */
	function filterSongs(props: FilterSongT) {
		let filtered: Song[] = [];
		if (props.type === "numbers") {
			if (!filterNumberProps.enabled) return;
			filtered = songs!.filter(song => song.number === props.value);
		} else if (props.type === "range") {
			if (!filterNumberProps.enabled) return;
			filtered = songs!.filter(song => song.number >= props.value[0] && song.number <= props.value[1]);
		} else if (props.type === "letters") {
			if (!filterLetterProps.enabled) return;
			filtered = songs!.filter(song => song.title.charAt(0) === props.value);
		}

		const isAlphabetical = sortAlphaProps.enabled;
		const sortDescending = isAlphabetical ? sortAlphaProps.sortDescending : sortNumberProps.sortDescending;
		sortList(sortAlphaProps.enabled, sortDescending, filtered);
	}

	/** [ASC/DESC] Handles list filter directional changes */
	function handleFilterChange(value: string | number, filterType: FilterT) {
		const sortDescending = value === "Descending";
		console.log("Filter time: ", sortDescending);

		if (filterType === FILTER_TYPES.NUM) {
			setSortNumberProps(props => ({ ...props, sortDescending }));
			if (sortNumberProps.enabled) handleFilterToggle(filterType, sortDescending);
		}

		if (filterType === FILTER_TYPES.ALPHA) {
			setSortAlphaProps(props => ({ ...props, sortDescending }));
			if (sortAlphaProps.enabled) handleFilterToggle(filterType, sortDescending);
		}
	}

	/** [Enable Options] Handles list filter features enable / disable */
	function handleFilterToggle(filterType: FilterT, sortDesc?: boolean) {
		console.log("Toggle called ", filterType, sortDesc);
		if (filterType !== FILTER_TYPES.FAVE) {
			const sortAlphabetical = filterType === FILTER_TYPES.ALPHA;
			let sortDescending: boolean;
			if (sortDesc !== undefined) sortDescending = sortDesc;
			else sortDescending = sortAlphabetical ? sortAlphaProps.sortDescending : sortNumberProps.sortDescending;

			console.log("Filter toggle values: ", sortAlphabetical, sortDescending);
			setSortNumberProps(props => ({ ...props, enabled: !sortAlphabetical }));
			setSortAlphaProps(props => ({ ...props, enabled: sortAlphabetical }));
			sortList(sortAlphabetical, sortDescending);
		} else {
			const isAlphabetical = sortAlphaProps.enabled;
			const sortDescending = isAlphabetical ? sortAlphaProps.sortDescending : sortNumberProps.sortDescending;
			sortList(sortAlphaProps.enabled, sortDescending, songs);
		}
	}

	/** Sorts the displayed list using the selected filters */
	function sortList(
		sortAlphabetically: boolean,
		sortDescending: boolean,
		sourceList?: Song[],
		initialize?: boolean
	): Song[] {
		const newArray = sourceList ? [...sourceList] : [...finalList];

		console.log(sortAlphabetically, sortDescending);

		if (sortAlphabetically) {
			if (!sortDescending) newArray.sort((a, b) => a.title.localeCompare(b.title));
			else newArray.sort((a, b) => b.title.localeCompare(a.title));
			console.log(newArray[0]);
		} else {
			if (!sortDescending) newArray.sort((a, b) => a.number - b.number);
			else newArray.sort((a, b) => b.number - a.number);
		}

		if (!initialize) setFinalList(newArray);
		// For the one time it needs to return something ...
		return newArray;
	}

	/** Sets the page title */
	useEffect(() => {
		dispatch!({ type: "setTitle", payload: meta.page });
	}, [dispatch]);

	const NumberItems = () => {
		const values = createNumbers();
		return (
			<>
				{values.map(number => (
					<Button
						key={number.start}
						onClick={number.callback}
						size="sm"
						disabled={!filterNumberProps.enabled}
					>
						{number.start} - {number.end}
					</Button>
				))}
			</>
		);
	};

	const LetterItems = () => {
		const values = createLetters();
		return (
			<>
				{values.map(letter => (
					<Button
						key={letter.value}
						onClick={letter.callback}
						size="sm"
						disabled={!filterLetterProps.enabled}
					>
						{letter.value}
					</Button>
				))}
			</>
		);
	};

	/** Renders a single cell */
	const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
		const itemIndex = rowIndex * numColumns + columnIndex;
		if (itemIndex >= finalList.length) return null;
		return (
			<Box
				key={data[itemIndex].number}
				data-song-id={data[itemIndex].number}
				onClick={memoDisplaySong}
				className="listItem"
				style={style}
				bg={modalBG}
			>
				<Text className="listNumber">#{data[itemIndex].number}</Text>
				<Text className="listTitle">{data[itemIndex].title}</Text>
			</Box>
		);
	};

	const FilterMenu = () => (
		<VStack pl={5} spacing={6}>
			<RadioGroup
				name="sorting-type"
				value={sortAlphaProps.enabled ? FILTER_TYPES.ALPHA : FILTER_TYPES.NUM}
				onChange={nextValue => handleFilterToggle(nextValue as FILTER_TYPES)}
				w="100%"
			>
				<Stack>
					<Box w="100%">
						<Heading fontSize="lg">Sort Alphabetically</Heading>
						<Box mt={4}>
							<Radio value={FILTER_TYPES.ALPHA} name="sorting-type">
								Enable
							</Radio>
							<RadioGroup
								name="sort-alpha"
								value={sortAlphaProps.sortDescending ? "Descending" : "Ascending"}
								onChange={nextValue => handleFilterChange(nextValue, FILTER_TYPES.ALPHA)}
							>
								<Stack>
									<Radio value="Ascending">
										Ascending <SortAlphaDownIcon />
									</Radio>
									<Radio value="Descending">
										Descending <SortAlphaUpIcon />
									</Radio>
								</Stack>
							</RadioGroup>
						</Box>
					</Box>
					<Box w="100%">
						<Heading fontSize="lg">Sort Numerically</Heading>
						<Box mt={4}>
							<Radio value={FILTER_TYPES.NUM} name="sorting-type">
								Enable
							</Radio>
							<RadioGroup
								name="sort-numeric"
								value={sortNumberProps.sortDescending ? "Descending" : "Ascending"}
								onChange={value => handleFilterChange(value, FILTER_TYPES.NUM)}
							>
								<Stack>
									<Radio value="Ascending">
										Ascending <SortNumericDownIcon />
									</Radio>
									<Radio value="Descending">
										Descending <SortNumericUpIcon />
									</Radio>
								</Stack>
							</RadioGroup>
						</Box>
					</Box>
				</Stack>
			</RadioGroup>
			<Box w="100%">
				<Heading fontSize="lg">Filter By Letter</Heading>
				<Box mt={4}>
					<Stack>
						<Checkbox
							defaultChecked={filterLetterProps.enabled}
							onChange={() => setFilterLetterProps(props => ({ ...props, enabled: !props.enabled }))}
						>
							Enable
						</Checkbox>
						<Flex flexWrap="wrap">
							<Stack>
								<LetterItems />
							</Stack>
						</Flex>
					</Stack>
				</Box>
			</Box>
			<Box w="100%">
				<Heading fontSize="lg">Filter By Range</Heading>
				<Box mt={4}>
					<Stack>
						<Checkbox
							defaultChecked={filterNumberProps.enabled}
							onChange={() => setFilterNumberProps(props => ({ ...props, enabled: !props.enabled }))}
						>
							Enable
						</Checkbox>
						<Flex flexWrap="wrap">
							<Stack>
								<NumberItems />
							</Stack>
						</Flex>
					</Stack>
				</Box>
			</Box>
			<Box w="100%">
				<Heading fontSize="lg">Favourites</Heading>
				<Box mt={4}>
					<Checkbox value="Favourites" onChange={() => handleFilterToggle(FILTER_TYPES.FAVE)} disabled>
						Only favourites
					</Checkbox>
				</Box>
			</Box>
		</VStack>
	);

	return (
		<>
			<Helmet>
				<title>{`Hymns | ${meta.title}`}</title>
			</Helmet>

			<Button onClick={onOpen} pos="absolute" right={-5} top="12%" zIndex={95}>
				Filter
			</Button>

			<Slide direction="right" in={isOpen} style={{ height: "100vh", width: "300px", zIndex: 100 }}>
				<Portal appendToParentPortal={false}>
					{isOpen && (
						<Box
							background="rgba(0,0,0,0.5)"
							w="100%"
							h="100%"
							pos="absolute"
							left={0}
							top={0}
							onClick={onToggle}
							zIndex={99}
						/>
					)}
				</Portal>

				<VStack
					color={modalColors}
					bg={modalBG}
					rounded="md"
					h="100vh"
					w="300px"
					right={0}
					pos="absolute"
					overflowY="scroll"
					zIndex={100}
				>
					<Box p={5} shadow="md" borderWidth="1px" bg="blue.500" w="100%" color="white">
						<Flex justifyContent="space-between">
							<Heading fontSize={28}>Filters</Heading>
							<CloseButton onClick={onToggle} />
						</Flex>
						<Text fontSize="sm">Last updated: March 24, 2021</Text>
					</Box>
					<Box color={modalColors} w="100%">
						<FilterMenu />
					</Box>
				</VStack>
			</Slide>

			<Box ref={wrapperRef} pos="relative" overflow="hidden">
				<AutoSizer>
					{({ height, width }) => (
						<FixedSizeGrid
							height={height}
							width={width}
							rowHeight={100}
							columnWidth={window.innerWidth > 950 ? width / 2 - 8 : width - 8}
							columnCount={numColumns}
							rowCount={numRows.current}
							itemData={finalList}
							style={{ overflowX: "hidden" }}
						>
							{Cell}
						</FixedSizeGrid>
					)}
				</AutoSizer>
			</Box>
		</>
	);
}

export default SongList;
