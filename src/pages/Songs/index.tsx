import { lazy } from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";
import { Box, useColorModeValue } from "@chakra-ui/react";
import withSuspense from "helpers/withSuspense";

import "./Songs.scss";

const SongList = withSuspense(lazy(() => import("components/Songs/SongList")));
const SongDisplay = withSuspense(lazy(() => import("components/Songs/SongDisplay")));
const Favourites = withSuspense(lazy(() => import("pages/Favourites")));

function Listing() {
	const { path } = useRouteMatch();
	const pageBG = useColorModeValue("gray.200", "gray.800");

	return (
		<Box className="songs" bg={pageBG}>
			<Switch>
				<Route exact path={`${path}/index`} component={SongList} />
				<Route path={`${path}/favourites`} component={Favourites} />
				<Route path={`${path}/:songID(\\d+)`} component={SongDisplay} />
				<Route>
					<Redirect to="/songs/index" />
				</Route>
			</Switch>
		</Box>
	);
}

export default Listing;
