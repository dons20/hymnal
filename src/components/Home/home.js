import PropTypes from 'prop-types';
import React, { Fragment } from "react";
import { withStyles } from '@material-ui/core/styles';
import { Typography, Paper } from "@material-ui/core";
import blue from '@material-ui/core/colors/blue';

const styles = theme => ({
    root: {
      ...theme.mixins.gutters(),
      backgroundColor: blue[700],
      color: '#FFF',
      paddingTop: theme.spacing.unit * 2,
      paddingBottom: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
    },
    heading: {
        color: '#FFF'
    }
});

function HomeScreen(props) {
    const { classes } = props;

    return ( 
        <Fragment>
            <Paper className={classes.root} elevation={3}>
                <Typography className={classes.heading} variant="h4">
                    Hymns for All Times
                </Typography>
            </Paper>
        </Fragment>
    );
}

HomeScreen.propTypes = {
    classes: PropTypes.object.isRequired,
};
 
export default withStyles(styles)(HomeScreen);