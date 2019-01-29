import React, { Component, Fragment, memo } from "react";
import PropTypes from "prop-types";
import { get, set } from "idb-keyval";
import { MainContext } from "../../App";
import { withStyles } from "@material-ui/core";
import { FixedSizeList } from "react-window";
import List from "@material-ui/core/List";

const styles = () => ({
  container: {
    height: "55vh",
    maxWidth: "800px",
    margin: "auto"
  },
  grid: {
    display: "grid",
    gridTemplateRows: "repeat(6, 1fr)",
    gridTemplateColumns: "25% 25% 25% 25%",
    width: "100%"
  },
  menuOpt: {
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    transition: "background 0.1s ease-in-out",
    willChange: "background",
    "&:hover": {
      background: "rgba(0,0,0,0.1)"
    }
  },
  songList: {
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "25% 1fr",
    textAlign: "left",
    transition: "background 0.1s ease-in-out",
    userSelect: "none",
    willChange: "background",
    "&:hover": {
      background: "rgba(0,0,0,0.1)"
    }
  },
  songTitle: {
    alignItems: "center",
    display: "flex",
    padding: "0 20px"
  }
});

const Row = memo(({ data, index, style }) => {
  const { filteredList, display, classes } = data;
  const song = filteredList[index];

  return (
    <div
      key={song.number}
      onClick={() => display(index)}
      className={classes.songList}
      style={style}
    >
      <div className={classes.songTitle}>#{song.number}</div>
      <div className={classes.songTitle}>{song.title}</div>
    </div>
  );
});

class SongList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      letters: Array(String),
      numbers: Array(Number),
      letterRow: Array(<div key={1} />)
    };
    this.displaySong = this.displaySong.bind(this);
    this.loadSongsFromJSON = this.loadSongsFromJSON.bind(this);
    this.createMenu = this.createMenu.bind(this);
    this.filterSongs = this.filterSongs.bind(this);
  }

  async checkDB() {
    console.log(
      `%cChecking if songs exist already`,
      "color: #b70018; font-size: medium;"
    );
    let songStorage = await get("songs");
    if (songStorage !== undefined) {
      console.log(
        `%cSongs found! Attempting to load...`,
        "color: #b70018; font-size: medium;"
      );
      return true;
    }
    console.log(
      `%cNo database entry found, will parse json...`,
      "color: #b70018; font-size: medium;"
    );
    return false;
  }

  async loadSongsFromJSON() {
    let songsJSON = await this.loadData();
    let { setProp } = this.context;
    set("songs", songsJSON);
    setProp("songList", this.cleanupStrings(songsJSON));
  }

  loadData() {
    return new Promise(async resolve => {
      let url = process.env.PUBLIC_URL + "/songs.json";
      let response = await fetch(url);
      if (response.ok) {
        console.log(
          `%cLoading from "${url}"`,
          "color: #b70018; font-size: medium;"
        );
        resolve(response.json());
      } else {
        throw Object.assign(new Error(`File "${url}" not found on server!`));
      }
    }).catch(err => {
      console.error(err);
    });
  }

  createMenu() {
    const { songList } = this.context;
    return new Promise(resolve => {
      let characters = [],
        numbers = [];
      for (let i = 0; i < songList.length; i++) {
        characters.push(songList[i].title.charAt(0));
        numbers.push(songList[i].number);
      }
      resolve(String.prototype.concat(...new Set(characters)));
    });
  }

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

  replaceString(string) {
    let newString = string
      .replace(/\*/g, "")
      .replace(/\s{2,}/g, "\n")
      .trim();
    return newString;
  }

  filterSongs(type, value) {
    if (type === "range") {
    } else if (type === "letter") {
      let filteredSongs = this.context.songList.filter(
        song => song.title.charAt(0) === value
      );
      this.context.setProp({
        filteredList: filteredSongs,
        songDisplay: "list"
      });
    } else {
      return null;
    }
  }

  displaySong(index) {
    this.context.setProp({
      title: this.context.filteredList[index].title,
      songDisplay: "list",
      activeIndex: index
    });
  }

  async componentDidMount() {
    const { classes } = this.props;

    console.log(
      "%cLoading Songs from database",
      "color: #d8001c; font-size: large; font-weight: bold"
    );
    let result = await this.checkDB();

    if (result) {
      let songStorage = await get("songs");
      let { setProp } = this.context;
      setProp({ songList: this.cleanupStrings(songStorage) });
    } else {
      await this.loadSongsFromJSON();
    }

    let letters = await this.createMenu();
    await this.setState({
      letters: letters
        .replace(/\W/, "")
        .split("")
        .sort()
    });

    await this.setState({
      letterRow: this.state.letters.map(letter => (
        <div
          className={classes.menuOpt}
          onClick={() => this.filterSongs("letter", letter)}
          key={letter}
        >
          {letter}
        </div>
      ))
    });
  }

  render() {
    const { letters, letterRow } = this.state;
    const { activeIndex, filteredList, songDisplay } = this.context;
    const { classes } = this.props;
    const itemData = { filteredList, display: this.displaySong, classes };

    return (
      <Fragment>
        {songDisplay === "" && (
          <List
            component="div"
            className={`${classes.container} ${classes.grid}`}
          >
            {letters.length > 1 && songDisplay === "" && letterRow}
          </List>
        )}
        {songDisplay === "list" && (
          <FixedSizeList
            height={500}
            itemCount={filteredList.length}
            itemData={itemData}
            itemSize={60}
            width={"100%"}
            className={classes.container}
          >
            {Row}
          </FixedSizeList>
        )}
        {songDisplay === "filteredView" && (
          <div>{filteredList[activeIndex].title}</div>
        )}
        {songDisplay === "directView" && (
          <div>{filteredList[activeIndex].title}</div>
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
