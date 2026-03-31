import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";

// Dummy Data
const dummyShipments = [
    {
        _id: "1",
        shipmentNumber: "SHP-001",
        bookingNumber: "BK-101",
        quotationNumber: "QTN-201",
        shipmentDate: "2026-03-20",
        consolType: "Direct",
        cargoType: "General",
        shipper: "Global Trades Ltd",
        consignee: "Oceanic Solutions",
    },
    {
        _id: "2",
        shipmentNumber: "SHP-002",
        bookingNumber: "BK-102",
        quotationNumber: "QTN-202",
        shipmentDate: "2026-03-21",
        consolType: "Consol",
        cargoType: "Hazardous",
        shipper: "Tech Movers",
        consignee: "Safe Logistics",
    },
];

const Shipment = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const openedRowRef = useRef(null);
    const [view, setView] = useState(initialView);
    const [shipments, setShipments] = useState(dummyShipments);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [openSections, setOpenSections] = useState({
        basic: true,
        handler: false,
        shipping: false,
        consol: false,
        coload: false,
        other: false,
        route: false,
        cargo: false,
        chargeSheet: true,
    });

    const [formData, setFormData] = useState({
        // Basic Info
        shipmentDate: "",
        bookingNumber: "",
        bookingThrough: "",
        quotationNo: "",
        consolType: "",
        bookingJobOwner: "",
        docUser: "",
        cargoType: "",
        documentMode: "",
        // Handler Details
        shipper: "", consignee: "", customer: "", originAgent: "",
        destinationAgent: "", notify: "", consignedToBank: "", sellingAgent: "",
        masterShipper: "", masterConsignee: "", secondNotify: "", thirdNotify: "",
        transporter: "", customsBroker: "", shipTo: "", bookingParty: "",
        seller: "", importer: "", buyer: "", actualShipper: "", actualConsignee: "",
        certifier: "", consolidator: "", stuffingLocation: "", isfFiler: "",
        // Shipping Details
        ownHouse: false, hawbNo: "", executionPlace: "",
        // Consol Detail
        consolidateAt: "", consolNo: "", awbNo: "",
        placeOfExec: "",
        // Co-Load
        coLoadType: "", agentName: "", agentAwbNo: "",
        // Other Details
        shippersRef: "", consigneesRef: "", salesPerson: "", businessDims: "",
        movementType: "", origin: "", placeOfReceipt: "", loadingPort: "",
        dischargePort: "", placeOfDelivery: "", destination: "", tradeLane: "",
        airlineName: "", flightNo: "", incoTerms: "", freightCurrency: "",
        freight: "", otherCharge: "",
        // Route Details
        transportMode: "", type: "", from: "", to: "",
        etaDept: "", etd: "", etaDest: "", atd: "", ataDest: "", remarks: "",
        // Cargo Details
        description: "", packages: 0, packageUnit: "", innerPkgs: 0, innerPkgUnit: "",
        grossWt: 0, grossWtUnit: "", netWt: 0, netWtUnit: "",
        dimension: "", volume: 0, volumeUnit: "", commodity: "", commodityType: "",
        humidity: "", hsCode: "", volumeWt: 0, chargeableWt: 0, chargeableWtUnit: "",
    });

    const [revenueEntries, setRevenueEntries] = useState([]);
    const [costEntries, setCostEntries] = useState([]);

    /* ───── DataTable init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
        if (dtRef.current) {
            dtRef.current.destroy();
        }

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "t" +
                "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",
            scrollY: "350px",
            scrollCollapse: true,
            scrollX: false,
            paging: true,
            responsive: true,
            language: { lengthMenu: "Show _MENU_ Entries" },
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    dropIcon: false,
                    buttons: ["print", "copy", "excel", "pdf"],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    dropIcon: false,
                    className: "custom-colvis",
                },
            ],
            data: shipments,
            columns: [
                { data: "shipmentNumber", responsivePriority: 1 },
                { data: "bookingNumber", responsivePriority: 2 },
                { data: "quotationNumber", responsivePriority: 3 },
                { data: "shipmentDate", responsivePriority: 4 },
                { data: "consolType", responsivePriority: 5 },
                { data: "cargoType", responsivePriority: 100 },
                { data: "shipper", responsivePriority: 100 },
                { data: "consignee", responsivePriority: 100 },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    responsivePriority: 1,
                    render: (data) => `
            <div class="d-flex gap-2">
              <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}"></i>
              <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}"></i>
            </div>
          `,
                },
            ],
        });

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
            const id = $(this).data("id");
            const rowData = shipments.find(s => s._id == id);
            if (rowData) {
                setFormData(prev => ({ ...prev, ...rowData }));
                setView("form");
            }
        });

        table.on("click", ".delete-icon", function () {
            const id = $(this).data("id");
            setDeleteId(id);
            setShowDeleteModal(true);
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [view, shipments]);

    const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card">
                    <div className="datatable-toolbar d-flex justify-content-between align-items-middle p-3">
                        <h5 className="table-title mb-0">AE Shipments</h5>
                        <button className="btn-primary-custom" onClick={() => setView("form")}>
                            <i className="bx bx-plus"></i> Create Shipment
                        </button>
                    </div>
                    <div className="card-datatable p-3">
                        <div className="table-responsive">
                            <table ref={tableRef} className="table dataTable dtr-inline shadow-none" style={{ width: "100%" }}>
                                <thead>
                                    <tr>
                                        <th>Shipment</th>
                                        <th>Booking</th>
                                        <th>Quotation</th>
                                        <th>Date</th>
                                        <th>Consol Type</th>
                                        <th>Cargo Type</th>
                                        <th>Shipper</th>
                                        <th>Consignee</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Details Modal */}
                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop">
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

                            <h5 className="modal-title">
                                Details of {selectedRow.shipmentNumber}
                            </h5>

                            <hr className="modal-divider" />

                            <table className="table table-sm">
                                <tbody>
                                    <tr><td><strong>Shipment Number:</strong></td><td>{selectedRow.shipmentNumber}</td></tr>
                                    <tr><td><strong>Booking Number:</strong></td><td>{selectedRow.bookingNumber}</td></tr>
                                    <tr><td><strong>Quotation Number:</strong></td><td>{selectedRow.quotationNumber}</td></tr>
                                    <tr><td><strong>Shipment Date:</strong></td><td>{selectedRow.shipmentDate}</td></tr>
                                    <tr><td><strong>Consol Type:</strong></td><td>{selectedRow.consolType}</td></tr>
                                    <tr><td><strong>Cargo Type:</strong></td><td>{selectedRow.cargoType}</td></tr>
                                    <tr><td><strong>Shipper:</strong></td><td>{selectedRow.shipper}</td></tr>
                                    <tr><td><strong>Consignee:</strong></td><td>{selectedRow.consignee}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="custom-modal-backdrop">
                        <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                            <div className="text-center p-4">
                                <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                                <h4 className="mb-2">Are you sure?</h4>
                                <p className="text-muted mb-4">You want to delete this shipment? This action cannot be undone.</p>
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
                                            setShipments(prev => prev.filter(s => s._id !== deleteId));
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

    // ───── Form View ─────
    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0" style={{ fontWeight: "700", color: "#566a7f" }}>Shipment Details</h5>
                <button className="btn-secondary-custom" onClick={() => setView("table")}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            {/* 1. BASIC INFO */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("basic")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Basic Info
                    </span>
                    <i className={`bx ${openSections.basic ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.basic && (
                    <div className="qt-section-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="qt-label">Shipment Date</label>
                                <input type="date" className="form-field qt-input" value={formData.shipmentDate} onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Booking Number</label>
                                <select className="form-field qt-input"><option>-- Select Booking Number --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Booking Through</label>
                                <div className="d-flex gap-2">
                                    <select className="form-field qt-input"><option>-- Select Type --</option></select>
                                    <select className="form-field qt-input"><option>-- Select Agent --</option></select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Quotation No</label>
                                <select className="form-field qt-input"><option>-- Select Quotation --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Consol Type <span className="text-danger">*</span></label>
                                <select className="form-field qt-input"><option>-- Select Consol Type --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Booking Job Owner</label>
                                <select className="form-field qt-input"><option>-- Select Job Owner --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Doc User</label>
                                <select className="form-field qt-input"><option>-- Select Doc User --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Cargo Type <span className="text-danger">*</span></label>
                                <select className="form-field qt-input"><option>-- Select Cargo Type --</option></select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Document Mode</label>
                                <select className="form-field qt-input"><option>-- Select Document Mode --</option></select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. HANDLER DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("handler")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details
                    </span>
                    <i className={`bx ${openSections.handler ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.handler && (
                    <div className="qt-section-body">
                        <div className="row g-3">
                            {[
                                "Shipper", "Consignee", "Customer", "Origin Agent",
                                "Destination Agent", "Notify", "Consigned to Bank", "Selling Agent",
                                "Master Shipper", "Master Consignee", "Second Notify", "Third Notify",
                                "Transporter", "Customs Broker", "Ship To", "Booking Party",
                                "Seller", "Importer", "Buyer", "Actual Shipper",
                                "Actual Consignee", "Certifier", "Consolidator", "Stuffing Location"
                            ].map(label => (
                                <div className="col-md-3" key={label}>
                                    <label className="qt-label">{label}</label>
                                    <div className="d-flex align-items-center gap-1">
                                        <select className="form-field qt-input"><option>-- Select --</option></select>
                                        {["Shipper", "Consignee", "Customer", "Origin Agent", "Destination Agent"].includes(label) && (
                                            <i className="bx bx-plus-circle text-primary cursor-pointer fs-5"></i>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="col-md-3">
                                <label className="qt-label">ISF Filer</label>
                                <select className="form-field qt-input"><option>-- Select --</option></select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. SHIPPING DETAILS (Parent) */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("shipping")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Shipping Details
                    </span>
                    <i className={`bx ${openSections.shipping ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.shipping && (
                    <div className="qt-section-body">
                        <div className="row g-3 mb-4 align-items-end">
                            <div className="col-md-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="ownHouse" />
                                    <label className="form-check-label qt-label" htmlFor="ownHouse">Own House</label>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">HAWB No</label>
                                <div className="d-flex gap-2">
                                    <input type="text" className="form-field qt-input" placeholder="No" />
                                    <input type="date" className="form-field qt-input" />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Execution Place</label>
                                <div className="d-flex gap-2">
                                    <input type="text" className="form-field qt-input" placeholder="Place" />
                                    <input type="date" className="form-field qt-input" />
                                </div>
                            </div>
                        </div>

                        {/* Sub-section: CONSOL DETAIL */}
                        <div className="bk-section-card mb-3" style={{ boxShadow: "none", border: "1px solid #eef0f2" }}>
                            <div className="bk-section-header py-2 px-3" style={{ background: "#f8f9fa", minHeight: "auto" }}>
                                <span className="bk-section-title" style={{ fontSize: "14px", color: "#3b5998" }}>Consol Detail</span>
                            </div>
                            <div className="qt-section-body p-3">
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-3">
                                        <label className="qt-label">Consolidate At</label>
                                        <div className="d-flex align-items-center gap-1">
                                            <select className="form-field qt-input"><option>-- Select --</option></select>
                                            <i className="bx bx-plus-circle text-primary cursor-pointer fs-5"></i>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="qt-label">Consol No</label>
                                        <div className="d-flex gap-2">
                                            <input type="text" className="form-field qt-input" placeholder="No" />
                                            <input type="date" className="form-field qt-input" />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="qt-label">AWB No</label>
                                        <div className="d-flex gap-2">
                                            <input type="text" className="form-field qt-input" placeholder="No" />
                                            <input type="date" className="form-field qt-input" />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="qt-label">Place Of Exec</label>
                                        <div className="d-flex gap-2">
                                            <input type="text" className="form-field qt-input" placeholder="Place" />
                                            <input type="date" className="form-field qt-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub-section: CO-LOAD */}
                        <div className="bk-section-card mb-3" style={{ boxShadow: "none", border: "1px solid #eef0f2" }}>
                            <div className="bk-section-header py-2 px-3" style={{ background: "#f8f9fa", minHeight: "auto" }}>
                                <span className="bk-section-title" style={{ fontSize: "14px", color: "#3b5998" }}>Co-Load</span>
                            </div>
                            <div className="qt-section-body p-3">
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-4">
                                        <label className="qt-label">Co-Load Type</label>
                                        <select className="form-field qt-input"><option>-- Select --</option></select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="qt-label">Agent Name</label>
                                        <div className="d-flex align-items-center gap-1">
                                            <select className="form-field qt-input"><option>-- Select --</option></select>
                                            <i className="bx bx-plus-circle text-primary cursor-pointer fs-5"></i>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="qt-label">Agent AWB No</label>
                                        <div className="d-flex gap-2">
                                            <input type="text" className="form-field qt-input" placeholder="No" />
                                            <input type="date" className="form-field qt-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub-section: OTHER DETAILS */}
                        <div className="bk-section-card" style={{ boxShadow: "none", border: "1px solid #eef0f2" }}>
                            <div className="bk-section-header py-2 px-3" style={{ background: "#f8f9fa", minHeight: "auto" }}>
                                <span className="bk-section-title" style={{ fontSize: "14px", color: "#3b5998" }}>Other Details</span>
                            </div>
                            <div className="qt-section-body p-3">
                                <div className="row g-3">
                                    {[
                                        { label: "Shipper's Ref", type: "input" },
                                        { label: "Consignee's Ref", type: "input" },
                                        { label: "Sales Person", type: "select" },
                                        { label: "Business Dims.", type: "input" },
                                        { label: "Movement Type", type: "select" },
                                        { label: "Origin", type: "select", add: true },
                                        { label: "Place Of Receipt", type: "select", add: true },
                                        { label: "Loading Port", type: "select", add: true },
                                        { label: "Discharge Port", type: "select", add: true },
                                        { label: "Place Of Delivery", type: "select", add: true },
                                        { label: "Destination", type: "select", add: true },
                                        { label: "Trade Lane", type: "select" },
                                    ].map(item => (
                                        <div className="col-md-3" key={item.label}>
                                            <label className="qt-label">{item.label}</label>
                                            <div className="d-flex align-items-center gap-1">
                                                {item.type === "select" ? (
                                                    <select className="form-field qt-input"><option>-- Select --</option></select>
                                                ) : (
                                                    <input type="text" className="form-field qt-input" />
                                                )}
                                                {item.add && <i className="bx bx-plus-circle text-primary cursor-pointer fs-5"></i>}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="col-md-3">
                                        <label className="qt-label">Airline Name</label>
                                        <div className="d-flex gap-1 align-items-center">
                                            <input type="text" className="form-field qt-input w-25" placeholder="Code" />
                                            <select className="form-field qt-input w-75"><option>-- Select --</option></select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="qt-label">Flight No</label>
                                        <div className="d-flex gap-1">
                                            <input type="text" className="form-field qt-input w-50" placeholder="No" />
                                            <input type="date" className="form-field qt-input w-50" />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="qt-label">IncoTerms</label>
                                        <select className="form-field qt-input"><option>-- Select --</option></select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="qt-label">Freight Currency</label>
                                        <select className="form-field qt-input"><option>-- Select --</option></select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 7. ROUTE DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("route")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-map-alt"></i></div> Route Details
                    </span>
                    <i className={`bx ${openSections.route ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.route && (
                    <div className="qt-section-body">
                        <div className="row g-3">
                            {[
                                { label: "Transport Mode", type: "select" },
                                { label: "Type", type: "input" },
                                { label: "From", type: "select" },
                                { label: "To", type: "select" },
                            ].map(item => (
                                <div className="col-md-3" key={item.label}>
                                    <label className="qt-label">{item.label}</label>
                                    {item.type === "select" ? (
                                        <select className="form-field qt-input"><option>-- Select --</option></select>
                                    ) : (
                                        <input type="text" className="form-field qt-input" />
                                    )}
                                </div>
                            ))}
                            {[
                                { label: "ETA (Dept)", type: "date-time" },
                                { label: "ETD", type: "date-time" },
                                { label: "ETA (Dest)", type: "date-time" },
                                { label: "ATD", type: "date-time" },
                            ].map(item => (
                                <div className="col-md-3" key={item.label}>
                                    <label className="qt-label">{item.label}</label>
                                    <div className="d-flex gap-1">
                                        <input type="date" className="form-field qt-input w-50" />
                                        <input type="time" className="form-field qt-input w-50" />
                                    </div>
                                </div>
                            ))}
                            <div className="col-md-3">
                                <label className="qt-label">ATA (Dest)</label>
                                <div className="d-flex gap-1">
                                    <input type="date" className="form-field qt-input w-50" />
                                    <input type="time" className="form-field qt-input w-50" />
                                </div>
                            </div>
                            <div className="col-md-9">
                                <label className="qt-label">Remarks</label>
                                <textarea className="form-field qt-input" rows="1"></textarea>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 8. CARGO DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("cargo")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-box"></i></div> Cargo Details
                    </span>
                    <i className={`bx ${openSections.cargo ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.cargo && (
                    <div className="qt-section-body">
                        <div className="row g-3">
                            <div className="col-md-12">
                                <label className="qt-label">Description</label>
                                <textarea className="form-field qt-input" rows="1"></textarea>
                            </div>
                            {[
                                { label: "Packages", type: "unit" },
                                { label: "Inner Pkgs", type: "unit" },
                                { label: "Gross Wt", type: "unit" },
                                { label: "Net Wt", type: "unit" },
                                { label: "Dimension (L*B*H)", type: "input-triple" },
                                { label: "Volume", type: "unit" },
                            ].map(item => (
                                <div className="col-md-3" key={item.label}>
                                    <label className="qt-label">{item.label}</label>
                                    {item.type === "unit" ? (
                                        <div className="d-flex gap-1">
                                            <input type="number" className="form-field qt-input w-50" defaultValue="0.000" />
                                            <select className="form-field qt-input w-50"><option>Select Unit</option></select>
                                        </div>
                                    ) : (
                                        <div className="d-flex gap-1">
                                            <input type="text" className="form-field qt-input w-25" defaultValue="0.000" />
                                            <span className="mt-2">x</span>
                                            <input type="text" className="form-field qt-input w-25" defaultValue="0.000" />
                                            <span className="mt-2">x</span>
                                            <input type="text" className="form-field qt-input w-25" defaultValue="0.000" />
                                            <select className="form-field qt-input w-25 px-1"><option>Select</option></select>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {[
                                { label: "Commodity", type: "select" },
                                { label: "Commodity Type", type: "select" },
                                { label: "Humidity (%)", type: "input" },
                                { label: "HS Code", type: "input" },
                                { label: "Volume Wt", type: "input" },
                                { label: "Chargeable Wt", type: "unit" },
                            ].map(item => (
                                <div className="col-md-3" key={item.label}>
                                    <label className="qt-label">{item.label}</label>
                                    {item.type === "select" ? (
                                        <select className="form-field qt-input"><option>-- Select --</option></select>
                                    ) : item.type === "unit" ? (
                                        <div className="d-flex gap-1">
                                            <input type="number" className="form-field qt-input w-50" defaultValue="0.000" />
                                            <select className="form-field qt-input w-50"><option>-- Select Unit --</option></select>
                                        </div>
                                    ) : (
                                        <input type="text" className="form-field qt-input" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 9. CHARGE SHEET DETAILS */}
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
                                                <tr><td colSpan="5" className="text-center py-3 text-muted">No entries</td></tr>
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
                                                <tr><td colSpan="5" className="text-center py-3 text-muted">No entries</td></tr>
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

            <div className="d-flex justify-content-end gap-2 mt-4 mb-5">
                <button className="btn-secondary-custom px-4" onClick={() => setView("table")}>
                    Cancel
                </button>
                <button className="btn-primary-custom px-4">
                    Save
                </button>
            </div>
        </div>
    );
};

export default Shipment;
