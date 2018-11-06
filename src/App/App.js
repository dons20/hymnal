import React, { Component } from 'react';
import BottomNav from '../components/BottomNav/BottomNav'
import Nav from '../components/Nav/Nav';
import './App.scss';

class App extends Component {
  render() {
    return (
      <div className="App">
        <section className="App-body">
          <Nav />
          <BottomNav />
        </section>
      </div>
    );
  }
}

export default App;
