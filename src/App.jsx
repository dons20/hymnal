import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import BottomNav from './components/BottomNav';
import Nav from './components/TopNav';
import styles from './App.module.scss';
import { Redirect } from 'react-router-dom';

export const MainContext = React.createContext();

class App extends Component {
	state = {
		width: window.innerWidth,
		path: '/',
		pages: {
			HOME: '/',
			INDEX: '/index',
			FAVOURITES: '/favourites',
			HISTORY: '/history',
			SETTINGS: '/settings'
		},
		navigate: false,
		dispatch: (path) => {
			this.setState({ 
				navigate: !this.navigate,
				path: path,
			})
		},
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
		const { width, navigate } = this.state;
		const isMobile = width <= 960;

		if (navigate) {
			this.setState({ navigate: false });
			return <Redirect to={this.state.path} push={true} />
		}

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