import { useContext, useEffect } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Helmet } from "react-helmet";
import { Card } from "components";
import { MainContext } from "App";

import favourites from "img/favourites.svg";
import songs from "img/songs.svg";
import "./Home.scss";

const meta = {
	title: "Homepage",
	page: "Home",
};

function HomeScreen() {
	const { pages, dispatch } = useContext(MainContext);
	const pageBG = useColorModeValue("#f5f5f5", "gray.800");

	useEffect(() => {
		dispatch!({ type: "setTitle", payload: meta.title });
	}, [dispatch]);

	return (
		<>
			<Helmet>
				<title>{`Hymns | ${meta.page}`}</title>
			</Helmet>
			<Box bg={pageBG}>
				<Box className="grid">
					<Card
						title="Songs"
						subtitle="View a listing of all songs"
						imageSrc={songs}
						imageAlt="Placeholder for Songs"
						primaryLink={pages!.INDEX}
						primaryLabel="View Songs"
					/>

					<Card
						title="Favourites"
						subtitle="View your favourite songs"
						imageSrc={favourites}
						imageAlt="Placeholder for Favourites"
						primaryLink={pages!.FAVOURITES}
						primaryLabel="View Favourites"
					/>
				</Box>
			</Box>
		</>
	);
}

export default HomeScreen;
