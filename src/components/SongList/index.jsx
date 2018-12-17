import React, { Fragment, Component } from 'react';
import { get, set } from 'idb-keyval';

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
        set('songs', JSON.stringify(songsJSON));
        this.songs = this.cleanupStrings(songsJSON);
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
        if (this.checkDB()) {
            let songStorage = await get('songs');
            let parsed = JSON.parse(songStorage);
            this.songs = this.cleanupStrings(parsed);
        } else {
            this.loadSongsFromJSON();
        }


        console.groupEnd();
    }
    
    render() {
        return ( 
            <Fragment>

            </Fragment>
        );
    }
}
 
export default SongList;