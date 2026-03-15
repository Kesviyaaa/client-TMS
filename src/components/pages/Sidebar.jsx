import { useState, useEffect } from "react";
import logo from "../../assets/InfologiaLogo.png";
import iconLogo from "../../assets/infologia_globe.jpeg";
import "../css/sidebar.css";
import { Link, useLocation } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const Sidebar = ({ collapsed, toggleSidebar, setWrapperHover }) => {
  const location = useLocation();

  // menu state
  const [hovered, setHovered] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  // active dashboard
  const isDashboardActive = location.pathname === "/analytics";

  // open dashboard menu automatically
  useEffect(() => {
    if (isDashboardActive) {
      setOpenMenu("dashboards");
    }
  }, [location.pathname]);

  // open datatable menu automatically
  useEffect(() => {
    if (location.pathname.startsWith("/tables-datatables")) {
      setOpenMenu("datatable");
    }
  }, [location.pathname]);

  // hover expand sidebar
  const handleMouseEnter = () => {
    if (collapsed) {
      setHovered(true);
      setWrapperHover(true);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed) {
      setHovered(false);
      setWrapperHover(false);
    }
  };

  useEffect(() => {
    const path = location.pathname;

    // GLOBAL MASTERS
    if (
      path.startsWith("/regions") ||
      path.startsWith("/countries") ||
      path.startsWith("/ports") ||
      path.startsWith("/currencies") ||
      path.startsWith("/commodities") ||
      path.startsWith("/units-of-measurements") ||
      path.startsWith("/container-types") ||
      path.startsWith("/document-types")
    ) {
      setOpenMenu("globalMasters");
    } else if (
      ["/parent-menu", "/sub-menu", "/modules"].some((route) =>
        path.startsWith(route)
      )
    ) {
      setOpenMenu("menu");
    }

    // CARRIER MASTERS
    else if (path.startsWith("/airline-master")) {
      setOpenMenu("carrierMasters");
    }

    // SHIPPING LINE
    else if (path.startsWith("/shipping-line-master")) {
      setOpenMenu("carrierMasters");
      setOpenSubMenu("shippingLine");
    }

    // VESSELS
    else if (path.startsWith("/vessels-master")) {
      setOpenMenu("carrierMasters");
      setOpenSubMenu("shippingLine");
    }

    // FINANCE
    else if (path.startsWith("/global-charge-codes")) {
      setOpenMenu("financeMasters");
    }

    // SYSTEM
    else if (path.startsWith("/company-creations")) {
      setOpenMenu("systemMaster");
    }

    // ACCOUNTS
    else if (path.startsWith("/charts-of-accounts")) {
      setOpenMenu("accounts");
    }
  }, [location.pathname]);

  return (
    <aside
      id="layout-menu"
      style={{ position: "fixed" }}
      className={`layout-menu menu-vertical menu ${
        collapsed ? "layout-menu-collapsed" : ""
      } ${collapsed && hovered ? "hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 🔷 TOGGLE BUTTON — moved OUTSIDE brand */}
      <a
        href="#!"
        onClick={(e) => {
          e.preventDefault();

          setWrapperHover(false);
          setHovered(false);

          setTimeout(() => {
            toggleSidebar();
          }, 0);
        }}
        style={{
          position: "absolute",
          top: "20px",
          right: "0",
          transform: "translate(50%, 0)", // ⭐ sticks to sidebar edge
          zIndex: 1001,
          backgroundColor: "#50A9E9",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          cursor: "pointer",
          textDecoration: "none",
          border: "3px solid #f5f5f9",

          opacity: collapsed && !hovered ? 0 : 1,
          pointerEvents: collapsed && !hovered ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        <i
          className={`bx ${
            !collapsed ? "bx-chevron-left" : hovered ? "bx-chevron-right" : ""
          }`}
          style={{ color: "#fff", fontSize: "18px" }}
        ></i>
      </a>

      {/* 🔷 BRAND */}
      <div className="app-brand demo">
        <a href="#!" className="app-brand-link text-decoration-none">
          <span className="app-brand-logo demo">
            <img
              src={collapsed && !hovered ? iconLogo : logo}
              alt="Infologia logo"
              className="sidebar-logo"
            />
          </span>
        </a>
      </div>

      <div className="menu-inner-shadow"></div>

      {/* Menu Items */}
      <ul className="menu-inner py-1">
        {/* Dashboard */}
        <li
          className={`menu-item ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
        >
          <Link to="/dashboard" className="menu-link text-decoration-none">
            <i className="menu-icon icon-base bx bx-home-smile"></i>
            <div className="menu-text">Dashboard</div>
          </Link>
        </li>

        {/* Menu */}
        <li
          className={`menu-item 
            ${openMenu === "menu" ? "open" : ""}
            ${
              location.pathname.startsWith("/parent-menu") ||
              location.pathname.startsWith("/sub-menu") ||
              location.pathname.startsWith("/modules")
                ? "active"
                : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(openMenu === "menu" ? null : "menu");
            }}
          >
            <i className="menu-icon bx bx-menu"></i>
            <div className="menu-text">Menu</div>
          </a>

          <ul className="menu-sub">
            <li
              className={`menu-item ${
                location.pathname === "/parent-menu" ? "active" : ""
              }`}
            >
              <Link to="/parent-menu" className="menu-link">
                <div className="menu-text">Parent Menu</div>
              </Link>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/sub-menu" ? "active" : ""
              }`}
            >
              <Link to="/sub-menu" className="menu-link">
                <div className="menu-text">Sub Menu</div>
              </Link>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/modules" ? "active" : ""
              }`}
            >
              <Link to="/modules" className="menu-link">
                <div className="menu-text">Modules</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* Global Masters */}
        <li
          className={`menu-item 
            ${openMenu === "globalMasters" ? "open" : ""}
            ${
              location.pathname.startsWith("/regions") ||
              location.pathname.startsWith("/countries") ||
              location.pathname.startsWith("/ports") ||
              location.pathname.startsWith("/currencies") ||
              location.pathname.startsWith("/commodities") ||
              location.pathname.startsWith("/units-of-measurements") ||
              location.pathname.startsWith("/container-types") ||
              location.pathname.startsWith("/document-types")
                ? "active"
                : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(
                openMenu === "globalMasters" ? null : "globalMasters"
              );
            }}
          >
            <i className="menu-icon bx bx-globe"></i>
            <div className="menu-text">Global Masters</div>
          </a>

          <ul className="menu-sub">
            <li
              className={`menu-item ${
                location.pathname === "/regions" ? "active" : ""
              }`}
            >
              <Link to="/regions" className="menu-link">
                <div className="menu-text">Regions</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                location.pathname === "/countries" ? "active" : ""
              }`}
            >
              <Link to="/countries" className="menu-link">
                <div className="menu-text">Countries</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                location.pathname === "/ports" ? "active" : ""
              }`}
            >
              <Link to="/ports" className="menu-link">
                <div className="menu-text">Ports</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                location.pathname === "/currencies" ? "active" : ""
              }`}
            >
              <Link to="/currencies" className="menu-link">
                <div className="menu-text">Currencies</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                location.pathname === "/commodities" ? "active" : ""
              }`}
            >
              <Link to="/commodities" className="menu-link">
                <div className="menu-text">Commodities</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                location.pathname === "/units-of-measurements" ? "active" : ""
              }`}
            >
              <Link to="/units-of-measurements" className="menu-link">
                <div className="menu-text">Units of Measurements</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                location.pathname === "/container-types" ? "active" : ""
              }`}
            >
              <Link to="/container-types" className="menu-link">
                <div className="menu-text">Container Types</div>
              </Link>
            </li>
            <li
              className={`menu-item ${
                location.pathname === "/document-types" ? "active" : ""
              }`}
            >
              <Link to="/document-types" className="menu-link">
                <div className="menu-text">Document Types</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* Carrier Masters */}
        <li
  className={`menu-item 
    ${openMenu === "carrierMasters" ? "open" : ""}
    ${
      location.pathname.startsWith("/airline-master") ||
      location.pathname.startsWith("/shipping-line-master") ||
      location.pathname.startsWith("/vessels-master")
        ? "active"
        : ""
    }`}
>
  <a
    href="#"
    className="menu-link menu-toggle text-decoration-none"
    onClick={(e) => {
      e.preventDefault();
      setOpenMenu(openMenu === "carrierMasters" ? null : "carrierMasters");
    }}
  >
    <i className="menu-icon bx bx-package"></i>
    <div className="menu-text">Carrier Masters</div>
  </a>

  <ul className="menu-sub">

    {/* Airline Master */}
    <li
      className={`menu-item ${
        location.pathname === "/airline-master" ? "active" : ""
      }`}
    >
      <Link to="/airline-master" className="menu-link">
        <div className="menu-text">Airline Master</div>
      </Link>
    </li>

    {/* Shipping Lines */}
    <li
      className={`menu-item 
        ${openSubMenu === "shippingLine" ? "open" : ""}
        ${
          location.pathname.startsWith("/shipping-line-master") ||
          location.pathname.startsWith("/vessels-master")
            ? "active"
            : ""
        }`}
    >
      <Link
        to="/shipping-line-master"
        className="menu-link menu-toggle"
        onClick={() => {
          setOpenSubMenu(
            openSubMenu === "shippingLine" ? null : "shippingLine"
          );
        }}
      >
        <div className="menu-text">Shipping Line Master</div>
      </Link>

      <ul className="menu-sub">

        {/* Vessels Master */}
        <li
          className={`menu-item ${
            location.pathname === "/vessels-master" ? "active" : ""
          }`}
        >
          <Link to="/vessels-master" className="menu-link">
            <div className="menu-text">Vessels Master</div>
          </Link>
        </li>

      </ul>
    </li>

  </ul>
</li>

        {/* Finance Masters */}
        <li
          className={`menu-item 
            ${openMenu === "financeMasters" ? "open" : ""}
            ${
              location.pathname.startsWith("/global-charge-codes")
                ? "active"
                : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(
                openMenu === "financeMasters" ? null : "financeMasters"
              );
            }}
          >
            <i className="menu-icon bx bx-dollar-circle"></i>
            <div className="menu-text">Finance Masters</div>
          </a>

          <ul className="menu-sub">
            <li
              className={`menu-item ${
                location.pathname === "/global-charge-codes" ? "active" : ""
              }`}
            >
              <Link to="/global-charge-codes" className="menu-link">
                <div className="menu-text">Global Charge Codes</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* System Master */}
        <li
          className={`menu-item 
            ${openMenu === "systemMaster" ? "open" : ""}
            ${
              location.pathname.startsWith("/company-creations") ? "active" : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(openMenu === "systemMaster" ? null : "systemMaster");
            }}
          >
            <i className="menu-icon bx bx-cog"></i>
            <div className="menu-text">System Master</div>
          </a>

          <ul className="menu-sub">
            <li
              className={`menu-item ${
                location.pathname === "/company-creations" ? "active" : ""
              }`}
            >
              <Link to="/company-creations" className="menu-link">
                <div className="menu-text">Company Creations</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* Accounts */}
        <li
          className={`menu-item 
            ${openMenu === "accounts" ? "open" : ""}
            ${
              location.pathname.startsWith("/charts-of-accounts")
                ? "active"
                : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(openMenu === "accounts" ? null : "accounts");
            }}
          >
            <i className="menu-icon bx bx-wallet"></i>
            <div className="menu-text">Accounts</div>
          </a>

          <ul className="menu-sub">
            <li
              className={`menu-item ${
                location.pathname === "/charts-of-accounts" ? "active" : ""
              }`}
            >
              <Link to="/charts-of-accounts" className="menu-link">
                <div className="menu-text">Charts of Accounts</div>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
