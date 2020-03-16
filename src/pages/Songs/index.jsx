import React, { Fragment, Suspense } from "react";
import "./Songs.scss";

const SongList = React.lazy(() => import("../../components/SongList"));

function Listing(props) {
    const { params } = props.match;
    const { id } = params;

    return (
        <div className="listing">
            <Suspense fallback={<Fragment>Loading Songs...</Fragment>}>
                <SongList id={id} />
            </Suspense>
        </div>
    );
}

export default Listing;
