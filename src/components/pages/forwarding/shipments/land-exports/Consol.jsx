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

import "../../../../../App.css";

/* ───── dummy data ───── */
const dummyConsols = [
    {
        _id: "1",
        consolNo: "LEC-002",
        consolDate: "2026-03-25",
        consolType: "FCL",
        cargoType: "General",
        origin: "Dubai",
        destination: "London",
        transporter: "Swift Transpo",
        vehicleNo: "V-101",
    },
];

const LandExportConsol = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const openedRowRef = useRef(null);

    // views: "table" | "form"
    const [view, setView] = useState(initialView);

    // dummy data for DataTable
    const [consols, setConsols] = useState(dummyConsols);

    // details modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // collapsible sections
    const [openSections, setOpenSections] = useState({
        basicInfo: true,
        handlerDetails: true,
        shippingDetails: true,
        pickUp: true,
        routingDetails: true,
        attachedHouse: true,
        chargeSheet: true
    });

    const [routeRows, setRouteRows] = useState([{ id: Date.now() }]);

    const [revenueEntries, setRevenueEntries] = useState([]);
    const [costEntries, setCostEntries] = useState([]);

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
        if (dtRef.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "t" +
                "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",
            scrollY: "400px",
            scrollCollapse: true,
            paging: true,
            language: { lengthMenu: "Show _MENU_ Entries" },
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
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
            responsive: true,
            data: consols,
            columns: [
                { data: "consolNo", title: "Consol No", responsivePriority: 1 },
                { data: "consolDate", title: "Consol Date", responsivePriority: 2 },
                { data: "consolType", title: "Consol Type", responsivePriority: 3 },
                { data: "cargoType", title: "Cargo Type", responsivePriority: 4 },
                { data: "origin", title: "Origin", responsivePriority: 5 },
                { data: "destination", title: "Destination", responsivePriority: 6 },
                { data: "transporter", title: "Transporter / Carrier", responsivePriority: 7 },
                { data: "vehicleNo", title: "Vehicle / Rail No", responsivePriority: 8 },
                {
                    data: null,
                    className: "no-export text-center",
                    title: "Edit",
                    responsivePriority: 1,
                    orderable: false,
                    render: (data) =>
                        `<div class="d-flex align-items-center justify-content-center gap-2">
               <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" title="Edit" style="font-size: 18px;"></i>
             </div>`,
                },
                {
                    data: null,
                    className: "no-export text-center",
                    title: "Delete",
                    responsivePriority: 1,
                    orderable: false,
                    render: (data) =>
                        `<div class="d-flex align-items-center justify-content-center gap-2">
                 <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Delete" style="font-size: 18px;"></i>
               </div>`,
                },
            ],
        });

        // details modal on expand
        dtRef.current.on("responsive-display", function (e, datatable, row, showHide) {
            if (showHide) {
                openedRowRef.current = row;
                setSelectedRow(row.data());
                setShowDetailsModal(true);
            }
        });

        // edit click handler
        $(tableRef.current).on("click", ".edit-icon", function () {
            setView("form");
        });

        // delete click handler
        $(tableRef.current).on("click", ".delete-icon", function () {
            const id = $(this).data("id");
            setDeleteId(id);
            setShowDeleteModal(true);
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy(true);
                dtRef.current = null;
            }
        };
    }, [view, consols]);

    /* ───── Handlers ───── */
    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    /* ════════════════════════════════════════════════════
       RENDER — TABLE VIEW
    ════════════════════════════════════════════════════ */
    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y pb-5">
                <div className="card">
                    <div className="datatable-toolbar d-flex justify-content-between align-items-middle p-3">
                        <h5 className="table-title mb-0">LE Consols</h5>
                        <button className="btn-primary-custom" onClick={() => setView("form")}>
                            <i className="bx bx-plus"></i> Create Consol
                        </button>
                    </div>

                    <div className="card-datatable p-3">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100">
                            <thead>
                                <tr>
                                    <th>Consol No</th>
                                    <th>Consol Date</th>
                                    <th>Consol Type</th>
                                    <th>Cargo Type</th>
                                    <th>Origin</th>
                                    <th>Destination</th>
                                    <th>Transporter / Carrier</th>
                                    <th>Vehicle / Rail No</th>
                                    <th className="no-export text-center">Edit</th>
                                    <th className="no-export text-center">Delete</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* Details Modal */}
                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                        <div className="custom-modal-card">
                            <button
                                className="custom-close"
                                onClick={() => {
                                    if (openedRowRef.current) {
                                        const node = $(openedRowRef.current.node());
                                        node.find("td.dtr-control").trigger("click");
                                    }
                                    setShowDetailsModal(false);
                                }}
                            >×</button>
                            <h5 className="modal-title">Consol Details</h5>
                            <hr className="modal-divider" />
                            <div className="modal-body p-0">
                                <table className="table table-sm">
                                    <tbody>
                                        {Object.entries(selectedRow).map(([k, v]) => (
                                            <tr key={k}><td><strong>{k}:</strong></td><td>{String(v)}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                        <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                            <div className="text-center p-4">
                                <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                                <h4 className="mb-2">Are you sure?</h4>
                                <p className="text-muted mb-4">You want to delete this consol? This action cannot be undone.</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        className="btn btn-secondary-custom"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setConsols(prev => prev.filter(s => s._id !== deleteId));
                                            setShowDeleteModal(false);
                                        }}
                                    >
                                        Yes, Delete it!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* ════════════════════════════════════════════════════
       RENDER — FORM VIEW
    ════════════════════════════════════════════════════ */
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0" style={{ fontWeight: "700", color: "#566a7f" }}>Land Export Consol Details</h5>
                <button className="btn-secondary-custom" onClick={() => setView("table")}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            {/* 1. BASIC INFORMATION */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("basicInfo")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Basic Information
                    </span>
                    <i className={`bx ${openSections.basicInfo ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.basicInfo && (
                    <div className="qt-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3">
                                <label className="qt-label">Consol No</label>
                                <input className="form-field qt-input" placeholder="LEC-002" defaultValue="LEC-002" />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Consol Date</label>
                                <input type="date" className="form-field qt-input" />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Consol Type</label>
                                <select className="form-field qt-input"><option>Select Consol Type</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Cargo Type</label>
                                <select className="form-field qt-input"><option>Select Cargo Type</option></select>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="qt-label">Consol Owner</label>
                                <select className="form-field qt-input"><option>Select Consol Owner</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Consol Status</label>
                                <input className="form-field qt-input" readOnly />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. HANDLER DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("handlerDetails")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details
                    </span>
                    <i className={`bx ${openSections.handlerDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.handlerDetails && (
                    <div className="qt-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Origin Agent <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Destination Agent <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Master Shipper</label><select className="form-field qt-input"><option>Select Master Shipper</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Master Consignee</label><select className="form-field qt-input"><option>Select Master Consignee</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Notify</label><select className="form-field qt-input"><option>Select</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Selling Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Ship To</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Ship To" /></div></div>
                            <div className="col-md-3"><label className="qt-label">Importer</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Importer" /></div></div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3"><label className="qt-label">Booking Party</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Book" /></div></div>
                            <div className="col-md-3"><label className="qt-label">Seller</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Sell" /></div></div>
                            <div className="col-md-3"><label className="qt-label">Buyer</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Buy" /></div></div>
                            <div className="col-md-3"><label className="qt-label">Transporter</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Tran" /></div></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. SHIPPING DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("shippingDetails")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Shipping Details
                    </span>
                    <i className={`bx ${openSections.shippingDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.shippingDetails && (
                    <div className="qt-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Chasis No.</label><input className="form-field qt-input" placeholder="Enter Chasis No" /></div>
                            <div className="col-md-3"><label className="qt-label">Execution Place</label><input className="form-field qt-input" placeholder="Enter Execution Place" /></div>
                            <div className="col-md-3"><label className="qt-label">No. Of Pkgs</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select Unit</option></select><input className="form-field qt-input w-50" defaultValue="0" /></div></div>
                            <div className="col-md-3"><label className="qt-label">Total Gross Wt.</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select Unit</option></select><input className="form-field qt-input w-50" defaultValue="0.000" /></div></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Total Net Wt.</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Volume</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select Unit</option></select><input className="form-field qt-input w-50" defaultValue="0.000" /></div></div>
                            <div className="col-md-3"><label className="qt-label">Volume Wt.</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Charge Wt.</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Sales Person</label><select className="form-field qt-input"><option>Select Sales Person</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Origin</label><select className="form-field qt-input"><option>Select</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Destination</label><select className="form-field qt-input"><option>Select</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Transporter / Carrier</label><select className="form-field qt-input"><option>Select Transporter / Carrier</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Vehicle / Rail No</label><input className="form-field qt-input" placeholder="Enter Vehicle / Rail No" /></div>
                            <div className="col-md-3"><label className="qt-label">Dest Agent Profit %</label><input className="form-field qt-input" defaultValue="0.00%" /></div>
                            <div className="col-md-3"><label className="qt-label">Trade Lane</label><select className="form-field qt-input"><option>Select Trade Lane</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Dest Agent Ref</label><input className="form-field qt-input" placeholder="Enter Dest Agent Ref" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Co-Load Type</label><select className="form-field qt-input"><option>Select Co-Load Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Agent Name</label><select className="form-field qt-input"><option>Select Agent Name</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Agent Quote No</label><input className="form-field qt-input" placeholder="Enter Agent Quote No" /></div>
                            <div className="col-md-3"><label className="qt-label">Agent Date</label><input type="date" className="form-field qt-input" /></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. PICK UP */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("pickUp")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-truck"></i></div> Pick Up
                    </span>
                    <i className={`bx ${openSections.pickUp ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.pickUp && (
                    <div className="qt-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Pickup Type</label><select className="form-field qt-input"><option>Select Pickup Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Pickup From</label><select className="form-field qt-input"><option>Select Pickup From</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Pickup Address</label><select className="form-field qt-input"><option>Select Pickup Address</option></select></div>
                            <div className="col-md-3"><label className="qt-label">EST Date & Time</label><input type="datetime-local" className="form-field qt-input" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Pickup Transporter</label><select className="form-field qt-input"><option>Select Pickup Transporter</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Transporter Reference No</label><input className="form-field qt-input" placeholder="Enter Transporter Ref No" /></div>
                            <div className="col-md-3"><label className="qt-label">Vehicle No</label><input className="form-field qt-input" placeholder="Enter Vehicle No" /></div>
                            <div className="col-md-3"><label className="qt-label">Driver Name</label><input className="form-field qt-input" placeholder="Enter Driver Name" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Charge Type</label><select className="form-field qt-input"><option>Select Charge Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Date</label><input type="date" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Bill To</label><select className="form-field qt-input"><option>Select Bill To</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Deliver To</label><select className="form-field qt-input"><option>Select Deliver To</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Delivery Address</label><select className="form-field qt-input"><option>Select Delivery Address</option></select></div>
                            <div className="col-md-3"><label className="qt-label">EST Date & Time (Delivery)</label><input type="datetime-local" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Packages</label><input className="form-field qt-input" defaultValue="0" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Weight</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3"><label className="qt-label">Total Volume</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-6"><label className="qt-label">Remarks</label><textarea className="form-field qt-input" rows="1"></textarea></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. ROUTING DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("routingDetails")}>
                    <div className="d-flex align-items-center gap-3">
                        <span className="bk-section-title" style={{ marginBottom: 0 }}>
                            <div className="bk-icon-circle"><i className="bx bx-git-branch"></i></div> Routing Details
                        </span>
                        <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12, backgroundColor: '#00b5ff', borderColor: '#00b5ff' }} onClick={(e) => { e.stopPropagation(); setRouteRows([...routeRows, { id: Date.now() }]); }}>Add New</button>
                    </div>
                    <i className={`bx ${openSections.routingDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.routingDetails && (
                    <div className="qt-section-body">
                        <div className="bk-dynamic-table-wrapper">
                            <table className="bk-dynamic-table">
                                <thead>
                                    <tr>
                                        <th>Transport Mode</th><th>Type</th><th>From</th><th>To</th><th>ETD</th><th>ETA(Dest.)</th><th>Carrier</th><th>Flight/Vessel</th><th>Voyage No</th><th>Remarks</th><th>Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routeRows.map(row => (
                                        <tr key={row.id}>
                                            <td><select className="form-field qt-input" style={{ height: 32 }}><option>Select</option></select></td>
                                            <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                            <td><select className="form-field qt-input" style={{ height: 32 }}><option>Select</option></select></td>
                                            <td><select className="form-field qt-input" style={{ height: 32 }}><option>Select</option></select></td>
                                            <td><input type="date" className="form-field qt-input" style={{ height: 32 }} /></td>
                                            <td><input type="date" className="form-field qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                            <td className="text-center"><button className="btn btn-danger btn-sm" style={{ height: 28, padding: "0 10px" }} onClick={() => setRouteRows(routeRows.filter(r => r.id !== row.id))}><i className="bx bx-x"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 6. ATTACHED HOUSE */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("attachedHouse")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-home"></i></div> Attached House
                    </span>
                    <i className={`bx ${openSections.attachedHouse ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.attachedHouse && (
                    <div className="qt-section-body">
                        <div className="d-flex justify-content-end gap-2 mb-3">
                            <button className="btn btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 13, backgroundColor: '#00b5ff', borderColor: '#00b5ff' }}><i className="bx bx-link me-1"></i> Attach Shipment</button>
                            <button className="btn btn-success" style={{ height: 32, padding: "0 15px", fontSize: 13, backgroundColor: '#28c76f', borderColor: '#28c76f' }}><i className="bx bx-plus me-1"></i> New Shipment</button>
                            <button className="btn btn-danger" style={{ height: 32, padding: "0 15px", fontSize: 13, backgroundColor: '#ff4c51', borderColor: '#ff4c51' }}><i className="bx bx-unlink me-1"></i> Detach</button>
                        </div>
                        <div className="bk-dynamic-table-wrapper">
                            <table className="bk-dynamic-table">
                                <thead>
                                    <tr>
                                        <th>Date</th><th>Shipment No</th><th>Shipper</th><th>Consignee</th><th>Cargo Type</th><th>Packages</th><th>Volume</th><th>Gross Wt</th><th>Charge Wt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colSpan="9" className="text-center py-4 text-muted">No data available</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 7. CHARGE SHEET DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("chargeSheet")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-dollar"></i></div> Charge Sheet Details
                    </span>
                    <i className={`bx ${openSections.chargeSheet ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.chargeSheet && (
                    <div className="qt-section-body">
                        <div className="row g-4">
                            {/* REVENUE */}
                            <div className="col-md-6">
                                <div className="qt-charge-card">
                                    <div className="qt-charge-header qt-charge-revenue">
                                        <span className="qt-charge-title">Revenue Details</span>
                                        <button className="legacy-add-btn-rev">Add $</button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table qt-charge-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Charge Name</th>
                                                    <th>Amount</th>
                                                    <th>Curr</th>
                                                    <th>Edit</th>
                                                    <th>Del</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {revenueEntries.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center py-3 text-muted">No entries</td></tr>
                                                ) : (
                                                    revenueEntries.map(e => (
                                                        <tr key={e.id}><td>{e.chargeCode}</td><td>{e.rate || "0.00"}</td><td>{e.rateCurrency || "-"}</td><td><i className="bx bx-edit text-primary"></i></td><td><i className="bx bx-trash text-danger"></i></td></tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* COST */}
                            <div className="col-md-6">
                                <div className="qt-charge-card">
                                    <div className="qt-charge-header qt-charge-cost">
                                        <span className="qt-charge-title">Cost Details</span>
                                        <button className="legacy-add-btn-cost">Add $</button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table qt-charge-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Charge Name</th>
                                                    <th>Amount</th>
                                                    <th>Curr</th>
                                                    <th>Edit</th>
                                                    <th>Del</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {costEntries.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center py-3 text-muted">No entries</td></tr>
                                                ) : (
                                                    costEntries.map(e => (
                                                        <tr key={e.id}><td>{e.chargeCode}</td><td>{e.rate || "0.00"}</td><td>{e.rateCurrency || "-"}</td><td><i className="bx bx-edit text-primary"></i></td><td><i className="bx bx-trash text-danger"></i></td></tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* SUMMARY */}
                            <div className="col-md-12">
                                <div className="qt-summary-wrapper">
                                    <div className="qt-charge-header">
                                        <span className="qt-charge-title">Shipment Summary</span>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table qt-summary-table align-middle">
                                            <thead>
                                                <tr>
                                                    <th className="qt-sum-empty"></th>
                                                    <th className="qt-sum-empty"></th>
                                                    <th colSpan={3} className="qt-sum-rev-head text-center">Revenue</th>
                                                    <th colSpan={3} className="qt-sum-cost-head text-center border-start">Cost</th>
                                                    <th className="qt-sum-empty"></th>
                                                    <th className="qt-sum-empty"></th>
                                                </tr>
                                                <tr>
                                                    <th>Services</th>
                                                    <th>Charge Name</th>
                                                    <th>Amount</th>
                                                    <th>Curr</th>
                                                    <th>Amount (HC)</th>
                                                    <th className="border-start">Amount</th>
                                                    <th>Curr</th>
                                                    <th>Amount (HC)</th>
                                                    <th className="border-start">Profit</th>
                                                    <th>Profit %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="qt-sum-total-row">
                                                    <td></td>
                                                    <td className="qt-summary-total-label fw-bold">Total</td>
                                                    <td>0.00</td>
                                                    <td></td>
                                                    <td className="fw-bold">0.00</td>
                                                    <td className="border-start">0.00</td>
                                                    <td></td>
                                                    <td className="fw-bold">0.00</td>
                                                    <td className="border-start fw-bold text-primary">0.00</td>
                                                    <td className="fw-bold text-primary">0%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                <button className="btn-secondary-custom" onClick={() => setView("table")}>Back</button>
                <button className="btn-primary-custom" style={{ backgroundColor: "#00b5ff", borderColor: "#00b5ff" }}>Save</button>
            </div>
        </div>
    );
};

export default LandExportConsol;
