import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { get, set } from "idb-keyval";
import { MainContext } from "../../App";
import { withStyles } from "@material-ui/core";
import List from "@material-ui/core/List";

/** @param {import('@material-ui/core').Theme} theme */
const styles = theme => ({
    container: {
        //height: "55vh",
        //backgroundColor: "#fff",
        display: "grid",
        gridAutoRows: 80,
        maxWidth: 1200,
        margin: "0 auto",
        paddingTop: 0,
        paddingBottom: 0
    },
    grid: {
        display: "grid",
        gridAutoRows: 80,
        gridTemplateColumns: "repeat(2, minmax(60px, 1fr))",
        gridGap: 10,
        width: "100%"
    },
    listItem: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "25% 1fr",
        textAlign: "left",
        transition: "background 0.1s ease-in-out",
        userSelect: "none",
        willChange: "background",
        "&:after": {
            content: '"',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 10,
            backgroundColor: "#f4f4f4"
        }
    },
    listItemEven: {
        background: "white"
    },
    listItemOdd: {
        background: "white"
    },
    listTitle: {
        alignItems: "center",
        display: "flex",
        padding: "0 20px"
    },
    listSwitcher: {
        backgroundColor: theme.palette.primary.A400,
        border: 0,
        boxShadow: "0 3px 6px rgba(41, 121, 240, 0.12), 0 3px 6px rgba(41, 121, 240, 0.24)",
        color: theme.palette.secondary.contrastText,
        fontSize: "1.3rem",
        padding: theme.spacing(2),
        width: "100%"
    },
    menuOpt: {
        alignItems: "center",
        background: "rgba(255,255,255,1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        cursor: "pointer",
        display: "flex",
        fontSize: "2rem",
        justifyContent: "center",
        transition: "background 0.1s ease-in-out, box-shadow 0.3s cubic-bezier(.25,.8,.25,1)",
        willChange: "background, box-shadow",
        "&:hover": {
            background: "rgba(0,0,0,0.05)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
        }
    },
    songContainer: {
        backgroundColor: "rgba(255,255,255,1)",
        height: "100%",
        padding: 15
    },
    songBody: {
        display: "grid",
        gridTemplateRows: "repeat(auto-fit, minmax(100px, 1fr))",
        gridRowGap: "20px",
        margin: "20px auto",
        whiteSpace: "pre-line"
    },
    songFooter: {
        alignSelf: "flex-end"
    },
    songHeader: {
        alignContent: "center",
        display: "grid",
        fontWeight: "bold",
        justifyItems: "center",
        gridTemplateRows: "auto auto"
    },
    "@media (min-width: 425px)": {
        grid: {
            gridTemplateRows: "repeat(auto-fit, 1fr)",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
        },
        listItem: {
            "&:hover": {
                background: "rgba(0,0,0,0.1)"
            }
        }
    }
});

class SongList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listSortByLetters: true,
            listSortAlphabetical: false,
            letterRow: Array(<div key={1} />),
            numbers: Array(Number),
            songBody: Array(<div key={1} />)
        };
        this.displaySong = this.displaySong.bind(this);
        this.loadSongsFromJSON = this.loadSongsFromJSON.bind(this);
        this.createMenu = this.createMenu.bind(this);
        this.filterSongs = this.filterSongs.bind(this);
        this.changeActiveNav = this.changeActiveNav.bind(this);
        this.swapListFilter = this.swapListFilter.bind(this);
    }

    /** Checks if songs have already been stored */
    async checkDB() {
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
    loadSongsFromJSON() {
        let { setProp } = this.context;
        this.fetchSongs().then(json => {
            setProp({ songList: this.cleanupStrings(json), listLoaded: true });
            set("songs", json);
        });
    }

    /** Fetches song database and returns it for parsing */
    fetchSongs() {
        return new Promise(async resolve => {
            let url = process.env.PUBLIC_URL + "/songs.json";
            let response = await fetch(url);
            if (response.ok) {
                console.log(`%cLoading from "${url}"`, "color: #b70018; font-size: medium;");
                resolve(response.json());
            } else {
                throw Object.assign(new Error(`File "${url}" not found on server!`));
            }
        }).catch(err => {
            console.error(err);
        });
    }

    /** Generates a menu from all available letters and numbers */
    createMenu() {
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
    cleanupStrings(songs) {
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
    replaceString(string) {
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
    filterSongs(type, value) {
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
    displaySong(index, filtered) {
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
    changeActiveNav() {
        this.setState({
            listSortByLetters: !this.state.listSortByLetters
        });
    }

    /** Swaps between numerical and alphabetical sort */
    swapListFilter(isAlphabetical) {
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
    componentDidMount() {
        if (this.context.songList.length <= 1) {
            console.log("%cLoading Songs from database", "color: #d8001c; font-size: large; font-weight: bold");
            this.checkDB()
                .then(async res => {
                    if (res) {
                        let songStorage = await get("songs");
                        let { setProp } = this.context;
                        setProp({ songList: this.cleanupStrings(songStorage), listLoaded: true });
                    } else {
                        this.loadSongsFromJSON();
                    }
                })
                .finally(() => {
                    if (this.props.id && this.props.id > 0 && this.props.id < this.context.songList.length)
                        this.displaySong(this.props.id - 1, false);
                });
        }
    }

    /** Handles changes to the active display when component updates */
    componentDidUpdate() {
        const { activeIndex, filteredList, songList, songDisplay, listLoaded } = this.context;

        /** Handles filtered song navigation */
        if (songDisplay === "fView" && this.state.songBody.length <= 1) {
            const newBody = filteredList[activeIndex].verse.map((verse, index) => {
                if (index === 1) {
                    return (
                        <Fragment key={index}>
                            <div>{filteredList[activeIndex].chorus}</div>
                            <div>{verse}</div>
                        </Fragment>
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
                        <Fragment key={index}>
                            <div>{songList[activeIndex].chorus}</div>
                            <div>{verse}</div>
                        </Fragment>
                    );
                }
                return <div key={index}>{verse}</div>;
            });
            this.setState({ songBody: newBody });
        }

        if (listLoaded && this.state.letterRow.length <= 1) {
            const { classes } = this.props;

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
                        <div
                            className={classes.menuOpt}
                            onClick={() => this.filterSongs("letter", letter)}
                            key={letter}
                        >
                            {letter}
                        </div>
                    )),
                    numbers: finalNumbers.map(num => (
                        <div
                            className={classes.menuOpt}
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

    render() {
        const { letterRow, numbers, songBody, listSortByLetters, listSortAlphabetical } = this.state;
        const { activeIndex, filteredList, songDisplay, listLoaded, songList } = this.context;
        const { classes } = this.props;

        return (
            <Fragment>
                {!listLoaded && <div>Replace me with loading icon</div>}
                {songDisplay === "" && listLoaded && (
                    <>
                        <button type="button" onClick={this.changeActiveNav} className={classes.listSwitcher}>
                            {listSortByLetters ? "Filter by Numbers" : "Filter by Letters"}
                        </button>
                        <List component="div" className={`${classes.container} ${classes.grid}`}>
                            {listSortByLetters ? letterRow : numbers}
                        </List>
                    </>
                )}
                {songDisplay === "list" && (
                    <Fragment>
                        <button
                            type="button"
                            onClick={() => {
                                this.swapListFilter(!listSortAlphabetical);
                            }}
                            className={classes.listSwitcher}
                        >
                            {listSortAlphabetical ? "Sort Alphabetically" : "Sort Numerically"}
                        </button>
                        <List component="div" className={classes.container}>
                            {filteredList.map((song, index) => (
                                <div
                                    key={song.number}
                                    onClick={() => this.displaySong(index, true)}
                                    className={`${classes.listItem} ${
                                        index % 2 ? classes.listItemOdd : classes.listItemEven
                                    }`}
                                >
                                    <div className={classes.listTitle}>#{song.number}</div>
                                    <div className={classes.listTitle}>{song.title}</div>
                                </div>
                            ))}
                        </List>
                    </Fragment>
                )}
                {songDisplay === "fView" && (
                    <div className={classes.songContainer}>
                        <div className={classes.songHeader}>
                            <div>{filteredList[activeIndex].number}</div>
                            <div>{filteredList[activeIndex].title}</div>
                        </div>
                        <div className={classes.songBody}>{songBody}</div>
                        {filteredList[activeIndex].author && (
                            <div className={classes.songFooter}>{filteredList[activeIndex].author}</div>
                        )}
                    </div>
                )}
                {songDisplay === "dView" && (
                    <div className={classes.songContainer}>
                        <div className={classes.songHeader}>
                            <div>{songList[activeIndex].number}</div>
                            <div>{songList[activeIndex].title}</div>
                        </div>
                        <div className={classes.songBody}>{songBody}</div>
                        {songList[activeIndex].author && (
                            <div className={classes.songFooter}>{songList[activeIndex].author}</div>
                        )}
                    </div>
                )}
            </Fragment>
        );
    }
}

SongList.propTypes = {
    classes: PropTypes.object.isRequired
};

SongList.contextType = MainContext;

export default withStyles(styles)(SongList);
