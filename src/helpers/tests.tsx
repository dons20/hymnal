import { act } from "react-dom/test-utils";
import { CTX, MainContextProvider } from "../utils/context";

type ProviderT = {
    children: React.ReactNode;
    value: unknown;
};

const resizeWindow = (x: number, y: number) => {
    window.innerWidth = x;
    window.innerHeight = y;
    act(() => {
        window.dispatchEvent(new Event("resize"));
    });
};

const Providers = ({ children, value }: ProviderT) => (
    <MainContextProvider value={value as CTX}>{children}</MainContextProvider>
);

export { resizeWindow, Providers };
export default resizeWindow;
