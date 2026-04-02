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
import "../../css/tracking.css";

const DocumentUpload = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    // Filter state
    const [filters, setFilters] = useState({
        department: "",
        clientName: "",
        dateFilter: "Last 7 Days",
        dateFrom: "2026-03-17",
        dateTo: "2026-03-23",
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!tableRef.current) return;
        if (dtRef.current) return;

        // Reset defaults
        $.fn.dataTable.ext.errMode = "none";
        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn rounded";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: false,
            scrollX: true,
            language: {
                lengthMenu: "Show _MENU_ entries",
                emptyTable: "No data available in table",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                search: "Search:",
            },
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible" } },
                        { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible" } },
                        { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible" } },
                        { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible" } },
                    ],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                },
            ],
            data: [],
            columns: [
                { data: "shipmentNo", title: "Shipment No." },
                { data: "containerNo", title: "Container No." },
                { data: "poNo", title: "PO No." },
                { data: "shipmentDate", title: "Shipment Date" },
                {
                    data: "status",
                    title: "Status",
                    render: (data) => data ? `<span class="badge bg-label-success">${data}</span>` : ""
                },
                { data: "co2Emission", title: "CO2 Emission" },
                { data: "cargoType", title: "Cargo Type" },
                { data: "shippingLine", title: "Shipping Line" },
                { data: "hblNo", title: "HBL No." },
                { data: "mblNo", title: "MBL No." },
                { data: "consolNo", title: "Consol No." },
                { data: "shipper", title: "Shipper" },
                { data: "consignee", title: "Consignee" },
                { data: "loadingPort", title: "Loading Port" },
                { data: "dischargePort", title: "Discharge Port" },
                { data: "lastUpdatedDate", title: "Last Updated Date" },
                { data: "incoterm", title: "Incoterm" },
            ],
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
    }, []);

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">



            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-upload"></i></div> Document Upload
                    </span>
                </div>

                <div className="row g-3 px-4 pb-4 align-items-end">
                    <div className="col">
                        <div className="filter-label">Department :</div>
                        <select className="filter-input" name="department" value={filters.department} onChange={handleFilterChange}>
                            <option value="">Select Department Name</option>
                            <option value="Ocean Import">Ocean Import</option>
                            <option value="Ocean Export">Ocean Export</option>
                            <option value="Air Import">Air Import</option>
                            <option value="Air Export">Air Export</option>
                        </select>
                    </div>
                    <div className="col">
                        <div className="filter-label">Client Name :</div>
                        <select className="filter-input" name="clientName" value={filters.clientName} onChange={handleFilterChange}>
                            <option value="">Select Company Name</option>
                            <option value="ABC Logistics">ABC Logistics</option>
                            <option value="Global Freight Ltd">Global Freight Ltd</option>
                            <option value="Skyline Shipping">Skyline Shipping</option>
                            <option value="Oceanic Traders">Oceanic Traders</option>
                            <option value="Prime Cargo Solutions">Prime Cargo Solutions</option>
                        </select>
                    </div>
                    <div className="col">
                        <div className="filter-label">Date Filter :</div>
                        <select className="filter-input" name="dateFilter" value={filters.dateFilter} onChange={handleFilterChange}>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <div className="filter-label">Date Range :</div>
                        <div className="date-range-container d-flex align-items-center" style={{ gap: '8px' }}>
                            <input type="date" className="filter-input w-100" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
                            <span className="text-muted" style={{ fontSize: '13px' }}>To</span>
                            <input type="date" className="filter-input w-100" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
                        </div>
                    </div>
                </div>

                <div className="card-datatable pb-1">
                    <table ref={tableRef} className="table dataTable dtr-inline w-100">
                        <thead>
                            {/* Handled by DataTables columns title prop but explicitly defined for safety */}
                            <tr>
                                <th>Shipment No.</th>
                                <th>Container No.</th>
                                <th>PO No.</th>
                                <th>Shipment Date</th>
                                <th>Status</th>
                                <th>CO2 Emission</th>
                                <th>CargoType</th>
                                <th>ShippingLine</th>
                                <th>HBL NO.</th>
                                <th>MBL NO.</th>
                                <th>Consol No.</th>
                                <th>Shipper</th>
                                <th>Consignee</th>
                                <th>Loading Port</th>
                                <th>Discharge Port</th>
                                <th>Last Updated Date</th>
                                <th>Incoterm</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
