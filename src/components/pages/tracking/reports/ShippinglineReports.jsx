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
import "../../../css/tracking.css";

/* ───── Dummy Data ───── */
const shippingLineData = [
    { 
        id: "1", shippingLine: "Maersk Line", branch: "New York", 
        shipmentCount: "120", sumVolumes: "450.5", sumTeus: "25" 
    },
    { 
        id: "2", shippingLine: "MSC", branch: "Los Angeles", 
        shipmentCount: "95", sumVolumes: "320.0", sumTeus: "18" 
    }
];

const ShippinglineReports = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    // Filter state
    const [filters, setFilters] = useState({
        carrier: "",
        department: "Ocean Export",
        dateFilter: "Last 7 Days",
        dateFrom: "2026-03-18",
        dateTo: "2026-03-24",
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!tableRef.current) return;

        dtRef.current = $(tableRef.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                 "<'row px-3'<'col-sm-12'tr>>" +
                 "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: false,
            scrollX: true,
            scrollY: "400px",
            scrollCollapse: true,
            data: shippingLineData,
            language: {
                lengthMenu: "Show _MENU_ entries",
                search: "Search:",
                emptyTable: "No data available in table",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
            },
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn rounded-3",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible" } },
                        { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible" } },
                        { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible" } },
                        { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible" } },
                    ]
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis rounded-3",
                    dropIcon: false,
                }
            ],
            columns: [
                { data: "shippingLine", title: "Shipping Line" },
                { data: "branch", title: "Branch" },
                { data: "shipmentCount", title: "Shipment Count" },
                { data: "sumVolumes", title: "Sum of Volumes" },
                { data: "sumTeus", title: "Sum of TEUs" }
            ]
        });

        // Remove default bootstrap classes from buttons to match CO2 Reports style perfectly
        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
            $(".dt-buttons").removeClass("btn-group"); // Removes grouping that forces square edges
        }, 0);

        return () => {
            if (dtRef.current) dtRef.current.destroy();
        };
    }, []);

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">

            <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                <h4 className="table-title" style={{ color: "#566a7f" }}>Reports</h4>
            </div>

            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-map-pin"></i></div> Shippingline Report
                    </span>
                </div>

                {/* Filters Row - Single Line (flex-nowrap prevents wrapping, ensuring it stays one row) */}
                <div className="d-flex gx-3 px-4 pb-4 align-items-end flex-nowrap" style={{ gap: "12px", overflowX: "auto" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <div className="filter-label">Select Carrier :</div>
                        <select className="filter-input" name="carrier" value={filters.carrier} onChange={handleFilterChange}>
                            <option value="">All Carriers</option>
                            <option value="Maersk Line">Maersk Line</option>
                            <option value="MSC">MSC</option>
                        </select>
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                        <div className="filter-label">Department :</div>
                        <select className="filter-input" name="department" value={filters.department} onChange={handleFilterChange}>
                            <option value="Ocean Export">Ocean Export</option>
                            <option value="Ocean Import">Ocean Import</option>
                            <option value="Air Export">Air Export</option>
                            <option value="Air Import">Air Import</option>
                        </select>
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                        <div className="filter-label">Date Filter :</div>
                        <select className="filter-input" name="dateFilter" value={filters.dateFilter} onChange={handleFilterChange}>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                            <option value="Custom">Custom Range</option>
                        </select>
                    </div>
                    <div style={{ flex: "2 1 400px" }}>
                        <div className="filter-label">Date Range :</div>
                        <div className="date-range-container">
                            <input type="date" className="filter-input w-100" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
                            <span className="text-muted">To</span>
                            <input type="date" className="filter-input w-100" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
                        </div>
                    </div>
                </div>

                <div className="card-datatable pb-1">
                    <table ref={tableRef} className="table dataTable dtr-inline w-100">
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShippinglineReports;
