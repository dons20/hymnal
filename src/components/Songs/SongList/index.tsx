import { useState, useEffect, useCallback, useRef, lazy } from "react";
import { FaHeart, FaSortAlphaDown, FaSortAlphaDownAlt, FaSortNumericDown, FaSortNumericDownAlt } from "react-icons/fa";
import { useDisclosure, RadioGroup, useColorModeValue, Box } from "@chakra-ui/react";
import type { GridChildComponentProps } from "react-window";
import withSuspense from "helpers/withSuspense";
import { isMobile } from "react-device-detect";
import { useMainContext } from "utils/context";
import { useNavigate } from "react-router-dom";
import { updateFavesDB } from "helpers";
import { Helmet } from "react-helmet";

/* Types necessary for lazy loaded components */
import type {
	Icon as IconType,
	Text as TextType,
	Flex as FlexType,
	Grid as GridType,
	Stack as StackType,
	Radio as RadioType,
	Slide as SlideType,
	VStack as VStackType,
	Portal as PortalType,
	Heading as HeadingType,
	Checkbox as CheckboxType,
	IconButton as IconButtonType,
	CloseButton as CloseButtonType,
} from "@chakra-ui/react/dist";

import { DEFAULT_ALPHA_PROPS, DEFAULT_FILTER_PROPS, DEFAULT_NUM_PROPS } from "./defaults";
import "./SongList.scss";

/* Lazy Base Imports */
const IconImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Icon })));
const IconButtonImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.IconButton })));
const TextImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Text })));
const StackImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Stack })));
const CheckboxImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Checkbox })));
const RadioImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Radio })));
const HeadingImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Heading })));
const SlideImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Slide })));
const PortalImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Portal })));
const VStackImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.VStack })));
const FlexImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Flex })));
const CloseButtonImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.CloseButton })));
const GridImport = lazy(() => import("@chakra-ui/react").then(module => ({ default: module.Grid })));
// @ts-ignore
const FixedSizeGridImport = lazy(() => import("react-window").then(module => ({ default: module.FixedSizeGrid })));
// @ts-ignore
const AutoSizerImport = lazy(() => import("react-virtualized-auto-sizer"));

/* With Suspense Wrapper */
const Text = withSuspense<typeof TextType>(TextImport);
const Icon = withSuspense<typeof IconType>(IconImport);
const IconButton = withSuspense<typeof IconButtonType>(IconButtonImport);
const Stack = withSuspense<typeof StackType>(StackImport);
const Checkbox = withSuspense<typeof CheckboxType>(CheckboxImport);
const Radio = withSuspense<typeof RadioType>(RadioImport);
const Heading = withSuspense<typeof HeadingType>(HeadingImport);
const Slide = withSuspense<typeof SlideType, null>(SlideImport, null);
const Portal = withSuspense<typeof PortalType, null>(PortalImport, null);
const VStack = withSuspense<typeof VStackType, null>(VStackImport, null);
const Flex = withSuspense<typeof FlexType>(FlexImport);
const CloseButton = withSuspense<typeof CloseButtonType>(CloseButtonImport);
const Grid = withSuspense<typeof GridType, null>(GridImport, null);
const AutoSizer = withSuspense<typeof AutoSizerImport, null>(AutoSizerImport, null);
const FixedSizeGrid = withSuspense<typeof FixedSizeGridImport, null>(FixedSizeGridImport, null);

const Button = withSuspense(lazy(() => import("components/Button")));

enum FilterTypes {
	FAVE = "Favourites",
	ALPHA = "Alphabetically",
	NUM = "Numerically",
}

type MenuOptionsFnT = [string[], number[][]];

interface NumberFilter {
	type: "numbers";
	value: number;
}
interface RangeFilter {
	type: "range";
	value: number[];
}
interface LettersFilter {
	type: "letters";
	value: string;
}
interface ToggleFilter {
	type: "toggle";
	value: "letter" | "range";
}

type FilterSongT = NumberFilter | RangeFilter | LettersFilter | ToggleFilter;

type FilterT = FilterTypes.FAVE | FilterTypes.ALPHA | FilterTypes.NUM;

type SortListProps = {
	sortAlphabetically: boolean;
	sortDescending: boolean;
	sourceList: Song[];
};

const meta = {
	title: "Hymns Index",
	page: "Hymns Index",
};

const SortAlphaDownIcon: typeof Icon = () => <Icon as={FaSortAlphaDown} />;
const SortAlphaUpIcon: typeof Icon = () => <Icon as={FaSortAlphaDownAlt} />;
const SortNumericDownIcon: typeof Icon = () => <Icon as={FaSortNumericDown} />;
const SortNumericUpIcon: typeof Icon = () => <Icon as={FaSortNumericDownAlt} />;

/** Sorts the displayed list using the selected filters */
function sortList({ sortAlphabetically, sortDescending, sourceList }: SortListProps): Song[] {
	const newArray = [...sourceList];

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
	} else if (!sortDescending) newArray.sort((a, b) => a.number - b.number);
	else newArray.sort((a, b) => b.number - a.number);

	// For the few times it needs to return a value
	return newArray;
}

function SongList() {
	/** Core, Context, Routing */
	const navigate = useNavigate();
	const { songs, favourites, setFavourites, dispatch } = useMainContext();

	// TODO: Sync all filter options with local storage as preferences

	/** Local State to handle list behaviour */
	const [sortAlphaProps, setSortAlphaProps] = useState(DEFAULT_ALPHA_PROPS);
	const [sortNumberProps, setSortNumberProps] = useState(DEFAULT_NUM_PROPS);
	const [filterLetterProps, setFilterLetterProps] = useState(DEFAULT_FILTER_PROPS);
	const [filterRangeProps, setFilterRangeProps] = useState(DEFAULT_FILTER_PROPS);
	const [filterByFaves, setFilterByFaves] = useState(false);
	const [finalList, setFinalList] = useState<Song[]>(
		sortList({
			sortAlphabetically: sortAlphaProps.enabled,
			sortDescending: sortNumberProps.sortDescending,
			sourceList: songs,
		})
	);

	/** Virtualized list props */
	const wrapperRef = useRef<HTMLDivElement>(null);

	/** Handles Filter Drawer display */
	const { isOpen, onOpen, onToggle } = useDisclosure();

	/** Mode responsive colors */
	const modalBG = useColorModeValue("gray.100", "gray.800");
	const modalColors = useColorModeValue("gray.800", "gray.100");
	const favActiveIconColor = useColorModeValue("var(--chakra-colors-red-500)", "var(--chakra-colors-red-300)");
	const favIconColor = useColorModeValue("var(--chakra-colors-gray-600)", "var(--chakra-colors-gray-500)");
	const favActiveIconBG = useColorModeValue("var(--chakra-colors-red-50)", "");

	const toggleFavourite = useCallback((number: number) => {
		let faves = [];
		if (favourites.includes(number - 1)) {
			faves = favourites.filter(fave => fave !== number - 1);
			setFavourites(faves);
		} else {
			faves = [...favourites, number - 1];
			setFavourites(faves);
		}
		updateFavesDB(faves);
	}, [favourites, setFavourites]);

	/** Triggers navigation to a song at a specified index */
	const memoDisplaySong = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			function displaySong(ev: React.MouseEvent<HTMLDivElement>) {
				const songID = ev.currentTarget.getAttribute("data-song-id");
				navigate(`${process.env.PUBLIC_URL}/songs/${songID}`);
			}

			displaySong(e);
		},
		[navigate]
	);

	/** Generates category labels from all available letters and numbers */
	const createMenu = useCallback(() => {
		const characters = [];
		const numbers = [];
		// Ensure we're getting numbers in order for later
		const songsCopy = [...songs!].sort((a, b) => a.number - b.number);
		for (let i = 0; i < songsCopy.length; i += 1) {
			const nextLetter = songsCopy[i].title.match("[a-zA-Z]")?.[0];
			if (nextLetter) characters.push(nextLetter);
			numbers.push(songsCopy[i].number);
		}
		return { letters: String.prototype.concat(...new Set(characters)), numbers };
	}, [songs]);

	const generateMenuOptions = useCallback((): MenuOptionsFnT => {
		const menuValues = createMenu();
		const letters = menuValues.letters.split("").sort();
		const numbers = [];
		for (let i = 0; i < menuValues.numbers.length; i += 100) {
			numbers.push(menuValues.numbers.slice(i, i + 100));
		}

		const finalNumbers = numbers.map(n => [n[0], n[n.length - 1]]);

		return [letters, finalNumbers];
	}, [createMenu]);

	const [letters, numbers] = generateMenuOptions();

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
		return sourceArray.filter(song => song.number >= parseInt(arg1, 10) && song.number <= parseInt(arg2, 10));
	}

	/**
	 * Filters list of songs by criteria
	 * Kinda difficult to read
	 * TODO: Write tests covering all use cases
	 * Maybe improve readability
	 */
	const filterSongs = useCallback((props: FilterSongT) => {
		let filteredList: Song[] = [...songs];
		switch (props.type) {
			case "numbers": {
				if (!filterRangeProps.enabled) return;
				setFilterRangeProps(_props => ({ ..._props, currValue: props.value.toString() }));
				filteredList = songs.filter(song => song.number === props.value);
				if (filterLetterProps.enabled) filteredList = filterByLetter(filteredList, filterLetterProps.currValue);
				break;
			}
			case "range": {
				if (!filterRangeProps.enabled) return;
				setFilterRangeProps(_props => ({ ..._props, currValue: props.value.toString() }));
				filteredList = songs.filter(song => song.number >= props.value[0] && song.number <= props.value[1]);
				if (filterLetterProps.enabled) filteredList = filterByLetter(filteredList, filterLetterProps.currValue);
				break;
			}
			case "letters": {
				if (!filterLetterProps.enabled) return;
				setFilterLetterProps(_props => ({ ..._props, currValue: props.value.toString() }));
				filteredList = filterByLetter(songs, props.value);
				if (filterRangeProps.enabled) filteredList = filterByRange(filteredList, filterRangeProps.currValue);
				break;
			}
			case "toggle": {
				if (props.value === "letter") {
					// Checks for outgoing value (it will be disabled after this function is complete)
					if (filterLetterProps.enabled) {
						filteredList = songs!;
						if (filterRangeProps.enabled)
							filteredList = filterByRange(filteredList, filterRangeProps.currValue);
					} else if (filterLetterProps.currValue) {
						filteredList = filterByLetter(songs, filterLetterProps.currValue);
						if (filterRangeProps.enabled) {
							filteredList = filterByRange(filteredList, filterRangeProps.currValue);
						}
					}
					setFilterLetterProps(({ enabled, ...rest }) => ({ ...rest, enabled: !enabled }));
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
					setFilterRangeProps(filterProps => ({ ...filterProps, enabled: !filterProps.enabled }));
				}
				break;
			}
			default:
				break;
		}

		if (filterByFaves && filteredList) {
			filteredList = filteredList.filter(item => favourites.includes(item.number - 1));
		}

		const isAlphabetical = sortAlphaProps.enabled;
		const sortDescending = isAlphabetical ? sortAlphaProps.sortDescending : sortNumberProps.sortDescending;
		setFinalList(
			sortList({ sortAlphabetically: sortAlphaProps.enabled, sortDescending, sourceList: filteredList })
		);
	}, [favourites, filterByFaves, filterLetterProps.currValue, filterLetterProps.enabled, filterRangeProps.currValue, filterRangeProps.enabled, songs, sortAlphaProps.enabled, sortAlphaProps.sortDescending, sortNumberProps.sortDescending]);

	const createLetters = useCallback(() =>
		letters.map(letter => ({
			callback: () => filterSongs({ type: "letters", value: letter }),
			value: letter,
		})), [filterSongs, letters]);

	const createNumbers = useCallback(() =>
		numbers.map(num => ({
			callback: () => filterSongs({ type: "range", value: [num[0], num[1]] }),
			start: num[0],
			end: num[1],
		})), [filterSongs, numbers]);

	/** [Enable Options] Handles list filter features enable / disable */
	const handleSortToggle = useCallback((filterType: FilterT, sortDesc?: boolean) => {
		if (filterType !== FilterTypes.FAVE) {
			const sortAlphabetically = filterType === FilterTypes.ALPHA;
			let sortDescending: boolean;
			if (sortDesc !== undefined) sortDescending = sortDesc;
			else sortDescending = sortAlphabetically ? sortAlphaProps.sortDescending : sortNumberProps.sortDescending;

			setSortNumberProps(props => ({ ...props, enabled: !sortAlphabetically }));
			setSortAlphaProps(props => ({ ...props, enabled: sortAlphabetically }));
			sortList({ sortAlphabetically, sortDescending, sourceList: finalList });
		} else {
			let targetList = filterByFaves ? songs : finalList;
			setFilterByFaves(!filterByFaves);
			const sortDescending = sortAlphaProps.enabled
				? sortAlphaProps.sortDescending
				: sortNumberProps.sortDescending;
			if (!filterByFaves) targetList = targetList.filter(item => favourites.includes(item.number - 1));
			sortList({ sortAlphabetically: sortAlphaProps.enabled, sortDescending, sourceList: targetList });
		}
	}, [favourites, filterByFaves, finalList, songs, sortAlphaProps.enabled, sortAlphaProps.sortDescending, sortNumberProps.sortDescending]);

	/** [ASC/DESC] Handles list filter directional changes */
	const handleSortChange = useCallback((value: string | number, filterType: FilterT) => {
		const sortDescending = value === "Descending";

		if (filterType === FilterTypes.NUM) {
			setSortNumberProps(props => ({ ...props, sortDescending }));
			if (sortNumberProps.enabled) handleSortToggle(filterType, sortDescending);
		}

		if (filterType === FilterTypes.ALPHA) {
			setSortAlphaProps(props => ({ ...props, sortDescending }));
			if (sortAlphaProps.enabled) handleSortToggle(filterType, sortDescending);
		}
	}, [handleSortToggle, sortAlphaProps.enabled, sortNumberProps.enabled]);

	/** Sets the page title */
	useEffect(() => {
		dispatch!({ type: "setTitle", payload: meta.page });
	}, [dispatch]);

	const NumberItems = useCallback(() => {
		const values = createNumbers();
		return (
			<>
				{values.map(number => {
					const displayValue = `${number.start} - ${number.end}`;
					const checkValue = [[number.start], [number.end]].toString();
					return (
						<Button
							minWidth="60px"
							margin="5px"
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
	}, [createNumbers, filterRangeProps.currValue, filterRangeProps.enabled]);

	const LetterItems = useCallback(() => {
		const values = createLetters();
		return (
			<>
				{values.map(letter => (
					<Button
						width="30px"
						mr="10px"
						mb="10px"
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
	}, [createLetters, filterLetterProps.currValue, filterLetterProps.enabled]);

	/** Renders a single cell */
	const Cell = useCallback(({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
		const maxColumns = 2;
		const itemWidth = 800;
		const columnCount = Math.min(Math.max(Math.ceil(window.innerWidth / itemWidth), 1), maxColumns);
		const itemIndex = rowIndex * columnCount + columnIndex;
		if (itemIndex >= finalList.length) return null;

		const isFavourite = favourites.includes(data[itemIndex].number - 1);
		return (
			<Box
				key={data[itemIndex].number}
				style={style}
				py={1}
				pl={3}
				ml={columnCount > 1 ? 5 : 0}
				mt={2}
				alignItems="center"
				textAlign="left"
			>
				<Grid alignItems="center" bg={modalBG} shadow="md" borderRadius="md" h="100%" pos="relative">
					<Grid
						borderRadius="md"
						className="listItem"
						onClick={memoDisplaySong}
						templateColumns="55px 1fr 50px"
						data-song-id={data[itemIndex].number}
						px={5}
					>
						<Text className="listNumber">#{data[itemIndex].number}</Text>
						<Text className="listTitle">{data[itemIndex].title}</Text>
					</Grid>
					<IconButton
						colorScheme={isFavourite ? "red" : "gray"}
						bgColor={isFavourite ? favActiveIconBG : modalBG}
						_hover={{ shadow: "md" }}
						icon={<FaHeart color={isFavourite ? favActiveIconColor : favIconColor} />}
						aria-label="Add to Favourites"
						size="lg"
						variant="outline"
						className="faveIcon"
						pos="absolute"
						right="10px"
						onClick={() => toggleFavourite(data[itemIndex].number)}
					/>
				</Grid>
			</Box>
		);
	}, [favActiveIconBG, favActiveIconColor, favIconColor, favourites, finalList.length, memoDisplaySong, modalBG, toggleFavourite]);

	const FilterMenu = useCallback(() => (
		<VStack pl={5} spacing={6}>
			<RadioGroup
				name="sorting-type"
				value={sortAlphaProps.enabled ? FilterTypes.ALPHA : FilterTypes.NUM}
				onChange={nextValue => handleSortToggle(nextValue as FilterTypes)}
				w="100%"
			>
				<Stack spacing={6}>
					<Box w="100%">
						<Heading fontSize="lg">Sort Numerically</Heading>
						<Box mt={4}>
							<Radio value={FilterTypes.NUM} name="sorting-type">
								Enable
							</Radio>
							<RadioGroup
								name="sort-numeric"
								value={sortNumberProps.sortDescending ? "Descending" : "Ascending"}
								onChange={value => handleSortChange(value, FilterTypes.NUM)}
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
					<Box w="100%">
						<Heading fontSize="lg">Sort Alphabetically</Heading>
						<Box mt={4}>
							<Radio value={FilterTypes.ALPHA} name="sorting-type">
								Enable
							</Radio>
							<RadioGroup
								name="sort-alpha"
								value={sortAlphaProps.sortDescending ? "Descending" : "Ascending"}
								onChange={nextValue => handleSortChange(nextValue, FilterTypes.ALPHA)}
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
						<Flex flexWrap="wrap">
							<LetterItems />
						</Flex>
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
						<Flex flexWrap="wrap">
							<NumberItems />
						</Flex>
					</Stack>
				</Box>
			</Box>
			<Box w="100%">
				<Heading fontSize="lg">Favourites</Heading>
				<Box mt={4}>
					<Checkbox
						defaultChecked={filterByFaves}
						value="Favourites"
						onChange={() => handleSortToggle(FilterTypes.FAVE)}
					>
						Only favourites
					</Checkbox>
				</Box>
			</Box>
		</VStack>
	), [LetterItems, NumberItems, filterByFaves, filterLetterProps.enabled, filterRangeProps.enabled, filterSongs, handleSortChange, handleSortToggle, sortAlphaProps.enabled, sortAlphaProps.sortDescending, sortNumberProps.enabled, sortNumberProps.sortDescending]);

	return (
		<>
			{/* @ts-expect-error Helmet no longer updated */}
			<Helmet>
				<title>{`Hymns for All Times | ${meta.title}`}</title>
			</Helmet>

			<Button onClick={onOpen} pos="absolute" right={-5} top="12%" zIndex={95} pl={2}>
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
					h={isMobile ? "94vh" : "100vh"}
					w="300px"
					right={0}
					pos="absolute"
					overflowY="auto"
					zIndex={100}
					pb={isMobile ? "1rem" : undefined}
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
						const itemWidth = 800;
						const columnCount = Math.min(Math.max(Math.ceil(width / itemWidth), 1), maxColumns);
						return (
							<FixedSizeGrid
								height={height}
								width={width}
								rowHeight={90}
								columnWidth={width / columnCount - 30}
								columnCount={columnCount}
								rowCount={Math.ceil(finalList.length / columnCount)}
								itemData={finalList}
								style={{ overflowX: "hidden" }}
								overscanRowCount={2}
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
