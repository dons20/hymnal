import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { MainContext } from '../../App';
import { withStyles } from '@material-ui/core/styles'
import { Typography, Paper, Card, CardContent, CardActions, CardMedia, Button } from '@material-ui/core';

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
	heading: {
		color: '#FFF'
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
	}
});

function HomeScreen (props) {
	const { classes } = props;

	return (
		<MainContext.Consumer>
			{({pages, dispatch}) => 
				<Fragment>
				<Paper className={classes.root} elevation={3}>
					<Typography className={classes.heading} variant="h4">
						Hymns for All Times
					</Typography>
					<Typography className={classes.heading} variant="h6">
						Song Book
					</Typography>
				</Paper>
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
									onClick={() => dispatch({ page: pages.INDEX })}>
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
								<Button size="small" variant="outlined" color="secondary" className={classes.action}>View Favourites</Button>
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
								<Button size="small" variant="outlined" color="secondary" disabled className={classes.action}>View History</Button>
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
