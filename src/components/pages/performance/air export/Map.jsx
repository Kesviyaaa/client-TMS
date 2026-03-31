import React, { useState } from "react";
import "../../../../App.css";
import "../../../css/performance.css";

// ───── Bracket Wrapper Component ─────
const BracketCard = ({ children, className = "", style = {} }) => (
  <div className={`bracket-card ${className}`} style={style}>
    <div className="br-tl"></div>
    <div className="br-tr"></div>
    <div className="br-bl"></div>
    <div className="br-br"></div>
    {children}
  </div>
);

// ───── MapPerformance Component ─────
const MapPerformance = () => {
  return (
    <div className="container-xxl flex-grow-1 container-p-y pb-5">
      {/* ───── HEADER ───── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="perf-header-title text-uppercase">
          <span className="text-muted pe-1">DASHBOARD</span> <span className="perf-air-export">MAP</span>
        </h5>
        
        <div className="d-flex align-items-center gap-3">
           <select className="header-filter-input" style={{ width: "240px", height: "38px" }}>
              <option value=""></option>
           </select>
           <div className="d-flex align-items-center border rounded overflow-hidden shadow-sm bg-white">
              <input type="text" className="border-0 px-2 py-2 text-center text-muted small" style={{ width: "110px", outline: 'none' }} defaultValue="dd/mm/yyyy" />
              <div className="bg-light border-start border-end px-3 py-2 text-muted fw-bold small">To</div>
              <input type="text" className="border-0 px-2 py-2 text-center text-muted small" style={{ width: "110px", outline: 'none' }} defaultValue="dd/mm/yyyy" />
           </div>
        </div>
      </div>

      <BracketCard className="p-4 overflow-hidden" style={{ minHeight: "500px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4 pe-3">
              <h6 className="fw-bold m-0 text-heading small" style={{ fontSize: '12px' }}>
                  Chargeable Weight(in Kgs) and Sum of Volume by Discharge Country
              </h6>
              <div className="text-muted" style={{ cursor: "pointer" }}>
                  <i className="bx bx-expand fs-5"></i>
              </div>
          </div>

          {/* Map Placeholder Content Area */}
          <div className="d-flex align-items-center justify-content-center flex-grow-1 bg-light border-light-subtle rounded position-relative" style={{ height: "380px" }}>
              <div className="text-center opacity-25">
                 <i className="bx bx-globe fs-1 mb-2"></i>
                 <p className="small mb-0 fw-bold">GLOBAL MAP VISUALIZATION PERFORMANCE</p>
                 <p className="extra-small">Backend Integration Required for Geospatial Data</p>
              </div>
          </div>

          {/* Bottom Labels / Legend Area from Screenshot */}
          <div className="d-flex justify-content-between align-items-center mt-4 px-2">
              <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: '#444' }}>COUNTRY</span>
              <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: '#444' }}>Chargeable Weight(in Kgs)</span>
              <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: '#444' }}>Sum of Volume</span>
              <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: '#444' }}>Customer Name</span>
              <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: '#444' }}>Shipment</span>
              <span className="fw-bold text-uppercase" style={{ fontSize: '10px', color: '#444' }}>Chargeable Weight(in Kgs)</span>
          </div>
      </BracketCard>

    </div>
  );
};

export default MapPerformance;
