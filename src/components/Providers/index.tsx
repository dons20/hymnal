import React from "react";
import { useSongLoader } from "components/CustomHooks";
import { MainContextProvider, pages, ACTIONTYPE, State } from "utils/context";
import { Loader } from "components";

type PropsT = {
	children: React.ReactNode;
};

const initialAppState = {
	title: "",
	subtitle: "",
	width: document.body.getBoundingClientRect().width,
};

function reducer(state: State, action: ACTIONTYPE): State {
	switch (action.type) {
		case "setTitle":
			return { ...state, title: action.payload };
		case "setSubtitle":
			return { ...state, subtitle: action.payload };
		case "setWidth":
			return { ...state, width: action.payload };
		default:
			return state;
	}
}

function MainContext({ children }: PropsT) {
	const { songs, favourites, setFavourites } = useSongLoader();
	const [state, dispatch] = React.useReducer(reducer, initialAppState);

	if (songs.length === 0) return <Loader />;

	return (
		<MainContextProvider value={{ meta: state, songs, favourites, setFavourites, dispatch, pages }}>
			{children}
		</MainContextProvider>
	);
}

export default MainContext;
