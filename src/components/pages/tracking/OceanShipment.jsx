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

const OceanShipment = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const tableRef3 = useRef(null);
    const dtRef1 = useRef(null);
    const dtRef2 = useRef(null);
    const dtRef3 = useRef(null);

    // Filter state
    const [filters, setFilters] = useState({
        cargoType: "FCL",
        status: "ALL",
        department: "",
        dateFilter: "Last 7 Days",
        dateFrom: "2026-02-22",
        dateTo: "2026-03-23",
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!tableRef1.current) return;
        if (dtRef1.current) return;

        // Reset defaults to prevent conflicts
        $.fn.dataTable.ext.errMode = "none";
        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef1.current = $(tableRef1.current).DataTable({
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
                        { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
                        { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
                        { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
                        { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
                    ],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    columns: ":not(.no-export)",
                    dropIcon: false,
                },
            ],
            data: [],
            columns: [
                { data: "containerNo", defaultContent: "" },
                { data: "poNo", defaultContent: "" },
                { data: "status", defaultContent: "" },
                { data: "co2Emission", defaultContent: "" },
                { data: "cargoType", defaultContent: "" },
                { data: "shippingLine", defaultContent: "" },
                { data: "hblNo", defaultContent: "" },
                { data: "mblNo", defaultContent: "" },
            ],
        });

        dtRef2.current = $(tableRef2.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3 pt-3'<'col-md-12 d-flex justify-content-end'f>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: false,
            scrollX: true,
            scrollY: "300px",
            scrollCollapse: true,
            language: {
                emptyTable: "No data available in table",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                search: "Search:",
            },
            data: [],
            columns: [
                { data: "shipmentNo", defaultContent: "" },
                { data: "containerNo", defaultContent: "" },
                { data: "cargoType", defaultContent: "" },
                { data: "shippingLine", defaultContent: "" },
                { data: "hblNo", defaultContent: "" },
                { data: "mblNo", defaultContent: "" },
                { data: "consolNo", defaultContent: "" },
                { data: "shipper", defaultContent: "" },
                { data: "consignee", defaultContent: "" },
                { data: "loadingPort", defaultContent: "" },
                { data: "dischargePort", defaultContent: "" },
                { data: "statusTracking", defaultContent: "" },
            ],
            pagingType: "simple",
        });

        dtRef3.current = $(tableRef3.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3 pt-3'<'col-md-12 d-flex justify-content-end'f>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: false,
            scrollX: true,
            scrollY: "300px",
            scrollCollapse: true,
            language: {
                emptyTable: "No data available in table",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                search: "Search:",
            },
            data: [],
            columns: [
                { data: "shipmentNo", defaultContent: "" },
                { data: "containerNo", defaultContent: "" },
                { data: "cargoType", defaultContent: "" },
                { data: "shippingLine", defaultContent: "" },
                { data: "hblNo", defaultContent: "" },
                { data: "mblNo", defaultContent: "" },
                { data: "consolNo", defaultContent: "" },
                { data: "shipper", defaultContent: "" },
                { data: "consignee", defaultContent: "" },
                { data: "loadingPort", defaultContent: "" },
                { data: "dischargePort", defaultContent: "" },
                { data: "statusTracking", defaultContent: "" },
            ],
            pagingType: "simple",
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        return () => {
            if (dtRef1.current) {
                dtRef1.current.destroy();
                dtRef1.current = null;
            }
            if (dtRef2.current) {
                dtRef2.current.destroy();
                dtRef2.current = null;
            }
            if (dtRef3.current) {
                dtRef3.current.destroy();
                dtRef3.current = null;
            }
        };
    }, []);

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">


            {/* Title / Breadcrumb Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <h4 className="table-title">Ocean Shipments</h4>
            </div>

            {/* CARD 1: Tracking Shipments */}
            <div className="ocean-card">
                <div className="ocean-title pb-3 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-map-pin"></i></div> Tracking Shipments
                    </span>
                </div>

                <div className="row g-3 px-4 pb-4">
                    <div className="col">
                        <div className="filter-label">CargoType :</div>
                        <select className="filter-input" name="cargoType" value={filters.cargoType} onChange={handleFilterChange}>
                            <option value="FCL">FCL</option>
                            <option value="LCL">LCL</option>
                        </select>
                    </div>
                    <div className="col">
                        <div className="filter-label">Status :</div>
                        <select className="filter-input" name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="ALL">ALL</option>
                            <option value="IN_TRANSIT">In Transit</option>
                        </select>
                    </div>
                    <div className="col">
                        <div className="filter-label">Department :</div>
                        <select className="filter-input" name="department" value={filters.department} onChange={handleFilterChange}>
                            <option value=""></option>
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
                    <table ref={tableRef1} className="table dataTable dtr-inline w-100">
                        <thead>
                            <tr>
                                <th>Container No.</th>
                                <th>PO No.</th>
                                <th>Status</th>
                                <th>CO2 Emission</th>
                                <th>CargoType</th>
                                <th>ShippingLine</th>
                                <th>HBL NO.</th>
                                <th>MBL NO.</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            {/* CARD 2 & 3: Non-Tracking Shipments */}
            <div className="row g-4 mt-1">
                <div className="col-md-6">
                    <div className="ocean-card h-100 mb-0">
                        <div className="ocean-title pb-1 m-0">
                            <span className="bk-section-title">
                                <div className="bk-icon-circle"><i className="bx bx-box"></i></div> Non-Tracking Shipments with containerNo
                            </span>
                        </div>
                        <div className="card-datatable pb-1">
                            <table ref={tableRef2} className="table dataTable dtr-inline w-100 border-top" style={{ minWidth: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Shipment No.</th>
                                        <th>Container No.</th>
                                        <th>CargoType</th>
                                        <th>Shipping Line</th>
                                        <th>HBL No.</th>
                                        <th>MBL No.</th>
                                        <th>Consol No.</th>
                                        <th>Shipper</th>
                                        <th>Consignee</th>
                                        <th>Loading Port</th>
                                        <th>Discharge Port</th>
                                        <th>Status Tracking</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="ocean-card h-100 mb-0">
                        <div className="ocean-title pb-1 m-0">
                            <span className="bk-section-title">
                                <div className="bk-icon-circle"><i className="bx bx-package"></i></div> Non-Tracking Shipments without containerNo
                            </span>
                        </div>
                        <div className="card-datatable pb-1">
                            <table ref={tableRef3} className="table dataTable dtr-inline w-100 border-top" style={{ minWidth: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Shipment No.</th>
                                        <th>Container No.</th>
                                        <th>CargoType</th>
                                        <th>Shipping Line</th>
                                        <th>HBL No.</th>
                                        <th>MBL No.</th>
                                        <th>Consol No.</th>
                                        <th>Shipper</th>
                                        <th>Consignee</th>
                                        <th>Loading Port</th>
                                        <th>Discharge Port</th>
                                        <th>Status Tracking</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default OceanShipment;
