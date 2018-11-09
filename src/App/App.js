import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import BottomNav from '../components/BottomNav/BottomNav';
import HomeScreen from '../components/Home/home';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Nav from '../components/Nav/Nav';
import Index from '../components/Index';
import './App.scss';

const theme = createMuiTheme({
	primary: { main: '#0277BD' },
  	secondary: { main: '#66BB6A' }
});
class App extends Component {
	constructor() {
		super();
		
		this.pages = {
			HOME: 'home',
			INDEX: 'index',
			FAVOURITES: 'favourites',
			SETTINGS: 'settings'
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
			<MuiThemeProvider theme={theme}>
				<div className="App">
					<CssBaseline />
					<section className="App-body">
						<Nav />
						{this.getComponent()}
						{isMobile ? <BottomNav /> : null}
					</section>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
