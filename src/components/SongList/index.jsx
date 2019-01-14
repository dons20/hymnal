import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { get, set } from 'idb-keyval';
import { withStyles } from '@material-ui/core';
import { FixedSizeList } from 'react-window';
import List from '@material-ui/core/List';

const Song = {
    number: Number,
    title: String,
    verse: Array(String),
    chorus: String,
    author: String,
}

const styles = () => ({
	container: {
        width: '60%',
        margin: 'auto',
    },
    grid: {
        display: 'grid',
        gridTemplateRows: 'repeat(6, 50px)',
        gridTemplateColumns: '25% 25% 25% 25%',
    },
	menuOpt: {
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        transition: 'background 0.1s ease-in-out',
        willChange: 'background',
        '&:hover': {
            background: 'rgba(0,0,0,0.1)'
        },
    },
});

class SongList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nowShowing: '',
            songList: Array(Song),
            letters: Array(String),
            numbers: Array(Number),
            filteredList: Array(<div key={1} />)
        };
    }

    async checkDB() {
        console.log(`%cChecking if songs exist already`, 'color: #b70018; font-size: medium;');
        let songStorage = await get('songs');
        if (songStorage !== undefined) {
            console.log(`%cSongs found! Attempting to load...`, 'color: #b70018; font-size: medium;');
            return true;
        }
        console.log(`%cNo database entry found, will parse json...`, 'color: #b70018; font-size: medium;');
        return false;
        
    }

    async loadSongsFromJSON() {
        let songsJSON = await this.loadData();
        set('songs', songsJSON);
        this.setState({songList: this.cleanupStrings(songsJSON)});
    }

    loadData() {
        return new Promise(async (resolve) => {
            let url = process.env.PUBLIC_URL + '/songs.json';
            let response = await fetch(url);
            if (response.ok) {
				console.log(`%cLoading from "${url}"`, 'color: #b70018; font-size: medium;');
				resolve(response.json());
			} else {
				throw Object.assign(new Error(`File "${url}" not found on server!`));
			}
		}).catch((err) => {
			console.error(err);
		});
    }

    createMenu() {
        const {songList} = this.state;
        return new Promise(resolve => {
            let characters = [],
                numbers = [];
            for (let i = 0; i < songList.length; i++) {
                characters.push(songList[i].title.charAt(0));
                numbers.push(songList[i].number);
            }
            resolve(String.prototype.concat(...new Set(characters)));
        })
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
            .replace(/\*/g, '')
            .replace(/\s{2,}/g, '\n')
            .trim();
        return newString;
    }

    async componentDidMount() {
        console.log("%cLoading Songs from database", "color: #d8001c; font-size: large; font-weight: bold");
        let result = await this.checkDB();
        
        if (result) {
            let songStorage = await get('songs');
            this.setState({songList: this.cleanupStrings(songStorage)});
        } else {
            await this.loadSongsFromJSON();
        }

        let letters = await this.createMenu();
        this.setState({letters: letters.replace(/\W/, '').split('').sort()});
    }

    filterSongs(type, value) {
        if (type === 'range') {

        } else if (type === 'letter') {
            let filteredSongs = this.state.songList.filter(song => song.title.charAt(0) === value);
            this.setState({
                filteredList: filteredSongs.map(e => 
                    <div 
                        
                        key={e.number.toString()} >
                        <div>{e.title}</div>
                    </div>
                ), 
                nowShowing: "songs"
            });
        } else {
            return null;
        }
    }
    
    render() {
        const { letters, nowShowing, filteredList } = this.state;
        const { classes } = this.props;
        let FL = null;
        if (filteredList.length > 1 && !FL) FL = () => (filteredList);

        return ( 
            <Fragment>
                {nowShowing === '' && 
                    <List 
                        component="div"
                        className={`${classes.container} ${classes.grid}`}
                    >
                        {letters.length > 1 && nowShowing === "" &&
                            letters.map(letter => 
                                <div 
                                    className={classes.menuOpt}
                                    onClick={() => this.filterSongs('letter', letter)}
                                    key={letter}
                                >
                                    {letter}
                                </div> 
                            )
                        }
                    </List>
                }
                {nowShowing === "songs" &&
                    <FixedSizeList 
                        height={300}
                        itemCount={filteredList.length}
                        itemSize={100}
                        width={'50%'}
                        className={classes.container}
                    >
                        {FL}
                    </FixedSizeList>
                }
            </Fragment>
        );
    }
}

SongList.propTypes = {
	classes: PropTypes.object.isRequired
};
 
export default withStyles(styles)(SongList);