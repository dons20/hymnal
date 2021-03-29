import React, { useState, useEffect, useRef } from "react";
import { FaItunesNote, FaHome, FaStar } from "react-icons/fa";
import { useLocation, useHistory } from "react-router-dom";
import { useScrollPosition } from "components/CustomHooks";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useMediaQuery } from "@chakra-ui/media-query";
import { isMobile } from "react-device-detect";
import { Box, Text } from "@chakra-ui/layout";
import { Button } from "components";
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
	const [iconsOnly] = useMediaQuery("(max-width: 475px)");
	const footerBg = useColorModeValue("blue.600", "blue.600");
	const footerColors = useColorModeValue("gray.100", "gray.100");

	const tabValues = [
		{
			title: "Home",
			url: "/home",
			icon: <FaHome />,
		},
		{
			title: "Songs",
			url: "/songs/index",
			icon: <FaItunesNote />,
		},
		{
			title: "Favourites",
			url: "/songs/favourites",
			icon: <FaStar />,
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
		<Box className={`bottom-nav${isMobile ? "" : " --hidden"}`} color={footerColors} bg={footerBg}>
			{tabValues.map(tab => (
				<Button
					data-url={tab.url}
					leftIcon={tab.icon}
					aria-label={tab.title}
					onClick={handleTabBarPress}
					key={tab.title}
					color={footerColors}
					bg="transparent"
					px={10}
				>
					{!iconsOnly && <Text>{tab.title}</Text>}
				</Button>
			))}
		</Box>
	);
}

export default MobileNavBar;
