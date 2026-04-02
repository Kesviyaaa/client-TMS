import React, { useState, useEffect, useRef } from "react";
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
        shipmentNumber: "SIS-001",
        bookingNumber: "SIB-101",
        quotationNumber: "SIQ-201",
        shipmentDate: "2026-03-20",
        consolType: "Direct",
        cargoType: "General",
        shipper: "Import Corp",
        consignee: "Local Distributors",
    },
];

const SeaImportShipment = ({ initialView = "table" }) => {
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
        cargo: true,
        chargeSheet: true,
    });

    const [formData, setFormData] = useState({
        // Basic Info
        shipmentDate: "", bookingNumber: "", consolType: "", cargoType: "",
        // Handler Details
        shipper: "", consignee: "", customer: "",
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
                { data: "shipmentNumber", title: "Shipment No", responsivePriority: 1 },
                { data: "bookingNumber", title: "Booking No", responsivePriority: 2 },
                { data: "quotationNumber", title: "Quotation No", responsivePriority: 3 },
                { data: "shipmentDate", title: "Date", responsivePriority: 4 },
                { data: "consolType", title: "Consol Type", responsivePriority: 5 },
                { data: "cargoType", title: "Cargo Type", responsivePriority: 100 },
                { data: "shipper", title: "Shipper", responsivePriority: 100 },
                { data: "consignee", title: "Consignee", responsivePriority: 100 },
                {
                    data: null,
                    title: "Actions",
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

                <h4 className="table-title mb-4">Sea Import Shipments</h4>

                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Shipment List
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
                            <h5 className="modal-title">Details of {selectedRow.shipmentNumber}</h5>
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

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0" style={{ color: "#566a7f", fontSize: "1.125rem", fontWeight: 600 }}>Shipment Details</h5>
                <button className="btn-secondary-custom" onClick={() => setView("table")}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            {/* Basic Info */}
            <div className="qt-section-card">
                <div className="bk-section-header" onClick={() => toggleSection("basic")}>
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Basic Info
                    </span>
                    <i className={`bx ${openSections.basic ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                </div>
                {openSections.basic && (
                    <div className="qt-section-body p-3">
                        <div className="row g-3">
                            <div className="col-md-3"><label className="qt-label">Shipment Date</label><input type="date" className="qt-input" /></div>
                            <div className="col-md-3"><label className="qt-label">Consol Type</label><select className="qt-input"><option>Select</option></select></div>
                        </div>
                    </div>
                )}
            </div>
            {/* Additional sections can be added here as needed */}
        </div>
    );
};

export default SeaImportShipment;
