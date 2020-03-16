import React from "react";
import { PageHeader, AutoComplete, Input } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import "./Header.scss";

function Header() {
    const history = useHistory();
    const location = useLocation();

    return (
        <PageHeader
            className="page-header"
            title="Hymns for All Times"
            onBack={location.pathname === "/home" ? null : () => history.goBack()}
            extra={
                <AutoComplete className="search" dropdownMatchSelectWidth={252}>
                    <Input.Search size="large" placeholder="Search songs..." enterButton />
                </AutoComplete>
            }
        ></PageHeader>
    );
}

export default Header;
