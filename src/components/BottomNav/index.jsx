import React, { useState, useEffect, useRef, useContext } from "react";
import { MainContext } from "../../App";
import theme from "../../theme.js";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import HomeIcon from "@material-ui/icons/Home";
import IndexIcon from "@material-ui/icons/LibraryBooksOutlined";
import FavoritesIcon from "@material-ui/icons/Favorite";
import SettingsIcon from "@material-ui/icons/Settings";

const useStyles = makeStyles({
    "@keyframes slideDown": {
        from: {
            transform: "translateY(0%)"
        },
        to: {
            transform: "translateY(100%)"
        }
    },
    root: {
        display: "none",
        [theme.breakpoints.down("sm")]: {
            bottom: 0,
            display: "flex",
            position: "sticky",
            willChange: "transform",
            width: "100%"
        }
    },
    showing: {
        animation: "$slideDown 0.3s ease-out reverse"
    },
    hiding: {
        animation: "$slideDown 0.1s ease-out"
    },
    hidden: {
        transform: "translateY(0)",
        position: "relative"
    }
});

function LabelBottomNavigation(props) {
    const scrollPos = useRef(0);
    const classes = useStyles(props);
    const context = useContext(MainContext);
    const [value, setValue] = useState("");
    const [hidden, setHidden] = useState(false);
    const [showing, setShowing] = useState(false);
    const [hiding, setHiding] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            //Handle navbar transitioning between showing/hiding/hidden states when scrolling
            if (document.body.getBoundingClientRect().top > scrollPos.current) {
                setHiding(false);
                setHidden(false);
                if (hidden) setShowing(true);
            } else {
                if (!hidden) setHiding(true);
            }

            // saves the new position for iteration.
            scrollPos.current = document.body.getBoundingClientRect().top;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hidden]);

    useEffect(() => {
        //Syncs currently selected tab with active url path
        let match = "";
        for (let key in context.pages) {
            if (context.path.startsWith(context.pages[key])) {
                match = context.pages[key];
            }
        }
        setValue(match);
    }, [context]);

    function handleChange(_event, newValue) {
        setValue(newValue);
    }

    function handleTabClicks(toPage) {
        if (toPage !== value) context.changePath(toPage);
    }

    return (
        <BottomNavigation
            value={value}
            onChange={handleChange}
            className={`${classes.root}${hiding ? " " + classes.hiding : ""}${hidden ? " " + classes.hidden : ""}${
                showing ? " " + classes.showing : ""
            }`}
            onAnimationEnd={() => {
                if (hiding) setHidden(true);
                setHiding(false);
                if (showing) setShowing(false);
            }}
        >
            <BottomNavigationAction
                label="Home"
                value={context.pages.HOME}
                icon={<HomeIcon />}
                onClick={() => handleTabClicks(context.pages.HOME)}
            />
            <BottomNavigationAction
                label="Index"
                value={context.pages.INDEX}
                icon={<IndexIcon />}
                onClick={() => handleTabClicks(context.pages.INDEX)}
            />
            <BottomNavigationAction
                label="Favourites"
                value={context.pages.FAVOURITES}
                icon={<FavoritesIcon />}
                onClick={() => handleTabClicks(context.pages.FAVOURITES)}
            />
            <BottomNavigationAction
                label="Settings"
                value={context.pages.HISTORY}
                icon={<SettingsIcon />}
                onClick={() => handleTabClicks(context.pages.HISTORY)}
            />
        </BottomNavigation>
    );
}

export default LabelBottomNavigation;
