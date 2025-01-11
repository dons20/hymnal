import { createCtx } from "helpers";

export const pages = {
    HOME: "/home",
    INDEX: "/songs",
    FAVOURITES: "/favourites",
    SETTINGS: "/settings",
};

export type State = {
    title: string;
    subtitle: string;
    width: number;
};

export type ACTIONTYPE =
    | { type: "setTitle"; payload: string }
    | { type: "setSubtitle"; payload: string }
    | { type: "setWidth"; payload: number };

export type CTX = {
    dispatch: React.Dispatch<ACTIONTYPE>;
    songs: Song[];
    favourites: number[];
    setFavourites: React.Dispatch<React.SetStateAction<number[]>>;
    pages: typeof pages;
    meta: State;
};

export const [useMainContext, MainContextProvider, MainContextConsumer] = createCtx<CTX>();
