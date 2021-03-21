import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useScrollPosition } from "components/CustomHooks";
import { FaItunesNote, FaHome, FaStar } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import "./BottomNav.scss";

const scrollHeight = Math.max(
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		document.body.offsetHeight,
		document.documentElement.offsetHeight,
		document.body.clientHeight,
		document.documentElement.clientHeight
	),
	offsetShow = scrollHeight;

function MobileNavBar() {
	const { pathname } = useLocation();
	const history = useHistory();
	const prevPath = useRef<string | null>(null);
	const [hidden] = useState(false);
	const [transitioning] = useState(false);

	const barColor = "white",
		unselectedTintColor = "#949494",
		tintColor = "#33A3F4";

	const tabValues = [
		{
			title: "Home",
			url: "/home",
			icon: <FaHome />,
		},
		{
			title: "Songs",
			url: "/songs",
			icon: <FaItunesNote />,
		},
		{
			title: "Favourites",
			url: "/favourites",
			icon: <FaStar />,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: <IoMdSettings />,
		},
	];

	/**
	 * Implements hide on scroll down, show on scroll up
	 * Will show if near the end of the page
	 */
	useScrollPosition(
		({ prevPos, currPos }: PosT) => {
			const shouldHide = currPos.y < prevPos.y;
			const belowThreshold = currPos.y > offsetShow;
			if (shouldHide !== hidden && !belowThreshold && !transitioning) {
				//setHidden(shouldHide);
				//triggerTransition();
			} else if (belowThreshold && !transitioning) {
				//setHidden(!shouldHide);
				//triggerTransition();
			}
		},
		[hidden],
		null,
		true,
		120
	);

	useEffect(() => {
		if (pathname !== prevPath.current) {
			/* new Promise(resolve => {
                resolve(
                    setTimeout(() => {
                        setTransitioning(false);
                        setHidden(false);
                    }, 300)
                );
            }); */
		}

		prevPath.current = pathname;
	}, [pathname]);

	/* function triggerTransition() {
        setTransitioning(true);
        new Promise(resolve => {
            resolve(setTimeout(() => setTransitioning(false), 250));
        });
    } */

	/* function disableTransitionState() {
        setTransitioning(false);
    } */

	function handleTabBarPress(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		const url = e.currentTarget.getAttribute("data-url") || "/";
		history.push(url);
	}

	return (
		<div className={`bottom-nav${hidden ? " --hidden" : ""}`} style={{ background: barColor }}>
			{tabValues.map(tab => (
				<button
					style={pathname.startsWith(tab.url) ? { color: tintColor } : { color: unselectedTintColor }}
					className="nav-item"
					onClick={handleTabBarPress}
					//onTransitionEnd={disableTransitionState}
					type="button"
					data-url={tab.url}
					key={tab.title}
				>
					{tab.icon}
					{tab.title}
				</button>
			))}
		</div>
	);
}

export default MobileNavBar;
