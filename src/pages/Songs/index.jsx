import React, { Fragment, Suspense } from 'react';
import PropTypes from 'prop-types';
import { MainContext } from '../../App';
import { withStyles } from '@material-ui/core';

const SongList = React.lazy(() => import('../../components/SongList'));

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

class Listing extends React.Component {
    componentDidMount() {
        let state = this.context;

        state.setTitle("List of Songs");
        state.setSubtitle("");
    }

    render() {    
        return ( 
            <Fragment>
                <div>
                    Song page...
                    <Suspense fallback={<Fragment>Loading Songs...</Fragment>} >
                        <SongList />
                    </Suspense>
                </div>
            </Fragment>
        );
    }
}

Listing.propTypes = {
	classes: PropTypes.object.isRequired
};

Listing.contextType = MainContext;
 
export default withStyles(styles)(Listing);