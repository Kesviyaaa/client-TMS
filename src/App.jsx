import { useState } from "react";
import {
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
import Breadcrumbs from "./components/pages/Breadcrumbs";

import Dashboard from "./components/pages/Dashboard";
import Quotations from "./components/pages/forwarding/Quotations";
import Bookings from "./components/pages/forwarding/Bookings";
import Shipment from "./components/pages/forwarding/shipments/sea-exports/Shipment";
import SeaExportConsol from "./components/pages/forwarding/shipments/sea-exports/Consol";
import AirExportShipment from "./components/pages/forwarding/shipments/air-exports/Shipment";
import AirExportConsol from "./components/pages/forwarding/shipments/air-exports/Consol";
import TrackingDashboard from "./components/pages/tracking/Dashboard";
import OceanShipment from "./components/pages/tracking/OceanShipment";
import AirImportDashboard from "./components/pages/performance/air import/Dashboard";
import AirExportDashboard from "./components/pages/performance/air export/Dashboard";
import AirImportShipmentDetails from "./components/pages/performance/air import/ShipmentDetails";
import AirExportShipmentDetails from "./components/pages/performance/air export/ShipmentDetails";
import AirImportSalesPerformance from "./components/pages/performance/air import/SalesPerformance";
import AirExportSalesPerformance from "./components/pages/performance/air export/SalesPerformance";
import AirImportClientPerformance from "./components/pages/performance/air import/ClientPerformance";
import AirExportClientPerformance from "./components/pages/performance/air export/ClientPerformance";
import AirImportAirlinePerformance from "./components/pages/performance/air import/AirlinePerformance";
import AirExportAirlinePerformance from "./components/pages/performance/air export/AirlinePerformance";
import AirImportMapPerformance from "./components/pages/performance/air import/Map";
import AirExportMapPerformance from "./components/pages/performance/air export/Map";
import AirExportTonnageReport from "./components/pages/performance/air export/TonnageReport";
import OceanImportSalesPerformance from "./components/pages/performance/ocean import/SalesPerformance";
import OceanExportSalesPerformance from "./components/pages/performance/ocean export/SalesPerformance";

import OceanCalendar from "./components/pages/tracking/calendar/OceanCalendar";
import AirCalendar from "./components/pages/tracking/calendar/AirCalendar";
import AirShipment from "./components/pages/tracking/AirShipment";
import ClientDetails from "./components/pages/tracking/ClientDetails";
import DocumentUpload from "./components/pages/tracking/DocumentUpload";
import VariationReport from "./components/pages/performance/VariationReport";
import Co2Reports from "./components/pages/tracking/reports/co2";
import ShipmentReports from "./components/pages/tracking/reports/ShipmentReports";
import AirlineReports from "./components/pages/tracking/reports/AirlineReports";
import ShippinglineReports from "./components/pages/tracking/reports/ShippinglineReports";
import LogReport from "./components/pages/tracking/reports/LogReport";
import CreateMilestone from "./components/pages/tracking/milestones/CreateMilestone";
import MilestoneGrouping from "./components/pages/tracking/milestones/MilestoneGrouping";
import AirImportConsol from "./components/pages/forwarding/shipments/air-imports/Consol";
import AirImportShipment from "./components/pages/forwarding/shipments/air-imports/Shipment";
import SeaImportConsol from "./components/pages/forwarding/shipments/sea-imports/Consol";
import LandExportShipment from "./components/pages/forwarding/shipments/land-exports/Shipment";
import LandExportConsol from "./components/pages/forwarding/shipments/land-exports/Consol";
import LandImportShipment from "./components/pages/forwarding/shipments/land-imports/Shipment";
import LandImportConsol from "./components/pages/forwarding/shipments/land-imports/Consol";
import Ports from "./components/pages/global-masters/Ports";
import Commodities from "./components/pages/global-masters/Commodities";
import Units from "./components/pages/global-masters/Units";
import ContainerTypes from "./components/pages/global-masters/ContainerTypes";
import DocumentTypes from "./components/pages/global-masters/DocumentTypes";
import TerminalOperator from "./components/pages/global-masters/TerminalOperator";
import CFS from "./components/pages/global-masters/CFS";
import AirlineMaster from "./components/pages/carrier-masters/AirlineMaster";
import ShippingLineMaster from "./components/pages/carrier-masters/ShippingLineMaster";
import BLWBClause from "./components/pages/carrier-masters/BLWBClause";
import VesselsMaster from "./components/pages/carrier-masters/VesselMaster";
import GlobalChargeCode from "./components/pages/finance-masters/GlobalChargeCode";
import AirlineCommission from "./components/pages/finance-masters/AirlineCommission";
import ShippingLineBrokerage from "./components/pages/finance-masters/ShippingLineBrokerage";
import APInvoice from "./components/pages/finance-masters/APInvoice";
import ARInvoice from "./components/pages/finance-masters/ARInvoice";
import Organisation from "./components/pages/system-masters/Organisation";
import Branch from "./components/pages/system-masters/Branch";
import User from "./components/pages/system-masters/User";
import Role from "./components/pages/system-masters/Role";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [wrapperHover, setWrapperHover] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // ⭐ REQUIRED — toggle function
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    setWrapperHover(false); // reset hover when manually toggled
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <div
        className={`layout-wrapper layout-content-navbar ${collapsed ? "layout-menu-collapsed" : ""
          } ${collapsed && wrapperHover ? "menu-hover" : ""}`}
      >
        <div className="layout-container">
          {/* Sidebar */}
          <Sidebar
            collapsed={collapsed}
            showMobileMenu={showMobileMenu}
            toggleSidebar={toggleSidebar}
            toggleMobileMenu={toggleMobileMenu}
            setWrapperHover={setWrapperHover}
          />

          {/* Mobile Backdrop */}
          {showMobileMenu && (
            <div
              className="layout-menu-backdrop d-xl-none"
              onClick={toggleMobileMenu}
            ></div>
          )}

          {/* Main page */}
          <div className="layout-page">
            <div className="top-blur"></div>
            <Navbar
              collapsed={collapsed}
              toggleMobileMenu={toggleMobileMenu}
            />

            <div className="content-wrapper">
              <div className="container-fluid flex-grow-1 container-p-y">
                <Breadcrumbs />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tracking-dashboard" element={<TrackingDashboard />} />
                  <Route path="/ocean-shipment" element={<OceanShipment />} />
                  <Route path="/quotations" element={<Quotations />} />
                  <Route path="/quotations/create" element={<Quotations initialView="form" />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/bookings/create" element={<Bookings initialView="form" />} />

                  {/* Sea Exports */}
                  <Route path="/forwarding/shipments/sea-exports/shipment" element={<Shipment />} />
                  <Route path="/forwarding/shipments/sea-exports/shipment/create" element={<Shipment initialView="form" />} />
                  <Route path="/forwarding/shipments/sea-exports/consol" element={<SeaExportConsol />} />

                  {/* Air Exports */}
                  <Route path="/forwarding/shipments/air-exports/shipment" element={<AirExportShipment />} />
                  <Route path="/forwarding/shipments/air-exports/shipment/create" element={<AirExportShipment initialView="form" />} />
                  <Route path="/forwarding/shipments/air-exports/consol" element={<AirExportConsol />} />
                  <Route path="/forwarding/shipments/air-exports/consol/create" element={<AirExportConsol initialView="form" />} />

                  {/* Air Imports */}
                  <Route path="/forwarding/shipments/air-imports/shipment" element={<AirImportShipment />} />
                  <Route path="/forwarding/shipments/air-imports/shipment/create" element={<AirImportShipment initialView="form" />} />
                  <Route path="/forwarding/shipments/air-imports/consol" element={<AirImportConsol />} />
                  <Route path="/forwarding/shipments/air-imports/consol/create" element={<AirImportConsol initialView="form" />} />

                  {/* Sea Imports */}
                  <Route path="/forwarding/shipments/sea-imports/consol" element={<SeaImportConsol />} />
                  <Route path="/forwarding/shipments/sea-imports/consol/create" element={<SeaImportConsol initialView="form" />} />

                  {/* Land Exports */}
                  <Route path="/forwarding/shipments/land-exports/consol" element={<LandExportConsol />} />
                  <Route path="/forwarding/shipments/land-exports/consol/create" element={<LandExportConsol initialView="form" />} />
                  <Route path="/forwarding/shipments/land-exports/shipment" element={<LandExportShipment />} />
                  <Route path="/forwarding/shipments/land-exports/shipment/create" element={<LandExportShipment initialView="form" />} />

                  {/* Land Imports */}
                  <Route path="/forwarding/shipments/land-imports/consol" element={<LandImportConsol />} />
                  <Route path="/forwarding/shipments/land-imports/consol/create" element={<LandImportConsol initialView="form" />} />
                  <Route path="/forwarding/shipments/land-imports/shipment" element={<LandImportShipment />} />
                  <Route path="/forwarding/shipments/land-imports/shipment/create" element={<LandImportShipment initialView="form" />} />

                  {/* Performance */}
                  <Route path="/performance/air-import/dashboard" element={<AirImportDashboard />} />
                  <Route path="/performance/air-import/shipment-details" element={<AirImportShipmentDetails />} />
                  <Route path="/performance/air-import/sales" element={<AirImportSalesPerformance />} />
                  <Route path="/performance/air-import/client" element={<AirImportClientPerformance />} />
                  <Route path="/performance/air-import/airline" element={<AirImportAirlinePerformance />} />
                  <Route path="/performance/air-import/map" element={<AirImportMapPerformance />} />
                  {/* <Route path="/performance/ocean-import/dashboard" element={<OceanImportDashboard />} /> */}
                  {/* <Route path="/performance/ocean-import/shipment-details" element={<OceanImportShipmentDetails />} /> */}
                  <Route path="/performance/ocean-import/sales" element={<OceanImportSalesPerformance />} />
                  {/* <Route path="/performance/ocean-export/dashboard" element={<OceanExportDashboard />} /> */}
                  {/* <Route path="/performance/ocean-export/shipment-details" element={<OceanExportShipmentDetails />} /> */}
                  <Route path="/performance/ocean-export/sales" element={<OceanExportSalesPerformance />} />
                  <Route path="/performance/air-export/dashboard" element={<AirExportDashboard />} />
                  <Route path="/performance/air-export/shipment-details" element={<AirExportShipmentDetails />} />
                  <Route path="/performance/air-export/sales" element={<AirExportSalesPerformance />} />
                  <Route path="/performance/air-export/client" element={<AirExportClientPerformance />} />
                  <Route path="/performance/air-export/airline" element={<AirExportAirlinePerformance />} />
                  <Route path="/performance/air-export/map" element={<AirExportMapPerformance />} />
                  <Route path="/performance/air-export/tonnage" element={<AirExportTonnageReport />} />
                  <Route path="/performance/variation" element={<VariationReport />} />

                  {/* Tracking Reports */}
                  <Route path="/co2-reports" element={<Co2Reports />} />
                  <Route path="/shipment-reports" element={<ShipmentReports />} />
                  <Route path="/airline-reports" element={<AirlineReports />} />
                  <Route path="/shipping-line-reports" element={<ShippinglineReports />} />
                  <Route path="/log-reports" element={<LogReport />} />

                  {/* Calendar & Others */}
                  <Route path="/ocean-calendar" element={<OceanCalendar />} />
                  <Route path="/air-calendar" element={<AirCalendar />} />
                  <Route path="/air-shipment" element={<AirShipment />} />
                  <Route path="/client-details" element={<ClientDetails />} />
                  <Route path="/document-upload" element={<DocumentUpload />} />

                  {/* Milestones */}
                  <Route path="/create-milestone" element={<CreateMilestone />} />
                  <Route path="/milestone-grouping" element={<MilestoneGrouping />} />

                  {/* Global Masters */}
                  <Route path="/global-masters/ports" element={<Ports />} />
                  <Route path="/global-masters/commodities" element={<Commodities />} />
                  <Route path="/global-masters/uom" element={<Units />} />
                  <Route path="/global-masters/container-types" element={<ContainerTypes />} />
                  <Route path="/global-masters/document-types" element={<DocumentTypes />} />
                  <Route path="/global-masters/terminal-operator" element={<TerminalOperator />} />
                  <Route path="/global-masters/cfs-yard" element={<CFS />} />
                  <Route path="/carrier-masters/airline" element={<AirlineMaster />} />
                  <Route path="/carrier-masters/shipping-line" element={<ShippingLineMaster />} />
                  <Route path="/carrier-masters/bl-clause" element={<BLWBClause />} />
                  <Route path="/carrier-masters/vessels" element={<VesselsMaster />} />

                  {/* Finance Masters */}
                  <Route path="/finance-masters/charge-codes" element={<GlobalChargeCode />} />
                  <Route path="/finance-masters/airline-commission" element={<AirlineCommission />} />
                  <Route path="/finance-masters/shipping-brokerage" element={<ShippingLineBrokerage />} />
                  <Route path="/finance-masters/accounts/ap-invoice" element={<APInvoice />} />
                  <Route path="/finance-masters/accounts/ap-invoice/create" element={<APInvoice initialView="form" />} />
                  <Route path="/finance-masters/accounts/ar-invoice" element={<ARInvoice />} />
                  <Route path="/finance-masters/accounts/ar-invoice/create" element={<ARInvoice initialView="form" />} />

                  {/* System Masters */}
                  <Route path="/system-master/org-details" element={<Organisation />} />
                  <Route path="/system-master/org-details/create" element={<Organisation initialView="form" />} />
                  <Route path="/system-master/branch" element={<Branch />} />
                  <Route path="/system-master/branch/create" element={<Branch initialView="form" />} />
                  <Route path="/system-master/user" element={<User />} />
                  <Route path="/system-master/user/create" element={<User initialView="form" />} />
                  <Route path="/system-master/user-role" element={<Role />} />


                </Routes>
              </div>

              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
