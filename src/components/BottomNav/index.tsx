import React, { useState, useEffect, useRef } from "react";
import { FaItunesNote, FaHome, FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useMediaQuery } from "@chakra-ui/media-query";
import { useDebouncedCallback } from "use-debounce";
import { isMobile } from "react-device-detect";
import { Box, Text } from "@chakra-ui/layout";
import Button from "components/Button";
import cx from "classnames";
import "./BottomNav.scss";

function MobileNavBar() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const [scrollingDown, setScrollingDown] = useState(true);
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

	const scrollEventHandler = useDebouncedCallback(() => {
		// If we're within 100px of the bottom, show the bottom nav regardless of scroll direction
		const windowHeight = Math.round(window.innerHeight);
		const documentHeight = Math.round(document.body.offsetHeight);
		const scrollY = Math.round(window.scrollY);
		
		if (scrollY >= (documentHeight - windowHeight) - 100) {
			setScrollingDown(false);
		// detects new state and compares it with the new one
		} else if (document.body.getBoundingClientRect().top > scrollPos.current) {
			setScrollingDown(false);
		} else setScrollingDown(true);

		// saves the new position for iteration.
		scrollPos.current = Math.round(document.body.getBoundingClientRect().top);
	}, 100, { leading: true, trailing: true });

	useEffect(() => {
		scrollPos.current = Math.round(document.body.getBoundingClientRect().top);
		prevPath.current = pathname;
		setScrollingDown(true);

		// adding scroll event
		window.addEventListener("scroll", scrollEventHandler);

		return () => {
			window.removeEventListener("scroll", scrollEventHandler);
		};
	}, [setScrollingDown, pathname, scrollEventHandler]);

	function handleTabBarPress(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		const url = e.currentTarget.getAttribute("data-url") as string;
		navigate(url);
	}

	return (
		<Box
			className={cx("bottom-nav", { "--disabled": !isMobile, "--hidden": scrollingDown })}
			color={footerColors}
			bg={footerBg}
			data-testid="bottomNavWrapper"
		>
			{tabValues.map(tab => (
				<Button
					data-url={tab.url}
					leftIcon={!iconsOnly ? tab.icon : undefined}
					aria-label={tab.title}
					onClick={handleTabBarPress}
					key={tab.title}
					color={footerColors}
					bg="transparent"
					px={10}
					data-testid={tab.title}
				>
					{iconsOnly && tab.icon}
					{!iconsOnly && <Text>{tab.title}</Text>}
				</Button>
			))}
		</Box>
	);
}

export default MobileNavBar;
