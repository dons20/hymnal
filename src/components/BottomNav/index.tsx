import React, { useState, useEffect, useRef } from "react";
import { FaItunesNote, FaHome, FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";
import { Box, Text, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useDebouncedCallback } from "use-debounce";
import Button from "../Button";
import cx from "classnames";
import "./BottomNav.scss";

function MobileNavBar() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [isAtBottom, setIsAtBottom] = useState(false);
    const prevPath = useRef<string | null>(null);
    const isMobileScreen = useMediaQuery('(max-width: 768px)');
    const iconsOnly = useMediaQuery('(max-width: 475px)');
    
    // Check if we're on the homepage
    const isHomePage = pathname === '/' || pathname === '/home';

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

    const scrollEventHandler = useDebouncedCallback(
        () => {
            // Show at bottom of page on mobile only
            const windowHeight = Math.round(window.innerHeight);
            const documentHeight = Math.round(document.body.offsetHeight);
            const scrollY = Math.round(window.scrollY);

            // Show when near bottom (within 100px) on mobile devices only
            if (isMobileScreen && scrollY >= documentHeight - windowHeight - 100) {
                setIsAtBottom(true);
            } else {
                setIsAtBottom(false);
            }
        },
        100,
        { leading: true, trailing: true }
    );

    useEffect(() => {
        prevPath.current = pathname;
        
        if (isMobileScreen) {
            // adding scroll event only for mobile
            window.addEventListener("scroll", scrollEventHandler);
            // Check initial position
            scrollEventHandler();
        } else {
            setIsAtBottom(false);
        }

        return () => {
            if (isMobileScreen) {
                window.removeEventListener("scroll", scrollEventHandler);
            }
        };
    }, [pathname, scrollEventHandler, isMobileScreen]);

    function handleTabBarPress(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const url = e.currentTarget.getAttribute("data-url") as string;
        navigate(url);
    }

    // Only show on mobile screens and when at bottom, but not on homepage
    if (!isMobileScreen || !isAtBottom || isHomePage) {
        return null;
    }

    return (
        <Box
            className={cx("bottom-nav")}
            c="gray.1"
            bg="blue.6"
            pos="fixed"
            bottom={0}
            left={0}
            right={0}
            p="sm"
            style={{ zIndex: 1000 }}
            data-testid="bottomNavWrapper"
        >
            <Group justify="space-around" gap={0}>
                {tabValues.map(tab => (
                    <Button
                        data-url={tab.url}
                        leftSection={!iconsOnly ? tab.icon : undefined}
                        aria-label={tab.title}
                        onClick={handleTabBarPress}
                        key={tab.title}
                        variant="subtle"
                        color="gray"
                        c="gray.1"
                        px="lg"
                        data-testid={tab.title}
                    >
                        {iconsOnly && tab.icon}
                        {!iconsOnly && <Text size="sm">{tab.title}</Text>}
                    </Button>
                ))}
            </Group>
        </Box>
    );
}

export default MobileNavBar;
