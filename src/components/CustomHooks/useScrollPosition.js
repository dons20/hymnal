import { useRef, useLayoutEffect, useEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const isBrowser = typeof window !== `undefined`;

function getScrollPosition({ element, useWindow }) {
    if (!isBrowser) return { x: 0, y: 0 };

    const target = element ? element.current : document.body;
    const position = target.getBoundingClientRect();

    return useWindow ? { x: window.pageXOffset, y: window.pageYOffset } : { x: position.left, y: position.top };
}

function useScrollPosition(effect, deps = [], element = false, useWindow = false, wait = 100) {
    const position = useRef(getScrollPosition({ useWindow }));

    let throttleTimeout = null;

    const callBack = () => {
        const currPos = getScrollPosition({ element, useWindow });
        effect({ prevPos: position.current, currPos });
        position.current = currPos;
        throttleTimeout = null;
    };

    useIsomorphicLayoutEffect(() => {
        if (!isBrowser) {
            return;
        }

        const handleScroll = () => {
            if (wait) {
                if (throttleTimeout === null) {
                    throttleTimeout = setTimeout(callBack, wait);
                }
            } else {
                callBack();
            }
        };

        window.addEventListener("scroll", handleScroll, {
            capture: false,
            passive: true
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            throttleTimeout && clearTimeout(throttleTimeout);
        };
    }, deps);
}

export default useScrollPosition;