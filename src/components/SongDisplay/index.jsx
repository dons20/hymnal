import React, { useContext, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { MainContext } from "../../App";
import { Helmet } from "react-helmet";
import "./SongDisplay.scss";

function SongDisplay() {
    const { songs, dispatch } = useContext(MainContext);
    const { songID } = useParams();

    const songIndex = parseInt(songID) - 1;
    const songBody = songs[songIndex].verse.map((verse, i) => {
        if (i === 1 && songs[songIndex].chorus) {
            return (
                <Fragment key={i}>
                    <div className="chorus">
                        <span className="label">Chorus</span>
                        {songs[songIndex].chorus}
                    </div>
                    <div className="verse">
                        <span className="label">Verse {i + 1}</span>
                        {verse}
                    </div>
                </Fragment>
            );
        }

        return (
            <div className="verse" key={i}>
                <span className="label">Verse {i + 1}</span>
                {verse}
            </div>
        );
    });

    useEffect(() => {
        if (songs.length > 1) dispatch({ type: "setTitle", payload: songs[songIndex].title });
    }, [dispatch, songs, songIndex]);

    return (
        <div className="container">
            {songs.length > 1 && (
                <>
                    <Helmet>
                        <title>{`Hymns | ${songs[songIndex].title}`}</title>
                    </Helmet>
                    <div className="header">
                        <div># {songs[songIndex].number}</div>
                        <div>{songs[songIndex].title}</div>
                    </div>
                    <div className="body">{songBody}</div>
                    {songs[songIndex].author && <div className="footer">{songs[songIndex].author}</div>}
                </>
            )}
        </div>
    );
}

export default SongDisplay;
