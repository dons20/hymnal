import React, { Suspense } from "react";
import { useParams } from "react-router-dom";
import Helmet from "react-helmet";
import "./Songs.scss";

const SongList = React.lazy(() => import("../../components/SongList"));

function Listing() {
    const { id } = useParams();

    const meta = {
        title: "Song Book",
        page: "Index"
    };

    return (
        <div className="listing">
            <Helmet>
                <title>{`Hymns | ${meta.page}`}</title>
            </Helmet>

            <Suspense fallback={<>Loading Songs...</>}>
                <SongList id={id} />
            </Suspense>
        </div>
    );
}

export default Listing;
