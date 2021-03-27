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
	SimpleGrid,
	Grid,
} from "@chakra-ui/react";
import "./SongList.scss";

enum FILTER_TYPES {
	FAVE = "Favourites",
	ALPHA = "Alphabetically",
	NUM = "Numerically",
}

type MenuOptionsFnT = [string[], number[][]];

type FilterSongT =
	| { type: "numbers"; value: number }
	| { type: "range"; value: number[] }
	| { type: "letters"; value: string }
	| { type: "toggle"; value: "letter" | "range" };

type FilterT = FILTER_TYPES.FAVE | FILTER_TYPES.ALPHA | FILTER_TYPES.NUM;
// type GetAttrT = { parentNode: { currentTarget: { getAttribute: (arg0: string) => String } } };

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
	const [filterRangeProps, setFilterRangeProps] = useState(DEFAULT_FILTER_PROPS);
	const [finalList, setFinalList] = useState<Song[]>(
		sortList(sortAlphaProps.enabled, sortNumberProps.sortDescending, songs, true)
	); // Contains a copy of songs from the context

	/** Virtualized list props */
	const wrapperRef = useRef<HTMLDivElement>(null);

	/** Handles Filter Drawer display */
	const { isOpen, onOpen, onToggle } = useDisclosure();
	const modalBG = useColorModeValue("gray.100", "gray.800");
	const modalColors = useColorModeValue("gray.800", "gray.100");

	/** Triggers navigation to a song at a specified index */
	const memoDisplaySong = useCallback(
		e => {
			function displaySong(e: React.MouseEvent<HTMLDivElement>) {
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
			const nextLetter = songsCopy[i].title.match("[a-zA-Z]")?.[0];
			if (nextLetter) characters.push(nextLetter);
			numbers.push(songsCopy[i].number);
		}
		return { letters: String.prototype.concat(...new Set(characters)), numbers: numbers };
	}, [songs]);

	const generateMenuOptions = useCallback((): MenuOptionsFnT => {
		const menuValues = createMenu();
		let letters = menuValues.letters.split("").sort();
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

	/**
	 * Filters list of songs by criteria
	 * Kinda difficult to read
	 * TODO: Write tests covering all use cases
	 * Maybe improve readability
	 */
	function filterSongs(props: FilterSongT) {
		let filteredList: Song[] | undefined;
		if (props.type === "numbers") {
			if (!filterRangeProps.enabled) return;
			setFilterRangeProps(_props => ({ ..._props, currValue: props.value.toString() }));
			filteredList = songs!.filter(song => song.number === props.value);
			if (filterLetterProps.enabled) filteredList = filterByLetter(filteredList, filterLetterProps.currValue);
		} else if (props.type === "range") {
			if (!filterRangeProps.enabled) return;
			setFilterRangeProps(_props => ({ ..._props, currValue: props.value.toString() }));
			filteredList = songs!.filter(song => song.number >= props.value[0] && song.number <= props.value[1]);
			if (filterLetterProps.enabled) filteredList = filterByLetter(filteredList, filterLetterProps.currValue);
		} else if (props.type === "letters") {
			if (!filterLetterProps.enabled) return;
			setFilterLetterProps(_props => ({ ..._props, currValue: props.value.toString() }));
			filteredList = filterByLetter(songs!, props.value);
			if (filterRangeProps.enabled) filteredList = filterByRange(filteredList, filterRangeProps.currValue);
		} else if (props.type === "toggle") {
			if (props.value === "letter") {
				// Checks for outgoing value (it will be disabled after this function is complete)
				if (filterLetterProps.enabled) {
					filteredList = songs!;
					if (filterRangeProps.enabled)
						filteredList = filterByRange(filteredList, filterRangeProps.currValue);
				} else if (filterLetterProps.currValue) {
					filteredList = filterByLetter(songs!, filterLetterProps.currValue);
					if (filterRangeProps.enabled) {
						filteredList = filterByRange(filteredList, filterRangeProps.currValue);
					}
				}
				setFilterLetterProps(props => ({ ...props, enabled: !props.enabled }));
			} else {
				if (filterRangeProps.enabled) {
					filteredList = songs!;
					if (filterLetterProps.enabled)
						filteredList = filterByLetter(filteredList, filterLetterProps.currValue);
				} else if (filterRangeProps.currValue) {
					// Handle cases of dual filters enabled
					filteredList = filterByRange(songs!, filterRangeProps.currValue);
					if (filterLetterProps.enabled)
						filteredList = filterByLetter(filteredList, filterLetterProps.currValue);
				}
				setFilterRangeProps(props => ({ ...props, enabled: !props.enabled }));
			}
		}

		const isAlphabetical = sortAlphaProps.enabled;
		const sortDescending = isAlphabetical ? sortAlphaProps.sortDescending : sortNumberProps.sortDescending;
		sortList(sortAlphaProps.enabled, sortDescending, filteredList);
	}

	function filterByLetter(sourceArray: Song[], matchValue: string | null) {
		if (!matchValue) return sourceArray;
		return sourceArray.filter(song => {
			const firstValidChar = song.title.match("[a-zA-Z]");
			return firstValidChar?.toString() === matchValue;
		});
	}
	function filterByRange(sourceArray: Song[], matchValue?: string | null) {
		if (!matchValue) return sourceArray;
		const [arg1, arg2] = matchValue.split(",");
		return sourceArray.filter(song => song.number >= parseInt(arg1) && song.number <= parseInt(arg2));
	}

	/** [ASC/DESC] Handles list filter directional changes */
	function handleSortChange(value: string | number, filterType: FilterT) {
		const sortDescending = value === "Descending";

		if (filterType === FILTER_TYPES.NUM) {
			setSortNumberProps(props => ({ ...props, sortDescending }));
			if (sortNumberProps.enabled) handleSortToggle(filterType, sortDescending);
		}

		if (filterType === FILTER_TYPES.ALPHA) {
			setSortAlphaProps(props => ({ ...props, sortDescending }));
			if (sortAlphaProps.enabled) handleSortToggle(filterType, sortDescending);
		}
	}

	/** [Enable Options] Handles list filter features enable / disable */
	function handleSortToggle(filterType: FilterT, sortDesc?: boolean) {
		if (filterType !== FILTER_TYPES.FAVE) {
			const sortAlphabetical = filterType === FILTER_TYPES.ALPHA;
			let sortDescending: boolean;
			if (sortDesc !== undefined) sortDescending = sortDesc;
			else sortDescending = sortAlphabetical ? sortAlphaProps.sortDescending : sortNumberProps.sortDescending;

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

		if (sortAlphabetically) {
			if (!sortDescending)
				newArray.sort((a, b) => {
					const firstCharMatch = a.title.match("[a-zA-Z]")?.index;
					const aSubstr = a.title.substr(firstCharMatch || 0);
					const secondCharMatch = b.title.match("[a-zA-Z]")?.index;
					const bSubstr = b.title.substr(secondCharMatch || 0);
					return aSubstr.localeCompare(bSubstr);
				});
			else
				newArray.sort((a, b) => {
					const firstCharMatch = a.title.match("[a-zA-Z]")?.index;
					const aSubstr = a.title.substr(firstCharMatch || 0);
					const secondCharMatch = b.title.match("[a-zA-Z]")?.index;
					const bSubstr = b.title.substr(secondCharMatch || 0);
					return bSubstr.localeCompare(aSubstr);
				});
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
				{values.map(number => {
					const displayValue = `${number.start} - ${number.end}`;
					const checkValue = [[number.start], [number.end]].toString();
					return (
						<Button
							key={number.start}
							onClick={number.callback}
							size="sm"
							disabled={!filterRangeProps.enabled}
							border={filterRangeProps.currValue === checkValue ? "3px solid" : undefined}
							borderColor="yellow.300"
						>
							{displayValue}
						</Button>
					);
				})}
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
						border={filterLetterProps.currValue === letter.value ? "3px solid" : undefined}
						borderColor="yellow.300"
					>
						{letter.value}
					</Button>
				))}
			</>
		);
	};

	/** Renders a single cell */
	const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
		const maxColumns = 2;
		const itemWidth = 700;
		const columnCount = Math.min(Math.max(Math.ceil(window.innerWidth / itemWidth), 1), maxColumns);
		const itemIndex = rowIndex * columnCount + columnIndex;
		if (itemIndex >= finalList.length) return null;
		return (
			<Box
				key={data[itemIndex].number}
				style={style}
				py={1}
				pl={3}
				alignItems="center"
				textAlign="left"
				userSelect="none"
				ml={itemIndex % 2 ? 1 : 0}
			>
				<Grid
					className="listItem"
					margin="auto"
					py={0}
					bg={modalBG}
					onClick={memoDisplaySong}
					templateColumns="80px 1fr"
					shadow="md"
					borderRadius="md"
					data-song-id={data[itemIndex].number}
				>
					<Text className="listNumber">#{data[itemIndex].number}</Text>
					<Text className="listTitle">{data[itemIndex].title}</Text>
				</Grid>
			</Box>
		);
	};

	const FilterMenu = () => (
		<VStack pl={5} spacing={6}>
			<RadioGroup
				name="sorting-type"
				value={sortAlphaProps.enabled ? FILTER_TYPES.ALPHA : FILTER_TYPES.NUM}
				onChange={nextValue => handleSortToggle(nextValue as FILTER_TYPES)}
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
								onChange={nextValue => handleSortChange(nextValue, FILTER_TYPES.ALPHA)}
							>
								<Stack>
									<Radio value="Ascending" disabled={!sortAlphaProps.enabled}>
										Ascending <SortAlphaDownIcon />
									</Radio>
									<Radio value="Descending" disabled={!sortAlphaProps.enabled}>
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
								onChange={value => handleSortChange(value, FILTER_TYPES.NUM)}
							>
								<Stack>
									<Radio value="Ascending" disabled={!sortNumberProps.enabled}>
										Ascending <SortNumericDownIcon />
									</Radio>
									<Radio value="Descending" disabled={!sortNumberProps.enabled}>
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
							onChange={() => filterSongs({ type: "toggle", value: "letter" })}
						>
							Enable
						</Checkbox>
						<SimpleGrid minChildWidth="30px" spacing="10px">
							<LetterItems />
						</SimpleGrid>
					</Stack>
				</Box>
			</Box>
			<Box w="100%">
				<Heading fontSize="lg">Filter By Range</Heading>
				<Box mt={4}>
					<Stack>
						<Checkbox
							defaultChecked={filterRangeProps.enabled}
							onChange={() => filterSongs({ type: "toggle", value: "range" })}
						>
							Enable
						</Checkbox>
						<SimpleGrid minChildWidth="60px" spacing="10px">
							<NumberItems />
						</SimpleGrid>
					</Stack>
				</Box>
			</Box>
			<Box w="100%">
				<Heading fontSize="lg">Favourites</Heading>
				<Box mt={4}>
					<Checkbox value="Favourites" onChange={() => handleSortToggle(FILTER_TYPES.FAVE)} disabled>
						Only favourites
					</Checkbox>
				</Box>
			</Box>
		</VStack>
	);

	return (
		<>
			<Helmet>
				<title>{`Hymns for All Times| ${meta.title}`}</title>
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
					overflowY="auto"
					zIndex={100}
				>
					<Box p={5} shadow="md" borderWidth="1px" bg="blue.500" w="100%" color="white">
						<Flex justifyContent="space-between">
							<Heading fontSize={28}>Filters</Heading>
							<CloseButton onClick={onToggle} />
						</Flex>
					</Box>
					<Box pr={5} color={modalColors} w="100%">
						<FilterMenu />
					</Box>
				</VStack>
			</Slide>

			<Box ref={wrapperRef} pos="relative" overflow="hidden" h="100%">
				<AutoSizer>
					{({ height, width }) => {
						const maxColumns = 2;
						const itemWidth = 700;
						const columnCount = Math.min(Math.max(Math.ceil(width / itemWidth), 1), maxColumns);
						return (
							<FixedSizeGrid
								height={height}
								width={width}
								rowHeight={90}
								columnWidth={width / columnCount}
								columnCount={columnCount}
								rowCount={Math.ceil(finalList.length / columnCount)}
								itemData={finalList}
								style={{ overflowX: "hidden" }}
							>
								{Cell}
							</FixedSizeGrid>
						);
					}}
				</AutoSizer>
			</Box>
		</>
	);
}

export default SongList;
