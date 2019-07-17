import React, { Fragment, Suspense, useEffect, useContext, useRef } from "react";
import { MainContext } from "../../App";
import { makeStyles } from "@material-ui/core";

const SongList = React.lazy(() => import("../../components/SongList"));

const useStyles = makeStyles({
    root: {
        color: "#111",
        display: "flex",
        flex: "1",
        flexDirection: "column",
        justifyContent: "flex-start",
        overflowY: "auto"
    },
    header: {
        color: "#111",
        fontSize: 24
    }
});

function Listing(props) {
    const { url } = props.match;
    const { id } = props.match.params;
    const classes = useStyles(props);
    const context = useContext(MainContext);
    const contextRef = useRef(context);

    useEffect(() => {
        contextRef.current.setProp({
            title: "List of Songs",
            subtitle: "",
            path: url
        });
    }, [url]);

    return (
        <div className={classes.root}>
            <Suspense fallback={<Fragment>Loading Songs...</Fragment>}>
                <SongList id={id} />
            </Suspense>
        </div>
    );
}

export default Listing;
