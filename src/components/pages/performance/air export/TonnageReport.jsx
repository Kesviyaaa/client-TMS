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

// ───── TonnagePerformance Component ─────
const TonnageReport = () => {
    const [activeMainTab, setActiveMainTab] = useState("NGL");
    const [viewMode, setViewMode] = useState("summary"); // Defaulting to summary as per screenshot

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            {/* ───── HEADER ───── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="perf-header-title text-uppercase">
                    <span className="text-muted pe-1">DASHBOARD</span> <span className="perf-air-export">TONNAGE REPORT</span>
                </h5>

                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center border rounded overflow-hidden shadow-sm bg-white">
                        <input type="text" className="border-0 px-2 py-2 text-center text-muted small" style={{ width: "110px", outline: 'none' }} defaultValue="---------- ----" />
                        <div className="bg-light border-start border-end px-3 py-2 text-muted fw-bold small">To</div>
                        <input type="text" className="border-0 px-2 py-2 text-center text-muted small" style={{ width: "110px", outline: 'none' }} defaultValue="---------- ----" />
                    </div>
                    <select className="header-filter-input" style={{ width: "180px", height: "38px" }}>
                        <option value="25%">25%</option>
                    </select>
                </div>
            </div>

            <BracketCard className="mb-4 d-flex" style={{ height: "55px", padding: 0, overflow: 'hidden' }}>
                <div
                    onClick={() => setActiveMainTab("NGL")}
                    className="d-flex align-items-center justify-content-center flex-grow-1 h-100 fw-bold text-uppercase"
                    style={{
                        cursor: "pointer",
                        borderRight: "1px solid #ddd",
                        color: activeMainTab === "NGL" ? "#2E8B57" : "#000",
                        backgroundColor: activeMainTab === "NGL" ? "#f9f9f9" : "transparent",
                        fontSize: "14px"
                    }}>
                    NGL
                </div>
                <div
                    onClick={() => setActiveMainTab("NCS")}
                    className="d-flex align-items-center justify-content-center flex-grow-1 h-100 fw-bold text-uppercase"
                    style={{
                        cursor: "pointer",
                        color: activeMainTab === "NCS" ? "#2E8B57" : "#000",
                        backgroundColor: activeMainTab === "NCS" ? "#f9f9f9" : "transparent",
                        fontSize: "14px"
                    }}>
                    NCS
                </div>
            </BracketCard>

            <div className="mt-4">
               <BracketCard className="p-4" style={{ minHeight: "200px" }}>
                    <div className="d-flex justify-content-end align-items-center mb-4 pe-3">
                         <div 
                            onClick={() => setViewMode(viewMode === "summary" ? "table" : "summary")}
                            className={`view-toggle-btn active`}>
                            <i className="bx bx-x fs-5"></i>
                         </div>
                    </div>

                    <div className="d-flex justify-content-end align-items-center pe-3 mb-4">
                         <button className="export-btn shadow-none h-100 px-4" style={{ height: "35px", fontSize: '11.5px', fontWeight: '600' }}>
                            Download Excel
                        </button>
                    </div>

                    <div className="mt-2 text-center text-muted small">
                        {activeMainTab} Tonnage Data Ready for Export
                    </div>
               </BracketCard>
            </div>

        </div>
    );
};

export default TonnageReport;
