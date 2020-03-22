import React, { Suspense, useReducer, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { useSongLoader } from "./components/CustomHooks";
import { Header, Home, Songs, Settings } from "./pages";
import BottomNav from "./components/BottomNav";
import styles from "./App.module.scss";

const PictureHeader = React.lazy(() => import("./components/PictureHeader"));

const pages = {
    HOME: "/",
    INDEX: "/songs",
    FAVOURITES: "/favourites",
    HISTORY: "/history",
    SETTINGS: "/settings"
};

const initialAppState = {
    title: "",
    subtitle: "",
    activeIndex: 0,
    songDisplay: "",
    listLoaded: false,
    width: document.body.getBoundingClientRect().width,
    filteredList: Array(<div key={1} />)
};

/**
 * @param {initialAppState} _state
 * @param {{ payload: Object }} action
 */
function reducer(_state, action) {
    switch (action.type) {
        case "setTitle":
            return { title: action.payload };
        case "setSubtitle":
            return { subtitle: action.payload };
        case "setWidth":
            return { width: action.payload };
        default:
            throw new Error(`Invalid Action Specified: ${action.payload}`);
    }
}

export const MainContext = React.createContext(initialAppState);

function App() {
    const [state, dispatch] = useReducer(reducer, initialAppState);
    const songs = useSongLoader();

    function handleWindowSizeChange() {
        dispatch({ type: "setWidth", payload: document.body.getBoundingClientRect().width });
    }

    useEffect(() => {
        window.addEventListener("orientationchange", handleWindowSizeChange, {
            capture: false,
            passive: true
        });
        return function cleanup() {
            window.addEventListener("orientationchange", handleWindowSizeChange);
        };
    }, []);

    const { width } = state;
    const isMobile = width <= 960;

    return (
        <div className={styles.root}>
            <MainContext.Provider value={{ ...state, dispatch, songs, pages }}>
                <section className={styles.app_body}>
                    <Header />
                    <main className={styles.app_inner}>
                        <Suspense fallback={<div>Loading...</div>}>
                            <PictureHeader title={state.title} subtitle={state.subtitle} />
                        </Suspense>

                        <div className={styles.wrapper}>
                            <Switch>
                                <Route exact path="/home" component={Home} />
                                <Route exact path={["/songs", "/songs/:id"]} component={Songs} />
                                <Route path="settings" component={Settings} />
                                <Route>
                                    <Redirect to="/home" />} />
                                </Route>
                            </Switch>
                        </div>
                    </main>

                    {/* Bottom Navigation on mobile */ isMobile ? <BottomNav /> : null}
                </section>
            </MainContext.Provider>
        </div>
    );
}

export default App;
