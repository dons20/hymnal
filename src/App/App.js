import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import BottomNav from '../components/BottomNav/BottomNav';
import Nav from '../components/TopNav/TopNav';
import styles from './App.module.scss';
import Index from '../pages/Index/Index';
import HomePage from '../pages/Home/Home';

class App extends Component {
	constructor() {
		super();
		
		this.pages = {
			HOME: 'Home',
			INDEX: 'Index',
			FAVOURITES: 'Favourites',
			SETTINGS: 'Settings'
		};

		this.state = {
			currentPage: this.pages.HOME,
			width: window.innerWidth
		};
	}

	componentWillMount() {
		window.addEventListener('resize', this.handleWindowSizeChange);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleWindowSizeChange);
	}

	handleWindowSizeChange = () => {
		this.setState({ width: window.innerWidth });
	};

	changePage(page) {
		this.setState({ currentPage: page});
	}

	getComponent() {
		let component = null;
		switch (this.state.currentPage) {
			case this.pages.HOME:
				component = <HomePage 
								navigate={this.changePage.bind(this)} 
								pages={this.pages}>
							</HomePage>;
				break;
			case this.pages.INDEX:
				component = <Index />;
				break;
			case this.pages.FAVOURITES:
				break;
			case this.pages.SETTINGS:
                break;
            default:
                break;

		}
		return component;
	}

	render() {
		const { width } = this.state;
		const isMobile = width <= 960;
		return (
			<div className={styles.app}>
				<CssBaseline />
				<section className={styles.app_body}>
					{/* Header */}
					<Nav />
					<main className={styles.app_inner}>
						{/* Main */}
						{this.getComponent()}
					</main>
					{/* Bottom Navigation on mobile */}
					{isMobile ? <BottomNav /> : null}
				</section>
			</div>
		);
	}
}

export default App;