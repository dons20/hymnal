import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useScrollPosition } from "../CustomHooks";
import { BookOutlined, HomeOutlined, StarOutlined, SettingOutlined } from "@ant-design/icons";
import "./BottomNav.scss";

const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    ),
    offsetShow = scrollHeight - 80;

function MobileNavBar() {
    const { pathname } = useLocation();
    const history = useHistory();
    const [hidden, setHidden] = useState(false);

    const barColor = "white",
        unselectedTintColor = "#949494",
        tintColor = "#33A3F4";

    const tabValues = [
        {
            title: "Home",
            url: "/home",
            icon: <HomeOutlined />
        },
        {
            title: "Songs",
            url: "/songs",
            icon: <BookOutlined />
        },
        {
            title: "Favourites",
            url: "/favourites",
            icon: <StarOutlined />
        },
        {
            title: "Settings",
            url: "/settings",
            icon: <SettingOutlined />
        }
    ];

    /**
     * Implements hide on scroll down, show on scroll up
     * Will show if near the end of the page
     */
    useScrollPosition(
        ({ prevPos, currPos }) => {
            const shouldHide = currPos.y < prevPos.y;
            const belowThreshold = currPos.y > offsetShow;
            if (shouldHide !== hidden && !belowThreshold) setHidden(shouldHide);
            else if (belowThreshold) setHidden(false);
        },
        [hidden],
        false,
        true,
        60
    );

    /**
     * @param {MouseEventInit&{ currentTarget: { getAttribute: (arg0: string) => String; }; }} e
     */
    function handleTabBarPress({ currentTarget }) {
        const url = currentTarget.getAttribute("data-url");
        history.push(url);
    }

    return (
        <div className={`bottom-nav${hidden ? " --hidden" : ""}`} style={{ background: barColor }}>
            {tabValues.map(tab => (
                <div
                    style={pathname.startsWith(tab.url) ? { color: tintColor } : { color: unselectedTintColor }}
                    className="nav-item"
                    onClick={handleTabBarPress}
                    data-url={tab.url}
                    key={tab.title}
                >
                    {tab.icon}
                    {tab.title}
                </div>
            ))}
        </div>
    );
}

export default MobileNavBar;
