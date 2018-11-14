import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import Routes from './routes';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
	palette: {
		primary: { main: '#0277BD' },
        secondary: { main: '#66BB6A' },
	},
	typography: {
		useNextVariants: true,
	},
});

ReactDOM.render(
	<MuiThemeProvider theme={theme}> 
		<BrowserRouter >
        	<Routes />
    	</BrowserRouter >
	</MuiThemeProvider>, 
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
