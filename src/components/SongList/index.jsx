import React, { useState, useEffect, useContext } from "react";
import { get, set } from "idb-keyval";
import { MainContext } from "../../App";
import Loader from "react-loader-spinner";
import { List } from "antd";
import "./SongList.scss";
import {} from "react";

function SongList(props) {
    const [filterBy, setFilterBy] = useState("letters");
    const { letterRow, numbers, songBody, listSortByLetters, listSortAlphabetical } = state;
    const { activeIndex, filteredList, songDisplay, listLoaded, songList } = useContext();

    /** Checks if songs have already been stored */
    async function checkDB() {
        console.log(`%cChecking if songs exist already`, "color: #b70018; font-size: medium;");
        let songStorage = await get("songs");
        if (songStorage !== undefined) {
            console.log(`%cSongs found! Attempting to load...`, "color: #b70018; font-size: medium;");
            return true;
        }
        console.log(`%cNo database entry found, will parse json...`, "color: #b70018; font-size: medium;");
        return false;
    }

    /** Loads songs from JSON and stores them locally */
    function loadSongsFromJSON() {
        this.fetchSongs().then(json => {
            this.setState({ songList: this.cleanupStrings(json), listLoaded: true });
            set("songs", json);
        });
    }

    /** Fetches song database and returns it for parsing */
    function fetchSongs() {
        return new Promise(async resolve => {
            let url = process.env.PUBLIC_URL + "/songs.json";
            let response = await fetch(url);
            if (response.ok) {
                resolve(response.json());
            } else {
                throw Object.assign(new Error(`File not found on server!`));
            }
        }).catch(err => {
            console.error(err);
        });
    }

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
     * Iterates over song array to make strings readable
     * @param {import('../../App').SongType} songs
     */
    function cleanupStrings(songs) {
        let obj = songs;
        for (let i = 0; i < obj.length; i++) {
            if (obj[i].chorus.length > 0) {
                obj[i].chorus = this.replaceString(obj[i].chorus);
            }
            let verses = [];
            for (let j = 0; j < obj[i].verse.length; j++) {
                if (obj[i].verse[j].length > 0) {
                    verses.push(this.replaceString(obj[i].verse[j]));
                }
            }
            obj[i].verse = verses;
        }

        return obj;
    }

    /**
     * Removes unnecessary characters and spaces from string
     * @param {string} string
     */
    function replaceString(string) {
        let newString = string
            .replace(/\*/g, "")
            .replace(/\s{2,}/g, "\n")
            .trim();
        return newString;
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

    /** Triggers loading of songs from database on component mount */
    useEffect(() => {
        /* if (this.state.songList.length <= 1) {
            console.log("%cLoading Songs from database", "color: #d8001c; font-size: large; font-weight: bold");
            this.checkDB()
                .then(async res => {
                    if (res) {
                        let songStorage = await get("songs");
                        this.setState({ songList: this.cleanupStrings(songStorage), listLoaded: true });
                    } else {
                        this.loadSongsFromJSON();
                    }
                })
                .finally(() => {
                    if (this.props.id && this.props.id > 0 && this.props.id < this.context.songList.length)
                        this.displaySong(this.props.id - 1, false);
                });
        } */
    }, []);

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
                        <button type="button" onClick={this.changeActiveNav} className="listSwitcher">
                            {listSortByLetters ? "Filter by Numbers" : "Filter by Letters"}
                        </button>
                    </div>
                    <List component="div" className="container grid">
                        {listSortByLetters ? letterRow : numbers}
                    </List>
                </>
            )}
            {songDisplay === "list" && (
                <>
                    <button
                        type="button"
                        onClick={() => {
                            this.swapListFilter(!listSortAlphabetical);
                        }}
                        className="listSwitcher"
                    >
                        {listSortAlphabetical ? "Sort Numerically" : "Sort Alphabetically"}
                    </button>
                    <List component="div" className="container">
                        {filteredList.map((song, index) => (
                            <div
                                key={song.number}
                                onClick={() => this.displaySong(index, true)}
                                className={`listItem ${index % 2 ? "listItemOdd" : "listItemEven"}`}
                            >
                                <div className="listTitle">#{song.number}</div>
                                <div className="listTitle">{song.title}</div>
                            </div>
                        ))}
                    </List>
                </>
            )}
            {songDisplay === "fView" && (
                <div className="songContainer">
                    <div className="songHeader">
                        <div>{filteredList[activeIndex].number}</div>
                        <div>{filteredList[activeIndex].title}</div>
                    </div>
                    <div className="songBody">{songBody}</div>
                    {filteredList[activeIndex].author && (
                        <div className="songFooter">{filteredList[activeIndex].author}</div>
                    )}
                </div>
            )}
            {songDisplay === "dView" && (
                <div className="songContainer">
                    <div className="songHeader">
                        <div>{songList[activeIndex].number}</div>
                        <div>{songList[activeIndex].title}</div>
                    </div>
                    <div className="songBody">{songBody}</div>
                    {songList[activeIndex].author && <div className="songFooter">{songList[activeIndex].author}</div>}
                </div>
            )}
        </>
    );
}

export default SongList;
