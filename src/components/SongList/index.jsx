import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { MainContext } from "../../App";
import { Helmet } from "react-helmet";
import { Spin, List } from "antd";
import "./SongList.scss";

/** FA Images */
import { ReactComponent as Filter } from "../../img/filter-solid.svg";
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
    const [rawList, setRawList] = useState(songs);
    const [filteredList, setFilteredList] = useState([]);
    const [sortDescending, setSortDescending] = useState(true);
    const [filterByLetters, setFilterByLetters] = useState(true);
    const [shouldFilterList, setShouldFilterList] = useState(true);
    const [showFilteredList, setShowFilteredList] = useState(false);
    const [sortAlphabetical, setSortAlphabetical] = useState(true);
    const [numbers, setNumbers] = useState(Array(<div key={1} />));
    const [letters, setLetters] = useState(Array(<div key={1} />));

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
    const unfilteredJSX = useMemo(
        () =>
            rawList.map(song => (
                <div key={song.number} data-song-id={song.number} onClick={memoizedDisplaySong} className="listItem">
                    <div className="listNumber">#{song.number}</div>
                    <div className="listTitle">{song.title}</div>
                </div>
            )),
        [rawList, memoizedDisplaySong]
    );

    function handleNumericSort() {
        if (!sortAlphabetical) {
            setSortDescending(!sortDescending);
            sortList(false);

            if (!showFilteredList) {
                if (sortDescending) {
                    numbers.sort((a, b) => parseInt(a.props["data-value"]) - parseInt(b.props["data-value"]));
                } else {
                    numbers.sort((a, b) => parseInt(b.props["data-value"]) - parseInt(a.props["data-value"]));
                }
            }
        } else {
            setSortAlphabetical(false);
            setFilterByLetters(false);

            if (!showFilteredList) {
                if (sortDescending) {
                    numbers.sort((a, b) => parseInt(a.props["data-value"]) - parseInt(b.props["data-value"]));
                } else {
                    numbers.sort((a, b) => parseInt(b.props["data-value"]) - parseInt(a.props["data-value"]));
                }
            }
        }
    }

    function handleNumericFilter() {
        setSortDescending(!sortDescending);
        filterList(false);
    }

    function handleAlphaSort() {
        if (sortAlphabetical) {
            setSortDescending(!sortDescending);
            sortList(true);

            if (!showFilteredList) {
                if (sortDescending) {
                    letters.sort((a, b) => b.props["data-value"].localeCompare(a.props["data-value"]));
                } else {
                    letters.sort((a, b) => a.props["data-value"].localeCompare(b.props["data-value"]));
                }
            }
        } else {
            setSortAlphabetical(true);
            setFilterByLetters(true);

            if (!showFilteredList) {
                if (sortDescending) {
                    letters.sort((a, b) => a.props["data-value"].localeCompare(b.props["data-value"]));
                } else {
                    letters.sort((a, b) => b.props["data-value"].localeCompare(a.props["data-value"]));
                }
            }
        }
    }

    function handleAlphaFilter() {
        setSortDescending(!sortDescending);
        filterList(true);
    }

    /** Swaps between filtered and unfiltered list displays */
    function toggleFilteredList() {
        setShouldFilterList(!shouldFilterList);
        setShowFilteredList(!showFilteredList);
    }

    /** Swaps between numerical and alphabetical filters */
    function filterList(shouldFilterAlpha = filterByLetters) {
        if (shouldFilterAlpha) {
            setFilteredList(
                [...filteredList].sort((a, b) => {
                    return a.title.localeCompare(b.title);
                })
            );
        } else {
            setFilteredList(
                [...filteredList].sort((a, b) => {
                    return parseInt(a.number) - parseInt(b.number);
                })
            );
        }
        setFilterByLetters(shouldFilterAlpha);
    }

    /** Swaps between numerical and alphabetical sorting of the filtered lists */
    function sortList(shouldSortAlpha = sortAlphabetical) {
        let callback = null;
        if (showFilteredList) {
            callback = setFilteredList;
        } else {
            callback = setRawList;
        }

        if (shouldSortAlpha) {
            if (sortDescending) {
                callback(list =>
                    [...list].sort((a, b) => {
                        return a.title.localeCompare(b.title);
                    })
                );
            } else {
                callback(list =>
                    [...list].sort((a, b) => {
                        return b.title.localeCompare(a.title);
                    })
                );
            }
        } else {
            if (sortDescending) {
                callback(list =>
                    [...list].sort((a, b) => {
                        return parseInt(a.number) - parseInt(b.number);
                    })
                );
            } else {
                callback(list =>
                    [...list].sort((a, b) => {
                        return parseInt(b.number) - parseInt(a.number);
                    })
                );
            }
        }
        setSortAlphabetical(shouldSortAlpha);
    }

    /** Shows the filtered list based on selection */
    function changeActiveNav() {
        setShowFilteredList(true);
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
            changeActiveNav();
        }

        if (songs.length > 1 && letters.length <= 1) {
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
                            {<Filter title="Filter icon" className={shouldFilterList ? "active" : ""} />}
                        </button>
                        <button
                            type="button"
                            className="listSwitcher"
                            onClick={showFilteredList ? handleAlphaFilter : handleAlphaSort}
                        >
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
                        <button
                            type="button"
                            className="listSwitcher"
                            onClick={showFilteredList ? handleNumericFilter : handleNumericSort}
                        >
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
                    {!showFilteredList && <List>{filterByLetters ? letters : numbers}</List>}
                    {showFilteredList && (
                        <List>
                            {shouldFilterList && filteredJSX}
                            {!shouldFilterList && unfilteredJSX}
                        </List>
                    )}
                </>
            )}
        </>
    );
}

export default SongList;
