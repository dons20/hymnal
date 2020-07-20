import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { List, Menu, Dropdown, Button } from "antd";
import { FixedSizeGrid } from "react-window";
import { Helmet } from "react-helmet";
import Icon from "@ant-design/icons";
import { MainContext } from "App";
import "./SongList.scss";

/** FA Images */
import { ReactComponent as Filter } from "img/filter-solid.svg";
//import { ReactComponent as ArrowLeft } from "img/arrow-left-solid.svg";
import { ReactComponent as SortAlphaDown } from "img/sort-alpha-down-solid.svg";
import { ReactComponent as SortAlphaDownAlt } from "img/sort-alpha-down-alt-solid.svg";
import { ReactComponent as SortNumericDown } from "img/sort-numeric-down-solid.svg";
import { ReactComponent as SortNumericDownAlt } from "img/sort-numeric-down-alt-solid.svg";

const meta = {
	title: "Song List",
	page: "List of Hymns",
};

const SortAlphaDownIcon = props => <Icon component={SortAlphaDown} {...props} />;
const SortAlphaUpIcon = props => <Icon component={SortAlphaDownAlt} {...props} />;
const SortNumericDownIcon = props => <Icon component={SortNumericDown} {...props} />;
const SortNumericUpIcon = props => <Icon component={SortNumericDownAlt} {...props} />;

function SongList() {
	/** Effects */
	const history = useHistory();
	const { path } = useRouteMatch();
	const { songs, dispatch } = useContext(MainContext);

	/** Local State to handle list behaviour */
	const [filteredList, setFilteredList] = useState([...songs]); // Contains a subset of song list items
	const [unfilteredList, setUnfilteredList] = useState([...songs]); // Contains a copy of songs from the context
	const [sortDescending, setSortDescending] = useState(true); // Determines sorting direction of lists
	const [filterByLetters, setFilterByLetters] = useState(true); // Determines filter category; letters or numbers
	const [sortAlphabetical, setSortAlphabetical] = useState(true); // Determines if the list should be sorted alphabetically or numerically
	const [shouldFilterCategory, enableCategoryFilters] = useState(true); // Determines if the list should have category filters enabled
	const [showFilteredList, setShowFilteredList] = useState(false); // Determines if the filtered list should be shown
	const [numbers, setNumbers] = useState(Array(<div key={1} />)); // Contains an array of available song number categories
	const [letters, setLetters] = useState(Array(<div key={1} />)); // Contains an array of available song letter categories
	const shouldUpdateFilter = useRef(true);
	/** @type {React.MutableRefObject<HTMLDivElement>} */
	const wrapperRef = useRef(null);
	const numColumns = useRef(window.innerWidth > 950 ? 2 : 1);
	const numRows = useRef(0);

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
			 * @param {MouseEventInit&{ currentTarget: { getAttribute: (arg0: string) => String; }; }} e
			 */
			function displaySong(e) {
				const songID = e.currentTarget.getAttribute("data-song-id");
				history.push(`${path}/${songID}`);
			}

			displaySong(e);
		},
		[history, path]
	);

	useEffect(() => {
		if (!shouldUpdateFilter.current || songs.length <= 1) return;

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
	function filterList(shouldFilterAlpha) {
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
			return new Promise(resolve => {
				let characters = [],
					numbers = [];
				for (let i = 0; i < songs.length; i++) {
					characters.push(songs[i].title.charAt(0));
					numbers.push(songs[i].number);
				}
				resolve({ letters: String.prototype.concat(...new Set(characters)), numbers: numbers });
			});
		}

		/**
		 * Filters list of songs by criteria
		 * @param {String} type
		 * @param {Number|Array|String} value
		 */
		function filterSongs(type, value) {
			let filteredSongs;
			if (type === "numbers") {
				filteredSongs = songs.filter(song => song.number === value);
				setSortAlphabetical(false);
			} else if (type === "range") {
				filteredSongs = songs.filter(song => song.number >= value[0] && song.number <= value[1]);
				setSortAlphabetical(false);
			} else if (type === "letters") {
				filteredSongs = songs.filter(song => song.title.charAt(0) === value);
				setSortAlphabetical(true);
			} else {
				return null;
			}

			setSortDescending(true);
			setFilteredList(filteredSongs);
			setShowFilteredList(true);
		}

		/**
		 * Check if songs have been loaded into global state
		 * Splits category entries into JSX elements for actual menu
		 */
		if (songs.length > 1 && letters.length <= 1) {
			createMenu().then(val => {
				let letters = val.letters.replace(/\W/, "").split("").sort();
				let numbers = [];
				for (let i = 0; i < val.numbers.length; i += 100) {
					numbers.push(val.numbers.slice(i, i + 100));
				}

				let finalNumbers = numbers.map(n => {
					return [n[0], n[n.length - 1]];
				});

				setLetters(
					letters.map(letter => (
						<div
							className="menuOpt"
							onClick={() => filterSongs("letters", letter)}
							key={letter}
							data-value={letter}
						>
							{letter}
						</div>
					))
				);
				setNumbers(
					finalNumbers.map(num => (
						<div
							className="menuOpt"
							onClick={() => filterSongs("range", [num[0], num[1]])}
							key={num[0]}
							data-value={num[0]}
						>
							{num[0]} - {num[1]}
						</div>
					))
				);
			});
		}
	}, [songs, letters.length]);

	/** @param {import("react-window").GridChildComponentProps} props */
	const Cell = ({ columnIndex, rowIndex, style, data }) => {
		const itemIndex = rowIndex * numColumns.current + columnIndex;

		return (
			<div
				key={data[itemIndex].number}
				data-song-id={data[itemIndex].number}
				onClick={memoizedDisplaySong}
				className="listItem"
				style={style}
			>
				<div className="listNumber">#{data[itemIndex].number}</div>
				<div className="listTitle">{data[itemIndex].title}</div>
			</div>
		);
	};

	const menu = (
		<Menu>
			<Menu.Item key="0">
				<Button type="default" size="large" onClick={toggleListFilter} block>
					{showFilteredList && !shouldFilterCategory ? "Enable Filter" : "No Filter"}
				</Button>
			</Menu.Item>
			<Menu.Item key="1">
				<Button
					type={sortAlphabetical && sortDescending ? "primary" : "default"}
					icon={<SortAlphaDownIcon className={sortAlphabetical ? "active" : ""} />}
					onClick={sortAlphaDescending}
					size="large"
					block
				>
					Sort Alphabetic - Descending
				</Button>
			</Menu.Item>
			<Menu.Item key="2">
				<Button
					type={sortAlphabetical && !sortDescending ? "primary" : "default"}
					icon={<SortAlphaUpIcon className={sortAlphabetical ? "active" : ""} />}
					onClick={sortAlphaAscending}
					size="large"
					block
				>
					Sort Alphabetic - Ascending
				</Button>
			</Menu.Item>
			<Menu.Item key="3">
				<Button
					type={!sortAlphabetical && sortDescending ? "primary" : "default"}
					icon={<SortNumericDownIcon className={sortAlphabetical ? "" : "active"} />}
					onClick={sortNumericDescending}
					size="large"
					block
				>
					Sort Numeric - Descending
				</Button>
			</Menu.Item>
			<Menu.Item key="4">
				<Button
					type={!sortAlphabetical && !sortDescending ? "primary" : "default"}
					icon={<SortNumericUpIcon className={sortAlphabetical ? "" : "active"} />}
					onClick={sortNumericAscending}
					size="large"
					block
				>
					Sort Numeric - Ascending
				</Button>
			</Menu.Item>
		</Menu>
	);

	/** Sets the page title */
	useEffect(() => {
		dispatch({ type: "setTitle", payload: meta.page });
	}, [dispatch]);

	return (
		<>
			<Helmet>
				<title>{`Hymns | ${meta.title}`}</title>
			</Helmet>

			<div className="utilityHeader">
				<Dropdown
					overlay={menu}
					trigger={["click"]}
					placement="bottomCenter"
					overlayClassName="custom-overlay"
					overlayStyle={{ minWidth: 300 }}
				>
					<button type="button" className="listSwitcher ant-dropdown-link" onClick={e => e.preventDefault()}>
						<Filter title="Filter icon" className={`icon ${shouldFilterCategory ? "active" : ""}`} />
						<div className="label">Sort and Filter</div>
					</button>
				</Dropdown>
			</div>
			<div className="list-wrapper" ref={wrapperRef}>
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
			</div>
		</>
	);
}

export default SongList;
