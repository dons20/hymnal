import React, { Suspense, useReducer, useEffect } from "react";
import BottomNav from "./components/BottomNav";
import styles from "./App.module.scss";
import Header from "./pages/Header";
import { useSongLoader } from "./components/CustomHooks";

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
    width: window.innerWidth,
    filteredList: Array(<div key={1} />)
};

/**
 * @param {initialAppState} state
 * @param {{ payload: Object }} action
 */
function reducer(state, action) {
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

function App({ children }) {
    const [state, dispatch] = useReducer(reducer, initialAppState);
    const songs = useSongLoader();

    function handleWindowSizeChange() {
        dispatch({ type: "setWidth", width: window.innerWidth });
    }

    useEffect(() => {
        window.addEventListener("resize", handleWindowSizeChange);
        return function cleanup() {
            window.removeEventListener("resize", handleWindowSizeChange);
        };
    });

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
                        {children}
                    </main>

                    {/* Bottom Navigation on mobile */ isMobile ? <BottomNav /> : null}
                </section>
            </MainContext.Provider>
        </div>
    );
}

export default App;
