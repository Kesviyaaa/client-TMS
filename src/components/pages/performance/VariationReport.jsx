import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-responsive";
import "datatables.net-responsive-bs5";
import "datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css";

import "datatables.net-buttons";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.colVis";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs;

import "../../../App.css";

// ───── Bracket Wrapper Component ─────
const BracketCard = ({ children, className = "", style = {} }) => (
    <div className={`bracket-card ${className}`} style={{ position: "relative", backgroundColor: "#fff", transition: "transform 0.3s ease, box-shadow 0.3s ease", ...style }}>
        <div className="br-tl" style={{ position: "absolute", top: 0, left: 0, width: "12px", height: "12px", borderTop: "2px solid #a1acb8", borderLeft: "2px solid #a1acb8" }}></div>
        <div className="br-tr" style={{ position: "absolute", top: 0, right: 0, width: "12px", height: "12px", borderTop: "2px solid #a1acb8", borderRight: "2px solid #a1acb8" }}></div>
        <div className="br-bl" style={{ position: "absolute", bottom: 0, left: 0, width: "12px", height: "12px", borderBottom: "2px solid #a1acb8", borderLeft: "2px solid #a1acb8" }}></div>
        <div className="br-br" style={{ position: "absolute", bottom: 0, right: 0, width: "12px", height: "12px", borderBottom: "2px solid #a1acb8", borderRight: "2px solid #a1acb8" }}></div>
        {children}
    </div>
);

// ───── SubTable Component ─────
const SubTable = ({ title }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const [viewMode, setViewMode] = useState("table");

    useEffect(() => {
        if (!tableRef.current) return;
        if (dtRef.current) return;

        $.fn.dataTable.ext.errMode = "none";
        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom: "t",
            responsive: false,
            scrollX: true,
            scrollY: "150px",
            scrollCollapse: true,
            data: [],
            columns: [
                { data: "title", title: title, defaultContent: "" },
                { data: "noOfShipments", title: "NO.Of.Shipments", defaultContent: "" },
                { data: "chargeableWeight", title: "Chargeable Weight(in Kgs)", defaultContent: "" },
            ],
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [title]);

    return (
        <BracketCard className="hover-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-0 px-3 pt-3">
                <h6 className="fw-bold m-0" style={{ color: "#32475c", fontSize: "12px" }}>{title}</h6>
                <div className="d-flex gap-2">
                    <div
                        onClick={() => setViewMode("table")}
                        className="d-flex align-items-center justify-content-center"
                        style={{ width: "28px", height: "28px", backgroundColor: viewMode === "table" ? "#50a9e9" : "#e8f4fc", borderRadius: "4px", color: viewMode === "table" ? "white" : "#50a9e9", cursor: "pointer" }}>
                        <i className="bx bx-table fs-6"></i>
                    </div>
                    <div
                        onClick={() => setViewMode("chart")}
                        className="d-flex align-items-center justify-content-center"
                        style={{ width: "28px", height: "28px", backgroundColor: viewMode === "chart" ? "#50a9e9" : "#e8f4fc", borderRadius: "4px", color: viewMode === "chart" ? "white" : "#50a9e9", cursor: "pointer" }}>
                        <i className="bx bx-bar-chart-alt-2 fs-6"></i>
                    </div>
                </div>
            </div>

            <div style={{ display: viewMode === "table" ? "block" : "none" }} className="card-datatable pb-1 px-3">
                <table ref={tableRef} className="table dataTable dtr-inline w-100" style={{ fontSize: "11px" }}>
                    <thead></thead>
                </table>
            </div>
            <div style={{ display: viewMode === "chart" ? "flex" : "none", height: "150px", alignItems: "center", justifyContent: "center" }}>
                <span className="text-muted small">Chart placeholder</span>
            </div>
        </BracketCard>
    );
};

// ───── Main Variation Report Component ─────
const VariationReport = () => {
    const [tab1, setTab1] = useState("NGL");
    const [viewState, setViewState] = useState(1); // 1: Default, 2: Import/Export, 3: Agent/Free/Sub
    const [activeTab2, setActiveTab2] = useState("Import");
    const [activeTab3, setActiveTab3] = useState("Agent Nomination");

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5" style={{ background: "#f5f5f9" }}>
            <style>{`
        .hover-card:hover {
           transform: translateY(-5px);
           box-shadow: 0 0.5rem 1rem rgba(161, 172, 184, 0.45) !important;
        }
        .header-filter-input {
           font-size: 13px;
           border: 1px solid #d9dee3;
           border-radius: 4px;
           padding: 6px 10px;
           color: #697a8d;
           background-color: #fff;
           outline: none;
        }
      `}</style>

            {/* ───── HEADER ───── */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <h5 className="fw-bold m-0" style={{ color: "#2E8B57", fontSize: "14px", letterSpacing: "0.5px" }}>
                    <span style={{ color: '#566a7f' }}>DASHBOARD</span> VARIATION REPORT
                </h5>


            </div>



            {/* ───── MAIN CONTENT BOX ───── */}
            <div className="row g-0 px-3 mb-4">
                <div className="col-12">
                    <BracketCard style={{ minHeight: "280px", padding: "20px" }}>
                        {/* Icon Controls Bar */}
                        <div className="d-flex justify-content-end gap-2 mb-4">
                            <div
                                onClick={() => setViewState(1)}
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px", backgroundColor: viewState === 1 ? "#50a9e9" : "transparent", borderRadius: "4px", color: viewState === 1 ? "white" : "#50a9e9", border: "1px solid #50a9e9", cursor: "pointer" }}>
                                <i className="bx bx-window-alt fs-5"></i>
                            </div>
                            <div
                                onClick={() => setViewState(2)}
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px", backgroundColor: viewState === 2 ? "#50a9e9" : "transparent", borderRadius: "4px", color: viewState === 2 ? "white" : "#50a9e9", border: "1px solid #50a9e9", cursor: "pointer" }}>
                                <i className="bx bx-calendar fs-5"></i>
                            </div>
                            <div
                                onClick={() => setViewState(3)}
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px", backgroundColor: viewState === 3 ? "#50a9e9" : "transparent", borderRadius: "4px", color: viewState === 3 ? "white" : "#50a9e9", border: "1px solid #50a9e9", cursor: "pointer" }}>
                                <i className="bx bx-bar-chart-alt-2 fs-5"></i>
                            </div>
                        </div>

                        {/* View 1: Default Empty Area */}
                        {viewState === 1 && (
                            <div className="w-100" style={{ height: "155px" }}></div>
                        )}

                        {/* View 2: Import / Export Tabs */}
                        {viewState === 2 && (
                            <div className="w-100">
                                <BracketCard className="d-flex mb-4" style={{ height: "55px", padding: 0 }}>
                                    <div
                                        onClick={() => setActiveTab2("Import")}
                                        className="d-flex align-items-center justify-content-center flex-grow-1 h-100 fw-bold"
                                        style={{ cursor: "pointer", borderRight: "1px solid #ddd", color: activeTab2 === "Import" ? "black" : "#50a9e9", backgroundColor: activeTab2 === "Import" ? "#f9f9f9" : "transparent", fontSize: "14px" }}>
                                        Import
                                    </div>
                                    <div
                                        onClick={() => setActiveTab2("Export")}
                                        className="d-flex align-items-center justify-content-center flex-grow-1 h-100 fw-bold"
                                        style={{ cursor: "pointer", color: activeTab2 === "Export" ? "black" : "#50a9e9", backgroundColor: activeTab2 === "Export" ? "#f9f9f9" : "transparent", fontSize: "14px" }}>
                                        Export
                                    </div>
                                </BracketCard>
                                <BracketCard style={{ height: "100px", width: "100%", backgroundColor: "transparent" }}></BracketCard>
                            </div>
                        )}

                        {/* View 3: Nomination / Free Hand / Sub Agent Tabs */}
                        {viewState === 3 && (
                            <div className="w-100">
                                <div className="d-flex justify-content-around border-bottom mb-4 mx-2">
                                    {["Agent Nomination", "Free Hand", "Sub Agent"].map((tab) => (
                                        <div
                                            key={tab}
                                            onClick={() => setActiveTab3(tab)}
                                            className="pb-2 fw-bold"
                                            style={{ cursor: "pointer", color: activeTab3 === tab ? "#50a9e9" : "#a1acb8", borderBottom: activeTab3 === tab ? "3px solid #50a9e9" : "3px solid transparent", width: "33%", textAlign: "center", fontSize: "13px" }}>
                                            {tab}
                                        </div>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-end mb-2">
                                    <div style={{ backgroundColor: "#50a9e9", color: "white", padding: "6px", borderRadius: "4px" }}>
                                        <i className="bx bx-table sm"></i>
                                    </div>
                                </div>
                                <div className="border border-light-subtle rounded" style={{ height: "80px" }}></div>
                            </div>
                        )}
                    </BracketCard>
                </div>
            </div>

            {/* ───── SUB TABLES GRID ───── */}


        </div>
    );
};

export default VariationReport;


