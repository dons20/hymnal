import React, { useEffect, useState } from "react";

const Song = {
    number: Number,
    title: String,
    verse: Array(String),
    chorus: String,
    author: String
};

function useSongLoader() {
    const [state, setState] = useState({
        songList: Array(Song),
        listSortByLetters: true,
        listSortAlphabetical: false,
        letterRow: Array(<div key={1} />),
        numbers: Array(Number),
        songBody: Array(<div key={1} />)
    });

    let songs = null;
    return songs;
}

export { useSongLoader };
