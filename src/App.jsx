import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Navbar from "./components/pages/Navbar";
import Sidebar from "./components/pages/Sidebar";
import Footer from "./components/pages/Footer";

import ParentMenu from "./components/pages/ParentMenu";
import SubMenu from "./components/pages/SubMenu";
import Modules from "./components/pages/Modules";
import Regions from "./components/pages/Regions";
import Countries from "./components/pages/Countries";
import Ports from "./components/pages/Ports";
import Currencies from "./components/pages/Currencies";
import Commodities from "./components/pages/Commodities";
import UnitMaster from "./components/pages/UnitMaster";
import Global from "./components/pages/Global";
import Company from "./components/pages/Company";
import AirlineMaster from "./components/pages/AirlineMaster";
import ShippingMaster from "./components/pages/ShippingMaster";
import VesselMaster from "./components/pages/VesselMaster";
import Container from "./components/pages/Container";
import Document from "./components/pages/Document";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [wrapperHover, setWrapperHover] = useState(false);

  // ⭐ REQUIRED — toggle function
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    setWrapperHover(false); // reset hover when manually toggled
  };

  return (
    <Router>
      <div
        className={`layout-wrapper layout-content-navbar ${
          collapsed ? "layout-menu-collapsed" : ""
        } ${collapsed && wrapperHover ? "menu-hover" : ""}`}
      >
        <div className="layout-container">
          {/* Sidebar */}
          <Sidebar
            collapsed={collapsed}
            toggleSidebar={toggleSidebar}
            setWrapperHover={setWrapperHover}
          />

          {/* Main page */}
          <div className="layout-page">
            <div className="top-blur"></div>
            <Navbar collapsed={collapsed} />

            <div className="content-wrapper">
              <div className="container-fluid flex-grow-1 container-p-y">
                <Routes>
                  <Route path="/" element={<Navigate to="/analytics" />} />
                  <Route path="/parent-menu" element={<ParentMenu />} />
                  <Route path="/sub-menu" element={<SubMenu />} />
                  <Route path="/modules" element={<Modules />} />
                  <Route path="/regions" element={<Regions />} />
                  <Route path="/countries" element={<Countries />} />
                  <Route path="/ports" element={<Ports />} />
                  <Route path="/currencies" element={<Currencies />} />
                  <Route path="/commodities" element={<Commodities />} />
                  <Route path="/units-of-measurements" element={<UnitMaster />} />
                  <Route path="/global-charge-codes" element={<Global />} />
                  <Route path="/company-creations" element={<Company />} />
                  <Route path="/airline-master" element={<AirlineMaster />} />
                  <Route path="/shipping-line-master" element={<ShippingMaster />} />
                  <Route path="/vessels-master" element={<VesselMaster />} />
                  <Route path="/container-types" element={<Container />} />
                  <Route path="/document-types" element={<Document />} />
                </Routes>
              </div>

              <Footer />
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
