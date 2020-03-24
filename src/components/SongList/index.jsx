import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { MainContext } from "../../App";
import { Helmet } from "react-helmet";
import { Spin, List } from "antd";
import "./SongList.scss";

/** FA Images */
import { ReactComponent as Filter } from "../../img/filter-solid.svg";
import { ReactComponent as ArrowLeft } from "../../img/arrow-left-solid.svg";
import { ReactComponent as SortAlphaDown } from "../../img/sort-alpha-down-solid.svg";
import { ReactComponent as SortAlphaDownAlt } from "../../img/sort-alpha-down-alt-solid.svg";
import { ReactComponent as SortNumericDown } from "../../img/sort-numeric-down-solid.svg";
import { ReactComponent as SortNumericDownAlt } from "../../img/sort-numeric-down-alt-solid.svg";

const meta = {
    title: "Song List",
    page: "List of Hymns"
};

function SongList() {
    /** Effects */
    const history = useHistory();
    const { path } = useRouteMatch();
    const { songs, dispatch } = useContext(MainContext);

    /** Local State to handle list behaviour */
    const [unfiltered, setUnfiltered] = useState([]); // Contains a copy of songs from the context
    const [filteredList, setFilteredList] = useState([]); // Contains a subset of song list items
    const [sortDescending, setSortDescending] = useState(true); // Determines sorting direction of lists
    const [filterByLetters, setFilterByLetters] = useState(true); // Determines filter category; letters or numbers
    const [shouldFilterList, setShouldFilterList] = useState(true); // Determines if the list should have category filters enabled
    const [showFilteredList, setShowFilteredList] = useState(false); // Determines if the filtered list should be shown
    const [sortAlphabetical, setSortAlphabetical] = useState(true); // Determines if the list should be sorted alphabetically or numerically
    const [numbers, setNumbers] = useState(Array(<div key={1} />)); // Contains an array of available song number categories
    const [letters, setLetters] = useState(Array(<div key={1} />)); // Contains an array of available song letter categories

    const memoizedDisplaySong = useCallback(
        e => {
            /**
             * Displays a song at specified index
             * @param {MouseEventInit&{ currentTarget: { getAttribute: (arg0: string) => String; }; }} e
             */
            function displaySong(e) {
                const songID = e?.currentTarget?.getAttribute("data-song-id");
                history.push(`${path}/${songID}`);
            }

            displaySong(e);
        },
        [history, path]
    );

    /** Memoized JSX Output */
    const filteredJSX = useMemo(
        () =>
            filteredList.map(song => (
                <div key={song.number} data-song-id={song.number} onClick={memoizedDisplaySong} className="listItem">
                    <div className="listNumber">#{song.number}</div>
                    <div className="listTitle">{song.title}</div>
                </div>
            )),
        [filteredList, memoizedDisplaySong]
    );
    const unfilteredJSX = useMemo(() => {
        if (songs?.length > 1 && unfiltered.length < songs?.length) {
            setUnfiltered([...songs]);
        }

        return unfiltered.map(song => (
            <div key={song.number} data-song-id={song.number} onClick={memoizedDisplaySong} className="listItem">
                <div className="listNumber">#{song.number}</div>
                <div className="listTitle">{song.title}</div>
            </div>
        ));
    }, [unfiltered, songs, memoizedDisplaySong]);

    /** Swaps between filtered and unfiltered list displays */
    function toggleFilteredList() {
        setShouldFilterList(showFilteredList ? true : false);
        setShowFilteredList(!showFilteredList);
    }

    /** Shows the filtered list based on selection */
    function changeActiveNav() {
        setShowFilteredList(true);
    }

    /** Handles Numeric Sort button actions */
    function handleNumericSorts() {
        if (!sortAlphabetical) {
            setSortDescending(!sortDescending);
            if (!showFilteredList) {
                if (sortDescending) {
                    numbers.sort((a, b) => parseInt(b.props["data-value"]) - parseInt(a.props["data-value"]));
                } else {
                    numbers.sort((a, b) => parseInt(a.props["data-value"]) - parseInt(b.props["data-value"]));
                }
            } else {
                filterList(false);
            }
        } else {
            setSortAlphabetical(false);
            setFilterByLetters(false);

            if (!showFilteredList) {
                if (sortDescending) {
                    numbers.sort((a, b) => parseInt(a.props["data-value"]) - parseInt(b.props["data-value"]));
                    setSortDescending(true);
                } else {
                    numbers.sort((a, b) => parseInt(b.props["data-value"]) - parseInt(a.props["data-value"]));
                    setSortDescending(false);
                }
            }
        }
    }

    /** Handles Alphabetical Sort button actions */
    function handleAlphaSorts() {
        if (sortAlphabetical) {
            setSortDescending(!sortDescending);
            if (!showFilteredList) {
                if (sortDescending) {
                    letters.sort((a, b) => b.props["data-value"].localeCompare(a.props["data-value"]));
                } else {
                    letters.sort((a, b) => a.props["data-value"].localeCompare(b.props["data-value"]));
                }
            } else {
                filterList(true);
            }
        } else {
            setSortAlphabetical(true);
            setFilterByLetters(true);

            if (!showFilteredList) {
                if (sortDescending) {
                    letters.sort((a, b) => a.props["data-value"].localeCompare(b.props["data-value"]));
                    setSortDescending(true);
                } else {
                    letters.sort((a, b) => b.props["data-value"].localeCompare(a.props["data-value"]));
                    setSortDescending(false);
                }
            }
        }
    }

    /**
     * Swaps between numerical and alphabetical filter/sorting modes
     */
    function filterList(shouldFilterAlpha = filterByLetters) {
        const callback = showFilteredList ? setUnfiltered : setFilteredList;

        if (shouldFilterAlpha) {
            if (sortDescending) {
                callback(list => [...list].sort((a, b) => b.title.localeCompare(a.title)));
            } else {
                callback(list => [...list].sort((a, b) => a.title.localeCompare(b.title)));
            }
        } else {
            if (!sortDescending) {
                callback(list => [...list].sort((a, b) => parseInt(a.number) - parseInt(b.number)));
            } else {
                callback(list => [...list].sort((a, b) => parseInt(b.number) - parseInt(a.number)));
            }
        }

        setSortAlphabetical(shouldFilterAlpha);
        setFilterByLetters(shouldFilterAlpha);
    }

    /** Handles changes to the active display when component updates */
    useEffect(() => {
        /** Generates a menu from all available letters and numbers */
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
         * @param {Number|Array} value
         */
        function filterSongs(type, value) {
            let filteredSongs;
            if (type === "numbers") {
                filteredSongs = songs.filter(song => song.number === value);
            } else if (type === "range") {
                filteredSongs = songs.filter(
                    song => Number.parseInt(song.number) >= value[0] && Number.parseInt(song.number) <= value[1]
                );
            } else if (type === "letters") {
                filteredSongs = songs.filter(song => song.title.charAt(0) === value);
            } else {
                return null;
            }

            setFilteredList(filteredSongs);
            setSortAlphabetical(false);
            changeActiveNav();
        }

        if (songs.length > 1) {
            if (letters.length <= 1) {
                createMenu().then(val => {
                    let letters = val.letters
                        .replace(/\W/, "")
                        .split("")
                        .sort();
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
        }
    }, [songs, letters.length]);

    useEffect(() => {
        dispatch({ type: "setTitle", payload: meta.page });
    }, [dispatch]);

    return (
        <>
            {songs?.length <= 1 && (
                <div className="loader">
                    <Spin size="large" />
                </div>
            )}
            {songs?.length > 1 && (
                <>
                    <Helmet>
                        <title>{`Hymns | ${meta.title}`}</title>
                    </Helmet>
                    <div className="utilityHeader">
                        <button type="button" className="listSwitcher" onClick={toggleFilteredList}>
                            {showFilteredList && <ArrowLeft title="Back icon" />}
                            {!showFilteredList && (
                                <Filter title="Filter icon" className={shouldFilterList ? "active" : ""} />
                            )}
                        </button>
                        <button type="button" className="listSwitcher" onClick={handleAlphaSorts}>
                            {sortDescending ? (
                                <SortAlphaDown
                                    title="Sort Alphabetically descending icon"
                                    className={sortAlphabetical ? "active" : ""}
                                />
                            ) : (
                                <SortAlphaDownAlt
                                    title="Sort Alphabetically ascending icon"
                                    className={sortAlphabetical ? "active" : ""}
                                />
                            )}
                        </button>
                        <button type="button" className="listSwitcher" onClick={handleNumericSorts}>
                            {sortDescending ? (
                                <SortNumericDown
                                    title="Sort Numeric descending icon"
                                    className={sortAlphabetical ? "" : "active"}
                                />
                            ) : (
                                <SortNumericDownAlt
                                    title="Sort Numeric ascending icon"
                                    className={sortAlphabetical ? "" : "active"}
                                />
                            )}
                        </button>
                    </div>
                    {showFilteredList ? (
                        <List>{shouldFilterList ? filteredJSX : unfilteredJSX}</List>
                    ) : (
                        <List>{filterByLetters ? letters : numbers}</List>
                    )}
                </>
            )}
        </>
    );
}

export default SongList;
