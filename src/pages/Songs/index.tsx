import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { lazyImport } from "helpers";

import "./Songs.scss";

const SongList = lazyImport(import("components/SongList"));
const SongDisplay = lazyImport(import("components/SongDisplay"));

function Listing() {
	const { path } = useRouteMatch();
	const pageBG = useColorModeValue("#f5f5f5", "gray.800");

	return (
		<Box className="songs" bg={pageBG}>
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
