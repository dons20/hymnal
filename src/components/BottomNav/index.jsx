import React, { useState, useEffect, useRef, useContext } from "react";
import { MainContext } from "../../App";
import theme from "../../theme.js";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import FolderIcon from "@material-ui/icons/Folder";
import RestoreIcon from "@material-ui/icons/Restore";
import FavoriteIcon from "@material-ui/icons/Favorite";
import LocationOnIcon from "@material-ui/icons/LocationOn";

const useStyles = makeStyles({
    root: {
        display: "none",
        [theme.breakpoints.down("sm")]: {
            bottom: 0,
            display: "flex",
            position: "sticky",
            transition: "transform 0.3s ease-out",
            willChange: "transform",
            width: "100%"
        }
    },
    hide: {
        transform: "translateY(100%)"
    }
});

function LabelBottomNavigation(props) {
    const scrollPos = useRef(0);
    const { shouldForceShow } = props;
    const classes = useStyles(props);
    const context = useContext(MainContext);
    const [value, setValue] = useState("");
    const [shouldHide, setShouldHide] = useState(false);

    const handleChange = value => {
        setValue(value);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (document.body.getBoundingClientRect().top > scrollPos.current) setShouldHide(false);
            else setShouldHide(true);

            // saves the new position for iteration.
            scrollPos.current = document.body.getBoundingClientRect().top;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (context.path.startsWith(value)) {
            setValue(context.path);
        }

        if (shouldForceShow) setShouldHide(false);
    }, [shouldForceShow, value, context]);

    return (
        <BottomNavigation
            value={value}
            onChange={handleChange}
            className={`${classes.root}${shouldHide ? " " + classes.hide : ""}`}
        >
            <BottomNavigationAction
                label="Home"
                value={context.pages.HOME}
                icon={<RestoreIcon />}
                onClick={() => context.changePath(context.pages.HOME)}
            />
            <BottomNavigationAction
                label="Index"
                value={context.pages.INDEX}
                icon={<FavoriteIcon />}
                onClick={() => context.changePath(context.pages.INDEX)}
            />
            <BottomNavigationAction
                label="Favourites"
                value={context.pages.FAVOURITES}
                icon={<LocationOnIcon />}
                onClick={() => context.changePath(context.pages.FAVOURITES)}
            />
            <BottomNavigationAction
                label="Settings"
                value={context.pages.HISTORY}
                icon={<FolderIcon />}
                onClick={() => context.changePath(context.pages.HISTORY)}
            />
        </BottomNavigation>
    );
}

export default LabelBottomNavigation;
