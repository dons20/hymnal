import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Songs from './pages/Songs'


const Routes = () => (
    <App>
        <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/songs" component={Songs} />
            <Route render={() => <Redirect to="/" />}/>
        </Switch>
    </App>
)

export default Routes