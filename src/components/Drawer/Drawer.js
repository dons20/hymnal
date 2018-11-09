import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import Logo from '../../logo.png';

const styles = {
  list: {
    width: 250,
  },
  logo: {
    height: 'auto',
    maxHeight: '50px',
  },
};

class SwipeableTemporaryDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { left: false };
  }

  toggleDrawer(side, open) {
    this.setState({
      [side]: open,
    });
  };

  componentDidMount() {
    // Child passes its method to the parent
    this.props.shareMethods(this.toggleDrawer.bind(this));
  }

  render() {
    const { classes } = this.props;
    let iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

    const sideList = (
      <div className={classes.list}>
        <List gutterBottom>
            <ListItem>
              <ListItemIcon><img className={classes.logo} src={Logo} alt="Logo"/> </ListItemIcon>
              <ListItemText primary="Hymnal PWA" />
            </ListItem>
        </List>
        <Divider />
        <List>
          {['Index', 'Favourites', 'Search'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['Settings', 'About'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
    );

    return (
      
      <div>
        <SwipeableDrawer disableBackdropTransition={!iOS} disableDiscovery={iOS}
          open={this.state.left}
          onClose={() => this.toggleDrawer('left', false)}
          onOpen={() => this.toggleDrawer('left', true)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={() => this.toggleDrawer('left', false)}
            onKeyDown={() => this.toggleDrawer('left', false)}
          >
            {sideList}
          </div>
        </SwipeableDrawer>
      </div>
    );
  }
}

SwipeableTemporaryDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SwipeableTemporaryDrawer);