import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { FaSortAlphaDown, FaSortAlphaDownAlt, FaSortNumericDown, FaSortNumericDownAlt } from "react-icons/fa";
import { FixedSizeGrid, GridChildComponentProps } from "react-window";
import { DEFAULT_ALPHA_PROPS, DEFAULT_NUM_PROPS } from "./defaults";
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
	const [finalList, setFinalList] = useState([...songs!]); // Contains a copy of songs from the context
	const [filterAlphaProps, setFilterAlphaProps] = useState(DEFAULT_ALPHA_PROPS);
	const [filterNumberProps, setFilterNumberProps] = useState(DEFAULT_NUM_PROPS);
	// const [numbers, setNumbers] = useState<NumberP[]>([]); // An array of available song number categories
	// const [letters, setLetters] = useState<LetterP[]>([]); // An array of available song letter categories

	/** Virtualized list props */
	const wrapperRef = useRef<HTMLDivElement>(null);
	const numColumns = useRef(window.innerWidth > 950 ? 2 : 1);
	const numRows = useRef(0);

	if (numColumns.current === 2) numRows.current = finalList.length / 2;
	else numRows.current = finalList.length;

	/** Handles Filter Drawer display */
	const { isOpen, onOpen, onToggle } = useDisclosure();
	const modalBG = useColorModeValue("white", "gray.800");
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
		for (let i = 0; i < finalList.length; i++) {
			characters.push(finalList[i].title.charAt(0));
			numbers.push(finalList[i].number);
		}
		return { letters: String.prototype.concat(...new Set(characters)), numbers: numbers };
	}, [finalList]);

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
			filtered = songs!.filter(song => song.number === props.value);
		} else if (props.type === "range") {
			filtered = songs!.filter(song => song.number >= props.value[0] && song.number <= props.value[1]);
		} else if (props.type === "letters") {
			filtered = songs!.filter(song => song.title.charAt(0) === props.value);
		}

		const isAlphabetical = filterAlphaProps.enabled;
		const sortDescending = isAlphabetical ? filterAlphaProps.sortDescending : filterNumberProps.sortDescending;
		sortList(filterAlphaProps.enabled, sortDescending, filtered);
	}

	/** [Radio Buttons] Handles list filter directional changes */
	function handleFilterChange(value: string | number, filterType: FilterT) {
		const sortDescending = value === "Descending";

		if (filterType === FILTER_TYPES.NUM) {
			setFilterNumberProps(props => ({ ...props, sortDescending: sortDescending }));
			if (filterNumberProps.enabled) handleFilterToggle(filterType);
		}

		if (filterType === FILTER_TYPES.ALPHA) {
			setFilterAlphaProps(props => ({ ...props, sortDescending: sortDescending }));
			if (filterAlphaProps.enabled) handleFilterToggle(filterType);
		}
	}

	/** [Checkboxes] Handles list filter features enable / disable */
	function handleFilterToggle(filterType: FilterT) {
		console.log("Toggle called ", filterType);
		if (filterType !== FILTER_TYPES.FAVE) {
			const sortAlphabetical = filterType === FILTER_TYPES.ALPHA;
			const sortDescending = sortAlphabetical
				? filterAlphaProps.sortDescending
				: filterNumberProps.sortDescending;

			console.log(sortDescending);
			setFilterNumberProps(props => ({ ...props, enabled: !sortAlphabetical }));
			setFilterAlphaProps(props => ({ ...props, enabled: sortAlphabetical }));
			sortList(sortAlphabetical, sortDescending);
		} else {
			const isAlphabetical = filterAlphaProps.enabled;
			const sortDescending = isAlphabetical ? filterAlphaProps.sortDescending : filterNumberProps.sortDescending;
			sortList(filterAlphaProps.enabled, sortDescending, songs);
		}
	}

	/** Sorts the displayed list using the selected filters */
	function sortList(sortAlphabetically: boolean, sortDescending: boolean, sourceList?: Song[]) {
		const newArray = sourceList ? [...sourceList] : [...finalList];

		if (sortAlphabetically) {
			if (sortDescending) newArray.sort((a, b) => a.title.localeCompare(b.title));
			else newArray.sort((a, b) => b.title.localeCompare(a.title));
		} else {
			if (sortDescending) newArray.sort((a, b) => b.number - a.number);
			else newArray.sort((a, b) => a.number - b.number);
		}

		setFinalList(newArray);
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
					<Radio value={number.start} key={number.start}>
						{number.start} - {number.end}
					</Radio>
				))}
			</>
		);
	};

	const LetterItems = () => {
		const values = createLetters();
		return (
			<>
				{values.map(letter => (
					<Radio value={letter.value} key={letter.value}>
						{letter.value}
					</Radio>
				))}
			</>
		);
	};

	/** Renders a single cell */
	const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
		const itemIndex = rowIndex * numColumns.current + columnIndex;

		return (
			<Box
				key={data[itemIndex].number}
				data-song-id={data[itemIndex].number}
				onClick={memoDisplaySong}
				className="listItem"
				style={style}
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
				value={filterAlphaProps.enabled ? FILTER_TYPES.ALPHA : FILTER_TYPES.NUM}
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
								value={filterAlphaProps.sortDescending ? "Descending" : "Ascending"}
								onChange={nextValue => handleFilterChange(nextValue, FILTER_TYPES.ALPHA)}
							>
								<Stack>
									<Radio value="Ascending">
										Ascending <SortAlphaUpIcon />
									</Radio>
									<Radio value="Descending">
										Descending <SortAlphaDownIcon />
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
								value={filterNumberProps.sortDescending ? "Descending" : "Ascending"}
								onChange={value => handleFilterChange(value, FILTER_TYPES.NUM)}
							>
								<Stack>
									<Radio value="Ascending">
										Ascending <SortNumericUpIcon />
									</Radio>
									<Radio value="Descending">
										Descending <SortNumericDownIcon />
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
						<Checkbox>Enable</Checkbox>
						<RadioGroup
							name="filter-letter"
							defaultValue={FILTER_DIRS.DESCENDING}
							onChange={value => handleFilterChange(value, FILTER_TYPES.NUM)}
						>
							<Stack>
								<LetterItems />
							</Stack>
						</RadioGroup>
					</Stack>
				</Box>
			</Box>
			<Box w="100%">
				<Heading fontSize="lg">Filter By Range</Heading>
				<Box mt={4}>
					<Stack>
						<Checkbox>Enable</Checkbox>
						<RadioGroup name="filter-range" onChange={value => handleFilterChange(value, FILTER_TYPES.NUM)}>
							<Stack>
								<NumberItems />
							</Stack>
						</RadioGroup>
					</Stack>
				</Box>
			</Box>
			<Box w="100%">
				<Heading fontSize="lg">Favourites</Heading>
				<Box mt={4}>
					<Checkbox value="Favourites" onChange={() => handleFilterToggle(FILTER_TYPES.FAVE)}>
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

			<Button onClick={onOpen} pos="absolute" right={-5} top="18%" zIndex={95}>
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
						<Text fontSize="sm">Last updated: March 23, 2021</Text>
					</Box>
					<Box color={modalColors} w="100%">
						<FilterMenu />
					</Box>
				</VStack>
			</Slide>

			<Box className="list-wrapper" ref={wrapperRef}>
				<AutoSizer>
					{({ height, width }) => (
						<FixedSizeGrid
							height={height}
							width={width}
							rowHeight={100}
							columnWidth={window.innerWidth > 950 ? width / 2 - 6 : width - 6}
							columnCount={numColumns.current}
							rowCount={numRows.current}
							itemData={finalList}
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
