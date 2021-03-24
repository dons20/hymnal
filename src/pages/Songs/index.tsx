import React from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { withSuspense } from "helpers";

import "./Songs.scss";

const SongList = withSuspense(React.lazy(() => import("components/SongList")));
const SongDisplay = withSuspense(React.lazy(() => import("components/SongDisplay")));

function Listing() {
	const { path } = useRouteMatch();

	return (
		<Box className="songs">
			<Switch>
				<Route exact path={`${path}/index`} component={SongList} />
				<Route path={`${path}/:songID(\\d+)`} component={SongDisplay} />
				<Route>
					<Redirect to="/songs/index" />
				</Route>
			</Switch>
		</Box>
	);
}

export default Listing;
