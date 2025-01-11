import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, useColorModeValue } from "@chakra-ui/react";
import withSuspense from "helpers/withSuspense";

import "./Songs.scss";

const SongList = withSuspense(lazy(() => import("components/Songs/SongList")));
const SongDisplay = withSuspense(lazy(() => import("components/Songs/SongDisplay")));
const Favourites = withSuspense(lazy(() => import("pages/Favourites")));

function Listing() {
    const pageBG = useColorModeValue("gray.200", "gray.800");

    return (
        <Box className="songs" bg={pageBG}>
            <Routes>
                <Route path="index" element={<SongList />} />
                <Route path="favourites" element={<Favourites />} />
                <Route path=":songID" element={<SongDisplay />} />
                <Route path="/" element={<Navigate to="/songs/index" replace />} />
            </Routes>
        </Box>
    );
}

export default Listing;
