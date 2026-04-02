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

/* ───── Dummy Data ───── */
const trackingData = [
    { 
        id: "1", shipmentNo: "AIR-77201", shipmentDate: "2026-03-20", awbNo: "123-45678901", poNo: "PO-992", 
        flightDetails: "EK506 / EK202", etd: "2026-03-21 10:00", eta: "2026-03-22 18:00", atd: "2026-03-21 10:15", ata: "-", 
        status: "In Transit", co2: "1.2 Tons", airline: "Emirates", shipper: "Global Exports", consignee: "Tech Solutions", 
        pol: "DXB", pod: "LHR", lastUpdated: "2026-03-21 12:00", incoTerms: "CIF" 
    },
    { 
        id: "2", shipmentNo: "AIR-77202", shipmentDate: "2026-03-19", awbNo: "987-65432109", poNo: "PO-993", 
        flightDetails: "QR101", etd: "2026-03-20 08:00", eta: "2026-03-21 14:00", atd: "2026-03-20 08:30", ata: "2026-03-21 14:15", 
        status: "Completed", co2: "0.8 Tons", airline: "Qatar Airways", shipper: "Express Goods", consignee: "Prime Retail", 
        pol: "DOH", pod: "JFK", lastUpdated: "2026-03-21 15:00", incoTerms: "FOB" 
    }
];

const nonTrackingData = [
    { 
        id: "1", shipmentNo: "AIR-88201", shipmentDate: "2026-03-22", awbNo: "111-22233344", hawbNo: "H-556", 
        airline: "Lufthansa", bookingThru: "Agent X", shipper: "Atlas Corp", consignee: "NextGen Ltd", 
        pol: "FRA", pod: "SIN", dateOfExecution: "2026-03-21", customer: "NextGen Ltd", status: "Pending", tracking: "No" 
    }
];

const AirShipment = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dtRef1 = useRef(null);
    const dtRef2 = useRef(null);

    // Filter state
    const [filters, setFilters] = useState({
        status: "ALL",
        department: "",
        dateFilter: "Last 7 Days",
        dateFrom: "2026-03-16",
        dateTo: "2026-03-23",
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!tableRef1.current) return;

        // Tracking Table Init
        dtRef1.current = $(tableRef1.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                 "<'row px-3'<'col-sm-12'tr>>" +
                 "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: false,
            scrollX: true,
            scrollY: "350px",
            scrollCollapse: true,
            data: trackingData,
            language: {
                lengthMenu: "Show _MENU_ entries",
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
                    ]
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                }
            ],
            columns: [
                { data: "shipmentNo", title: "Shipment No./HAWB No." },
                { data: "shipmentDate", title: "Shipment Date" },
                { data: "awbNo", title: "AWB No." },
                { data: "poNo", title: "PO No." },
                { data: "flightDetails", title: "Flight Details" },
                { data: "etd", title: "ETD" },
                { data: "eta", title: "ETA" },
                { data: "atd", title: "ATD" },
                { data: "ata", title: "ATA" },
                { 
                    data: "status", 
                    render: (data) => {
                        let badgeClass = "bg-label-primary";
                        if (data === "Completed") badgeClass = "bg-label-success";
                        if (data === "In Transit") badgeClass = "bg-label-info";
                        return `<span class="badge ${badgeClass}">${data}</span>`;
                    }
                },
                { data: "co2", title: "CO2 Emission" },
                { data: "airline", title: "Airline" },
                { data: "shipper", title: "Shipper" },
                { data: "consignee", title: "Consignee" },
                { data: "pol", title: "Loading Port" },
                { data: "pod", title: "Discharge Port" },
                { data: "lastUpdated", title: "Last Updated Date" },
                { data: "incoTerms", title: "IncoTerms" }
            ]
        });

        // Non-Tracking Table Init
        dtRef2.current = $(tableRef2.current).DataTable({
            dom: "<'row align-items-center px-3 mb-2'<'col-md-12 d-flex justify-content-end'f>>" +
                 "<'row px-3'<'col-sm-12'tr>>" +
                 "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: false,
            scrollX: true,
            scrollY: "350px",
            scrollCollapse: true,
            data: nonTrackingData,
            language: {
                search: "Search:",
            },
            pagingType: "simple",
            columns: [
                { data: "shipmentNo", title: "Shipment No." },
                { data: "shipmentDate", title: "Shipment Date" },
                { data: "awbNo", title: "AWB No." },
                { data: "hawbNo", title: "HAWB No." },
                { data: "airline", title: "Airline" },
                { data: "bookingThru", title: "Booking Thru" },
                { data: "shipper", title: "Shipper" },
                { data: "consignee", title: "Consignee" },
                { data: "pol", title: "Loading Port" },
                { data: "pod", title: "Discharge Port" },
                { data: "dateOfExecution", title: "Date Of Execution" },
                { data: "customer", title: "Customer" },
                { data: "status", title: "Status" },
                { data: "tracking", title: "Tracking" }
            ]
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        return () => {
            if (dtRef1.current) dtRef1.current.destroy();
            if (dtRef2.current) dtRef2.current.destroy();
        };
    }, []);

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">

            <div className="d-flex justify-content-between align-items-start mb-4">
                <h4 className="table-title">Air Shipments</h4>
            </div>

            {/* Tracking Shipments Card */}
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-map-pin"></i></div> Tracking Shipments
                    </span>
                </div>

                {/* Filters in ONE SINGLE LINE */}
                <div className="row g-3 px-4 pb-4 align-items-end">
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
                            <option value="">--Select--</option>
                        </select>
                    </div>
                    <div className="col">
                        <div className="filter-label">Date Filter :</div>
                        <select className="filter-input" name="dateFilter" value={filters.dateFilter} onChange={handleFilterChange}>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="col-md-5">
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
                        {/* Headers are generated by DataTables title property */}
                    </table>
                </div>
            </div>

            {/* Non-Tracking Shipments Card */}
            <div className="ocean-card mt-4">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-box"></i></div> Non-Tracking Shipments
                    </span>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef2} className="table dataTable dtr-inline w-100 border-top">
                        {/* Headers are generated by DataTables title property */}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AirShipment;
