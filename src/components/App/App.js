import React, { Component } from 'react';
import Nav from '../Nav/Nav';
import './App.scss';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-body">
          <Nav />
        </header>
      </div>
    );
  }
}

export default App;
