import React, { useState, useEffect, useContext } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { MainContext } from "../../App";
import { Helmet } from "react-helmet";
import { Spin, List } from "antd";
import "./SongList.scss";

/** FA Images */
import SortAlphaDown from "../../img/sort-alpha-down-solid.svg";
import SortAlphaDownAlt from "../../img/sort-alpha-down-alt-solid.svg";
import SortNumericDown from "../../img/sort-numeric-down-solid.svg";
import SortNumericDownAlt from "../../img/sort-numeric-down-alt-solid.svg";
import Filter from "../../img/filter-solid.svg";

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
    const [shouldFilterList, setShouldFilterList] = useState(true);
    const [showFilteredList, setShowFilteredList] = useState(false);
    const [filterByLetters, setFilterByLetters] = useState(true);
    const [sortAlphabetical, setSortAlphabetical] = useState(false);
    const [letterRow, setLetterRow] = useState(Array(<div key={1} />));
    const [numbers, setNumbers] = useState(Array(<div key={1} />));
    const [filteredList, setFilteredList] = useState([]);

    /**
     * Displays a song at specified index
     * @param {MouseEventInit&{ currentTarget: { getAttribute: (arg0: string) => String; }; }} e
     */
    function displaySong(e) {
        const songID = e?.currentTarget?.getAttribute("data-song-id");
        history.push(`${path}/${songID}`);
    }

    function toggleFilteredList() {
        setShouldFilterList(!shouldFilterList);
        setShowFilteredList(!showFilteredList);
    }

    /** Swaps between numerical and alphabetical filters */
    function swapListFilter() {
        if (filterByLetters) {
            setFilteredList(
                [...filteredList].sort((a, b) => {
                    return parseInt(a.number) - parseInt(b.number);
                })
            );
        } else {
            setFilteredList(
                [...filteredList].sort((a, b) => {
                    return a.title.localeCompare(b.title);
                })
            );
        }
        setFilterByLetters(!filterByLetters);
    }

    /** Swaps between numerical and alphabetical sorting of the filtered lists */
    function swapListSorting() {
        if (sortAlphabetical) {
            setFilteredList(
                [...filteredList].sort((a, b) => {
                    return parseInt(a.number) - parseInt(b.number);
                })
            );
        } else {
            setFilteredList(
                [...filteredList].sort((a, b) => {
                    return a.title.localeCompare(b.title);
                })
            );
        }
        setSortAlphabetical(!sortAlphabetical);
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

        if (songs.length > 1 && letterRow.length <= 1) {
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

                setLetterRow(
                    letters.map(letter => (
                        <div className="menuOpt" onClick={() => filterSongs("letters", letter)} key={letter}>
                            {letter}
                        </div>
                    ))
                );
                setNumbers(
                    finalNumbers.map(num => (
                        <div className="menuOpt" onClick={() => filterSongs("range", [num[0], num[1]])} key={num[0]}>
                            {num[0]} - {num[1]}
                        </div>
                    ))
                );
            });
        }
    }, [songs, letterRow.length]);

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
            {songs?.length > 1 && !showFilteredList && (
                <>
                    <Helmet>
                        <title>{`Hymns | ${meta.title}`}</title>
                    </Helmet>
                    <div className="utilityHeader">
                        <button type="button" className="listSwitcher" onClick={toggleFilteredList}>
                            {<img src={Filter} alt="Filter icon" className={shouldFilterList ? "active" : ""} />}
                        </button>
                        <button type="button" className="listSwitcher" onClick={swapListFilter}>
                            {filterByLetters ? (
                                <img src={SortNumericDown} alt="Sort Numeric descending icon" />
                            ) : (
                                <img src={SortAlphaDown} alt="Sort Alphabetically descending icon" />
                            )}
                        </button>
                    </div>
                    <List>{filterByLetters ? letterRow : numbers}</List>
                </>
            )}
            {songs?.length > 1 && showFilteredList && (
                <>
                    <div className="utilityHeader">
                        <button type="button" className="listSwitcher" onClick={toggleFilteredList}>
                            {<img src={Filter} alt="Filter icon" className={shouldFilterList ? "active" : ""} />}
                        </button>
                        <button type="button" onClick={swapListSorting} className="listSwitcher">
                            {sortAlphabetical ? (
                                <img src={SortNumericDown} alt="Sort Numeric descending icon" />
                            ) : (
                                <img src={SortAlphaDown} alt="Sort Alphabetically descending icon" />
                            )}
                        </button>
                    </div>
                    <List>
                        {shouldFilterList &&
                            filteredList.map(song => (
                                <div
                                    key={song.number}
                                    data-song-id={song.number}
                                    onClick={displaySong}
                                    className="listItem"
                                >
                                    <div className="listTitle">#{song.number}</div>
                                    <div className="listTitle">{song.title}</div>
                                </div>
                            ))}
                        {!shouldFilterList &&
                            songs.map(song => (
                                <div
                                    key={song.number}
                                    data-song-id={song.number}
                                    onClick={displaySong}
                                    className="listItem"
                                >
                                    <div className="listTitle">#{song.number}</div>
                                    <div className="listTitle">{song.title}</div>
                                </div>
                            ))}
                    </List>
                </>
            )}
        </>
    );
}

export default SongList;
