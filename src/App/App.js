import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import BottomNav from '../components/BottomNav/BottomNav';
import HomeScreen from '../components/Home/Home';
import Nav from '../components/Nav/Nav';
import Index from '../components/Index';
import './App.scss';

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

	getComponent() {
		let component = null;
		switch (this.state.currentPage) {
			case this.pages.HOME:
				component = <HomeScreen />;
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
			<div className="App">
				<CssBaseline />
				<section className="App-body">
					{/* Header */}
					<Nav />
					{/* Main */}
					{this.getComponent()}
					{/* Bottom Navigation on mobile */}
					{isMobile ? <BottomNav /> : null}
				</section>
			</div>
		);
	}
}

export default App;
