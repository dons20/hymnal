import React, { Suspense, useReducer, useEffect } from "react";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import { useSongLoader, useTouchScreenDetection } from "./components/CustomHooks";
import { Header, Home, Songs, Settings } from "./pages";
import BottomNav from "./components/BottomNav";
import styles from "./App.module.scss";

const PictureHeader = React.lazy(() => import("./components/PictureHeader"));

const pages = {
    HOME: "/home",
    INDEX: "/songs",
    FAVOURITES: "/favourites",
    SETTINGS: "/settings"
};

const initialAppState = {
    meta: {
        title: "",
        subtitle: "",
        width: document.body.getBoundingClientRect().width
    }
};

/**
 * @param {{  }} _state
 * @param {{ type: String, payload: Object }} action
 */
function reducer(_state, action) {
    switch (action.type) {
        case "setTitle":
            return { ..._state, title: action.payload };
        case "setSubtitle":
            return { ..._state, subtitle: action.payload };
        case "setWidth":
            return { ..._state, width: action.payload };
        default:
            throw new Error(`Invalid Action Specified: ${action.payload}`);
    }
}

const ScrollRestoration = () => {
    const { pathname } = useHistory();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

/** @type {React.Context<any>} */
export const MainContext = React.createContext({});

function App() {
    const [state, dispatch] = useReducer(reducer, initialAppState);
    const songs = useSongLoader();
    const hasTouchScreen = useTouchScreenDetection();
    const width = state?.meta?.width;
    const isMobile = width <= 1200 && hasTouchScreen;

    function handleOrientationChange() {
        dispatch({ type: "setWidth", payload: document.body.getBoundingClientRect().width });
    }

    useEffect(() => {
        window.addEventListener("orientationchange", handleOrientationChange, {
            capture: false,
            passive: true
        });
        return function cleanup() {
            window.addEventListener("orientationchange", handleOrientationChange);
        };
    }, []);

    return (
        <div className={styles.root}>
            <MainContext.Provider value={{ meta: state, dispatch, songs, pages }}>
                <section className={styles.app_body}>
                    <Header />
                    <ScrollRestoration />
                    <main className={styles.app_inner}>
                        <Suspense fallback={<div>Loading...</div>}>
                            <PictureHeader />
                        </Suspense>

                        <div className={styles.wrapper}>
                            <Switch>
                                <Route path="/home" component={Home} />
                                <Route path="/songs" component={Songs} />
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
