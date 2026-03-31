import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/navbar.css";

const Navbar = ({ collapsed, hovered, toggleMobileMenu }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const shortcutsRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState([]);
  const searchInputRef = useRef(null);
  const [theme, setTheme] = useState("light");
  const [recent, setRecent] = useState([]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setResults([]);
  };
  const handleClick = (item) => {
    const updated = [item, ...recent.filter(p => p.path !== item.path)].slice(0, 5);
  
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  
    closeSearch();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecent(JSON.parse(stored));
    }
  }, []);

  const notifications = [
    {
      title: "Congratulation Lettie 🎉",
      description: "Won the monthly best seller gold badge",
      time: "1h ago",
      avatar: "../../assets/img/avatars/1.png",
    },
    {
      title: "Charles Franklin",
      description: "Accepted your connection",
      time: "12hr ago",
      initials: "CF",
      avatarClass: "bg-label-danger",
    },
    {
      title: "New Message ✉️",
      description: "You have new message from Natalie",
      time: "1h ago",
      avatar: "../../assets/img/avatars/2.png",
    },
    {
      title: "Whoo! You have new order 🛒",
      description: "ACME Inc. made new order $1,154",
      time: "1 day ago",
      initials: "AC",
      avatarClass: "bg-label-success",
    },
    {
      title: "Application has been approved 🚀",
      description: "Your ABC project application has been approved.",
      time: "2 days ago",
      avatar: "../../assets/img/avatars/9.png",
    },
    {
      title: "Monthly report is generated",
      description: "July monthly financial report is generated",
      time: "3 days ago",
      initials: "MR",
      avatarClass: "bg-label-success",
    },
  ];

  const toggleNotif = (e) => {
    e.preventDefault();
    setNotifOpen(!notifOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shortcutsRef.current && !shortcutsRef.current.contains(e.target)) {
        setShortcutsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (mode) => {
    const html = document.documentElement;
  
    html.classList.remove("light-style", "dark-style");
  
    if (mode === "dark") {
      html.classList.add("dark-style");
    } else if (mode === "light") {
      html.classList.add("light-style");
    } else if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
      if (prefersDark) {
        html.classList.add("dark-style");
      } else {
        html.classList.add("light-style");
      }
    }
  
    localStorage.setItem("theme", mode);
    setTheme(mode);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const html = document.documentElement;

    html.classList.remove("light-style", "dark-style");

    if (savedTheme === "dark") {
      html.classList.add("dark-style");
    } else {
      html.classList.add("light-style");
    }

    setTheme(savedTheme);
  }, []);

  const buildSearchData = () => {
    const data = [];
  
    // 🔹 FORWARDING
    data.push(
      { name: "Quotations", path: "/quotations", category: "FORWARDING", icon: "bx bx-file" },
      { name: "Bookings", path: "/bookings", category: "FORWARDING", icon: "bx bx-book" },
      { name: "Air Export Shipment", path: "/forwarding/shipments/air-exports/shipment", category: "FORWARDING", icon: "bx bxs-plane" },
      { name: "Air Export Consol", path: "/forwarding/shipments/air-exports/consol", category: "FORWARDING", icon: "bx bx-layer" },
      { name: "Air Import Shipment", path: "/forwarding/shipments/air-imports/shipment", category: "FORWARDING", icon: "bx bxs-plane" },
      { name: "Air Import Consol", path: "/forwarding/shipments/air-imports/consol", category: "FORWARDING", icon: "bx bx-layer" },
      { name: "Sea Export Shipment", path: "/forwarding/shipments/sea-exports/shipment", category: "FORWARDING", icon: "bx bxs-ship" },
      { name: "Sea Import Shipment", path: "/forwarding/shipments/sea-imports/shipment", category: "FORWARDING", icon: "bx bxs-ship" },
      { name: "Land Export Shipment", path: "/forwarding/shipments/land-exports/shipment", category: "FORWARDING", icon: "bx bxs-truck" },
      { name: "Land Import Shipment", path: "/forwarding/shipments/land-imports/shipment", category: "FORWARDING", icon: "bx bxs-truck" },
      { name: "Carrier Tariff", path: "/carrier-tariff", category: "FORWARDING", icon: "bx bx-line-chart" },
      { name: "Carrier Contract", path: "/carrier-contract", category: "FORWARDING", icon: "bx bx-file" },
      { name: "Airline Charges", path: "/airline-charges", category: "FORWARDING", icon: "bx bx-money" },
      { name: "Company Tariff Freight", path: "/company-tariff-freight", category: "FORWARDING", icon: "bx bx-dollar" },
    );
  
    // 🔹 TRACKING
    data.push(
      { name: "Tracking Dashboard", path: "/tracking-dashboard", category: "TRACKING", icon: "bx bx-home" },
      { name: "Ocean Shipment", path: "/ocean-shipment", category: "TRACKING", icon: "bx bxs-ship" },
      { name: "Airline Shipment", path: "/airline-shipment", category: "TRACKING", icon: "bx bxs-plane" },
      { name: "Client Details", path: "/client-details", category: "TRACKING", icon: "bx bx-user" },
      { name: "Document Upload", path: "/document-upload", category: "TRACKING", icon: "bx bx-upload" },
      { name: "Ocean Calendar", path: "/ocean-calendar", category: "TRACKING", icon: "bx bx-calendar" },
      { name: "Air Calendar", path: "/air-calendar", category: "TRACKING", icon: "bx bx-calendar-event" },
    );
  
    // 🔹 PERFORMANCE
    data.push(
      { name: "Air Import Dashboard", path: "/performance/air-import/dashboard", category: "PERFORMANCE", icon: "bx bxs-plane" },
      { name: "Air Export Dashboard", path: "/performance/air-export/dashboard", category: "PERFORMANCE", icon: "bx bxs-plane-take-off" },
      { name: "Ocean Import Dashboard", path: "/performance/ocean-import/dashboard", category: "PERFORMANCE", icon: "bx bx-anchor" },
      { name: "Ocean Export Dashboard", path: "/performance/ocean-export/dashboard", category: "PERFORMANCE", icon: "bx bxs-ship" },
      { name: "Sales Performance (AI)", path: "/performance/air-import/sales", category: "PERFORMANCE", icon: "bx bx-trending-up" },
      { name: "Sales Performance (AE)", path: "/performance/air-export/sales", category: "PERFORMANCE", icon: "bx bx-trending-up" },
      { name: "Variation Report", path: "/performance/variation", category: "PERFORMANCE", icon: "bx bx-line-chart" },
    );
  
    // 🔹 GLOBAL MASTERS
    data.push(
      { name: "Ports", path: "/global-masters/ports", category: "GLOBAL MASTERS", icon: "bx bxs-map" },
      { name: "Commodities", path: "/global-masters/commodities", category: "GLOBAL MASTERS", icon: "bx bx-category" },
      { name: "Units of Measurements", path: "/global-masters/uom", category: "GLOBAL MASTERS", icon: "bx bx-ruler" },
      { name: "Container Types", path: "/global-masters/container-types", category: "GLOBAL MASTERS", icon: "bx bx-package" },
      { name: "Document Type", path: "/global-masters/document-types", category: "GLOBAL MASTERS", icon: "bx bx-file" },
      { name: "Terminal Operator", path: "/global-masters/terminal-operator", category: "GLOBAL MASTERS", icon: "bx bx-git-branch" },
      { name: "CFS / Yard", path: "/global-masters/cfs-yard", category: "GLOBAL MASTERS", icon: "bx bx-building-house" },
    );
  
    // 🔹 CARRIER MASTERS
    data.push(
      { name: "Airline Master", path: "/carrier-masters/airline", category: "CARRIER MASTERS", icon: "bx bxs-plane" },
      { name: "Shipping Line Master", path: "/carrier-masters/shipping-line", category: "CARRIER MASTERS", icon: "bx bxs-ship" },
      { name: "BL / WB Clause", path: "/carrier-masters/bl-clause", category: "CARRIER MASTERS", icon: "bx bx-file" },
      { name: "Vessels Master", path: "/carrier-masters/vessels", category: "CARRIER MASTERS", icon: "bx bx-anchor" },
    );
  
    // 🔹 FINANCE MASTERS
    data.push(
      { name: "Global Charge Codes", path: "/finance-masters/charge-codes", category: "FINANCE MASTERS", icon: "bx bx-money" },
      { name: "Airline Commission", path: "/finance-masters/airline-commission", category: "FINANCE MASTERS", icon: "bx bx-line-chart" },
      { name: "Shipping Line Brokerage", path: "/finance-masters/shipping-brokerage", category: "FINANCE MASTERS", icon: "bx bx-trending-up" },
    );
  
    // 🔹 SYSTEM MASTERS
    data.push(
      { name: "Organisation Details", path: "/system-master/org-details", category: "SYSTEM MASTERS", icon: "bx bx-buildings" },
      { name: "Branch Creation", path: "/system-master/branch", category: "SYSTEM MASTERS", icon: "bx bx-git-branch" },
      { name: "User Creation", path: "/system-master/user", category: "SYSTEM MASTERS", icon: "bx bx-user" },
      { name: "User Role", path: "/system-master/user-role", category: "SYSTEM MASTERS", icon: "bx bx-id-card" },
    );
  
    return data;
  };
  
  const pages = buildSearchData();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }

      if (e.key === "Escape") {
        closeSearch();      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
  
    const filtered = pages.filter((p) =>
      (p.name + " " + p.category)
        .toLowerCase()
        .includes(value.toLowerCase())
    );
  
    setResults(filtered);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // CTRL + K → open search
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }

      // ESC → close search
      if (e.key === "Escape") {
        closeSearch();      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [searchOpen]);

  return (
    <nav
      className={`layout-navbar navbar ${
        collapsed ? "sidebar-collapsed" : "sidebar-expanded"
      } ${hovered ? "sidebar-hovered" : ""}`}
    >
      {/* Left menu toggle */}
      <div className="layout-menu-toggle navbar-nav align-items-center me-4 me-xl-0 d-xl-none">
        <a 
          className="nav-item nav-link px-0 me-xl-6" 
          href="#!"
          onClick={(e) => {
            e.preventDefault();
            toggleMobileMenu();
          }}
        >
          <i className="icon-base bx bx-menu icon-md"></i>
        </a>
      </div>

      {/* Navbar right */}
      <div
        className="navbar-nav-right d-flex align-items-center justify-content-end"
        id="navbar-collapse"
      >
        {/* Search */}
        <div className="navbar-nav align-items-center">
          <div className="nav-item navbar-search-wrapper mb-0">
            <a
              className="nav-item nav-link search-toggler d-flex align-items-center px-0"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSearchOpen(true);
              }}
            >
              <i className="bx bx-search bx-sm text-muted"></i>
              <span className="d-none d-md-inline-block text-muted ms-2">
                Search [Ctrl+K]
              </span>
            </a>
          </div>
        </div>

        <ul className="navbar-nav flex-row align-items-center ms-md-auto">
          {/* Language dropdown */}
          <li
            className={`nav-item dropdown-language dropdown me-2 me-xl-0 ${
              langOpen ? "show" : ""
            }`}
            ref={langRef}
          >
            <a
              className="nav-link dropdown-toggle hide-arrow"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setLangOpen(!langOpen);
              }}
            >
              <i className="icon-base bx bx-globe icon-md"></i>
            </a>
            <ul
              className={`dropdown-menu dropdown-menu-end ${
                langOpen ? "show" : ""
              }`}
            >
              <li>
                <button className="dropdown-item">English</button>
              </li>
              <li>
                <button className="dropdown-item">French</button>
              </li>
              <li>
                <button className="dropdown-item">Arabic</button>
              </li>
              <li>
                <button className="dropdown-item">German</button>
              </li>
            </ul>
          </li>

          {/* Theme switcher */}
          <li
            className={`nav-item dropdown-style-switcher dropdown me-2 me-xl-0 ${
              themeOpen ? "show" : ""
            }`}
            ref={themeRef}
          >
            <a
              className="nav-link dropdown-toggle hide-arrow"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setThemeOpen(!themeOpen);
              }}
            >
              <i
                className={`bx bx-sm ${
                  theme === "dark"
                    ? "bx-moon"
                    : theme === "light"
                    ? "bx-sun"
                    : "bx-laptop"
                }`}
              ></i>
            </a>
            <ul
              className={`dropdown-menu dropdown-menu-end ${
                themeOpen ? "show" : ""
              }`}
            >
              <li>
                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => handleThemeChange("light")}
                >
                  <i className="bx bx-sun me-2"></i>
                  <span>Light</span>
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => handleThemeChange("dark")}
                >
                  <i className="bx bx-moon me-2"></i>
                  <span>Dark</span>
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => handleThemeChange("system")}
                >
                  <i className="bx bx-laptop me-2"></i>
                  <span>System</span>
                </button>
              </li>
            </ul>
          </li>

          <li
            className={`nav-item dropdown-shortcuts navbar-dropdown dropdown me-2 me-xl-0 ${
              shortcutsOpen ? "show" : ""
            }`}
            ref={shortcutsRef}
          >
            <a
              className="nav-link dropdown-toggle hide-arrow"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShortcutsOpen(!shortcutsOpen);
              }}
            >
              <i className="icon-base bx bx-grid-alt icon-md"></i>
            </a>

            <div
              className={`dropdown-menu dropdown-menu-end p-3 ${
                shortcutsOpen ? "show" : ""
              }`}
            >
              <div className="dropdown-menu-header border-bottom mb-2 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Shortcuts</h6>
                <a href="#" className="text-muted" title="Add shortcuts">
                  <i className="icon-base bx bx-plus-circle"></i>
                </a>
              </div>

              <div className="shortcuts-grid">
                {[
                  { icon: "bx-calendar", label: "Calendar" },
                  { icon: "bx-food-menu", label: "Invoice" },
                  { icon: "bx-user", label: "Users" },
                  { icon: "bx-check-shield", label: "Roles" },
                  { icon: "bx-pie-chart-alt-2", label: "Dashboard" },
                  { icon: "bx-cog", label: "Settings" },
                  { icon: "bx-help-circle", label: "FAQs" },
                  { icon: "bx-window-open", label: "Modals" },
                ].map((item, i) => (
                  <div key={i} className="shortcut-item">
                    <div className="shortcut-icon">
                      <i
                        className={`icon-base bx ${item.icon} icon-26px text-heading`}
                      ></i>
                    </div>
                    <span className="shortcut-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </li>

          <li
            className={`nav-item dropdown-notifications navbar-dropdown dropdown me-3 me-xl-2 ${
              notifOpen ? "show" : ""
            }`}
            ref={notifRef}
          >
            <a
              className="nav-link dropdown-toggle hide-arrow"
              href="#"
              onClick={toggleNotif}
            >
              <span className="position-relative">
                <i className="icon-base bx bx-bell icon-md"></i>
                <span className="badge rounded-pill bg-danger badge-dot badge-notifications border"></span>
              </span>
            </a>

            <ul
              className={`dropdown-menu dropdown-menu-end p-0 ${
                notifOpen ? "show" : ""
              }`}
            >
              {/* Header */}
              <li className="dropdown-menu-header border-bottom">
                <div className="dropdown-header d-flex align-items-center py-3">
                  <h6 className="mb-0 me-auto">Notification</h6>
                  <div className="d-flex align-items-center h6 mb-0">
                    <span className="badge bg-label-primary me-2">
                      {notifications.length} New
                    </span>
                    <a
                      href="#"
                      className="dropdown-notifications-all p-2"
                      title="Mark all as read"
                    >
                      <i className="icon-base bx bx-envelope-open text-heading"></i>
                    </a>
                  </div>
                </div>
              </li>

              {/* Notifications List */}
              <li className="dropdown-notifications-list scrollable-container">
                <ul className="list-group list-group-flush">
                  {notifications.map((item, idx) => (
                    <li
                      key={idx}
                      className="list-group-item list-group-item-action dropdown-notifications-item"
                    >
                      <div className="d-flex">
                        <div className="flex-shrink-0 me-3">
                          <div className="avatar">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt="User Avatar"
                                className="rounded-circle"
                              />
                            ) : (
                              <span
                                className={`avatar-initial rounded-circle ${
                                  item.avatarClass || "bg-label-secondary"
                                }`}
                              >
                                {item.initials}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="small mb-0">{item.title}</h6>
                          <small className="mb-1 d-block text-body">
                            {item.description}
                          </small>
                          <small className="text-body-secondary">
                            {item.time}
                          </small>
                        </div>
                        <div className="flex-shrink-0 dropdown-notifications-actions">
                          <a href="#" className="dropdown-notifications-read">
                            <span className="badge badge-dot"></span>
                          </a>
                          <a
                            href="#"
                            className="dropdown-notifications-archive"
                          >
                            <span className="icon-base bx bx-x"></span>
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Footer */}
              <li className="dropdown-notifications-footer border-top">
                <div className="d-grid p-2">
                  <a
                    className="btn btn-primary btn-sm d-flex justify-content-center"
                    href="#"
                  >
                    <small className="align-middle">
                      View all notifications
                    </small>
                  </a>
                </div>
              </li>
            </ul>
          </li>
          <li
            className={`nav-item navbar-dropdown dropdown-user dropdown ${
              userOpen ? "show" : ""
            }`}
            ref={userRef}
          >
            <a
              className="nav-link dropdown-toggle hide-arrow p-0"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setUserOpen(!userOpen);
              }}
            >
              <div className="avatar avatar-online">
                <img
                  src="../../assets/img/avatars/1.png"
                  alt="avatar"
                  className="rounded-circle"
                />
              </div>
            </a>
            <ul
              className={`dropdown-menu dropdown-menu-end ${
                userOpen ? "show" : ""
              }`}
            >
              <li>
                <a
                  className="dropdown-item"
                  href="pages-account-settings-account.html"
                >
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar avatar-online">
                        <img
                          src="../../assets/img/avatars/1.png"
                          alt="avatar"
                          className="w-px-40 h-auto rounded-circle"
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">John Doe</h6>
                      <small className="text-body-secondary">Admin</small>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <div className="dropdown-divider my-1"></div>
              </li>
              <li>
                <a className="dropdown-item" href="pages-profile-user.html">
                  <i className="icon-base bx bx-user icon-md me-3"></i>
                  <span>My Profile</span>
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="pages-account-settings-account.html"
                >
                  <i className="icon-base bx bx-cog icon-md me-3"></i>
                  <span>Settings</span>
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="pages-account-settings-billing.html"
                >
                  <span className="d-flex align-items-center align-middle">
                    <i className="flex-shrink-0 icon-base bx bx-credit-card icon-md me-3"></i>
                    <span className="flex-grow-1 align-middle">
                      Billing Plan
                    </span>
                    <span className="flex-shrink-0 badge rounded-pill bg-danger">
                      4
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <div className="dropdown-divider my-1"></div>
              </li>
              <li>
                <a className="dropdown-item" href="pages-pricing.html">
                  <i className="icon-base bx bx-dollar icon-md me-3"></i>
                  <span>Pricing</span>
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="pages-faq.html">
                  <i className="icon-base bx bx-help-circle icon-md me-3"></i>
                  <span>FAQ</span>
                </a>
              </li>
              <li>
                <div className="dropdown-divider my-1"></div>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="auth-login-cover.html"
                  target="_blank"
                >
                  <i className="icon-base bx bx-power-off icon-md me-3"></i>
                  <span>Log Out</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {searchOpen && (
        <div className="search-modal-overlay">
          <div className="search-modal">
          <div className="search-header modern">
  <i className="bx bx-search search-icon"></i>

  <input
    type="text"
    placeholder="Search anything (Ctrl + K)"
    value={searchQuery}
    onChange={(e) => handleSearch(e.target.value)}
    autoFocus
  />

  <div className="search-actions">
    <i className="bx bx-x fs-4 me-2" onClick={closeSearch} style={{ cursor: 'pointer', color: '#6b7280' }}></i>
    <kbd>ESC</kbd>
  </div>
</div>

            <div className="search-results">
              {/* DEFAULT VIEW */}
              {searchQuery === "" && (
                <div className="search-empty-state modern">
                  <div className="search-grid-container">
                    {/* COLUMN 1 */}
                    <div className="search-grid-column">
                      <div className="search-category-section">
                        <div className="search-category-header">FORWARDING</div>
                        {pages.filter(p => p.category === "FORWARDING").map((item, i) => (
                          <Link key={i} to={item.path} className="search-grid-item" onClick={() => handleClick(item)}>
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="search-category-section">
                        <div className="search-category-header">TRACKING</div>
                        {pages.filter(p => p.category === "TRACKING").map((item, i) => (
                          <Link key={i} to={item.path} className="search-grid-item" onClick={() => handleClick(item)}>
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="search-category-section">
                        <div className="search-category-header">PERFORMANCE</div>
                        {pages.filter(p => p.category === "PERFORMANCE").map((item, i) => (
                          <Link key={i} to={item.path} className="search-grid-item" onClick={() => handleClick(item)}>
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN 2 */}
                    <div className="search-grid-column">
                      <div className="search-category-section">
                        <div className="search-category-header">GLOBAL MASTERS</div>
                        {pages.filter(p => p.category === "GLOBAL MASTERS").map((item, i) => (
                          <Link key={i} to={item.path} className="search-grid-item" onClick={() => handleClick(item)}>
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="search-category-section">
                        <div className="search-category-header">CARRIER MASTERS</div>
                        {pages.filter(p => p.category === "CARRIER MASTERS").map((item, i) => (
                          <Link key={i} to={item.path} className="search-grid-item" onClick={() => handleClick(item)}>
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="search-category-section">
                        <div className="search-category-header">FINANCE MASTERS</div>
                        {pages.filter(p => p.category === "FINANCE MASTERS").map((item, i) => (
                          <Link key={i} to={item.path} className="search-grid-item" onClick={() => handleClick(item)}>
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="search-category-section">
                        <div className="search-category-header">SYSTEM MASTERS</div>
                        {pages.filter(p => p.category === "SYSTEM MASTERS").map((item, i) => (
                          <Link key={i} to={item.path} className="search-grid-item" onClick={() => handleClick(item)}>
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEARCH RESULTS */}
              {searchQuery !== "" && results.length === 0 && (
                <div className="search-empty">
                  No results found
                  <small>Try searching for analytics or tables</small>
                </div>
              )}

{searchQuery !== "" &&
  Object.entries(
    results.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {})
  ).map(([category, items]) => (
    <div key={category} className="search-group">
      <div className="search-group-title">{category}</div>

      {items.map((item, i) => (
  <Link
    key={i}
    to={item.path}
    className="search-result modern"
    onClick={() => handleClick(item)}
  >
    <div className="left">
      <i className={item.icon}></i>
    </div>

    <div className="center">
      <div className="title">{item.name}</div>
      <div className="meta">{category}</div>
    </div>

    <div className="right">
      <span>↵</span>
    </div>
  </Link>
))}
    </div>
  ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
