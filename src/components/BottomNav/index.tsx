import React, { useState, useEffect, useRef } from "react";
import { FaItunesNote, FaHome, FaStar } from "react-icons/fa";
import { useLocation, useHistory } from "react-router-dom";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useMediaQuery } from "@chakra-ui/media-query";
import { isMobile } from "react-device-detect";
import { Box, Text } from "@chakra-ui/layout";
import { Button } from "components";
import "./BottomNav.scss";

function MobileNavBar() {
	const { pathname } = useLocation();
	const history = useHistory();
	const [scrollingDown, setScrollingDown] = useState(false);
	const prevPath = useRef<string | null>(null);
	const scrollPos = useRef(document.body.getBoundingClientRect().top);
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

	useEffect(() => {
		// Initial state
		// var scrollPos = 0;
		const scrollEventHandler = () => {
			// detects new state and compares it with the new one
			if (document.body.getBoundingClientRect().top > scrollPos.current) setScrollingDown(false);
			else setScrollingDown(true);
			// saves the new position for iteration.
			scrollPos.current = document.body.getBoundingClientRect().top;
		};

		// adding scroll event
		window.addEventListener("scroll", scrollEventHandler);

		return () => {
			window.removeEventListener("scroll", scrollEventHandler);
		};
	}, [setScrollingDown]);

	useEffect(() => {
		prevPath.current = pathname;
	}, [pathname]);

	function handleTabBarPress(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		const url = e.currentTarget.getAttribute("data-url") || "/";
		history.push(url);
	}

	return (
		<Box
			className={`bottom-nav${isMobile ? "" : " --disabled"}${scrollingDown ? "" : " --hidden"}`}
			color={footerColors}
			bg={footerBg}
		>
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
