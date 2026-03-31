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

/* ───── dummy data ───── */
const dummyBookings = [
    { _id: "1", jobOrderNo: "JO-1001", jobOrderDate: "2026-03-18T10:00:00", transportMode: "Air", transportType: "Import", customer: "Global Trade Co", salesPerson: "John Doe" },
    { _id: "2", jobOrderNo: "JO-1002", jobOrderDate: "2026-03-17T14:30:00", transportMode: "Sea", transportType: "Export", customer: "Pacific Logistics", salesPerson: "Jane Smith" },
    { _id: "3", jobOrderNo: "JO-1003", jobOrderDate: "2026-03-16T09:15:00", transportMode: "Road", transportType: "Import", customer: "Euro Trans Inc", salesPerson: "Mike Ross" },
    { _id: "4", jobOrderNo: "JO-1004", jobOrderDate: "2026-03-15T16:45:00", transportMode: "Rail", transportType: "Export", customer: "Asiatic Cargo", salesPerson: "Harvey Specter" },
];

/* ───── component ───── */
const Bookings = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const openedRowRef = useRef(null);

    // views: "table" | "form"
    const [view, setView] = useState(initialView);
    const [bookings, setBookings] = useState(dummyBookings);

    // details modal (on row expand)
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // form items state
    const [formData, setFormData] = useState({
        jobOrderDate: "", transportMode: "", transportType: "", customer: "", customerBranch: "", salesPerson: "", jobOwner: "",
        shipper: "", consignee: "", originAgent: "", destAgent: "", sellingAgent: "", notify: "", secondNotify: "", thirdNotify: "", shipTo: "", consignedBank: "", customsBroker: "", bookingParty: "", seller: "", buyer: "", importer: "",
        quotation: "", consolType: "", bookingThru: "", bookingFor: "", movementType: "", incoTerms: "", origin: "", placeOfReceipt: "", loadingPort: "", dischargePort: "", placeOfDelivery: "", destination: "", tradeLane: "", date: "", newSchedule: "", flightList: "",
        shipperRef: "", consigneeRef: "", businessDimension: "", cargoType: "", goodsExpected: "", etaDest: "", freightCurrency: "", freight: "", otherCharge: "", handlingInfo: "", remark: ""
    });

    // dynamic tables
    const [routingRows, setRoutingRows] = useState([{ id: Date.now(), mode: "", type: "", from: "", to: "", etd: "", eta: "", carrier: "", vessel: "", voyage: "", remarks: "" }]);
    const [cargoListRows, setCargoListRows] = useState([{ id: Date.now(), desc: "", pkgs: "0", innerPkgs: "0", grossWt: "0.000", netWt: "0.000", volWt: "0.000", chargeableWt: "0.000", dimension: "", commodity: "" }]);

    // charges
    const [revenueEntries, setRevenueEntries] = useState([]);
    const [costEntries, setCostEntries] = useState([]);
    const [showRevenueModal, setShowRevenueModal] = useState(false);
    const [showCostModal, setShowCostModal] = useState(false);
    const [chargeForm, setChargeForm] = useState({ chargeCode: "", rate: "", rateCurrency: "" });
    const [openSections, setOpenSections] = useState({
        basic: true, handler: true, shipping: true, routing: true, cargo: true, cargoList: true, charges: true
    });

    /* ───── DataTable Init & Cleanup ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;

        // Clean up existing instance if any
        if (dtRef.current) {
            dtRef.current.destroy(true);
            dtRef.current = null;
        }

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom: "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "t" +
                "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",
            paging: true,
            responsive: true,
            data: bookings,
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
                { data: "jobOrderNo", responsivePriority: 1 },
                { data: "jobOrderDate", render: (d) => d ? new Date(d).toLocaleDateString() : "", responsivePriority: 2 },
                { data: "transportMode", responsivePriority: 3 },
                { data: "transportType", responsivePriority: 4 },
                { data: "customer", responsivePriority: 5 },
                { data: "salesPerson", responsivePriority: 6 },
                {
                    data: null, className: "no-export text-center", responsivePriority: 1, orderable: false,
                    render: (data) => `
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" title="Edit" style="font-size: 18px;"></i>
                            <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Delete" style="font-size: 18px;"></i>
                        </div>`
                }
            ],
            language: { lengthMenu: "Show _MENU_ Entries" }
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        // details modal on expand
        dtRef.current.on("responsive-display", (e, datatable, row, showHide) => {
            if (showHide) {
                openedRowRef.current = row;
                setSelectedRow(row.table().row(row.index()).data());
                setShowDetailsModal(true);
            }
        });

        // edit click
        $(tableRef.current).on("click", ".edit-icon", function () {
            const data = dtRef.current.row($(this).parents("tr")).data();
            if (data) {
                setFormData(prev => ({ ...prev, ...data }));
                setView("form");
            }
        });

        // delete click
        $(tableRef.current).on("click", ".delete-icon", function () {
            const id = $(this).data("id");
            setDeleteId(id);
            setShowDeleteModal(true);
        });

        // first col click
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
    }, [view, bookings]);

    /* ───── Handlers ───── */
    const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    const addRoutingRow = () => setRoutingRows([...routingRows, { id: Date.now(), mode: "", type: "", from: "", to: "", etd: "", eta: "", carrier: "", vessel: "", voyage: "", remarks: "" }]);
    const removeRoutingRow = (id) => setRoutingRows(routingRows.filter(r => r.id !== id));

    const addCargoListRow = () => setCargoListRows([...cargoListRows, { id: Date.now(), desc: "", pkgs: "0", innerPkgs: "0", grossWt: "0.000", netWt: "0.000", volWt: "0.000", chargeableWt: "0.000", dimension: "", commodity: "" }]);
    const removeCargoListRow = (id) => setCargoListRows(cargoListRows.filter(r => r.id !== id));

    const totalRev = revenueEntries.reduce((s, e) => s + (parseFloat(e.rate) || 0), 0);
    const totalCost = costEntries.reduce((s, e) => s + (parseFloat(e.rate) || 0), 0);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChargeChange = (e) => {
        const { name, value } = e.target;
        setChargeForm(prev => ({ ...prev, [name]: value }));
    };

    const resetChargeForm = () =>
        setChargeForm({
            chargeCode: "", chargeDescription: "", chargeType: "", ppcc: "",
            type: "Receivable", paidTo: "", contractNo: "", basis: "",
            basisType: "", rateType: "", date: "", rate: "", rateCurrency: "", paidBy: "",
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

    /* ════════════════════════════════════════════════════
       RENDER — TABLE VIEW
    ════════════════════════════════════════════════════ */
    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card">
                    <div className="datatable-toolbar d-flex justify-content-between align-items-start p-3">
                        <div className="title-section">
                            <h5 className="table-title">Bookings</h5>
                        </div>
                        <button className="btn-add-record btn-primary-custom" onClick={() => setView("form")}>
                            <i className="bx bx-plus"></i> Create Booking
                        </button>
                    </div>
                    <div className="card-datatable p-3">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100">
                            <thead>
                                <tr>
                                    <th>Job Order No</th>
                                    <th>Job Order Date</th>
                                    <th>Transport Mode</th>
                                    <th>Transport Type</th>
                                    <th>Customer</th>
                                    <th>Sales Person</th>
                                    <th>Edit</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* DETAILS MODAL */}
                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop">
                        <div className="custom-modal-card">
                            <button className="custom-close" onClick={() => {
                                if (openedRowRef.current) {
                                    const tr = $(openedRowRef.current.node());
                                    tr.find("td.dtr-control").trigger("click");
                                    openedRowRef.current = null;
                                }
                                setShowDetailsModal(false);
                            }}>×</button>
                            <h5 className="modal-title">Booking Details: {selectedRow.jobOrderNo}</h5>
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

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                        <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                            <div className="text-center p-4">
                                <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                                <h4 className="mb-2">Are you sure?</h4>
                                <p className="text-muted mb-4">You want to delete this booking? This action cannot be undone.</p>
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
                                            setBookings(prev => prev.filter(b => b._id !== deleteId));
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
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0">Booking Details</h5>
                <button className="btn-secondary-custom" onClick={() => setView("table")}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            {/* BASIC INFORMATION */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("basic")} style={{ cursor: "pointer" }}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-info-circle"></i></div> Basic Information
                    </span>
                    <i className={`bx ${openSections.basic ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                </div>
                {openSections.basic && (
                    <div className="bk-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3">
                                <label className="qt-label">Job Order Date</label>
                                <input type="date" className="qt-input" />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Transport Mode <span className="text-danger">*</span></label>
                                <select className="qt-input"><option>-- Select Transport Mode --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Transport Type <span className="text-danger">*</span></label>
                                <select className="qt-input"><option>-- Select Transport Type --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Customer <span className="text-danger">*</span></label>
                                <select className="qt-input"><option>-- Select Customer --</option></select>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="qt-label">Customer Branch</label>
                                <select className="qt-input"><option>-- Select Customer Branch --</option></select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Sales Person</label>
                                <select className="qt-input"><option>-- Select Sales Person --</option></select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Job Owner</label>
                                <select className="qt-input"><option>-- Select Job Owner --</option></select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* HANDLER DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("handler")} style={{ cursor: "pointer" }}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-user"></i></div> Handler Details
                    </span>
                    <i className={`bx ${openSections.handler ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                </div>
                {openSections.handler && (
                    <div className="bk-section-body">
                        <div className="row g-3">
                            {["Shipper", "Consignee", "Origin Agent", "Destination Agent", "Selling Agent", "Notify", "Second Notify", "Third Notify", "Ship To", "Consigned To Bank", "Customs Broker", "Booking Party", "Seller", "Buyer", "Importer", "Customer"].map(f => (
                                <div className="col-md-3 mb-2" key={f}>
                                    <label className="qt-label">{f} {f === "Customer" && <span className="text-danger">*</span>}</label>
                                    <select className="qt-input"><option>--Select {f}--</option></select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SHIPPING DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("shipping")} style={{ cursor: "pointer" }}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bxs-ship"></i></div> Shipping Details
                    </span>
                    <i className={`bx ${openSections.shipping ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                </div>
                {openSections.shipping && (
                    <div className="bk-section-body">
                        <div className="row g-3">
                            <div className="col-md-3"><label className="qt-label">Quotation</label><select className="qt-input"><option>-- Select Quotation Number--</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Consol Type</label><select className="qt-input"><option>-- Select Consol Type--</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Booking Thru</label><select className="qt-input"><option>-- Select Booking Thru --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Booking For</label><select className="qt-input"><option>-- Select Agent --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Movement Type</label><select className="qt-input"><option>-- Select Movement Type --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Inco Terms</label><select className="qt-input"><option>-- Select Inco Terms --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Origin</label><select className="qt-input"><option>-- Select Origin --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Place Of Receipt <span className="text-danger">*</span></label><select className="qt-input"><option>-- Select Place of Receipt --</option></select></div>
                        </div>
                    </div>
                )}
            </div>

            {/* ROUTING DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("routing")} style={{ cursor: "pointer" }}>
                    <div className="d-flex align-items-center gap-3">
                        <span className="bk-section-title" style={{ marginBottom: 0 }}>
                            <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-git-branch"></i></div> Routing Details
                        </span>
                        <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); addRoutingRow(); }}>Add New</button>
                    </div>
                    <i className={`bx ${openSections.routing ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                </div>
                {openSections.routing && (
                    <div className="bk-section-body">
                        <div className="bk-dynamic-table-wrapper">
                            <table className="bk-dynamic-table">
                                <thead>
                                    <tr>
                                        <th>Transport Mode</th><th>Type</th><th>From</th><th>To</th><th>ETD</th><th>ETA(Dest.)</th><th>Carrier</th><th>Flight/Vessel</th><th>Voyage No</th><th>Remarks</th><th>Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routingRows.map(row => (
                                        <tr key={row.id}>
                                            <td><select className="qt-input" style={{ height: 32 }}><option>Sel</option></select></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><select className="qt-input" style={{ height: 32 }}></select></td>
                                            <td><select className="qt-input" style={{ height: 32 }}></select></td>
                                            <td><input type="date" className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input type="date" className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td className="text-center"><button className="bk-remove-btn" onClick={() => removeRoutingRow(row.id)}>Remove</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* CARGO DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("cargo")} style={{ cursor: "pointer" }}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-package"></i></div> Cargo Details
                    </span>
                    <i className={`bx ${openSections.cargo ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                </div>
                {openSections.cargo && (
                    <div className="bk-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="qt-label">Description</label>
                                <textarea className="qt-input" rows="3" placeholder="Description" style={{ height: "auto", minHeight: 110, paddingTop: 10 }}></textarea>
                            </div>
                            <div className="col-md-6">
                                <div className="row g-2 mb-2">
                                    <div className="col-md-6">
                                        <label className="qt-label">Packages</label>
                                        <div className="d-flex gap-1">
                                            <input type="number" className="qt-input" defaultValue="0" style={{ width: "60%" }} />
                                            <select className="qt-input" style={{ width: "40%" }}><option>-- Unit --</option></select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="qt-label">Inner Pkgs</label>
                                        <div className="d-flex gap-1">
                                            <input type="number" className="qt-input" defaultValue="0" style={{ width: "60%" }} />
                                            <select className="qt-input" style={{ width: "40%" }}><option>-- Unit --</option></select>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="qt-label">Gross Wt</label>
                                        <div className="d-flex gap-1">
                                            <input type="number" className="qt-input" defaultValue="0.000" style={{ width: "60%" }} />
                                            <select className="qt-input" style={{ width: "40%" }}><option>-- Unit --</option></select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="qt-label">Net Wt</label>
                                        <div className="d-flex gap-1">
                                            <input type="number" className="qt-input" defaultValue="0.000" style={{ width: "60%" }} />
                                            <select className="qt-input" style={{ width: "40%" }}><option>-- Unit --</option></select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3">
                                <label className="qt-label">Dimension (L*B*H)</label>
                                <div className="d-flex gap-1 align-items-center">
                                    <input className="qt-input" placeholder="0.000" />
                                    <span>x</span>
                                    <input className="qt-input" placeholder="0.000" />
                                    <span>x</span>
                                    <input className="qt-input" placeholder="0.000" />
                                    <select className="qt-input" style={{ maxWidth: '80px' }}><option>Unit</option></select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Volume</label>
                                <div className="d-flex gap-1">
                                    <input type="number" className="qt-input" placeholder="0.000" />
                                    <select className="qt-input"><option>Unit</option></select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Commodity</label>
                                <div className="d-flex gap-1">
                                    <input type="text" className="qt-input" />
                                    <select className="qt-input"><option>Sel</option></select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Commodity Type</label>
                                <div className="d-flex gap-1">
                                    <select className="qt-input"><option>Select</option></select>
                                    <input className="qt-input" />
                                </div>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="qt-label">Humidity (%)</label>
                                <input type="number" className="qt-input" placeholder="0.00" />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">HS Code</label>
                                <div className="d-flex gap-1">
                                    <input type="text" className="qt-input" />
                                    <select className="qt-input"><option>Sel</option></select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Volume Wt</label>
                                <div className="d-flex gap-1">
                                    <input type="number" className="qt-input" placeholder="0.000" />
                                    <input className="qt-input" />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Chargeable Wt</label>
                                <div className="d-flex gap-1">
                                    <input type="number" className="qt-input" placeholder="0.000" />
                                    <select className="qt-input"><option>Unit</option></select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CARGO DETAILS LIST */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("cargoList")} style={{ cursor: "pointer" }}>
                    <div className="d-flex align-items-center gap-3">
                        <span className="bk-section-title" style={{ marginBottom: 0 }}>
                            <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-list-ul"></i></div> Cargo Details List
                        </span>
                        <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); addCargoListRow(); }}>Add New</button>
                    </div>
                    <i className={`bx ${openSections.cargoList ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                </div>
                {openSections.cargoList && (
                    <div className="bk-section-body">
                        <div className="bk-dynamic-table-wrapper">
                            <table className="bk-dynamic-table">
                                <thead>
                                    <tr>
                                        <th>Description</th><th>Packages</th><th>Inner Packages</th><th>Gross Weight</th><th>Net Weight</th><th>Volume Weight</th><th>Chargeable Weight</th><th>Dimension</th><th>Commodity</th><th>Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargoListRows.map(row => (
                                        <tr key={row.id}>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td><input className="qt-input" style={{ height: 32 }} /></td>
                                            <td className="text-center"><button className="bk-remove-btn" onClick={() => removeCargoListRow(row.id)}>Remove</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* CHARGE SHEET DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("charges")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle" style={{ color: "#1976d2" }}><i className="bx bx-dollar"></i></div> Charge Sheet Details
                    </span>
                    <i className={`bx ${openSections.charges ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ color: "#1976d2" }}></i>
                </div>
                {openSections.charges && (
                    <div className="bk-section-body">
                        {/* Revenue + Cost side-by-side */}
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
                                                    revenueEntries.map(e => (
                                                        <tr key={e.id}><td>{e.chargeCode}</td><td>{e.rate || "0.00"}</td><td>{e.rateCurrency || "-"}</td><td><i className="bx bx-edit text-primary"></i></td><td><i className="bx bx-trash text-danger" onClick={() => setRevenueEntries(r => r.filter(x => x.id !== e.id))}></i></td></tr>
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
                                                    costEntries.map(e => (
                                                        <tr key={e.id}><td>{e.chargeCode}</td><td>{e.rate || "0.00"}</td><td>{e.rateCurrency || "-"}</td><td><i className="bx bx-edit text-primary"></i></td><td><i className="bx bx-trash text-danger" onClick={() => setCostEntries(c => c.filter(x => x.id !== e.id))}></i></td></tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUMMARY CARD */}
                        <div className="qt-summary-wrapper">
                            <div className="qt-charge-header">
                                <span>Booking Summary</span>
                            </div>
                            <div className="table-responsive">
                                <table className="table qt-summary-table">
                                    <thead>
                                        <tr>
                                            <th className="qt-sum-empty"></th><th className="qt-sum-empty"></th>
                                            <th colSpan={3} className="qt-sum-rev-head">Revenue</th>
                                            <th colSpan={3} className="qt-sum-cost-head">Cost</th>
                                            <th className="qt-sum-empty"></th><th className="qt-sum-empty"></th>
                                        </tr>
                                        <tr><th>Services</th><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Amount (HC)</th><th>Amount</th><th>Curr</th><th>Amount (HC)</th><th>Profit</th><th>Profit %</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td className="qt-summary-total-label">Total</td>
                                            <td>{totalRev.toFixed(2)}</td><td></td><td>{totalRev.toFixed(2)}</td>
                                            <td>{totalCost.toFixed(2)}</td><td></td><td>{totalCost.toFixed(2)}</td>
                                            <td>{(totalRev - totalCost).toFixed(2)}</td>
                                            <td>{totalRev ? (((totalRev - totalCost) / totalRev) * 100).toFixed(2) : "0.00"}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                <button className="btn-secondary-custom" onClick={() => setView("table")}>
                    Cancel
                </button>
                <button className="btn-primary-custom">
                    Save
                </button>
            </div>

            {/* CHARGE MODALS */}
            {showRevenueModal && renderChargeModal("Create Revenue Charge Sheet", "Receivable", handleCreateRevenue, () => setShowRevenueModal(false))}
            {showCostModal && renderChargeModal("Create Cost Charge Sheet", "Payable", handleCreateCost, () => setShowCostModal(false))}
        </div>
    );

    /* ───── charge modal renderer ───── */
    function renderChargeModal(title, typeDefault, onCreate, onClose) {
        return (
            <div className="custom-modal-backdrop">
                <div className="custom-modal-card" style={{ width: 680, maxHeight: "85vh", overflowY: "auto" }}>
                    <button className="custom-close" onClick={onClose}>×</button>
                    <h5 className="modal-title" style={{ background: "#50a9e9", color: "#fff", margin: "-1.5rem -1.75rem 0", padding: "14px 20px", borderRadius: "0.5rem 0.5rem 0 0" }}>
                        {title}
                    </h5>
                    <div style={{ paddingTop: 20 }}>
                        {/* row 1 */}
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
                        {/* row 2 */}
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
                        {/* row 3 */}
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
                        {/* row 4 */}
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
                        {/* row 5 */}
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

export default Bookings;
