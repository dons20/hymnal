import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useScrollPosition } from "../CustomHooks";
import { BookOutlined, HomeOutlined, StarOutlined, SettingOutlined } from "@ant-design/icons";
import "./BottomNav.scss";

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

    useScrollPosition(
        ({ prevPos, currPos }) => {
            const shouldHide = currPos.y < prevPos.y;
            if (shouldHide !== hidden) setHidden(shouldHide);
        },
        [hidden],
        false,
        true,
        60
    );

    /**
     * @param {{ currentTarget: import("react").DOMElement }} e
     */
    function handleTabBarPress({ currentTarget }) {
        const url = currentTarget.getAttribute("data-url");
        history.push(url);
    }

    return (
        <div className={`bottom-nav${hidden ? " --hidden" : ""}`} style={{ background: barColor }}>
            {tabValues.map(tab => (
                <div
                    style={pathname === tab.url ? { color: tintColor } : { color: unselectedTintColor }}
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
