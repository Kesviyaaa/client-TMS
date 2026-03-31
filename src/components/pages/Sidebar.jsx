import { useState, useEffect } from "react";
import logo from "../../assets/InfologiaLogo.png";
import iconLogo from "../../assets/infologia_globe.jpeg";
import "../css/sidebar.css";
import { Link, useLocation } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const Sidebar = ({ collapsed, toggleSidebar, setWrapperHover, showMobileMenu }) => {
  const location = useLocation();

  // menu state
  const [hovered, setHovered] = useState(false);
  const [openMenu, setOpenMenu] = useState({});
  const [openSubMenu, setOpenSubMenu] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [openPerf, setOpenPerf] = useState(null);

  const [openGlobalMasters, setOpenGlobalMasters] = useState(false);
  const [openGMSub, setOpenGMSub] = useState({});
  const [openFinSub, setOpenFinSub] = useState({});

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

  const performanceMenu = [
    {
      key: "airImport",
      title: "Air Import",
      icon: "bx bxs-plane",
      children: [
        { name: "Air Import Dashboard", path: "/performance/air-import/dashboard" },
        { name: "Shipment Details", path: "/performance/air-import/shipment-details" },
        { name: "Sales Performance", path: "/performance/air-import/sales" },
        { name: "Client Performance", path: "/performance/air-import/client" },
        { name: "Airline Performance", path: "/performance/air-import/airline" },
        { name: "Map", path: "/performance/air-import/map" },
      ],
    },
    {
      key: "airExport",
      title: "Air Export",
      icon: "bx bxs-plane-take-off",
      children: [
        { name: "Air Export Dashboard", path: "/performance/air-export/dashboard" },
        { name: "Shipment Details", path: "/performance/air-export/shipment-details" },
        { name: "Sales Performance", path: "/performance/air-export/sales" },
        { name: "Client Performance", path: "/performance/air-export/client" },
        { name: "Tonnage Variation", path: "/performance/air-export/tonnage" },
        { name: "Airline Performance", path: "/performance/air-export/airline" },
        { name: "Map", path: "/performance/air-export/map" },
      ],
    },
    {
      key: "oceanImport",
      title: "Ocean Import",
      icon: "bx bx-anchor",
      children: [
        { name: "Ocean Import Dashboard", path: "/performance/ocean-import/dashboard" },
        { name: "Shipment Details", path: "/performance/ocean-import/shipment-details" },
        { name: "Sales Performance", path: "/performance/ocean-import/sales" },
        { name: "Client Performance", path: "/performance/ocean-import/client" },
        { name: "Shipping Performance", path: "/performance/ocean-import/shipping" },
        { name: "Map", path: "/performance/ocean-import/map" },
      ],
    },
    {
      key: "oceanExport",
      title: "Ocean Export",
      icon: "bx bxs-ship",
      children: [
        { name: "Ocean Export Dashboard", path: "/performance/ocean-export/dashboard" },
        { name: "Shipment Details", path: "/performance/ocean-export/shipment-details" },
        { name: "Sales Performance", path: "/performance/ocean-export/sales" },
        { name: "Client Performance", path: "/performance/ocean-export/client" },
        { name: "Shipping Performance", path: "/performance/ocean-export/shipping" },
        { name: "Map", path: "/performance/ocean-export/map" },
      ],
    },
    {
      key: "variation",
      title: "Variation Report",
      icon: "bx bx-line-chart",
      path: "/performance/variation",
    },
  ];

  const globalMastersMenu = [
    { name: "Ports", path: "/global-masters/ports", icon: "bx bxs-map" },
    { name: "Commodities", path: "/global-masters/commodities", icon: "bx bx-category" },

    { name: "Units of Measurements", path: "/global-masters/uom", icon: "bx bx-ruler" },

    { name: "Container Types", path: "/global-masters/container-types", icon: "bx bx-package" },

    {
      name: "Document Types",
      icon: "bx bx-file",
      children: [
        { name: "Document Type", path: "/global-masters/document-types" },
        { name: "Terminal Operator", path: "/global-masters/terminal-operator" },
      ],
    },



    { name: "CFS / Yard", path: "/global-masters/cfs-yard", icon: "bx bx-building-house" },
  ];

  const carrierMastersMenu = [
    { name: "Airline Master", path: "/carrier-masters/airline", icon: "bx bxs-plane" },
    { name: "Shipping Line Master", path: "/carrier-masters/shipping-line", icon: "bx bxs-ship" },
    { name: "BL / WB Clause", path: "/carrier-masters/bl-clause", icon: "bx bx-file" },
    { name: "Vessels Master", path: "/carrier-masters/vessels", icon: "bx bx-anchor" },
  ];

  const financeMastersMenu = [
    { name: "Global Charge Codes", path: "/finance-masters/charge-codes", icon: "bx bx-money" },
    { name: "Airline Commission", path: "/finance-masters/airline-commission", icon: "bx bx-line-chart" },
    { name: "Shipping Line Brokerage", path: "/finance-masters/shipping-brokerage", icon: "bx bx-trending-up" },
    {
      name: "Accounts",
      icon: "bx bx-calculator",
      children: [
        { name: "AP Invoice", path: "/finance-masters/accounts/ap-invoice" },
        { name: "AR Invoice", path: "/finance-masters/accounts/ar-invoice" },
      ],
    },
  ];

  const systemMastersMenu = [
    { name: "Organisation Details", path: "/system-master/org-details", icon: "bx bx-buildings" },
    { name: "Branch Creation", path: "/system-master/branch", icon: "bx bx-git-branch" },
    { name: "User Creation", path: "/system-master/user", icon: "bx bx-user" },
    { name: "User Role", path: "/system-master/user-role", icon: "bx bx-id-card" },
  ];

  // 🚀 ONLY FORWARDING LOGIC
  useEffect(() => {
    const path = location.pathname;

    const isForwarding = [
      "/quotations", "/bookings", "/forwarding/shipments/air-exports", "/forwarding/shipments/air-imports", "/forwarding/shipments/sea-exports", "/forwarding/shipments/sea-imports", "/forwarding/shipments/land-exports", "/forwarding/shipments/land-imports",
      "/carrier-tariff", "/carrier-contract", "/airline-charges", "/company-tariff-freight",
      "/export-charges", "/import-charges", "/customer-export-charges", "/customer-import-charges"
    ].some((route) => path.startsWith(route));

    const isTracking = [
      "/tracking-dashboard", "/ocean-shipment", "/air-shipment", "/client-details", "/document-upload",
      "/co2-reports", "/shipment-reports", "/airline-reports", "/shipping-line-reports", "/log-reports", "/agent-wise-log-report",
      "/ocean-calendar", "/air-calendar", "/create-milestone", "/milestone-alert-settings", "/milestone-grouping"
    ].some((route) => path.startsWith(route));

    const isPerformance = path.startsWith("/performance");
    const isGlobalMasters = path.startsWith("/global-masters");
    const isCarrierMasters = path.startsWith("/carrier-masters");
    const isFinanceMasters = path.startsWith("/finance-masters");
    const isSystemMasters = path.startsWith("/system-master");

    // set only the active menu to true, all others to false
    setOpenMenu({
      forwarding: isForwarding,
      tracking: isTracking,
      performance: isPerformance,
      globalMasters: isGlobalMasters,
      carrierMasters: isCarrierMasters,
      financeMasters: isFinanceMasters,
      systemMasters: isSystemMasters,
    });

    if (isForwarding) {
      setOpenSubMenu((prev) => ({
        ...prev,
        shipments:
          prev.shipments ||
          path.startsWith("/forwarding/shipments/air-exports") ||
          path.startsWith("/forwarding/shipments/air-imports") ||
          path.startsWith("/forwarding/shipments/sea-exports") ||
          path.startsWith("/forwarding/shipments/sea-imports") ||
          path.startsWith("/forwarding/shipments/land-exports") ||
          path.startsWith("/forwarding/shipments/land-imports"),

        airExports: prev.airExports || path.startsWith("/forwarding/shipments/air-exports"),
        airImports: prev.airImports || path.startsWith("/forwarding/shipments/air-imports"),
        seaExports: prev.seaExports || path.startsWith("/forwarding/shipments/sea-exports"),
        seaImports: prev.seaImports || path.startsWith("/forwarding/shipments/sea-imports"),
        landExports: prev.landExports || path.startsWith("/forwarding/shipments/land-exports"),
        landImports: prev.landImports || path.startsWith("/forwarding/shipments/land-imports"),

        settings:
          prev.settings ||
          path.startsWith("/carrier-tariff") ||
          path.startsWith("/carrier-contract") ||
          path.startsWith("/airline-charges") ||
          path.startsWith("/company-tariff-freight") ||
          path.startsWith("/export-charges") ||
          path.startsWith("/import-charges") ||
          path.startsWith("/customer-export-charges") ||
          path.startsWith("/customer-import-charges"),

        tariff:
          prev.tariff ||
          path.startsWith("/carrier-tariff") ||
          path.startsWith("/carrier-contract") ||
          path.startsWith("/airline-charges") ||
          path.startsWith("/company-tariff-freight") ||
          path.startsWith("/export-charges") ||
          path.startsWith("/import-charges") ||
          path.startsWith("/customer-export-charges") ||
          path.startsWith("/customer-import-charges"),

        airTariff:
          prev.airTariff ||
          path.startsWith("/carrier-tariff") ||
          path.startsWith("/carrier-contract") ||
          path.startsWith("/airline-charges") ||
          path.startsWith("/company-tariff-freight") ||
          path.startsWith("/export-charges") ||
          path.startsWith("/import-charges") ||
          path.startsWith("/customer-export-charges") ||
          path.startsWith("/customer-import-charges"),

        buy:
          prev.buy ||
          path.startsWith("/carrier-tariff") ||
          path.startsWith("/carrier-contract") ||
          path.startsWith("/airline-charges"),

        sell:
          prev.sell ||
          path.startsWith("/company-tariff-freight") ||
          path.startsWith("/export-charges") ||
          path.startsWith("/import-charges") ||
          path.startsWith("/customer-export-charges") ||
          path.startsWith("/customer-import-charges"),

        companyOthers:
          prev.companyOthers ||
          path.startsWith("/export-charges") ||
          path.startsWith("/import-charges"),

        customerOthers:
          prev.customerOthers ||
          path.startsWith("/customer-export-charges") ||
          path.startsWith("/customer-import-charges"),
      }));
    }

    if (isTracking) {
      setOpenSubMenu((prev) => ({
        ...prev,
        reports:
          path.startsWith("/co2-reports") ||
          path.startsWith("/shipment-reports") ||
          path.startsWith("/airline-reports") ||
          path.startsWith("/shipping-line-reports") ||
          path.startsWith("/log-reports") ||
          path.startsWith("/agent-wise-log-report"),

        calendar:
          path.startsWith("/ocean-calendar") ||
          path.startsWith("/air-calendar"),

        milestones:
          path.startsWith("/create-milestone") ||
          path.startsWith("/milestone-alert-settings") ||
          path.startsWith("/milestone-grouping"),
      }));
    }

    if (isFinanceMasters) {
      const foundSection = financeMastersMenu.find((section) =>
        section.children?.some((c) =>
          path.startsWith(c.path)
        ) || path.startsWith(section.path)
      );
      if (foundSection) {
        setOpenFinSub(prev => ({ ...prev, [foundSection.name]: true }));
      }
    }

    if (isPerformance) {
      const foundSection = performanceMenu.find((section) =>
        section.children?.some((c) =>
          path.startsWith(c.path)
        )
      );
      if (foundSection) {
        setOpenPerf(foundSection.key);
      }
    }

    if (isGlobalMasters) {
      const foundSection = globalMastersMenu.find((section) =>
        section.children?.some((c) =>
          path.startsWith(c.path)
        ) || path.startsWith(section.path)
      );
      if (foundSection) {
        setOpenGMSub(prev => ({ ...prev, [foundSection.name]: true }));
      }
    }

  }, [location.pathname]);

  // 🚀 TRACKING LOGIC


  return (
    <aside
      id="layout-menu"
      style={{ position: "fixed" }}
      className={`layout-menu menu-vertical menu ${collapsed ? "layout-menu-collapsed" : ""
        } ${collapsed && hovered ? "hovered" : ""} ${showMobileMenu ? "show" : ""
        }`}
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
          className={`bx ${!collapsed ? "bx-chevron-left" : hovered ? "bx-chevron-right" : ""
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
        {/* Forwarding */}
        <li
          className={`menu-item 
      ${openMenu?.forwarding ? "open" : ""}
      ${[
              "/quotations",
              "/bookings",
              "/air-exports",
              "/air-imports",
              "/sea-exports",
              "/sea-imports",
              "/land-exports",
              "/land-imports",
              "/carrier-tariff",
              "/carrier-contract",
              "/airline-charges",
              "/company-tariff-freight",
              "/export-charges",
              "/import-charges",
              "/customer-export-charges",
              "/customer-import-charges",
            ].some((route) => location.pathname.startsWith(route))
              ? "active-top"
              : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(prev => ({
                tracking: false, performance: false, globalMasters: false, carrierMasters: false, financeMasters: false, systemMasters: false,
                forwarding: !prev.forwarding
              }));
            }}
          >
            <i className="menu-icon bx bx-transfer"></i>
            <div className="menu-text">Forwarding</div>
          </a>

          <ul className="menu-sub">
            {/* Quotations */}
            <li className={`menu-item ${activeItem === "/quotations" ? "active" : ""}`}>
              <Link to="/quotations" className="menu-link">
                <i className="menu-icon bx bx-file"></i>
                <div className="menu-text">Quotations</div>
              </Link>
            </li>

            {/* Bookings */}
            <li className={`menu-item ${location.pathname === "/bookings" ? "active" : ""}`}>
              <Link to="/bookings" className="menu-link">
                <i className="menu-icon bx bx-book"></i>

                <div className="menu-text">Bookings</div>
              </Link>
            </li>

            {/* Shipments */}
            <li
              className={`menu-item 
          ${openSubMenu?.shipments ? "open" : ""}
          ${["/forwarding/shipments/air-exports", "/forwarding/shipments/air-imports", "/forwarding/shipments/sea-exports", "/forwarding/shipments/sea-imports", "/forwarding/shipments/land-exports", "/forwarding/shipments/land-imports"].some((r) =>
                location.pathname.startsWith(r)
              )
                  ? "active-section"
                  : ""
                }`}
            >
              <a
                href="#"
                className="menu-link menu-toggle"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenSubMenu((prev) => ({
                    ...prev,
                    shipments: !prev.shipments,
                    settings: false,
                  }));
                }}
              >
                <i className="menu-icon bx bx-package"></i>

                <div className="menu-text">Shipments</div>
              </a>

              <ul className="menu-sub">
                {/* Air Exports */}
                <li className={`menu-item ${openSubMenu?.airExports ? "open" : ""} ${location.pathname.startsWith("/forwarding/shipments/air-exports") ? "active" : ""}`}>
                  <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                    e.preventDefault();
                    setOpenSubMenu(prev => ({ ...prev, airExports: !prev.airExports, airImports: false, seaExports: false, seaImports: false, landExports: false, landImports: false }));
                  }}>
                    <div className="menu-text">Air Exports</div>
                  </a>

                  <ul className="menu-sub">
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/air-exports/shipment" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/air-exports/shipment" className="menu-link"><div className="menu-text">Shipment</div></Link>
                    </li>
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/air-exports/consol" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/air-exports/consol" className="menu-link"><div className="menu-text">Consol</div></Link>
                    </li>
                  </ul>
                </li>

                {/* Air Imports */}
                <li className={`menu-item ${openSubMenu?.airImports ? "open" : ""} ${location.pathname.startsWith("/forwarding/shipments/air-imports") ? "active" : ""}`}>
                  <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                    e.preventDefault();
                    setOpenSubMenu(prev => ({ ...prev, airImports: !prev.airImports, airExports: false, seaExports: false, seaImports: false, landExports: false, landImports: false }));
                  }}>
                    <div className="menu-text">Air Imports</div>
                  </a>

                  <ul className="menu-sub">
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/air-imports/shipment" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/air-imports/shipment" className="menu-link"><div className="menu-text">Shipment</div></Link>
                    </li>
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/air-imports/consol" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/air-imports/consol" className="menu-link"><div className="menu-text">Consol</div></Link>
                    </li>
                  </ul>
                </li>

                {/* Sea Exports */}
                <li className={`menu-item ${openSubMenu?.seaExports ? "open" : ""} ${location.pathname.startsWith("/forwarding/shipments/sea-exports") ? "active" : ""}`}>
                  <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                    e.preventDefault();
                    setOpenSubMenu(prev => ({ ...prev, seaExports: !prev.seaExports, airExports: false, airImports: false, seaImports: false, landExports: false, landImports: false }));
                  }}>
                    <div className="menu-text">Sea Exports</div>
                  </a>

                  <ul className="menu-sub">
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/sea-exports/shipment" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/sea-exports/shipment" className="menu-link"><div className="menu-text">Shipment</div></Link>
                    </li>
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/sea-exports/consol" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/sea-exports/consol" className="menu-link"><div className="menu-text">Consol</div></Link>
                    </li>
                  </ul>
                </li>

                {/* Sea Imports FIXED */}
                <li className={`menu-item ${openSubMenu?.seaImports ? "open" : ""} ${location.pathname.startsWith("/forwarding/shipments/sea-imports") ? "active" : ""}`}>
                  <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                    e.preventDefault();
                    setOpenSubMenu(prev => ({ ...prev, seaImports: !prev.seaImports, airExports: false, airImports: false, seaExports: false, landExports: false, landImports: false }));
                  }}>
                    <div className="menu-text">Sea Imports</div>
                  </a>

                  <ul className="menu-sub">
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/sea-imports/shipment" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/sea-imports/shipment" className="menu-link"><div className="menu-text">Shipment</div></Link>
                    </li>
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/sea-imports/consol" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/sea-imports/consol" className="menu-link"><div className="menu-text">Consol</div></Link>
                    </li>
                  </ul>
                </li>

                {/* Land Exports */}
                <li className={`menu-item ${openSubMenu?.landExports ? "open" : ""} ${location.pathname.startsWith("/forwarding/shipments/land-exports") ? "active" : ""}`}>
                  <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                    e.preventDefault();
                    setOpenSubMenu(prev => ({ ...prev, landExports: !prev.landExports, airExports: false, airImports: false, seaExports: false, seaImports: false, landImports: false }));
                  }}>
                    <div className="menu-text">Land Exports</div>
                  </a>

                  <ul className="menu-sub">
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/land-exports/shipment" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/land-exports/shipment" className="menu-link"><div className="menu-text">Shipment</div></Link>
                    </li>
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/land-exports/consol" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/land-exports/consol" className="menu-link"><div className="menu-text">Consol</div></Link>
                    </li>
                  </ul>
                </li>

                {/* Land Imports */}
                <li className={`menu-item ${openSubMenu?.landImports ? "open" : ""} ${location.pathname.startsWith("/forwarding/shipments/land-imports") ? "active" : ""}`}>
                  <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                    e.preventDefault();
                    setOpenSubMenu(prev => ({ ...prev, landImports: !prev.landImports, airExports: false, airImports: false, seaExports: false, seaImports: false, landExports: false }));
                  }}>
                    <div className="menu-text">Land Imports</div>
                  </a>

                  <ul className="menu-sub">
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/land-imports/shipment" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/land-imports/shipment" className="menu-link"><div className="menu-text">Shipment</div></Link>
                    </li>
                    <li className={`menu-item ${location.pathname === "/forwarding/shipments/land-imports/consol" ? "active" : ""}`}>
                      <Link to="/forwarding/shipments/land-imports/consol" className="menu-link"><div className="menu-text">Consol</div></Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* SETTINGS */}
            <li
              className={`menu-item 
    ${openSubMenu?.settings ? "open" : ""}
    ${[
                  "/carrier-tariff",
                  "/carrier-contract",
                  "/airline-charges",
                  "/company-tariff-freight",
                  "/export-charges",
                  "/import-charges",
                  "/customer-export-charges",
                  "/customer-import-charges",
                ].some((r) => location.pathname.startsWith(r))
                  ? "active-section"
                  : ""
                }`}
            >        <a href="#" className="menu-link menu-toggle" onClick={(e) => {
              e.preventDefault();
              setOpenSubMenu(prev => ({ ...prev, settings: !prev.settings, shipments: false }));
            }}>
                <i className="menu-icon bx bx-cog"></i>

                <div className="menu-text">Settings</div>
              </a>

              <ul className="menu-sub">
                {/* TARIFF */}
                <li className={`menu-item ${openSubMenu?.tariff ? "open" : ""}`}>
                  <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                    e.preventDefault();
                    setOpenSubMenu(prev => ({ ...prev, tariff: !prev.tariff }));
                  }}>
                    <div className="menu-text">Tariff</div>
                  </a>

                  <ul className="menu-sub">
                    {/* AIR */}
                    <li className={`menu-item ${openSubMenu?.airTariff ? "open" : ""}`}>
                      <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                        e.preventDefault();
                        setOpenSubMenu(prev => ({ ...prev, airTariff: !prev.airTariff }));
                      }}>
                        <div className="menu-text">Air</div>
                      </a>

                      <ul className="menu-sub">
                        {/* BUY */}
                        <li className={`menu-item ${openSubMenu?.buy ? "open" : ""}`}>
                          <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                            e.preventDefault();
                            setOpenSubMenu(prev => ({ ...prev, buy: !prev.buy, sell: false }));
                          }}>
                            <div className="menu-text">Buy</div>
                          </a>

                          <ul className="menu-sub">
                            <li className={`menu-item ${location.pathname === "/carrier-tariff" ? "active" : ""}`}>
                              <Link to="/carrier-tariff" className="menu-link"><div className="menu-text">Carrier Tariff</div></Link>
                            </li>
                            <li className={`menu-item ${location.pathname === "/carrier-contract" ? "active" : ""}`}>
                              <Link to="/carrier-contract" className="menu-link"><div className="menu-text">Carrier Contract</div></Link>
                            </li>
                            <li className={`menu-item ${location.pathname === "/airline-charges" ? "active" : ""}`}>
                              <Link to="/airline-charges" className="menu-link"><div className="menu-text">Airline Charges</div></Link>
                            </li>
                          </ul>
                        </li>

                        {/* SELL */}
                        <li className={`menu-item ${openSubMenu?.sell ? "open" : ""}`}>
                          <a
                            href="#"
                            className="menu-link menu-toggle"
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenSubMenu((prev) => ({ ...prev, sell: !prev.sell, buy: false }));
                            }}
                          >
                            <div className="menu-text">Sell</div>
                          </a>

                          <ul className="menu-sub">
                            {/* Company Tariff Freight */}
                            <li className={`menu-item ${location.pathname === "/company-tariff-freight" ? "active" : ""}`}>
                              <Link to="/company-tariff-freight" className="menu-link">
                                <div className="menu-text">Company Tariff (Freight)</div>
                              </Link>
                            </li>

                            {/* Company Tariff Others */}
                            <li className={`menu-item ${openSubMenu?.companyOthers ? "open" : ""}`}>
                              <a
                                href="#"
                                className="menu-link menu-toggle"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOpenSubMenu((prev) => ({
                                    ...prev,
                                    companyOthers: !prev.companyOthers,
                                    customerOthers: false,
                                  }));
                                }}
                              >
                                <div className="menu-text">Company Tariff (Others)</div>
                              </a>

                              <ul className="menu-sub">
                                <li className={`menu-item ${location.pathname === "/export-charges" ? "active" : ""}`}>
                                  <Link to="/export-charges" className="menu-link">
                                    <div className="menu-text">Export Charges</div>
                                  </Link>
                                </li>

                                <li className={`menu-item ${location.pathname === "/import-charges" ? "active" : ""}`}>
                                  <Link to="/import-charges" className="menu-link">
                                    <div className="menu-text">Import Charges</div>
                                  </Link>
                                </li>
                              </ul>
                            </li>

                            {/* Customer Tariff Others */}
                            <li className={`menu-item ${openSubMenu?.customerOthers ? "open" : ""}`}>
                              <a
                                href="#"
                                className="menu-link menu-toggle"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOpenSubMenu((prev) => ({
                                    ...prev,
                                    customerOthers: !prev.customerOthers,
                                    companyOthers: false,
                                  }));
                                }}
                              >
                                <div className="menu-text">Customer Tariff (Others)</div>
                              </a>

                              <ul className="menu-sub">
                                <li className={`menu-item ${location.pathname === "/customer-export-charges" ? "active" : ""}`}>
                                  <Link to="/customer-export-charges" className="menu-link">
                                    <div className="menu-text">Export Charges</div>
                                  </Link>
                                </li>

                                <li className={`menu-item ${location.pathname === "/customer-import-charges" ? "active" : ""}`}>
                                  <Link to="/customer-import-charges" className="menu-link">
                                    <div className="menu-text">Import Charges</div>
                                  </Link>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        {/* TRACKING */}
        <li
          className={`menu-item 
    ${openMenu?.tracking ? "open" : ""}
    ${[
              "/tracking-dashboard",
              "/ocean-shipment",
              "/airline-shipment",
              "/client-details",
              "/document-upload",
              "/co2-reports",
              "/shipment-reports",
              "/airline-reports",
              "/shipping-line-reports",
              "/log-reports",
              "/ocean-calendar",
              "/air-calendar",
              "/create-milestone",
              "/milestone-alert-settings",
              "/milestone-grouping",
            ].some((route) => location.pathname.startsWith(route))
              ? "active-top"
              : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(prev => ({
                forwarding: false, performance: false, globalMasters: false, carrierMasters: false, financeMasters: false, systemMasters: false,
                tracking: !prev.tracking
              }));
            }}
          >
            <i className="menu-icon bx bx-map"></i>
            <div className="menu-text">Tracking</div>
          </a>

          <ul className="menu-sub">
            {/* Dashboard */}
            <li className={`menu-item ${location.pathname === "/tracking-dashboard" ? "active" : ""}`}>
              <Link to="/tracking-dashboard" className="menu-link">
                <i className="menu-icon bx bx-home"></i>
                <div className="menu-text">Tracking Dashboard</div>
              </Link>
            </li>

            {/* Ocean */}
            <li className={`menu-item ${location.pathname === "/ocean-shipment" ? "active" : ""}`}>
              <Link to="/ocean-shipment" className="menu-link">
                <i className="menu-icon bx bxs-ship"></i>
                <div className="menu-text">Ocean Shipment</div>
              </Link>
            </li>

            {/* Air Shipment */}
            <li className={`menu-item ${location.pathname === "/air-shipment" ? "active" : ""}`}>
              <Link to="/air-shipment" className="menu-link">
                <i className="menu-icon bx bxs-plane"></i>
                <div className="menu-text">Air Shipment</div>
              </Link>
            </li>

            {/* Client */}
            <li className={`menu-item ${location.pathname === "/client-details" ? "active" : ""}`}>
              <Link to="/client-details" className="menu-link">
                <i className="menu-icon bx bx-user"></i>
                <div className="menu-text">Client Details</div>
              </Link>
            </li>

            {/* Documents */}
            <li className={`menu-item ${location.pathname === "/document-upload" ? "active" : ""}`}>
              <Link to="/document-upload" className="menu-link">
                <i className="menu-icon bx bx-upload"></i>
                <div className="menu-text">Document Upload</div>
              </Link>
            </li>

            {/* REPORTS */}
            <li className={`menu-item ${openSubMenu?.reports ? "open" : ""} ${["/co2-reports", "/shipment-reports", "/airline-reports", "/shipping-line-reports", "/log-reports", "/agent-wise-log-report"]
              .some(r => location.pathname.startsWith(r)) ? "active-section" : ""}`}>

              <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                e.preventDefault();
                setOpenSubMenu(prev => ({ ...prev, reports: !prev.reports, calendar: false, milestones: false }));
              }}>
                <i className="menu-icon bx bx-bar-chart"></i>
                <div className="menu-text">Reports</div>
              </a>

              <ul className="menu-sub">
                <li className={`menu-item ${location.pathname === "/co2-reports" ? "active" : ""}`}>
                  <Link to="/co2-reports" className="menu-link"><div className="menu-text">CO2 Reports</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/shipment-reports" ? "active" : ""}`}>
                  <Link to="/shipment-reports" className="menu-link"><div className="menu-text">Shipment Reports</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/airline-reports" ? "active" : ""}`}>
                  <Link to="/airline-reports" className="menu-link"><div className="menu-text">Airline Reports</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/shipping-line-reports" ? "active" : ""}`}>
                  <Link to="/shipping-line-reports" className="menu-link"><div className="menu-text">Shipping Line Reports</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/log-reports" ? "active" : ""}`}>
                  <Link to="/log-reports" className="menu-link"><div className="menu-text">Log Reports</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/agent-wise-log-report" ? "active" : ""}`}>
                  <Link to="/agent-wise-log-report" className="menu-link"><div className="menu-text">Agent Wise Log Report</div></Link>
                </li>
              </ul>
            </li>

            {/* CALENDAR */}
            <li className={`menu-item ${openSubMenu?.calendar ? "open" : ""} ${["/ocean-calendar", "/air-calendar"]
              .some(r => location.pathname.startsWith(r)) ? "active-section" : ""}`}>

              <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                e.preventDefault();
                setOpenSubMenu(prev => ({ ...prev, calendar: !prev.calendar, reports: false, milestones: false }));
              }}>
                <i className="menu-icon bx bx-calendar"></i>
                <div className="menu-text">Calendar</div>
              </a>

              <ul className="menu-sub">
                <li className={`menu-item ${location.pathname === "/ocean-calendar" ? "active" : ""}`}>
                  <Link to="/ocean-calendar" className="menu-link"><div className="menu-text">Ocean Calendar</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/air-calendar" ? "active" : ""}`}>
                  <Link to="/air-calendar" className="menu-link"><div className="menu-text">Air Calendar</div></Link>
                </li>
              </ul>
            </li>

            {/* MILESTONES */}
            <li className={`menu-item ${openSubMenu?.milestones ? "open" : ""} ${["/create-milestone", "/milestone-alert-settings", "/milestone-grouping"]
              .some(r => location.pathname.startsWith(r)) ? "active-section" : ""}`}>

              <a href="#" className="menu-link menu-toggle" onClick={(e) => {
                e.preventDefault();
                setOpenSubMenu(prev => ({ ...prev, milestones: !prev.milestones, reports: false, calendar: false }));
              }}>
                <i className="menu-icon bx bx-flag"></i>
                <div className="menu-text">Milestones</div>
              </a>

              <ul className="menu-sub">
                <li className={`menu-item ${location.pathname === "/create-milestone" ? "active" : ""}`}>
                  <Link to="/create-milestone" className="menu-link"><div className="menu-text">Create Milestone</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/milestone-alert-settings" ? "active" : ""}`}>
                  <Link to="/milestone-alert-settings" className="menu-link"><div className="menu-text">Milestone Alert Settings</div></Link>
                </li>
                <li className={`menu-item ${location.pathname === "/milestone-grouping" ? "active" : ""}`}>
                  <Link to="/milestone-grouping" className="menu-link"><div className="menu-text">Milestone Grouping</div></Link>
                </li>
              </ul>
            </li>

          </ul>
        </li>

        {/* PERFORMANCE DASHBOARD */}
        <li
          className={`menu-item 
    ${openMenu?.performance ? "open" : ""}
    ${location.pathname.startsWith("/performance")
              ? "active-top"
              : ""
            }`}
        >
          <a
            href="#"
            className="menu-link menu-toggle text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(prev => ({
                forwarding: false, tracking: false, globalMasters: false, carrierMasters: false, financeMasters: false, systemMasters: false,
                performance: !prev.performance
              }));
            }}
          >
            <i className="menu-icon bx bx-line-chart"></i>
            <div className="menu-text">Performance Dashboard</div>
          </a>

          <ul className="menu-sub">
            {performanceMenu.map((section) => (
              <li
                key={section.key}
                className={`menu-item 
          ${section.children ? (openPerf === section.key ? "open" : "") : ""}
          ${section.children
                    ? section.children.some((c) =>
                      location.pathname === c.path
                    )
                      ? "active-section"
                      : ""
                    : location.pathname === section.path
                      ? "active"
                      : ""
                  }`}
              >
                {/* IF HAS CHILDREN */}
                {section.children ? (
                  <>
                    <a
                      href="#"
                      className="menu-link menu-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenPerf(
                          openPerf === section.key ? null : section.key
                        );
                      }}
                    >
                      <i className={`menu-icon ${section.icon}`}></i>

                      <div className="menu-text">{section.title}</div>
                    </a>

                    <ul className="menu-sub">
                      {section.children.map((item) => (
                        <li
                          key={item.path}
                          className={`menu-item ${location.pathname === item.path
                            ? "active"
                            : ""
                            }`}
                        >
                          <Link to={item.path} className="menu-link">
                            <div className="menu-text">{item.name}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  /* NO CHILD (Variation Report) */
                  <Link to={section.path} className="menu-link">
                    <i className={`menu-icon ${section.icon}`}></i>

                    <div className="menu-text">{section.title}</div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </li>
        {/* tracking */}
        <li
          className={`menu-item ${openMenu?.globalMasters ? "open" : ""} 
  ${location.pathname.startsWith("/global-masters") ? "active-top" : ""}`}
        >
          <a
            href="#"
            className="menu-link menu-toggle"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(prev => ({
                forwarding: false, tracking: false, performance: false, carrierMasters: false, financeMasters: false, systemMasters: false,
                globalMasters: !prev.globalMasters
              }));
            }}
          >
            <i className="menu-icon bx bx-globe"></i>
            <div className="menu-text">Global Masters</div>
          </a>

          <ul className="menu-sub tree-menu">
            {globalMastersMenu.map((item, index) => (
              <li
                key={index}
                className={`menu-item 
          ${item.children ? (openGMSub[item.name] ? "open" : "") : ""}
          ${item.children?.some((child) =>
                  location.pathname.startsWith(child.path)
                )
                    ? "active"
                    : ""
                  }
          ${!item.children && location.pathname === item.path
                    ? "active"
                    : ""
                  }
        `}
              >
                {item.children ? (
                  <>
                    {/* 🔹 PARENT WITH CHILDREN */}
                    <a
                      href="#"
                      className="menu-link menu-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenGMSub((prev) => ({
                          ...prev,
                          [item.name]: !prev[item.name],
                        }));
                      }}
                    >
                      {item.icon && (
                        <i className={`menu-icon ${item.icon}`}></i>
                      )}
                      <div className="menu-text">{item.name}</div>
                    </a>

                    <ul className="menu-sub">
                      {item.children.map((child, i) => (
                        <li
                          key={i}
                          className={`menu-item ${location.pathname === child.path ? "active" : ""
                            }`}
                        >
                          <Link to={child.path} className="menu-link">
                            {child.icon && (
                              <i className={`menu-icon ${child.icon}`}></i>
                            )}
                            <div className="menu-text">{child.name}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  /* 🔹 NORMAL ITEM (FIXED — NO NESTED LI) */
                  <Link to={item.path} className="menu-link">
                    {item.icon && (
                      <i className={`menu-icon ${item.icon}`}></i>
                    )}
                    <div className="menu-text">{item.name}</div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </li>
        <li
          className={`menu-item ${openMenu?.carrierMasters ? "open" : ""} 
  ${location.pathname.startsWith("/carrier-masters") ? "active-top" : ""}`}
        >
          <a
            href="#"
            className="menu-link menu-toggle"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(prev => ({
                forwarding: false, tracking: false, performance: false, globalMasters: false, financeMasters: false, systemMasters: false,
                carrierMasters: !prev.carrierMasters
              }));
            }}
          >
            <i className="menu-icon bx bx-package"></i>
            <div className="menu-text">Carrier Masters</div>
          </a>

          <ul className="menu-sub tree-menu">
            {carrierMastersMenu.map((item, index) => (
              <li
                key={index}
                className={`menu-item ${location.pathname === item.path ? "active" : ""
                  }`}
              >
                <Link to={item.path} className="menu-link">
                  {item.icon && <i className={`menu-icon ${item.icon}`}></i>}
                  <div className="menu-text">{item.name}</div>
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li
          className={`menu-item ${openMenu?.financeMasters ? "open" : ""} 
  ${location.pathname.startsWith("/finance-masters") ? "active-top" : ""}`}
        >
          <a
            href="#"
            className="menu-link menu-toggle"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(prev => ({
                forwarding: false, tracking: false, performance: false, globalMasters: false, carrierMasters: false, systemMasters: false,
                financeMasters: !prev.financeMasters
              }));
            }}
          >
            <i className="menu-icon bx bx-dollar-circle"></i>
            <div className="menu-text">Finance Masters</div>
          </a>

          <ul className="menu-sub tree-menu">
            {financeMastersMenu.map((item, index) => (
              <li
                key={index}
                className={`menu-item 
                  ${item.children ? (openFinSub[item.name] ? "open" : "") : ""}
                  ${item.children?.some((child) =>
                  location.pathname.startsWith(child.path)
                )
                    ? "active"
                    : ""
                  }
                  ${!item.children && location.pathname === item.path
                    ? "active"
                    : ""
                  }
                `}
              >
                {item.children ? (
                  <>
                    <a
                      href="#"
                      className="menu-link menu-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenFinSub((prev) => ({
                          ...prev,
                          [item.name]: !prev[item.name],
                        }));
                      }}
                    >
                      {item.icon && (
                        <i className={`menu-icon ${item.icon}`}></i>
                      )}
                      <div className="menu-text">{item.name}</div>
                    </a>

                    <ul className="menu-sub">
                      {item.children.map((child, i) => (
                        <li
                          key={i}
                          className={`menu-item ${location.pathname === child.path ? "active" : ""
                            }`}
                        >
                          <Link to={child.path} className="menu-link">
                            {child.icon && (
                              <i className={`menu-icon ${child.icon}`}></i>
                            )}
                            <div className="menu-text">{child.name}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link to={item.path} className="menu-link">
                    {item.icon && (
                      <i className={`menu-icon ${item.icon}`}></i>
                    )}
                    <div className="menu-text">{item.name}</div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </li>
        <li
          className={`menu-item ${openMenu?.systemMasters ? "open" : ""} 
  ${location.pathname.startsWith("/system-master") ? "active-top" : ""}`}
        >
          <a
            href="#"
            className="menu-link menu-toggle"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(prev => ({
                forwarding: false, tracking: false, performance: false, globalMasters: false, carrierMasters: false, financeMasters: false,
                systemMasters: !prev.systemMasters
              }));
            }}
          >
            <i className="menu-icon bx bx-cog"></i>
            <div className="menu-text">System Master</div>
          </a>

          <ul className="menu-sub tree-menu">
            {systemMastersMenu.map((item, index) => (
              <li
                key={index}
                className={`menu-item ${location.pathname === item.path ? "active" : ""
                  }`}
              >
                <Link to={item.path} className="menu-link">
                  {item.icon && <i className={`menu-icon ${item.icon}`}></i>}
                  <div className="menu-text">{item.name}</div>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
