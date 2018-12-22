import React, { Fragment, Component } from 'react';
import { get, set } from 'idb-keyval';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const Song = {
    number: Number,
    title: String,
    verse: Array(String),
    chorus: String,
    author: String,
}

class SongList extends Component {

    constructor(props) {
        super(props);
        this.songs = [Song];
        this.state = {
            songList: [<ListItem key={1} />]
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
        this.songs = this.cleanupStrings(songsJSON);

        this.setState({songList: this.songs.map(e => 
            <ListItem 
                button
                key={e.number.toString()} >
              <ListItemText primary={e.title} />
            </ListItem>
        )});
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
        console.group("%cLoading Songs from database", "color: #d8001c; font-size: large;");
        let result = await this.checkDB();
        
        if (result) {
            let songStorage = await get('songs');
            this.songs = this.cleanupStrings(songStorage);
            this.setState({songList: this.songs.map(e => 
                <ListItem 
                    button
                    key={e.number.toString()} >
                  <ListItemText primary={e.title} />
                </ListItem>
            )});
        } else {
            this.loadSongsFromJSON();
        }
        console.groupEnd();
    }
    
    render() {
        return ( 
            <Fragment>
                 <List component="nav">
                    {this.state.songList.length > 1 && 
                        this.state.songList}
                </List>
            </Fragment>
        );
    }
}
 
export default SongList;