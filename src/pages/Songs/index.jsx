import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Paper, withStyles } from '@material-ui/core';

const styles = (theme) => ({
	root: {
		...theme.mixins.gutters(),
		backgroundColor: theme.palette.primary.light,
		color: '#FFF',
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
    },
});

function Listing (props) {
    const { classes } = props;
    
    return ( 
        <Fragment>
            <Paper className={classes.root}>
                Index Page
            </Paper>
        </Fragment>
    );
}

Listing.propTypes = {
	classes: PropTypes.object.isRequired
};
 
export default withStyles(styles)(Listing);