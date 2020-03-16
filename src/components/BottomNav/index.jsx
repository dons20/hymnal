import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { MainContext } from "../../App";
import { Affix } from "antd";
import { TabBar } from "antd-mobile";
import { BookOutlined, HomeOutlined, StarOutlined, SettingOutlined } from "@ant-design/icons";
import "./BottomNav.scss";

function BottomNav() {
    const context = useContext(MainContext);
    const { pathname } = useLocation();
    const history = useHistory();
    const scrollPos = useRef(0);
    const [selectedTab, setSelectedTab] = useState(pathname);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const top = document.body.getBoundingClientRect().top || window.pageXOffset;
            //Handle navbar transitioning between showing/hiding/hidden states when scrolling
            if (top - scrollPos.current < 100 && top > scrollPos.current) {
                setHidden(true);
            } else {
                setHidden(false);
            }

            // saves the new position for iteration.
            scrollPos.current = document.body.getBoundingClientRect().top;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setSelectedTab(pathname);
    }, [pathname]);

    function handleTabBarPress(page) {
        history.push(page);
    }

    return (
        <Affix offsetBottom={0}>
            <TabBar
                barTintColor="white"
                unselectedTintColor="#949494"
                tintColor="#33A3F4"
                className="tab-bar"
                hidden={hidden}
            >
                <TabBar.Item
                    title="Home"
                    key="Home"
                    selected={selectedTab === "/home"}
                    icon={<HomeOutlined />}
                    selectedIcon={<HomeOutlined />}
                    value={context.pages.HOME}
                    onPress={() => handleTabBarPress("/home")}
                    data-seed="logId"
                />
                <TabBar.Item
                    title="Songs"
                    key="Songs"
                    selected={selectedTab === "/songs"}
                    icon={<BookOutlined />}
                    selectedIcon={<BookOutlined />}
                    value={context.pages.INDEX}
                    onPress={() => handleTabBarPress("/songs")}
                />
                <TabBar.Item
                    title="Favourites"
                    key="Favourites"
                    selected={selectedTab === "/favourites"}
                    icon={<StarOutlined />}
                    selectedIcon={<StarOutlined />}
                    value={context.pages.FAVOURITES}
                    onPress={() => handleTabBarPress("/favourites")}
                />
                <TabBar.Item
                    title="Settings"
                    key="Settings"
                    selected={selectedTab === "/settings"}
                    icon={<SettingOutlined />}
                    selectedIcon={<SettingOutlined />}
                    value={context.pages.HISTORY}
                    onPress={() => handleTabBarPress("/settings")}
                />
            </TabBar>
        </Affix>
    );
}

export default BottomNav;
