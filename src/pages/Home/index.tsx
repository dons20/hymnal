import { useEffect } from "react";
import { Box, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
import { Helmet } from "react-helmet";
import { Card } from "components";
import { useMainContext } from "App";

import favourites from "img/favourites.svg";
import songs from "img/songs.svg";
import "./Home.scss";

const meta = {
	title: "Homepage",
	page: "Home",
};

function HomeScreen() {
	const { pages, dispatch } = useMainContext();
	const pageBG = useColorModeValue("gray.200", "gray.800");

	useEffect(() => {
		dispatch!({ type: "setTitle", payload: meta.title });
	}, [dispatch]);

	return (
		<>
			<Helmet>
				<title>{`Hymns for All Times | ${meta.page}`}</title>
			</Helmet>
			<Box bg={pageBG} h="100%">
				<SimpleGrid
					minChildWidth={{ base: "260px", sm: "380px" }}
					spacingX="30px"
					spacingY="15px"
					className="grid"
					maxWidth={{ md: "800px" }}
				>
					<Card
						title="Songs"
						subtitle="View a listing of all songs"
						imageSrc={songs}
						imageAlt="Placeholder for Songs"
						primaryLink={pages.INDEX}
						primaryLabel="View Songs"
					/>

					<Card
						title="Favourites"
						subtitle="View your favourite songs"
						imageSrc={favourites}
						imageAlt="Placeholder for Favourites"
						primaryLink={pages.FAVOURITES}
						primaryLabel="View Favourites"
					/>
				</SimpleGrid>
			</Box>
		</>
	);
}

export default HomeScreen;
