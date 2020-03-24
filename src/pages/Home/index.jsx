import React, { useMemo, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainContext } from "../../App";
import { Helmet } from "react-helmet";
import { Card, Button } from "antd";
import songs from "../../img/songs.svg";
import favourites from "../../img/favourites.svg";
import "./Home.scss";

const meta = {
    title: "Homepage",
    page: "Home"
};

function HomeScreen() {
    const { pages, dispatch } = useContext(MainContext);

    useEffect(() => {
        dispatch({ type: "setTitle", payload: meta.title });
    }, [dispatch]);

    return useMemo(() => {
        return (
            <>
                <Helmet>
                    <title>{`Hymns | ${meta.page}`}</title>
                </Helmet>
                <div className="grid">
                    <Card
                        hoverable={window.innerWidth > 960}
                        className="card"
                        title="Songs"
                        cover={
                            <img alt="Placeholder for Songs" src={songs} style={{ height: "100%", width: "100%" }} />
                        }
                        extra={<p style={{ margin: 0 }}>View a listing of all songs</p>}
                    >
                        <Button type="primary" size="large" block>
                            <Link to={pages.INDEX}>View Songs</Link>
                        </Button>
                    </Card>
                    <Card
                        hoverable={window.innerWidth > 960}
                        className="card"
                        title="Favourites"
                        cover={
                            <img
                                alt="Placeholder for Favourites"
                                src={favourites}
                                style={{ height: "100%", width: "100%" }}
                            />
                        }
                        extra={<p style={{ margin: 0 }}>View your favourite songs</p>}
                    >
                        <Button size="large" block>
                            <Link to={pages.FAVOURITES}>View Favourites</Link>
                        </Button>
                    </Card>
                </div>
            </>
        );
    }, [pages]);
}

export default HomeScreen;
