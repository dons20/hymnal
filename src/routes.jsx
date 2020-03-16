import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Songs from "./pages/Songs";

const Routes = () => (
    <App>
        <Switch>
            <Route exact path="/home" render={() => <Home />} />
            <Route
                path={["/songs", "/songs/:id"]}
                //render={({ match }) => <Songs x={match} />}
                component={Songs}
                exact
            />
            <Route render={() => <Redirect to="/home" />} />
        </Switch>
    </App>
);

export default Routes;
