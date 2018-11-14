import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import BottomNav from './components/BottomNav';
import Nav from './components/TopNav';
import styles from './App.module.scss';
import { Redirect } from 'react-router-dom';

export const MainContext = React.createContext();

const reducer = (action) => {
	return <Redirect to={action.page} />
}

class App extends Component {
	state = {
		width: window.innerWidth,
		activePage: '/',
		pages: {
			HOME: '/',
			INDEX: '/index',
			FAVOURITES: '/favourites',
			SETTINGS: '/settings'
		},
		dispatch: action => {
			console.log(action);
			reducer(action);
		}
	}

	componentWillMount() {
		window.addEventListener('resize', this.handleWindowSizeChange);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleWindowSizeChange);
	}

	handleWindowSizeChange = () => {
		this.setState({ width: window.innerWidth });
	}

	render() {
		const { width } = this.state;
		const isMobile = width <= 960;
		return (
			<div className={styles.app}>
				<CssBaseline />
				<MainContext.Provider value={this.state}>
					<section className={styles.app_body}>
						{/* Header */}
						<Nav />
						
						{/* Main */}
						<main className={styles.app_inner}>
							{/* this.getComponent() */}
							{this.props.children}
						</main>
						
						{/* Bottom Navigation on mobile */}
						{isMobile ? <BottomNav /> : null}
					</section>
				</MainContext.Provider>
			</div>
		);
	}
}

export default App;