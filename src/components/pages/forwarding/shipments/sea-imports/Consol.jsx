import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";

import "../../../../../App.css";

// Dummy Data
const dummyConsols = [
    {
        _id: "1",
        consolNo: "SIC-2001",
        consolDate: "2026-03-20",
        consolType: "Master Consol",
        consolOwner: "John Doe",
        status: "Active",
    },
];

const SeaImportConsol = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const openedRowRef = useRef(null);

    const [view, setView] = useState(initialView);
    const [consols, setConsols] = useState(dummyConsols);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [openSections, setOpenSections] = useState({
        basic: true,
        handler: true,
        shipping: true,
        di: true,
        route: true,
        house: true,
        packing: true,
    });

    const [routeRows, setRouteRows] = useState([{ id: Date.now() }]);

    /* ───── DataTable init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
        if (dtRef.current) {
            dtRef.current.destroy();
        }

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "t" +
                "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",
            paging: true,
            responsive: true,
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
            data: consols,
            columns: [
                { data: "consolNo", title: "Consol No", responsivePriority: 1 },
                { data: "consolDate", title: "Consol Date", responsivePriority: 2 },
                { data: "consolType", title: "Consol Type", responsivePriority: 3 },
                { data: "consolOwner", title: "Consol Owner", responsivePriority: 4 },
                { 
                    data: "status", 
                    title: "Status", 
                    responsivePriority: 5,
                    render: (d) => `<span class="status-badge bg-label-${d === 'Active' ? 'success' : 'secondary'}">${d}</span>`
                },
                {
                    data: null,
                    title: "Edit",
                    orderable: false,
                    searchable: false,
                    responsivePriority: 1,
                    render: (data) => `
                        <div class="d-flex align-items-center gap-2">
                            <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" style="font-size: 18px;"></i>
                        </div>
                    `,
                },
            ],
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        // Responsive event
        dtRef.current.on("responsive-display", function (e, datatable, row, showHide) {
            if (showHide) {
                openedRowRef.current = row;
                setSelectedRow(row.data());
                setShowDetailsModal(true);
            }
        });

        // Event Delegation
        const table = $(tableRef.current);
        table.on("click", ".edit-icon", function () {
            setView("form");
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [view, consols]);

    const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y pb-5">
                <div className="card">
                    <div className="datatable-toolbar d-flex justify-content-between align-items-middle p-3">
                        <h5 className="table-title mb-0">SI Consols</h5>
                        <button className="btn-primary-custom" onClick={() => setView("form")}>
                            <i className="bx bx-plus"></i> Create Consol
                        </button>
                    </div>
                    <div className="card-datatable p-3">
                        <div className="table-responsive">
                            <table ref={tableRef} className="table dataTable dtr-inline shadow-none" style={{ width: "100%" }}>
                                <thead>
                                    <tr>
                                        <th>Consol No</th>
                                        <th>Consol Date</th>
                                        <th>Consol Type</th>
                                        <th>Consol Owner</th>
                                        <th>Status</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Details Modal */}
                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop" style={{ zIndex: 9999 }}>
                        <div className="custom-modal-card">
                            <button
                                className="custom-close"
                                onClick={() => {
                                    if (openedRowRef.current) {
                                        const tr = $(openedRowRef.current.node());
                                        tr.find("td.dtr-control").trigger("click");
                                        openedRowRef.current = null;
                                    }
                                    setShowDetailsModal(false);
                                }}
                            >
                                ×
                            </button>
                            <h5 className="modal-title">Details of {selectedRow.consolNo}</h5>
                            <hr className="modal-divider" />
                            <table className="table table-sm">
                                <tbody>
                                    {Object.entries(selectedRow).map(([k, v]) => (
                                        <tr key={k}><td><strong>{k}:</strong></td><td>{String(v)}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ───── Form View ─────
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0" style={{ fontWeight: "700", color: "#566a7f" }}>Sea Import Consols</h5>
                <button className="btn-secondary-custom" onClick={() => setView("table")}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            {/* 1. BASIC INFORMATION */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("basic")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Basic Information
                    </span>
                    <i className={`bx ${openSections.basic ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.basic && (
                    <div className="bk-section-body">
                        <div className="row g-3">
                            <div className="col-md-3"><label className="qt-label">Consol No <span className="text-danger">*</span></label><input className="form-field qt-input" placeholder="SIC-001" /></div>
                            <div className="col-md-3"><label className="qt-label">Consol Date</label><input type="date" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Consol Type <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Consol Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Cargo Type <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Cargo Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Consol Owner <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Consol Owner</option></select></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. HANDLER DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("handler")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details
                    </span>
                    <i className={`bx ${openSections.handler ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.handler && (
                    <div className="bk-section-body">
                        <div className="row g-3 mb-3">
                            {["Destination Agent *", "Origin Agent *", "Selling Agent", "Ship To", "Importer", "Booking Party", "Seller", "Buyer", "Transporter"].map(label => (
                                <div className="col-md-3 mb-2" key={label}>
                                    <label className="qt-label">{label.replace("*", "")} {label.includes("*") && <span className="text-danger">*</span>}</label>
                                    <select className="form-field qt-input"><option>Select {label.replace("*", "").trim()}</option></select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. SHIPPING DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("shipping")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Shipping Details
                    </span>
                    <i className={`bx ${openSections.shipping ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.shipping && (
                    <div className="bk-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">BL Issued By</label><select className="form-field qt-input"><option>Select BL Issued By</option></select></div>
                            <div className="col-md-3"><label className="qt-label">BL No</label><input className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">BL Date</label><input type="date" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">No of Packages</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select Unit</option></select><input className="form-field qt-input w-50" defaultValue="0"/></div></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Total Inner Packages</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select Unit</option></select><input className="form-field qt-input w-50" defaultValue="0"/></div></div>
                            <div className="col-md-3"><label className="qt-label">Total Gross Weight</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select Unit</option></select><input className="form-field qt-input w-50" defaultValue="0.000"/></div></div>
                            <div className="col-md-3"><label className="qt-label">Total Net Weight</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Volume</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select Unit</option></select><input className="form-field qt-input w-50" defaultValue="0.000"/></div></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Volume Weight</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Charge Weight</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-3"><label className="qt-label">No. of House(s)</label><input className="form-field qt-input" defaultValue="0" /></div>
                            <div className="col-md-3"><label className="qt-label">Marks and Nos</label><textarea className="form-field qt-input" rows="1"></textarea></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Nature and Quantity of Goods</label><input className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Invoice Value</label><div className="d-flex gap-1"><input className="form-field qt-input w-50" defaultValue="0.00"/><select className="form-field qt-input w-50"><option>Select...</option></select></div></div>
                            <div className="col-md-3"><label className="qt-label">Sales Person</label><select className="form-field qt-input"><option>Select Sales Person</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Place of Receipt <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Place of Receipt</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Loading Port <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Loading Port</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Discharge Port <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Discharge Port</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Place of Delivery <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Place of Delivery</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Shipping line</label><select className="form-field qt-input"><option>Select Shipping line</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Vessel/Voyage</label><select className="form-field qt-input"><option>Select Vessel/Voyage</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Trade Lane</label><select className="form-field qt-input"><option>Select Trade Lane</option></select></div>
                            <div className="col-md-3"><label className="qt-label">De-Stuffing At</label><select className="form-field qt-input"><option>Select De-Stuffing At</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Cont. Return Location</label><select className="form-field qt-input"><option>Select Return Location</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Freight Currency <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Currency</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Contract</label><select className="form-field qt-input"><option>Select Contract</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Co-Load Type</label><select className="form-field qt-input"><option>Select Co-Load Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Agent Name</label><select className="form-field qt-input"><option>Select Agent Name</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Agent BL No</label><input className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">BL Date</label><input type="date" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Orig. Agent Ref.</label><input className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">AMS No.</label><input className="form-field qt-input" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">G/O Date</label><input type="date" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Last Free Date</label><input type="date" className="form-field qt-input" /></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. DI */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("di")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-truck"></i></div> DI
                    </span>
                    <i className={`bx ${openSections.di ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.di && (
                    <div className="bk-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">DI Type</label><select className="form-field qt-input"><option>Select DI Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Pickup From</label><select className="form-field qt-input"><option>Select Pickup From</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Pickup Address</label><select className="form-field qt-input"><option>Select Address</option></select></div>
                            <div className="col-md-3"><label className="qt-label">EST Date & Time</label><input type="datetime-local" className="form-field qt-input" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Delivery Transporter</label><select className="form-field qt-input"><option>Select Pickup Transporter</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Transporter Reference No</label><input className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Vehicle No</label><input className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Driver Name</label><input className="form-field qt-input" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Charge Type</label><select className="form-field qt-input"><option>Select Charge Type</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Date</label><input type="date" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Deliver To</label><select className="form-field qt-input"><option>Select Deliver To</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Delivery Address</label><select className="form-field qt-input"><option>Select Address</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">EST Date & Time</label><input type="datetime-local" className="form-field qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Packages</label><input className="form-field qt-input" defaultValue="0" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Weight</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-3"><label className="qt-label">Total Volume</label><input className="form-field qt-input" defaultValue="0.000" /></div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6"><label className="qt-label">Remarks</label><textarea className="form-field qt-input" rows="1"></textarea></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. ROUTING DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("route")}>
                    <div className="d-flex align-items-center gap-3">
                        <span className="bk-section-title" style={{ marginBottom: 0 }}>
                            <div className="bk-icon-circle"><i className="bx bx-git-branch"></i></div> Routing Details
                        </span>
                        <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setRouteRows([...routeRows, { id: Date.now() }]); }}>Add New</button>
                    </div>
                    <i className={`bx ${openSections.route ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.route && (
                    <div className="bk-section-body">
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
                                            <td><select className="form-field qt-input" style={{height: 32}}><option>Select</option></select></td>
                                            <td><input className="form-field qt-input" style={{height: 32}}/></td>
                                            <td><select className="form-field qt-input" style={{height: 32}}><option>Select</option></select></td>
                                            <td><select className="form-field qt-input" style={{height: 32}}><option>Select</option></select></td>
                                            <td><input type="date" className="form-field qt-input" style={{height: 32}}/></td>
                                            <td><input type="date" className="form-field qt-input" style={{height: 32}}/></td>
                                            <td><input className="form-field qt-input" style={{height: 32}}/></td>
                                            <td><input className="form-field qt-input" style={{height: 32}}/></td>
                                            <td><input className="form-field qt-input" style={{height: 32}}/></td>
                                            <td><input className="form-field qt-input" style={{height: 32}}/></td>
                                            <td className="text-center"><button className="bk-remove-btn" onClick={() => setRouteRows(routeRows.filter(r => r.id !== row.id))}>Remove</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 6. ATTACHED HOUSE */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("house")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-home"></i></div> Attached House
                    </span>
                    <i className={`bx ${openSections.house ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.house && (
                    <div className="bk-section-body">
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

            {/* 7. PACKING DETAILS */}
            <div className="bk-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("packing")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-box"></i></div> Packing Details
                    </span>
                    <i className={`bx ${openSections.packing ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.packing && (
                    <div className="bk-section-body">
                        <div className="bk-dynamic-table-wrapper">
                            <table className="bk-dynamic-table">
                                <thead>
                                    <tr>
                                        <th>Description</th><th>Commodity</th><th>Packages</th><th>Gross Weight</th><th>Volume</th><th>Chargeable Weight</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colSpan="7" className="text-center py-4 text-muted">No packing details available</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                <button className="btn-secondary-custom" onClick={() => setView("table")}>Back</button>
                <button className="btn-primary-custom" style={{backgroundColor: "#00b5ff", borderColor: "#00b5ff"}}>Create</button>
            </div>
        </div>
    );
};

export default SeaImportConsol;
