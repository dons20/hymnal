import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles'
import { Typography, Paper, Card, CardContent, CardActions, Button } from '@material-ui/core';

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
        minWidth: 275,
    },
        bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
        title: {
        fontSize: 14,
    },
        pos: {
        marginBottom: 12,
    },
});

function HomeScreen(props) {
    const { classes } = props;
    const bull = <span className={classes.bullet}>•</span>;

	return (
		<Fragment>
			<Paper className={classes.root} elevation={3}>
				<Typography className={classes.heading} variant="h4">
					Hymns for All Times
				</Typography>
				<Typography className={classes.heading} variant="p">
					Song Book
				</Typography>
			</Paper>
			<Card>
				<CardContent>
					<Typography
						className={classes.title}
						color="textSecondary"
						gutterBottom
					>
						Word of the Day
					</Typography>
					<Typography variant="h5" component="h2">
						be
						{bull}
						nev
						{bull}o{bull}
						lent
					</Typography>
					<Typography className={classes.pos} color="textSecondary">
						adjective
					</Typography>
					<Typography component="p">
						well meaning and kindly.
						<br />
						{'"a benevolent smile"'}
					</Typography>
				</CardContent>
				<CardActions>
					<Button size="small">Learn More</Button>
				</CardActions>
			</Card>
		</Fragment>
	);
}

HomeScreen.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomeScreen);
