import PropTypes from 'prop-types';
import React, { Fragment, Suspense } from 'react';
import { MainContext } from '../../App';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Card, CardContent, CardActions, CardMedia, Button } from '@material-ui/core';

const PictureHeader = React.lazy(() => import('../../components/PictureHeader'));

const styles = (theme) => ({
	root: {
		backgroundColor: theme.palette.primary.light,
		color: '#FFF',
		marginBottom: theme.spacing.unit * 2
	},
	hCont: {
		alignItems: 'center',
		backgroundColor: 'rgba(0, 12, 23, 0.63)',
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		justifyContent: 'center',
	},
	heading: {
		color: '#FFF',
    },
    card: {
		margin: `${theme.spacing.unit * 2}px auto`,
		minWidth: 250,
		width: 'calc(1/3*100% - (1 - 1/3)*10px)',
    },
	media: {
		height: 150
	},
	title: {
        fontSize: 14,
    },
	pos: {
        marginBottom: 12,
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
		gridGap: '30px',
	},
	wrapper: {
		margin: '0 auto',
		width: '90%',
	},
	action: {
		marginLeft: 'auto',
	},
	bgImgCont: {
		backgroundSize: 'cover',
		backgroundPosition: 'bottom center',
		backgroundRepeat: 'no-repeat',
		display: 'block',
		height: '25vh',
		position: 'relative',
		width: '100%',
	},
	bgImg: {
		display: 'none',
	},
});

function HomeScreen (props) {
	const { classes } = props;

	return (
		<MainContext.Consumer>
			{state => 
				<Fragment>
					<Suspense fallback={<Fragment>Loading...</Fragment>}>
						<PictureHeader 
							title={"Hymns for All Times"}
							subtitle={"Song Book"}
						/>
					</Suspense>
					<div className={classes.wrapper}>
						<div className={classes.grid}>
							<Card className={classes.card}>
								<CardMedia 
									component="img"
									className={classes.media}
									src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOUWH9lHgAEvQI7iIz1fQAAAABJRU5ErkJggg=="
									title="Placeholder"
								/>
								<CardContent>
									<Typography variant="h5" component="h2" className={classes.pos}>
										Songs
									</Typography>
									<Typography component="p">
										View a listing of all songs
									</Typography>
								</CardContent>
								<CardActions>
									<Button 
										size="small" 
										variant="outlined" 
										color="primary" 
										className={classes.action} 
										onClick={() => { state.dispatch(state.pages.INDEX) }}>
										View Songs
									</Button>
								</CardActions>
							</Card>
							<Card className={classes.card}>
								<CardMedia 
									component="img"
									className={classes.media}
									src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8oiYxDwAEmgGyAOwzCAAAAABJRU5ErkJggg=="
									title="Placeholder"
								/>
								<CardContent>
									<Typography variant="h5" component="h2" className={classes.pos}>
										Favourites
									</Typography>
									<Typography component="p">
										View your favourite songs here!
									</Typography>
								</CardContent>
								<CardActions>
									<Button 
										size="small" 
										variant="outlined" 
										color="secondary" 
										className={classes.action}
										onClick={() => { state.dispatch(state.pages.FAVOURITES) }}>
										View Favourites
									</Button>
								</CardActions>
							</Card>
							<Card className={classes.card}>
								<CardMedia 
									component="img"
									className={classes.media}
									src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNUlLgyDwADHAGth3cp9QAAAABJRU5ErkJggg=="
									title="Placeholder"
								/>
								<CardContent>
									<Typography variant="h5" component="h2" className={classes.pos}>
										History
									</Typography>
									<Typography component="p">
										Previously viewed songs
									</Typography>
								</CardContent>
								<CardActions>
									<Button 
										size="small" 
										variant="outlined" 
										color="secondary" 
										className={classes.action}
										onClick={() => { state.dispatch(state.pages.HISTORY) }}>
										View History
									</Button>
								</CardActions>
							</Card>
						</div>
					</div>
				</Fragment>
			}
		</MainContext.Consumer>
		
	);
}

HomeScreen.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomeScreen);