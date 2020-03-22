import React, { useState, useEffect, useContext } from "react";

import { MainContext } from "../../App";
import Loader from "react-loader-spinner";
import { List } from "antd";
import "./SongList.scss";
import {} from "react";

function SongList({ id }) {
    const [filterBy, setFilterBy] = useState("letters");
    const { activeIndex, filteredList, songDisplay, listLoaded, songList } = useContext();
    const [state, setState] = useState({
        listSortByLetters: true,
        listSortAlphabetical: false,
        letterRow: Array(<div key={1} />),
        numbers: Array(Number),
        songBody: Array(<div key={1} />)
    });

    /** Generates a menu from all available letters and numbers */
    function createMenu() {
        const { songList } = this.context;
        return new Promise(resolve => {
            let characters = [],
                numbers = [];
            for (let i = 0; i < songList.length; i++) {
                characters.push(songList[i].title.charAt(0));
                numbers.push(songList[i].number);
            }
            resolve({ letters: String.prototype.concat(...new Set(characters)), numbers: numbers });
        });
    }

    /**
     * Filters list of songs by criteria
     * @param {String} type
     * @param {String} value
     */
    function filterSongs(type, value) {
        let filteredSongs;
        if (type === "number") {
            filteredSongs = this.context.songList.filter(song => song.number === value);
        } else if (type === "numRange") {
            filteredSongs = this.context.songList.filter(
                song => Number.parseInt(song.number) >= value[0] && Number.parseInt(song.number) <= value[1]
            );
        } else if (type === "letter") {
            filteredSongs = this.context.songList.filter(song => song.title.charAt(0) === value);
        } else {
            return null;
        }
        this.context.setProp({
            filteredList: filteredSongs,
            songDisplay: "list"
        });
    }

    /**
     * Displays a song at specified index
     * @param {Number} index
     * @param {Boolean} filtered
     */
    function displaySong(index, filtered) {
        /*.finally(() => {
            if (_id > 0 && _id < songs.length)
                displaySong(_id - 1, false);
        });*/
        if (filtered) {
            this.context.setProp({
                title: this.context.filteredList[index].title,
                songDisplay: "fView",
                activeIndex: index
            });
        } else {
            this.context.setProp({
                title: this.context.songList[index].title,
                songDisplay: "dView",
                activeIndex: index
            });
        }
    }

    /** Swaps between letter sort and number sort */
    function changeActiveNav() {
        this.setState({
            listSortByLetters: !this.state.listSortByLetters
        });
    }

    /** Swaps between numerical and alphabetical sort */
    function swapListFilter(isAlphabetical) {
        const { filteredList, setProp } = this.context;
        if (isAlphabetical) {
            setProp({
                filteredList: [...filteredList].sort((a, b) => {
                    return (a.title > b.title) - (a.title < b.title);
                })
            });
        } else {
            setProp({
                filteredList: [...filteredList].sort((a, b) => {
                    return parseInt(a.number) - parseInt(b.number);
                })
            });
        }
        this.setState({ listSortAlphabetical: isAlphabetical });
    }

    /** Handles changes to the active display when component updates */
    function componentDidUpdate() {
        const { activeIndex, filteredList, songList, songDisplay, listLoaded } = this.context;

        /** Handles filtered song navigation */
        if (songDisplay === "fView" && this.state.songBody.length <= 1) {
            const newBody = filteredList[activeIndex].verse.map((verse, index) => {
                if (index === 1) {
                    return (
                        <>
                            <div>{filteredList[activeIndex].chorus}</div>
                            <div>{verse}</div>
                        </>
                    );
                }
                return <div key={index}>{verse}</div>;
            });
            this.setState({ songBody: newBody });
        }

        /** Handles unfiltered song navigation */
        if (songDisplay === "dView" && this.state.songBody.length <= 1) {
            const newBody = songList[activeIndex].verse.map((verse, index) => {
                if (index === 1) {
                    return (
                        <>
                            <div>{songList[activeIndex].chorus}</div>
                            <div>{verse}</div>
                        </>
                    );
                }
                return <div key={index}>{verse}</div>;
            });
            this.setState({ songBody: newBody });
        }

        if (listLoaded && this.state.letterRow.length <= 1) {
            this.createMenu().then(val => {
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

                this.setState({
                    letterRow: letters.map(letter => (
                        <div className="menuOpt" onClick={() => this.filterSongs("letter", letter)} key={letter}>
                            {letter}
                        </div>
                    )),
                    numbers: finalNumbers.map(num => (
                        <div
                            className="menuOpt"
                            onClick={() => this.filterSongs("numRange", [num[0], num[1]])}
                            key={num[0]}
                        >
                            {num[0]} - {num[1]}
                        </div>
                    ))
                });
            });
        }
    }

    return (
        <>
            {!listLoaded && (
                <div className="loader">
                    <Loader type="Oval" color="blue" height={100} width={100} />
                </div>
            )}
            {songDisplay === "" && listLoaded && (
                <>
                    <div className="utilityHeader">
                        <button type="button" onClick={changeActiveNav} className="listSwitcher">
                            {/* {listSortByLetters ? "Filter by Numbers" : "Filter by Letters"} */}
                        </button>
                    </div>
                    <List component="div" className="container grid">
                        {/* {listSortByLetters ? letterRow : numbers} */}
                    </List>
                </>
            )}
            {songDisplay === "list" && (
                <>
                    <button
                        type="button"
                        onClick={() => {
                            //swapListFilter(!listSortAlphabetical);
                        }}
                        className="listSwitcher"
                    >
                        {/* {listSortAlphabetical ? "Sort Numerically" : "Sort Alphabetically"} */}
                    </button>
                    <List component="div" className="container">
                        {/* {filteredList.map((song, index) => (
                            <div
                                key={song.number}
                                //onClick={() => displaySong(index, true)}
                                className={`listItem ${index % 2 ? "listItemOdd" : "listItemEven"}`}
                            >
                                <div className="listTitle">#{song.number}</div>
                                <div className="listTitle">{song.title}</div>
                            </div>
                        ))} */}
                    </List>
                </>
            )}
            {songDisplay === "...fView" && (
                <div className="songContainer">
                    <div className="songHeader">
                        {/* <div>{filteredList[activeIndex].number}</div> */}
                        {/* <div>{filteredList[activeIndex].title}</div> */}
                    </div>
                    {/* <div className="songBody">{songBody}</div> */}
                    {/* {filteredList[activeIndex].author && (
                        <div className="songFooter">{filteredList[activeIndex].author}</div>
                    )} */}
                </div>
            )}
            {songDisplay === "....dView" && (
                <div className="songContainer">
                    <div className="songHeader">
                        <div>{songList[activeIndex].number}</div>
                        <div>{songList[activeIndex].title}</div>
                    </div>
                    {/* <div className="songBody">{songBody}</div> */}
                    {songList[activeIndex].author && <div className="songFooter">{songList[activeIndex].author}</div>}
                </div>
            )}
        </>
    );
}

export default SongList;
