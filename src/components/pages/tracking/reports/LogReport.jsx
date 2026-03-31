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

/* ───── Dummy Data ───── */
const agentLogData = [
    {
        id: "1", company: "Global Logistics", email: "admin@global.com",
        login: "2026-03-24 09:00", logout: "2026-03-24 17:00", ipAddress: "192.168.1.1",
        countryName: "United Arab Emirates", countryCode: "AE", cityName: "Dubai", regionName: "Dubai"
    },
    {
        id: "2", company: "Prime Freight", email: "user1@prime.com",
        login: "2026-03-24 10:15", logout: "-", ipAddress: "192.168.1.42",
        countryName: "United Kingdom", countryCode: "GB", cityName: "London", regionName: "England"
    }
];

const AgentWiseLogReport = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    // Filter state
    const [filters, setFilters] = useState({
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
            data: agentLogData,
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
                { data: "company", title: "Company" },
                { data: "email", title: "Email" },
                { data: "login", title: "Login" },
                { data: "logout", title: "Logout" },
                { data: "ipAddress", title: "IP Address" },
                { data: "countryName", title: "Country Name" },
                { data: "countryCode", title: "Country Code" },
                { data: "cityName", title: "City Name" },
                { data: "regionName", title: "Region Name" }
            ]
        });

        // Remove default bootstrap classes from buttons to match CO2 Reports style
        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
            $(".dt-buttons").removeClass("btn-group");
        }, 0);

        return () => {
            if (dtRef.current) dtRef.current.destroy();
        };
    }, []);

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <style>{`
                .ocean-card {
                   background: #fff;
                   border-radius: 8px;
                   box-shadow: 0 0.125rem 0.25rem rgba(161, 172, 184, 0.4);
                   transition: transform 0.3s ease, box-shadow 0.3s ease;
                   margin-bottom: 20px;
                }
                .filter-label {
                   font-size: 13px;
                   color: #566a7f;
                   font-weight: 600;
                   margin-bottom: 5px;
                }
                .filter-input {
                   font-size: 14px;
                   border: 1px solid #d9dee3;
                   border-radius: 0.375rem;
                   padding: 0.4375rem 0.875rem;
                   color: #697a8d;
                   background-color: #fff;
                   width: 100%;
                }
                .filter-input:focus {
                   border-color: #50A9E9;
                   outline: none;
                }
                .ocean-title {
                   color: #566a7f;
                   font-size: 1.125rem;
                   font-weight: 600;
                   padding: 1.25rem;
                   margin-bottom: 0;
                   display: flex;
                   align-items: center;
                }
                .date-range-container {
                   display: flex;
                   align-items: center;
                   gap: 10px;
                }
                .dataTables_wrapper .dataTables_paginate .paginate_button {
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                    background: transparent !important;
                }
                .dataTables_info {
                    font-size: 13px;
                    color: #697a8d;
                }
                .dt-buttons {
                    display: flex;
                    gap: 8px;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                <h4 className="table-title" style={{ color: "#566a7f" }}>Reports</h4>
            </div>

            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-map-pin"></i></div> Log Report
                    </span>
                </div>

                {/* Filters Row - Single Line (flex-nowrap prevents wrapping) */}
                <div className="d-flex gx-3 px-4 pb-4 align-items-end flex-nowrap" style={{ gap: "12px", overflowX: "auto" }}>
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

export default AgentWiseLogReport;
