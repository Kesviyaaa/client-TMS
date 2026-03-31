import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.mjs";
import "datatables.net-buttons/js/buttons.print.mjs";
import "datatables.net-responsive-bs5";
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

import JSZip from "jszip";
window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs

import "../../../../../App.css";

/* ───── DUMMY DATA ───── */
const dummyConsols = [
    { _id: "1", consolNo: "SEC-1001", consolDate: "2026-03-20T10:00:00", consolType: "Direct Consol", consolOwner: "John Doe", status: "Active" },
    { _id: "2", consolNo: "SEC-1002", consolDate: "2026-03-19T14:30:00", consolType: "Master Consol", consolOwner: "Jane Smith", status: "Closed" },
    { _id: "3", consolNo: "SEC-1003", consolDate: "2026-03-18T09:15:00", consolType: "Co-Load Consol", consolOwner: "Mike Ross", status: "Active" },
];

/* ───── COMPONENT ───── */
const SeaExportConsol = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const openedRowRef = useRef(null);

    // views: "table" | "form"
    const [view, setView] = useState(initialView);
    const [consols, setConsols] = useState(dummyConsols);

    // modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showAttachSearch, setShowAttachSearch] = useState(false);

    // section toggles
    const [openSections, setOpenSections] = useState({
        basic: true, master: true, shipping: true, pickup: true, route: true, house: true, packing: true, charges: true
    });

    // dynamic tables
    const [routeRows, setRouteRows] = useState([{ id: Date.now(), mode: "", type: "", from: "", to: "", etaOrigin: "", etd: "", etaDest: "", ataDest: "", remarks: "" }]);
    const [houseRows, setHouseRows] = useState([]); // attached house list
    const [packingRows, setPackingRows] = useState([]); // packing details

    // charges
    const [revenueEntries, setRevenueEntries] = useState([]);
    const [costEntries, setCostEntries] = useState([]);
    const [showRevenueModal, setShowRevenueModal] = useState(false);
    const [showCostModal, setShowCostModal] = useState(false);
    const [chargeForm, setChargeForm] = useState({
        chargeCode: "", chargeDescription: "", chargeType: "", ppcc: "",
        type: "Receivable", paidTo: "", contractNo: "", basis: "",
        basisType: "", rateType: "", date: "", rate: "", rateCurrency: "", paidBy: ""
    });

    /* ───── DATATABLE INIT ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;

        // Clean up
        if (dtRef.current) {
            dtRef.current.destroy(true);
            dtRef.current = null;
        }

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            paging: true,
            responsive: true,
            data: consols,
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
                    ]
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                    columns: ":not(.no-export)"
                }
            ],
            columns: [
                { data: "consolNo", title: "Consol No", responsivePriority: 1 },
                { data: "consolDate", title: "Consol Date", render: (d) => d ? new Date(d).toLocaleDateString() : "", responsivePriority: 2 },
                { data: "consolType", title: "Consol Type", responsivePriority: 3 },
                { data: "consolOwner", title: "Consol Owner", responsivePriority: 4 },
                { data: "status", title: "Status", responsivePriority: 5, render: (d) => `<span class="status-badge bg-label-${d === 'Active' ? 'success' : d === 'Closed' ? 'danger' : 'secondary'}">${d}</span>` },
                {
                    data: null, className: "no-export text-center", title: "Edit", responsivePriority: 1, orderable: false,
                    render: (data) => `
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" title="Edit" style="font-size: 18px;"></i>
                        </div>`
                },
                {
                    data: null, className: "no-export text-center", title: "Delete", responsivePriority: 1, orderable: false,
                    render: (data) => `
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Delete" style="font-size: 18px;"></i>
                        </div>`
                }
            ],
            language: { lengthMenu: "Show _MENU_ Entries" }
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
            $(".dt-buttons").removeClass("btn-group");
        }, 0);

        // DETAILS MODAL (+)
        dtRef.current.on("responsive-display", (e, datatable, row, showHide) => {
            if (showHide) {
                openedRowRef.current = row;
                setSelectedRow(row.table().row(row.index()).data());
                setShowDetailsModal(true);
            }
        });

        // ACTIONS
        $(tableRef.current).on("click", ".edit-icon", function () {
            setView("form");
        });

        $(tableRef.current).on("click", ".delete-icon", function () {
            const id = $(this).data("id");
            setDeleteId(id);
            setShowDeleteModal(true);
        });

        // first col click -> details
        $(tableRef.current).on("click", "tbody tr td:first-child", function () {
            const rowData = dtRef.current.row($(this).closest("tr")).data();
            if (rowData) {
                setSelectedRow(rowData);
                setShowDetailsModal(true);
            }
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy(true);
                dtRef.current = null;
            }
        };
    }, [view, consols]);

    /* ───── HANDLERS ───── */
    const toggleSection = (s) => setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));

    const addRouteRow = () => setRouteRows([...routeRows, { id: Date.now(), mode: "", type: "", from: "", to: "", etaOrigin: "", etd: "", etaDest: "", ataDest: "", remarks: "" }]);
    const removeRouteRow = (id) => setRouteRows(routeRows.filter(r => r.id !== id));

    const addPackingRow = () => setPackingRows([...packingRows, { id: Date.now(), desc: "", commodity: "", pkgs: "", grossWt: "", volume: "", chargeableWt: "" }]);
    const removePackingRow = (id) => setPackingRows(packingRows.filter(r => r.id !== id));

    const totalRev = revenueEntries.reduce((s, e) => s + (parseFloat(e.rate) || 0), 0);
    const totalCost = costEntries.reduce((s, e) => s + (parseFloat(e.rate) || 0), 0);

    const handleChargeChange = (e) => {
        const { name, value } = e.target;
        setChargeForm(prev => ({ ...prev, [name]: value }));
    };

    const resetChargeForm = () =>
        setChargeForm({
            chargeCode: "", chargeDescription: "", chargeType: "", ppcc: "",
            type: "Receivable", paidTo: "", contractNo: "", basis: "",
            basisType: "", rateType: "", date: "", rate: "", rateCurrency: "", paidBy: ""
        });

    const handleCreateRevenue = () => {
        setRevenueEntries((prev) => [...prev, { ...chargeForm, id: Date.now() }]);
        resetChargeForm();
        setShowRevenueModal(false);
    };

    const handleCreateCost = () => {
        const entry = { ...chargeForm, type: "Payable", id: Date.now() };
        setCostEntries((prev) => [...prev, entry]);
        resetChargeForm();
        setShowCostModal(false);
    };

    /* ══════════════════════════════════════
       RENDER — COMBINED DOM
    ══════════════════════════════════════ */
    return (
        <>
            {/* VIEW: TABLE */}
            <div style={{ display: view === "table" ? "block" : "none" }}>
                <div className="container-xxl flex-grow-1 container-p-y pb-5">
                    <div className="card">
                        <div className="datatable-toolbar d-flex justify-content-between align-items-middle p-3">
                            <h5 className="table-title mb-0">SE Consols</h5>
                            <button className="btn-add-record btn-primary-custom" onClick={() => setView("form")}>
                                <i className="bx bx-plus"></i> Create Consol
                            </button>
                        </div>
                        <div className="card-datatable p-3">
                            <table ref={tableRef} className="table dataTable dtr-inline w-100">
                            </table>
                        </div>
                    </div>

                    {/* DETAILS MODAL */}
                    {showDetailsModal && selectedRow && (
                        <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                            <div className="custom-modal-card">
                                <button className="custom-close" onClick={() => {
                                    if (openedRowRef.current) {
                                        const tr = $(openedRowRef.current.node());
                                        tr.find("td.dtr-control").trigger("click");
                                        openedRowRef.current = null;
                                    }
                                    setShowDetailsModal(false);
                                }}>×</button>
                                <h5 className="modal-title">Consol Details: {selectedRow.consolNo}</h5>
                                <hr className="modal-divider" />
                                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
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

                    {/* DELETE CONFIRMATION MODAL */}
                    {showDeleteModal && (
                        <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                            <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                                <div className="text-center p-4">
                                    <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                                    <h4 className="mb-2">Are you sure?</h4>
                                    <p className="text-muted mb-4">You want to delete this Consol? This action cannot be undone.</p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <button className="btn btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                        <button className="btn btn-danger" onClick={() => {
                                            setConsols(prev => prev.filter(b => b._id !== deleteId));
                                            setShowDeleteModal(false);
                                        }}>Yes, Delete it!</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* VIEW: FORM */}
            <div style={{ display: view === "form" ? "block" : "none" }}>
                <div className="container-xxl flex-grow-1 container-p-y pb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0" style={{ fontWeight: "700", color: "#566a7f" }}>Sea Export Consol Details</h5>
                        <button className="btn-secondary-custom" onClick={() => setView("table")}>
                            <i className="bx bx-arrow-back me-1"></i> Back to List
                        </button>
                    </div>

                    {/* BASIC INFO */}
                    <div className="bk-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("basic")} style={{ cursor: "pointer" }}>
                            <span className="bk-section-title"><div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-info-circle"></i></div> Basic Information</span>
                            <i className={`bx ${openSections.basic ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                        </div>
                        {openSections.basic && (
                            <div className="bk-section-body">
                                <div className="row g-3">
                                    <div className="col-md-3"><label className="qt-label">Consol No <span className="text-danger">*</span></label><input className="form-field qt-input" placeholder="SEC-005" /></div>
                                    <div className="col-md-3"><label className="qt-label">Consol Date</label><input type="date" className="form-field qt-input" /></div>
                                    <div className="col-md-3"><label className="qt-label">Consol Type <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Consol Type</option><option>FCL</option><option>LCL</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Cargo Type <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Cargo Type</option><option>General</option><option>Hazardous</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Consol Owner <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Consol Owner</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Consol Status</label><input className="form-field qt-input" disabled /></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MASTER DETAILS */}
                    <div className="bk-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("master")} style={{ cursor: "pointer" }}>
                            <span className="bk-section-title"><div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-user"></i></div> Master Details</span>
                            <i className={`bx ${openSections.master ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                        </div>
                        {openSections.master && (
                            <div className="bk-section-body">
                                <div className="row g-3">
                                    {["Origin Agent *", "Destination Agent *", "Master Shipper", "Master Consignee", "Notify", "Selling Agent", "IncoTerm", "Transporter"].map((f, i) => (
                                        <div className="col-md-3 mb-2" key={i}>
                                            <label className="qt-label">{f.replace("*", "")} {f.includes("*") && <span className="text-danger">*</span>}</label>
                                            <select className="form-field qt-input"><option>Select {f.replace("*", "").trim()}</option></select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SHIPPING DETAILS */}
                    <div className="bk-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("shipping")} style={{ cursor: "pointer" }}>
                            <span className="bk-section-title"><div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bxs-ship"></i></div> Shipping Details</span>
                            <i className={`bx ${openSections.shipping ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                        </div>
                        {openSections.shipping && (
                            <div className="bk-section-body">
                                <div className="row g-3 mb-3">
                                    <div className="col-md-3"><label className="qt-label">Co Loader By</label><select className="form-field qt-input"><option>Select Co Loader By</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">B/L No.</label><input className="form-field qt-input" placeholder="Enter B/L No" /></div>
                                    <div className="col-md-3"><label className="qt-label">Carrier Booking Ref</label><input className="form-field qt-input" placeholder="Enter Carrier Booking Ref" /></div>
                                    <div className="col-md-3"><label className="qt-label">Vessel/Voy</label><input className="form-field qt-input" placeholder="Enter Vessel/Voy" /></div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-3"><label className="qt-label">No of Packages</label><div className="d-flex gap-1"><select className="form-field qt-input" style={{ width: "40%" }}><option>Unit</option></select><input className="form-field qt-input" style={{ width: "60%" }} defaultValue="0" /></div></div>
                                    <div className="col-md-3"><label className="qt-label">Total Gross Weight</label><div className="d-flex gap-1"><select className="form-field qt-input" style={{ width: "40%" }}><option>Unit</option></select><input className="form-field qt-input" style={{ width: "60%" }} defaultValue="0.000" /></div></div>
                                    <div className="col-md-3"><label className="qt-label">Total Net Weight</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                                    <div className="col-md-3"><label className="qt-label">Total Volume</label><div className="d-flex gap-1"><select className="form-field qt-input" style={{ width: "40%" }}><option>Unit</option></select><input className="form-field qt-input" style={{ width: "60%" }} defaultValue="0.000" /></div></div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-3"><label className="qt-label">Place of Receipt <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Port</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Loading Port <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Port</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Discharge Port <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Port</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Place of Delivery <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Port</option></select></div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-3"><label className="qt-label">ETD</label><input type="date" className="form-field qt-input" /></div>
                                    <div className="col-md-3"><label className="qt-label">ETA</label><input type="date" className="form-field qt-input" /></div>
                                    <div className="col-md-3"><label className="qt-label">Shipping Line</label><select className="form-field qt-input"><option>Select Shipping Line</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Trade Lane</label><select className="form-field qt-input"><option>Select Trade Lane</option></select></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PICK UP */}
                    <div className="bk-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("pickup")} style={{ cursor: "pointer" }}>
                            <span className="bk-section-title"><div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bxs-truck"></i></div> Pick Up</span>
                            <i className={`bx ${openSections.pickup ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                        </div>
                        {openSections.pickup && (
                            <div className="bk-section-body">
                                <div className="row g-3 mb-3">
                                    <div className="col-md-3"><label className="qt-label">Pickup From</label><select className="form-field qt-input"><option>Select Pickup From</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Empty Container Pickup</label><select className="form-field qt-input"><option>Select...</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Pickup Point</label><select className="form-field qt-input"><option>Select Pickup Point</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Pickup Address</label><select className="form-field qt-input"><option>Select Address</option></select></div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-3"><label className="qt-label">EAT Date & Time</label><input type="datetime-local" className="form-field qt-input" /></div>
                                    <div className="col-md-3"><label className="qt-label">Pickup Transporter</label><select className="form-field qt-input"><option>Select Transporter</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">Transporter Reference No</label><input className="form-field qt-input" placeholder="Enter Ref No" /></div>
                                    <div className="col-md-3"><label className="qt-label">Vehicle No</label><input className="form-field qt-input" placeholder="Enter Vehicle No" /></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ROUTE DETAILS */}
                    <div className="bk-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("route")} style={{ cursor: "pointer" }}>
                            <div className="d-flex align-items-center gap-3">
                                <span className="bk-section-title" style={{ marginBottom: 0 }}>
                                    <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-git-branch"></i></div> Route Details
                                </span>
                                <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); addRouteRow(); }}>Add New</button>
                            </div>
                            <i className={`bx ${openSections.route ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                        </div>
                        {openSections.route && (
                            <div className="bk-section-body">
                                <div className="bk-dynamic-table-wrapper">
                                    <table className="bk-dynamic-table">
                                        <thead>
                                            <tr>
                                                <th>Transport Mode</th><th>Type</th><th>From</th><th>To</th>
                                                <th>ETD</th><th>ETA/Dest. T</th><th>Carrier</th><th>Flight/Vessel</th>
                                                <th>Voyage/No</th><th>Remarks</th><th>Remove</th>
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
                                                    <td className="text-center"><button className="bk-remove-btn" onClick={() => removeRouteRow(row.id)}>Remove</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ATTACHED HOUSE */}
                    <div className="bk-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("house")} style={{ cursor: "pointer" }}>
                            <span className="bk-section-title"><div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-home"></i></div> Attached House</span>
                            <i className={`bx ${openSections.house ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                        </div>
                        {openSections.house && (
                            <div className="bk-section-body">
                                <div className="d-flex justify-content-end gap-2 mb-3">
                                    <button onClick={() => setShowAttachSearch(!showAttachSearch)} style={{ height: 32, padding: "0 15px", fontSize: 13, border: "none", borderRadius: "4px", color: "white", backgroundColor: "#00b5ff", display: "flex", alignItems: "center" }}><i className="bx bx-link me-2"></i> Attach Shipment</button>
                                    <button style={{ height: 32, padding: "0 15px", fontSize: 13, border: "none", borderRadius: "4px", color: "white", backgroundColor: "#28c76f", display: "flex", alignItems: "center" }}><i className="bx bx-plus me-2"></i> New Shipment</button>
                                    <button style={{ height: 32, padding: "0 15px", fontSize: 13, border: "none", borderRadius: "4px", color: "white", backgroundColor: "#ff4c51", display: "flex", alignItems: "center" }}><i className="bx bx-unlink me-2"></i> Detach</button>
                                </div>
                                <div className="bk-dynamic-table-wrapper">
                                    <table className="bk-dynamic-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th><th>Shipment No</th><th>Shipper</th><th>Consignee</th>
                                                <th>Cargo Type</th><th>Packages</th><th>Volume</th><th>Gross Wt</th><th>Charge Wt</th><th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {houseRows.length === 0 ? (
                                                <tr><td colSpan="10" className="text-center text-muted p-4">No attached Data</td></tr>
                                            ) : (
                                                houseRows.map(row => (
                                                    <tr key={row.id}>
                                                        {/* Adaptation: Sea Export fields might vary slightly but we'll follow AE pattern */}
                                                        <td><input type="date" className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td className="text-center"><button className="bk-remove-btn" onClick={() => setHouseRows(houseRows.filter(h => h.id !== row.id))}>Remove</button></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PACKING DETAILS */}
                    <div className="bk-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("packing")} style={{ cursor: "pointer" }}>
                            <div className="d-flex align-items-center gap-3">
                                <span className="bk-section-title" style={{ marginBottom: 0 }}>
                                    <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-box"></i></div> Packing Details
                                </span>
                                <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); addPackingRow(); }}>Add New</button>
                            </div>
                            <i className={`bx ${openSections.packing ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                        </div>
                        {openSections.packing && (
                            <div className="bk-section-body">
                                <div className="bk-dynamic-table-wrapper">
                                    <table className="bk-dynamic-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th><th>Commodity</th><th>Packages</th><th>Gross Weight</th>
                                                <th>Volume</th><th>Chargeable Weight</th><th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {packingRows.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center text-muted p-4">No packing details available</td></tr>
                                            ) : (
                                                packingRows.map(row => (
                                                    <tr key={row.id}>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td><input className="form-field qt-input" style={{ height: 32 }} /></td>
                                                        <td className="text-center"><button className="bk-remove-btn" onClick={() => removePackingRow(row.id)}>Remove</button></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CHARGE SHEET DETAILS */}
                    <div className="qt-section-card">
                        <div className="bk-section-header" onClick={() => toggleSection("charges")}>
                            <span className="bk-section-title"><div className="bk-icon-circle" style={{ color: "#1976d2" }}><i className="bx bx-dollar"></i></div> Charge Sheet Details</span>
                            <i className={`bx ${openSections.charges ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ color: "#1976d2" }}></i>
                        </div>
                        {openSections.charges && (
                            <div className="bk-section-body">
                                <div className="row g-4 mb-4">
                                    {/* REVENUE */}
                                    <div className="col-md-6">
                                        <div className="qt-charge-card">
                                            <div className="qt-charge-header qt-charge-revenue">
                                                <span>Revenue Details</span>
                                                <button className="legacy-add-btn-rev" onClick={() => { resetChargeForm(); setShowRevenueModal(true); }}>Add $</button>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table qt-charge-table">
                                                    <thead><tr><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Edit</th><th>Del</th></tr></thead>
                                                    <tbody>
                                                        {revenueEntries.length === 0 ? (
                                                            <tr><td colSpan={5} className="text-center py-3 text-muted">No entries</td></tr>
                                                        ) : (
                                                            revenueEntries.map(e => (<tr key={e.id}><td>{e.chargeCode}</td><td>{e.rate || "0.00"}</td><td>{e.rateCurrency || "-"}</td><td><i className="bx bx-edit text-primary"></i></td><td><i className="bx bx-trash text-danger" onClick={() => setRevenueEntries(r => r.filter(x => x.id !== e.id))}></i></td></tr>))
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
                                                <span>Cost Details</span>
                                                <button className="legacy-add-btn-cost" onClick={() => { resetChargeForm(); setShowCostModal(true); }}>Add $</button>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table qt-charge-table">
                                                    <thead><tr><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Edit</th><th>Del</th></tr></thead>
                                                    <tbody>
                                                        {costEntries.length === 0 ? (
                                                            <tr><td colSpan={5} className="text-center py-3 text-muted">No entries</td></tr>
                                                        ) : (
                                                            costEntries.map(e => (<tr key={e.id}><td>{e.chargeCode}</td><td>{e.rate || "0.00"}</td><td>{e.rateCurrency || "-"}</td><td><i className="bx bx-edit text-primary"></i></td><td><i className="bx bx-trash text-danger" onClick={() => setCostEntries(c => c.filter(x => x.id !== e.id))}></i></td></tr>))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SUMMARY CARD */}
                                <div className="qt-summary-wrapper">
                                    <div className="qt-charge-header"><span>Consol Summary</span></div>
                                    <div className="table-responsive">
                                        <table className="table qt-summary-table">
                                            <thead>
                                                <tr><th className="qt-sum-empty"></th><th className="qt-sum-empty"></th><th colSpan={3} className="qt-sum-rev-head">Revenue</th><th colSpan={3} className="qt-sum-cost-head">Cost</th><th className="qt-sum-empty"></th><th className="qt-sum-empty"></th></tr>
                                                <tr><th>Services</th><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Amount (HC)</th><th>Amount</th><th>Curr</th><th>Amount (HC)</th><th>Profit</th><th>Profit %</th></tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td></td><td className="qt-summary-total-label">Total</td><td>{totalRev.toFixed(2)}</td><td></td><td>{totalRev.toFixed(2)}</td><td>{totalCost.toFixed(2)}</td><td></td><td>{totalCost.toFixed(2)}</td><td>{(totalRev - totalCost).toFixed(2)}</td><td>{totalRev ? (((totalRev - totalCost) / totalRev) * 100).toFixed(2) : "0.00"}%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                        <button className="btn-secondary-custom" onClick={() => setView("table")}>Close</button>
                        <button className="btn-primary-custom">Save</button>
                    </div>
                </div>
            </div>

            {/* CHARGE MODALS */}
            {showRevenueModal && renderChargeModal("Create Revenue Charge Sheet", "Receivable", handleCreateRevenue, () => setShowRevenueModal(false))}
            {showCostModal && renderChargeModal("Create Cost Charge Sheet", "Payable", handleCreateCost, () => setShowCostModal(false))}
        </>
    );

    /* ───── CHARGE MODAL RENDERER ───── */
    function renderChargeModal(title, typeDefault, onCreate, onClose) {
        return (
            <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                <div className="custom-modal-card" style={{ width: 680, maxHeight: "85vh", overflowY: "auto" }}>
                    <button className="custom-close" onClick={onClose}>×</button>
                    <h5 className="modal-title" style={{ background: "#50a9e9", color: "#fff", margin: "-1.5rem -1.75rem 0", padding: "14px 20px", borderRadius: "0.5rem 0.5rem 0 0" }}>
                        {title}
                    </h5>
                    <div style={{ paddingTop: 20 }}>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="qt-label">Charge Code <span className="text-danger">*</span></label>
                                <select name="chargeCode" className="form-field qt-input" value={chargeForm.chargeCode} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                    <option value="FREIGHT">FREIGHT</option>
                                    <option value="THC">THC</option>
                                    <option value="DOC">DOC</option>
                                    <option value="BL">BL</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Charge Description</label>
                                <textarea name="chargeDescription" className="form-field qt-input" rows={2} value={chargeForm.chargeDescription} onChange={handleChargeChange} style={{ height: 60, paddingTop: 8 }} />
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <label className="qt-label">Charge Type</label>
                                <select name="chargeType" className="form-field qt-input" value={chargeForm.chargeType} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                    <option value="Freight">Freight</option>
                                    <option value="Local">Local</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">PP/CC</label>
                                <select name="ppcc" className="form-field qt-input" value={chargeForm.ppcc} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                    <option value="PP">PP</option>
                                    <option value="CC">CC</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Type</label>
                                <input type="text" className="form-field qt-input" value={typeDefault} readOnly style={{ background: "#f5f5f5" }} />
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <label className="qt-label">Paid To</label>
                                <select name="paidTo" className="form-field qt-input" value={chargeForm.paidTo} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Contract No</label>
                                <select name="contractNo" className="form-field qt-input" value={chargeForm.contractNo} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Basis</label>
                                <select name="basis" className="form-field qt-input" value={chargeForm.basis} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                </select>
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <label className="qt-label">Basis Type</label>
                                <select name="basisType" className="form-field qt-input" value={chargeForm.basisType} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Rate Type</label>
                                <select name="rateType" className="form-field qt-input" value={chargeForm.rateType} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Date</label>
                                <input type="date" name="date" className="form-field qt-input" value={chargeForm.date} onChange={handleChargeChange} />
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <label className="qt-label">Rate</label>
                                <input type="number" name="rate" className="form-field qt-input" value={chargeForm.rate} onChange={handleChargeChange} placeholder="0.00" />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Rate Currency</label>
                                <select name="rateCurrency" className="form-field qt-input" value={chargeForm.rateCurrency} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="INR">INR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Paid BY</label>
                                <select name="paidBy" className="form-field qt-input" value={chargeForm.paidBy} onChange={handleChargeChange}>
                                    <option value="">Select</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-buttons" style={{ marginTop: 16 }}>
                        <button className="btn-secondary-custom" onClick={onClose}>Close</button>
                        <button className="btn-primary-custom" onClick={onCreate}>Create</button>
                    </div>
                </div>
            </div>
        );
    }
};

export default SeaExportConsol;
