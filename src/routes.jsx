import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Songs from "./pages/Songs";

const Routes = () => (
    <App>
        <Switch>
            <Route exact path="/" render={() => <Home />} />
            <Route path="/songs" render={() => <Songs />} />
            <Route render={() => <Redirect to="/" />} />
        </Switch>
    </App>
);

export default Routes;
