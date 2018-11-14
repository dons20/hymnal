import React from 'react'
import { Route, Switch } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Listing from './pages/Listing'

const Routes = () => (
    <App>
        <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/index" component={Listing} />
        </Switch>
    </App>
)

export default Routes