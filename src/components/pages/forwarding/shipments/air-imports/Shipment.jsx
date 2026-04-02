import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";

import "../../../../../App.css";
import "../../../../css/forwarding.css";

// Dummy Data
const dummyShipments = [
    {
        _id: "1",
        consolNo: "AIC-1001",
        consolDate: "2026-03-20",
        consolType: "Direct",
        consolOwner: "John Doe",
        status: "Active",
    },
    {
        _id: "2",
        consolNo: "AIC-1002",
        consolDate: "2026-03-21",
        consolType: "Consol",
        consolOwner: "Jane Smith",
        status: "Closed",
    },
];

const AirImportShipment = ({ initialView = "table" }) => {
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
        handler: true,
        shipping: true,
        other: true,
        cargo: true,
        chargeSheet: true,
    });

    const [formData, setFormData] = useState({
        // Basic Info
        shipmentDate: "", bookingNumber: "", bookingThrough: "", bookingThroughAgent: "",
        quotationNo: "", consolType: "", deliveryMode: "", bookingJobOwner: "",
        docUser: "", cargoType: "", documentMode: "",
        // Handler Details
        shipper: "", consignee: "", customer: "", originAgent: "",
        destinationAgent: "", notify: "", consignedToBank: "", sellingAgent: "",
        masterShipper: "", masterConsignee: "", secondNotify: "", thirdNotify: "",
        transporter: "", customsBroker: "", shipTo: "", bookingParty: "",
        seller: "", importer: "", buyer: "", actualShipper: "", actualConsignee: "",
        certifier: "", consolidator: "", stuffingLocation: "", isfFiler: "", highAirSeller: "",
        // Shipping Details
        hawbNo: "", executionPlaceName: "", executionPlaceDate: "",
        // Other Details
        sawbNo: "", shippersRef: "", salesPerson: "", poConRefNo: "",
        businessDims: "", amsHawbNo: "", agentAwbNo: "", lastFreeDate: "",
        soDate: "", partOfShipment: "", movementType: "", origin: "",
        placeOfReceipt: "", loadingPort: "", dischargePort: "", placeOfDelivery: "",
        destination: "", tradeLane: "", airlineName: "", flightNo: "", flightDate: "",
        incoTerms: "", freight: "", coLoadType: "", agentName: "",
        agentAwbNoOther: "", agentAwbDateOther: "", remarks: "",
        // Cargo Details
        description: "", packages: 0, packageUnit: "", innerPkgs: 0, innerPkgUnit: "",
        grossWt: 0, grossWtUnit: "", netWt: 0, netWtUnit: "",
        dimensionL: 0, dimensionB: 0, dimensionH: 0, dimensionUnit: "",
        volume: 0, volumeUnit: "", commodity: "", commodityType: "",
        humidity: "", hsCode: "", volumeWt: 0, chargeableWt: 0, chargeableWtUnit: "",
    });

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
                    autoClose: true,
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
                { data: "consolNo", title: "Consol No", responsivePriority: 1 },
                { data: "consolDate", title: "Consol Date", responsivePriority: 2 },
                { data: "consolType", title: "Consol Type", responsivePriority: 3 },
                { data: "consolOwner", title: "Consol Owner", responsivePriority: 4 },
                {
                    data: "status",
                    title: "Status",
                    responsivePriority: 5,
                    render: (d) => `<span class="status-badge bg-label-${d === 'Active' ? 'success' : 'danger'}">${d}</span>`
                },
                {
                    data: null,
                    title: "Edit",
                    orderable: false,
                    searchable: false,
                    responsivePriority: 1,
                    render: (data) => `
                        <div class="d-flex align-items-center gap-2">
                            <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}"></i>
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
            switchToForm();
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [view, shipments]);

    const switchToForm = () => {
        if (dtRef.current) {
            dtRef.current.destroy();
            dtRef.current = null;
        }
        setView("form");
    };

    const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    if (view === "table") {
        return (
            <div className="container-xxl container-p-y pb-5">

                <h4 className="table-title mb-4">AI Shipments</h4>

                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bxs-plane-land"></i></div> Shipment List
                        </span>
                        <button className="btn-primary-custom" onClick={switchToForm}>
                            <i className="bx bx-plus"></i> Create Shipment
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
                <h5 className="bk-form-heading mb-0" style={{ color: "#566a7f", fontSize: "1.125rem", fontWeight: 600 }}>Air Import Shipment Details</h5>
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
                            <div className="col-md-3"><label className="qt-label">Shipment Date</label><input type="date" className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Booking Number</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Booking Through</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Booking Through Agent</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Quotation No</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Consol Type <span className="text-danger">*</span></label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Delivery Mode</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Booking Job Owner</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Doc User</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Cargo Type <span className="text-danger">*</span></label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Document Mode</label><select className="qt-input"><option>-- Select --</option></select></div>
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
                                "Actual Consignee", "Certifier", "Consolidator", "Stuffing Location",
                                "ISF Filer", "High Air Seller"
                            ].map(label => (
                                <div className="col-md-3 mb-2" key={label}>
                                    <label className="qt-label">{label}</label>
                                    <select className="qt-input"><option>-- Select --</option></select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. SHIPPING DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("shipping")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Shipping Details
                    </span>
                    <i className={`bx ${openSections.shipping ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.shipping && (
                    <div className="qt-section-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="qt-label">HAWB No</label>
                                <input className="qt-input" type="text" />
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Execution Place</label>
                                <select className="qt-input"><option>-- Select --</option></select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. OTHER DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("other")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-list-ul"></i></div> Other Details
                    </span>
                    <i className={`bx ${openSections.other ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.other && (
                    <div className="qt-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">SAWB No</label><input className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Shipper's Ref</label><input className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Sales Person</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">PO/Con Ref No</label><input className="qt-input" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Business Dims.</label><input className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">AMS HAWB No</label><input className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Agent AWB No</label><input className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Last Free Date</label><input type="date" className="qt-input" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">S.O. Date</label><input type="date" className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Part of Shipment</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Movement Type</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Origin</label><select className="qt-input"><option>-- Select --</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Place of Receipt <span className="text-danger">*</span></label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Loading Port <span className="text-danger">*</span></label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Discharge Port <span className="text-danger">*</span></label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Place of Delivery <span className="text-danger">*</span></label><select className="qt-input"><option>-- Select --</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Destination</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Trade Lane</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Airline Name</label><div className="d-flex gap-1"><input className="qt-input w-25" /><select className="qt-input w-75"><option>-- Select --</option></select></div></div>
                            <div className="col-md-3"><label className="qt-label">Flight No</label><input className="qt-input" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Flight Date</label><input type="date" className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">IncoTerms</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Freight</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Co-Load Type</label><select className="qt-input"><option>-- Select --</option></select></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Agent Name</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Agent AWB No</label><input className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">AWB Date</label><input type="date" className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">AMS No.</label><input className="qt-input" /></div>
                        </div>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3"><label className="qt-label">B.D Date</label><input type="date" className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Last Free Date</label><input type="date" className="qt-input" /></div>
                            <div className="col-md-6"><label className="qt-label">Remarks</label><textarea className="qt-input" rows="1"></textarea></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. CARGO DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("cargo")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-box"></i></div> Cargo Details
                    </span>
                    <i className={`bx ${openSections.cargo ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.cargo && (
                    <div className="qt-section-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-12"><label className="qt-label">Description</label><textarea className="qt-input" rows="1"></textarea></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Packages</label><div className="d-flex gap-1"><input className="qt-input w-50" defaultValue="0" /><select className="qt-input w-50"><option>Unit</option></select></div></div>
                            <div className="col-md-3"><label className="qt-label">Inner Pkgs</label><div className="d-flex gap-1"><input className="qt-input w-50" defaultValue="0" /><select className="qt-input w-50"><option>Unit</option></select></div></div>
                            <div className="col-md-3"><label className="qt-label">Gross Wt</label><div className="d-flex gap-1"><input className="qt-input w-50" defaultValue="0.000" /><select className="qt-input w-50"><option>Unit</option></select></div></div>
                            <div className="col-md-3"><label className="qt-label">Net Wt</label><input className="qt-input" defaultValue="0.000" /></div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-3"><label className="qt-label">Dimension (L*B*H)</label><div className="d-flex gap-1 align-items-center"><input className="qt-input px-1 text-center" style={{ width: "20%" }} defaultValue="0.000" /><span>x</span><input className="qt-input px-1 text-center" style={{ width: "20%" }} defaultValue="0.000" /><span>x</span><input className="qt-input px-1 text-center" style={{ width: "20%" }} defaultValue="0.000" /><select className="qt-input w-25"><option>Unit</option></select></div></div>
                            <div className="col-md-3"><label className="qt-label">Volume</label><div className="d-flex gap-1"><input className="qt-input w-50" defaultValue="0.000" /><select className="qt-input w-50"><option>Unit</option></select></div></div>
                            <div className="col-md-3"><label className="qt-label">Commodity</label><select className="qt-input"><option>-- Select --</option></select></div>
                            <div className="col-md-3"><label className="qt-label">Commodity Type</label><select className="qt-input"><option>-- Select --</option></select></div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3"><label className="qt-label">Humidity (%)</label><input className="qt-input" defaultValue="0.00" /></div>
                            <div className="col-md-3"><label className="qt-label">HS Code</label><input className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Volume Wt</label><input className="qt-input" defaultValue="0.000" /></div>
                            <div className="col-md-3"><label className="qt-label">Chargeable Wt</label><div className="d-flex gap-1"><input className="qt-input w-50" defaultValue="0.000" /><select className="qt-input w-50"><option>Unit</option></select></div></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 6. CHARGE SHEET DETAILS */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("chargeSheet")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-dollar"></i></div> Charge Sheet Details
                    </span>
                    <i className={`bx ${openSections.chargeSheet ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.chargeSheet && (
                    <div className="qt-section-body">
                        <div className="d-flex justify-content-end mb-3">
                            <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 13 }}>Add $</button>
                        </div>
                        <div className="qt-summary-wrapper">
                            <div className="table-responsive">
                                <table className="table qt-summary-table align-middle">
                                    <thead>
                                        <tr>
                                            <th className="qt-sum-empty"></th><th className="qt-sum-empty"></th>
                                            <th colSpan={3} className="qt-sum-rev-head text-center">Revenue</th>
                                            <th colSpan={3} className="qt-sum-cost-head text-center border-start">Cost</th>
                                            <th className="qt-sum-empty"></th><th className="qt-sum-empty"></th><th className="qt-sum-empty"></th><th className="qt-sum-empty"></th>
                                        </tr>
                                        <tr>
                                            <th>Services</th><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Amount (HC)</th>
                                            <th className="border-start">Amount</th><th>Curr</th><th>Amount (HC)</th>
                                            <th className="border-start">Profit</th><th>Profit %</th><th>Edit</th><th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="qt-sum-total-row">
                                            <td></td><td className="qt-summary-total-label fw-bold">Total</td>
                                            <td>0.00</td><td></td><td className="fw-bold">0.00</td>
                                            <td className="border-start">0.00</td><td></td><td className="fw-bold">0.00</td>
                                            <td className="border-start fw-bold text-primary">0.00</td><td className="fw-bold text-primary">0%</td>
                                            <td></td><td></td>
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
    );
};

export default AirImportShipment;
