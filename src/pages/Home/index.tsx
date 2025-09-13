import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Box, SimpleGrid, useMantineColorScheme } from "@mantine/core";
import { useMainContext } from "@/utils/context";
import { Card } from "@/components";

import favourites from "@/img/favourites.svg";
import songs from "@/img/songs.svg";
import "./Home.scss";

const meta = {
    title: "Homepage",
    page: "Home",
};

function HomeScreen() {
    const { pages, dispatch } = useMainContext();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        dispatch!({ type: "setTitle", payload: meta.title });
    }, [dispatch]);

    return (
        <>
            <Helmet>
                <title>{`Hymns for All Times | ${meta.page}`}</title>
            </Helmet>
            <Box bg={isDark ? 'gray.8' : 'gray.2'} h="100%" data-testid="homeWrapper">
                <SimpleGrid
                    cols={{ base: 1, sm: 2 }}
                    className="grid"
                    maw="800px"
                    m="0 auto"
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
