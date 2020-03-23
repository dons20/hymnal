import React from "react";
import { PageHeader, AutoComplete, Input } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import "./Header.scss";

function Header() {
    const history = useHistory();
    const location = useLocation();

    /** Will navigate one level up in the application */
    function back() {
        const oneLevelUp = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
        history.push(oneLevelUp);
    }

    return (
        <PageHeader
            className="page-header"
            title="Hymns for All Times"
            onBack={location.pathname.match(/^[\\/{1}][^\\/]*$/g) ? null : back}
            extra={
                <AutoComplete className="search" dropdownMatchSelectWidth={252}>
                    <Input.Search size="large" placeholder="Search songs..." enterButton />
                </AutoComplete>
            }
        ></PageHeader>
    );
}

export default Header;
