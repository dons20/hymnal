import React, { Fragment, Suspense } from "react";
import PropTypes from "prop-types";
import { MainContext } from "../../App";
import { withStyles } from "@material-ui/core";

const SongList = React.lazy(() => import("../../components/SongList"));

const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        alignItems: "center",
        color: "#111",
        display: "flex",
        flex: "1",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        overflowY: "auto"
    },
    header: {
        color: "#111",
        fontSize: 24
    }
});

class Listing extends React.Component {
    componentDidMount() {
        let ctx = this.context;
        ctx.setProp({
            title: "List of Songs",
            subtitle: ""
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Suspense fallback={<Fragment>Loading Songs...</Fragment>}>
                    <SongList />
                </Suspense>
            </div>
        );
    }
}

Listing.propTypes = {
    classes: PropTypes.object.isRequired
};

Listing.contextType = MainContext;

export default withStyles(styles)(Listing);
