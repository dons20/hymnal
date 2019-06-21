import React from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { withStyles, withTheme } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import Drawer from "../Drawer";
import Logo from "../../logo.png";

const styles = theme => ({
    root: {
        width: "100%"
    },
    grow: {
        flexGrow: 1
    },
    menuButton: {
        display: "none",
        [theme.breakpoints.up("md")]: {
            display: "block",
            marginLeft: -12,
            marginRight: 20
        }
    },
    logo: {
        height: "auto",
        maxHeight: "50px",
        marginRight: 10,
        [theme.breakpoints.down("xs")]: {
            display: "none"
        }
    },
    h6: {
        display: "none",
        [theme.breakpoints.up("sm")]: {
            display: "block"
        }
    },
    search: {
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25)
        },
        marginLeft: 0,
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(1),
            width: "auto"
        }
    },
    searchIcon: {
        width: theme.spacing(9),
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    inputRoot: {
        color: "inherit",
        width: "100%",
        display: "flex"
    },
    inputInput: {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(10),
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            width: 200,
            "&:focus": {
                width: 300
            }
        }
    }
});

function Nav(props) {
    const { classes } = props;

    function acceptMethods(toggleDrawer) {
        // Parent stores the method that the child passed
        classes.toggleDrawer = toggleDrawer;
    }

    return (
        <div className={classes.root}>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <IconButton
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="Open drawer"
                        onClick={() => classes.toggleDrawer("left", true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <img className={classes.logo} src={Logo} alt="Logo" />
                    <Typography className={classes.h6} variant="h6" color="inherit" noWrap>
                        Hymnal PWA
                    </Typography>
                    <div className={classes.grow} />
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon />
                        </div>
                        <InputBase
                            placeholder="Search…"
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput
                            }}
                        />
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer shareMethods={acceptMethods} />
        </div>
    );
}

Nav.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
};

export default withTheme(withStyles(styles)(Nav));
