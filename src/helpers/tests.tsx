import { act } from "react-dom/test-utils";
import { MainContextProvider } from "utils/context";

type ProviderT = {
	children: React.ReactNode;
	value: any;
};

const resizeWindow = (x: number, y: number) => {
	// @ts-ignore
	window.innerWidth = x;
	// @ts-ignore
	window.innerHeight = y;
	act(() => {
		window.dispatchEvent(new Event("resize"));
	});
};

const Providers = ({ children, value }: ProviderT) => (
	<MainContextProvider value={value}>{children}</MainContextProvider>
);

export { resizeWindow, Providers };
export default resizeWindow;
