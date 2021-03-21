import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { FaSortAlphaDown, FaSortAlphaDownAlt, FaSortNumericDown, FaSortNumericDownAlt } from "react-icons/fa";
import {
	Icon,
	Menu,
	MenuItem,
	MenuList,
	List,
	MenuButton,
	Box,
	Text,
	MenuOptionGroup,
	useColorModeValue,
} from "@chakra-ui/react";
import { FixedSizeGrid, GridChildComponentProps } from "react-window";
import { useHistory, useRouteMatch } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { Helmet } from "react-helmet";
import { Button } from "components";
import { MainContext } from "App";
import "./SongList.scss";

type filterSongT =
	| { type: "numbers"; value: number }
	| { type: "range"; value: number[] }
	| { type: "letters"; value: string };

const meta = {
	title: "Song List",
	page: "List of Hymns",
};

const SortAlphaDownIcon: typeof Icon = () => <Icon as={FaSortAlphaDown} />;
const SortAlphaUpIcon: typeof Icon = () => <Icon as={FaSortAlphaDownAlt} />;
const SortNumericDownIcon: typeof Icon = () => <Icon as={FaSortNumericDown} />;
const SortNumericUpIcon: typeof Icon = () => <Icon as={FaSortNumericDownAlt} />;

function SongList() {
	/** Effects */
	const history = useHistory();
	const { path } = useRouteMatch();
	const { songs, dispatch } = useContext(MainContext);

	/** Local State to handle list behaviour */
	const [filteredList, setFilteredList] = useState([...songs!]); // Contains a subset of song list items
	const [unfilteredList, setUnfilteredList] = useState([...songs!]); // Contains a copy of songs from the context
	const [sortDescending, setSortDescending] = useState(true); // Determines sorting direction of lists
	const [filterByLetters, setFilterByLetters] = useState(true); // Determines filter category; letters or numbers
	const [sortAlphabetical, setSortAlphabetical] = useState(true); // Determines if the list should be sorted alphabetically or numerically
	const [shouldFilterCategory, enableCategoryFilters] = useState(true); // Determines if the list should have category filters enabled
	const [showFilteredList, setShowFilteredList] = useState(false); // Determines if the filtered list should be shown
	const [numbers, setNumbers] = useState(Array(<div key={1} />)); // Contains an array of available song number categories
	const [letters, setLetters] = useState(Array(<div key={1} />)); // Contains an array of available song letter categories
	const shouldUpdateFilter = useRef(true);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const numColumns = useRef(window.innerWidth > 950 ? 2 : 1);
	const numRows = useRef(0);

	/** Reactive colours */
	const btnColor = useColorModeValue("white", "white");

	if (shouldFilterCategory) {
		if (numColumns.current === 2) numRows.current = filteredList.length / 2;
		else numRows.current = filteredList.length;
	} else {
		if (numColumns.current === 2) numRows.current = unfilteredList.length / 2;
		else numRows.current = unfilteredList.length;
	}

	const memoizedDisplaySong = useCallback(
		e => {
			/**
			 * Displays a song at specified index
			 */
			function displaySong(e: MouseEventInit & { currentTarget: { getAttribute: (arg0: string) => String } }) {
				const songID = e.currentTarget.getAttribute("data-song-id");
				history.push(`${path}/${songID}`);
			}

			displaySong(e);
		},
		[history, path]
	);

	useEffect(() => {
		if (!shouldUpdateFilter.current || songs!.length <= 1) return;

		let newArray = [...unfilteredList];

		if (sortAlphabetical) {
			if (sortDescending) newArray.sort((a, b) => a.title.localeCompare(b.title));
			else newArray.sort((a, b) => b.title.localeCompare(a.title));
		} else {
			if (sortDescending) newArray.sort((a, b) => b.number - a.number);
			else newArray.sort((a, b) => a.number - b.number);
		}

		setUnfilteredList(newArray);

		shouldUpdateFilter.current = false;
	}, [unfilteredList, sortAlphabetical, songs, sortDescending]);

	/** Disables the list filters to show all songs */
	function toggleListFilter() {
		setSortDescending(true);
		if (shouldFilterCategory && showFilteredList) enableCategoryFilters(false);
		else enableCategoryFilters(!shouldFilterCategory);

		if (!(shouldFilterCategory && showFilteredList)) setShowFilteredList(!showFilteredList);

		shouldUpdateFilter.current = true;
	}

	/** Sorts Numbers Descending */
	function sortNumericDescending() {
		setSortDescending(true);
		filterList(false);
		if (!showFilteredList)
			setNumbers([...numbers].sort((a, b) => parseInt(a.props["data-value"]) - parseInt(b.props["data-value"])));
		shouldUpdateFilter.current = true;
	}

	/** Sorts Numbers Ascending */
	function sortNumericAscending() {
		setSortDescending(false);
		filterList(false);
		if (!showFilteredList)
			setNumbers([...numbers].sort((a, b) => parseInt(b.props["data-value"]) - parseInt(a.props["data-value"])));
		shouldUpdateFilter.current = true;
	}

	/** Sorts Letters Descending */
	function sortAlphaDescending() {
		setSortDescending(true);
		filterList(true);
		if (!showFilteredList)
			setLetters([...letters].sort((a, b) => a.props["data-value"].localeCompare(b.props["data-value"])));
		shouldUpdateFilter.current = true;
	}

	/** Sorts Letters Ascending */
	function sortAlphaAscending() {
		setSortDescending(false);
		filterList(true);
		if (!showFilteredList)
			setLetters([...letters].sort((a, b) => b.props["data-value"].localeCompare(a.props["data-value"])));
		shouldUpdateFilter.current = true;
	}

	/**
	 * Swaps between numerical and alphabetical filter/sorting modes
	 */
	function filterList(shouldFilterAlpha: boolean) {
		const callback = shouldFilterCategory ? setFilteredList : setUnfilteredList;

		if (shouldFilterAlpha) {
			if (sortDescending) callback(list => [...list].sort((a, b) => b.title.localeCompare(a.title)));
			else callback(list => [...list].sort((a, b) => a.title.localeCompare(b.title)));
		} else {
			if (!sortDescending) callback(list => [...list].sort((a, b) => a.number - b.number));
			else callback(list => [...list].sort((a, b) => b.number - a.number));
		}

		setSortAlphabetical(shouldFilterAlpha);
		setFilterByLetters(shouldFilterAlpha);
	}

	/** Handles changes to the active display when component updates */
	useEffect(() => {
		/** Generates category labels from all available letters and numbers */
		function createMenu() {
			let characters = [],
				numbers = [];
			for (let i = 0; i < songs!.length; i++) {
				characters.push(songs![i].title.charAt(0));
				numbers.push(songs![i].number);
			}
			return { letters: String.prototype.concat(...new Set(characters)), numbers: numbers };
		}

		/**
		 * Filters list of songs by criteria
		 */
		function filterSongs(props: filterSongT) {
			let filteredSongs = songs!;
			if (props.type === "numbers") {
				filteredSongs = songs!.filter(song => song.number === props.value);
				setSortAlphabetical(false);
			} else if (props.type === "range") {
				filteredSongs = songs!.filter(song => song.number >= props.value[0] && song.number <= props.value[1]);
				setSortAlphabetical(false);
			} else if (props.type === "letters") {
				filteredSongs = songs!.filter(song => song.title.charAt(0) === props.value);
				setSortAlphabetical(true);
			}

			setSortDescending(true);
			setFilteredList(filteredSongs);
			setShowFilteredList(true);
		}

		/**
		 * Check if songs have been loaded into global state
		 * Splits category entries into JSX elements for actual menu
		 */
		if (songs!.length > 1 && letters.length <= 1) {
			const menuValues = createMenu();
			let letters = menuValues.letters.replace(/\W/, "").split("").sort();
			let numbers = [];
			for (let i = 0; i < menuValues.numbers.length; i += 100) {
				numbers.push(menuValues.numbers.slice(i, i + 100));
			}

			let finalNumbers = numbers.map(n => {
				return [n[0], n[n.length - 1]];
			});

			setLetters(
				letters.map(letter => (
					<Box
						className="menuOpt"
						onClick={() => filterSongs({ type: "letters", value: letter })}
						key={letter}
						data-value={letter}
					>
						{letter}
					</Box>
				))
			);
			setNumbers(
				finalNumbers.map(num => (
					<Box
						className="menuOpt"
						onClick={() => filterSongs({ type: "range", value: [num[0], num[1]] })}
						key={num[0]}
						data-value={num[0]}
					>
						{num[0]} - {num[1]}
					</Box>
				))
			);
		}
	}, [songs, letters.length]);

	/** Renders a single cell */
	const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
		const itemIndex = rowIndex * numColumns.current + columnIndex;

		return (
			<Box
				key={data[itemIndex].number}
				data-song-id={data[itemIndex].number}
				onClick={memoizedDisplaySong}
				className="listItem"
				style={style}
			>
				<Text className="listNumber">#{data[itemIndex].number}</Text>
				<Text className="listTitle">{data[itemIndex].title}</Text>
			</Box>
		);
	};

	const FilterMenu = (
		<Menu closeOnSelect={false}>
			<MenuButton as={Button} colorScheme="blue" rightIcon={<SortAlphaUpIcon />}>
				Filter
			</MenuButton>
			<MenuList>
				<MenuOptionGroup defaultValue="toggleFilter" title="Order" type="radio">
					<MenuItem value="toggleFilter">
						<Button onClick={toggleListFilter} colorScheme="transparent">
							{showFilteredList && !shouldFilterCategory ? "Enable Filter" : "No Filter"}
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							type={sortAlphabetical && sortDescending ? "primary" : "default"}
							icon={<SortAlphaDownIcon className={sortAlphabetical ? "active" : ""} />}
							onClick={sortAlphaDescending}
							colorScheme="transparent"
						>
							Sort Alphabetic - Descending
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							type={sortAlphabetical && !sortDescending ? "primary" : "default"}
							icon={<SortAlphaUpIcon className={sortAlphabetical ? "active" : ""} />}
							onClick={sortAlphaAscending}
							colorScheme="transparent"
						>
							Sort Alphabetic - Ascending
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							type={!sortAlphabetical && sortDescending ? "primary" : "default"}
							icon={<SortNumericDownIcon className={sortAlphabetical ? "" : "active"} />}
							onClick={sortNumericDescending}
							colorScheme="transparent"
						>
							Sort Numeric - Descending
						</Button>
					</MenuItem>
					<MenuItem>
						<Button
							type={!sortAlphabetical && !sortDescending ? "primary" : "default"}
							icon={<SortNumericUpIcon className={sortAlphabetical ? "" : "active"} />}
							onClick={sortNumericAscending}
							colorScheme="transparent"
							color="white"
						>
							Sort Numeric - Ascending
						</Button>
					</MenuItem>
				</MenuOptionGroup>
			</MenuList>
		</Menu>
	);

	/** Sets the page title */
	useEffect(() => {
		dispatch!({ type: "setTitle", payload: meta.page });
	}, [dispatch]);

	return (
		<>
			<Helmet>
				<title>{`Hymns | ${meta.title}`}</title>
			</Helmet>

			<Box className="utilityHeader">{FilterMenu}</Box>
			<Box className="list-wrapper" ref={wrapperRef}>
				{showFilteredList ? (
					<AutoSizer>
						{({ height, width }) => (
							<FixedSizeGrid
								height={height}
								width={width}
								rowHeight={100}
								columnWidth={window.innerWidth > 950 ? width / 2 - 6 : width - 6}
								columnCount={numColumns.current}
								rowCount={numRows.current}
								itemData={shouldFilterCategory ? filteredList : unfilteredList}
							>
								{Cell}
							</FixedSizeGrid>
						)}
					</AutoSizer>
				) : (
					<List>{filterByLetters ? letters : numbers}</List>
				)}
			</Box>
		</>
	);
}

export default SongList;
