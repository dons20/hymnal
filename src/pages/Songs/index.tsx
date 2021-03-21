import React, { Suspense } from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";

import "./Songs.scss";

const SongList = React.lazy(() => import("components/SongList"));
const SongDisplay = React.lazy(() => import("components/SongDisplay"));

function Listing() {
	const { path } = useRouteMatch();

	return (
		<div className="songs">
			<Suspense fallback={<Spinner size="xl" />}>
				<Switch>
					<Route exact path={path} component={SongList} />
					<Route path={`${path}/:songID(\\d+)`} component={SongDisplay} />
					<Route>
						<Redirect to="/songs" />
					</Route>
				</Switch>
			</Suspense>
		</div>
	);
}

export default Listing;
