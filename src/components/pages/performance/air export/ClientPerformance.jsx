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

// ───── SalesTable Component ─────
const SalesTable = ({ title, activeMainTab }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const [viewMode, setViewMode] = useState("table"); // 'table', 'chart', 'summary'
    const [activeSubTab, setActiveSubTab] = useState("Agent Nomination");

    useEffect(() => {
        if (activeMainTab === "CCL" || viewMode === "summary" || viewMode === "chart") return;
        if (!tableRef.current) return;
        if (dtRef.current) {
            dtRef.current.destroy();
            dtRef.current = null;
        }

        $.fn.dataTable.ext.errMode = "none";
        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-4 pt-3 mb-2'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-4 pb-4 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: false,
            scrollX: true,
            scrollCollapse: true,
            language: {
                lengthMenu: "Show _MENU_ Entries",
                emptyTable: "No data available in table",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                search: "Search:",
                searchPlaceholder: "Search...",
            },
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: '<i class="bx bx-printer"></i> Print', className: "dropdown-item", exportOptions: { columns: ":visible" } },
                        { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', className: "dropdown-item", exportOptions: { columns: ":visible" } },
                        { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', className: "dropdown-item", exportOptions: { columns: ":visible" } },
                        { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', className: "dropdown-item", exportOptions: { columns: ":visible" } },
                    ],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis ms-2",
                    dropIcon: false,
                    columns: ":visible",
                },
            ],
            data: [],
            columns: [
                { data: "clientname", title: "Client's Name", defaultContent: "" },
                { data: "noOfShipments", title: "Number Of Shipments", defaultContent: "" },
                { data: "noofvolume", title: "Number of Volume", defaultContent: "" },
            ],
            pagingType: "simple",
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [viewMode, activeSubTab, activeMainTab]);

    // CCL MODE VIEW
    if (activeMainTab === "CCL") {
        return (
            <BracketCard className="p-4" style={{ minHeight: "150px" }}>
                <div className="d-flex justify-content-between align-items-center mb-0 pe-3">
                    <h6 className="fw-bold m-0 text-heading text-uppercase">{title}</h6>
                    <button className="export-btn shadow-none h-100 px-4" style={{ height: "35px", fontSize: '11px' }}>
                        <i className="bx bx-spreadsheet me-1 fs-6"></i> Download Excel
                    </button>
                </div>
            </BracketCard>
        );
    }

    // FORWARDING MODE VIEW
    return (
        <BracketCard className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-0 pe-3">
                <h6 className="fw-bold m-0 text-heading text-uppercase">{title}</h6>
                <div className="d-flex gap-2">
                    <div
                        onClick={() => setViewMode("summary")}
                        className={`view-toggle-btn ${viewMode === "summary" ? "active" : "inactive"}`}>
                        <i className="bx bx-x fs-5"></i>
                    </div>
                    <div
                        onClick={() => setViewMode("table")}
                        className={`view-toggle-btn ${viewMode === "table" ? "active" : "inactive"}`}>
                        <i className="bx bx-table fs-5"></i>
                    </div>
                    <div
                        onClick={() => setViewMode("chart")}
                        className={`view-toggle-btn ${viewMode === "chart" ? "active" : "inactive"}`}>
                        <i className="bx bx-bar-chart-alt-2 fs-5"></i>
                    </div>
                </div>
            </div>

            {/* Operations Bar - Hidden in Chart mode */}
            {viewMode !== "chart" && (
                <div className="d-flex justify-content-end mb-3 gap-2 align-items-center pe-3 h-auto" style={{ minHeight: '40px' }}>
                    {/* If summary mode (X), show only Excel Download without arrows */}
                    {viewMode === "summary" ? (
                        <button className="export-btn shadow-none h-100" style={{ height: "32px", width: '150px' }}>
                            <i className="bx bx-spreadsheet me-1"></i> Download Excel
                        </button>
                    ) : (
                        <>
                            <select className="header-filter-input py-1 px-2" style={{ width: "60px", height: "32px" }}>
                                <option value=""></option>
                            </select>
                            <button className="export-btn py-1 px-2 h-100 d-flex align-items-center" style={{ height: "32px", fontSize: '11.5px', fontWeight: '600' }}>
                                <i className="bx bx-spreadsheet me-1"></i> Download Excel
                            </button>
                            <select className="header-filter-input py-1 px-2" style={{ width: "60px", height: "32px" }}>
                                <option value=""></option>
                            </select>
                            <select className="header-filter-input py-1 px-2" style={{ width: "60px", height: "32px" }}>
                                <option value=""></option>
                            </select>
                            <select className="header-filter-input py-1 px-2" style={{ width: "60px", height: "32px" }}>
                                <option value=""></option>
                            </select>
                        </>
                    )}
                </div>
            )}

            {/* Table View */}
            <div style={{ display: viewMode === "table" ? "block" : "none" }} className="card-datatable pb-1">
                <table ref={tableRef} className="table dataTable dtr-inline w-100">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>

            {/* Chart View */}
            <div style={{ display: viewMode === "chart" ? "block" : "none" }}>
                <div className="d-flex justify-content-around border-bottom mb-4 mx-2">
                    {["Agent Nomination", "Free Hand", "Sub Agent"].map((tab) => (
                        <div
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            className="pb-2 fw-bold"
                            style={{ cursor: "pointer", color: activeSubTab === tab ? "#50a9e9" : "#a1acb8", borderBottom: activeSubTab === tab ? "3px solid #50a9e9" : "3px solid transparent", width: "33%", textAlign: "center", fontSize: "14px" }}>
                            {tab}
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-end mb-2 pe-2">
                    <div className="view-toggle-btn active" style={{ width: '40px' }}>
                        <i className="bx bx-table sm"></i>
                    </div>
                </div>
                <div className="border border-light-subtle rounded d-flex align-items-center justify-content-center" style={{ height: "150px" }}>
                    <p className="text-muted small">No visualization available</p>
                </div>
            </div>

            {/* Summary (X) View status area - removed dotted line */}
            {viewMode === "summary" && <div className="mt-2 text-center text-muted small">Excel Summary View Enabled</div>}
        </BracketCard>
    );
};

// ───── Main Component ─────
const ClientPerformance = () => {
    const [activeMainTab, setActiveMainTab] = useState("Forwarding");

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            {/* ───── HEADER ───── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="perf-header-title text-uppercase">
                    <span className="text-muted pe-1">DASHBOARD</span> <span className="perf-air-export">CLIENT PERFORMANCE</span>
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

            <BracketCard className="mb-4 d-flex" style={{ height: "55px", padding: 0, overflow: 'hidden' }}>
                <div
                    onClick={() => setActiveMainTab("Forwarding")}
                    className="d-flex align-items-center justify-content-center flex-grow-1 h-100 fw-bold text-uppercase"
                    style={{
                        cursor: "pointer",
                        borderRight: "1px solid #ddd",
                        color: activeMainTab === "Forwarding" ? "#2E8B57" : "#000",
                        backgroundColor: activeMainTab === "Forwarding" ? "#f9f9f9" : "transparent",
                        fontSize: "14px"
                    }}>
                    Forwarding
                </div>
                <div
                    onClick={() => setActiveMainTab("CCL")}
                    className="d-flex align-items-center justify-content-center flex-grow-1 h-100 fw-bold text-uppercase"
                    style={{
                        cursor: "pointer",
                        color: activeMainTab === "CCL" ? "#2E8B57" : "#000",
                        backgroundColor: activeMainTab === "CCL" ? "#f9f9f9" : "transparent",
                        fontSize: "14px"
                    }}>
                    CCL
                </div>
            </BracketCard>

            <div className="mt-4">
                <SalesTable title="Client Performance" activeMainTab={activeMainTab} />
            </div>

        </div>
    );
};

export default ClientPerformance;
