import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-responsive";
import "datatables.net-responsive-bs5";

import "datatables.net-buttons";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.colVis";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs;

import "../../css/carrier.css";

const ShippingLineMaster = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dt1 = useRef(null);
    const dt2 = useRef(null);

    const [view, setView] = useState("table"); // table | form
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        alias: "",
        scac: "",
        shortName: "",
        accountNo: "",
        homepage: "",
        tracking: "",
        blFormat: "",
        nvocc: false,
        status: "Active"
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const switchToForm = () => {
        if (dt1.current) {
            dt1.current.destroy(true);
            dt1.current = null;
        }
        if (dt2.current) {
            dt2.current.destroy(true);
            dt2.current = null;
        }
        setView("form");
    };

    const switchToTable = () => {
        setView("table");
    };

    /* ───────────── DATATABLE INIT ───────────── */
    useEffect(() => {
        if (view !== "table" || !tableRef1.current || !tableRef2.current) return;
        if (dt1.current || dt2.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        const domLayout =
            "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
            "<'row px-3'<'col-sm-12'tr>>" +
            "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>";

        const commonButtons = [
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
                columns: ":not(.no-export)",
            },
        ];

        // ── Table 1: Shipping Line Master Details ──
        dt1.current = $(tableRef1.current).DataTable({
            dom: domLayout,
            responsive: true,
            data: [],
            buttons: commonButtons,
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "name", title: "Shipping Line Name" },
                { data: "scac", title: "SCAC Code" },
                { data: "shortName", title: "Short Name" },
                { data: "nvocc", title: "NVOCC", render: d => d ? "Yes" : "No" },
                {
                    data: "status",
                    title: "Status",
                    render: (d) =>
                        `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"
                        }">${d || "Active"}</span>`,
                },
                {
                    data: null,
                    title: "View",
                    className: "text-center no-export",
                    render: () =>
                        `<div class="d-flex align-items-center justify-content-center gap-2">
                             <i class="bx bx-show view-btn text-info cursor-pointer" title="View" style="font-size: 18px;"></i>
                         </div>`,
                },
            ],
        });

        // ── Table 2: Shipping Line Client Details ──
        dt2.current = $(tableRef2.current).DataTable({
            dom: domLayout,
            responsive: true,
            data: [],
            buttons: commonButtons,
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "name", title: "Shipping Line Name" },
                { data: "status", title: "Status" },
                {
                    data: null,
                    title: "Edit",
                    className: "text-center no-export",
                    render: () =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-btn text-primary cursor-pointer" title="Edit" style="font-size: 18px;"></i></div>`,
                },
                {
                    data: null,
                    title: "Remove",
                    className: "text-center no-export",
                    render: () =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-trash remove-btn text-danger cursor-pointer" title="Remove" style="font-size: 18px;"></i></div>`,
                },
            ],
        });

        $(tableRef1.current).on("click", ".view-btn", function () {
            const row = dt1.current.row($(this).parents("tr")).data();
            setSelectedRow(row || { name: "Example Line", scac: "MAEU", status: "Active" });
            setModalTitle("Shipping Line Details");
            setShowDetailsModal(true);
        });

        return () => {
            if (dt1.current) dt1.current.destroy(true);
            if (dt2.current) dt2.current.destroy(true);
            dt1.current = null;
            dt2.current = null;
        };
    }, [view]);

    /* ════════════════════════════════════════════════════
       RENDER — TABLE VIEW
    ════════════════════════════════════════════════════ */
    const renderTableView = () => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="title-section">
                    <h4 className="table-title">Shipping Line Master</h4>
                </div>
            </div>

            {/* Card 1 */}
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Shipping Line Master Details
                    </span>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef1} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* Card 2 */}
            <div className="ocean-card mt-4">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-user"></i></div> Shipping Line Details
                    </span>
                    <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={switchToForm}>
                        <i className="bx bx-plus"></i> Create
                    </button>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef2} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedRow && (
                <div className="custom-modal-backdrop" onClick={(e) => { if(e.target === e.currentTarget) setShowDetailsModal(false); }}>
                    <div className="custom-modal-card">
                        <button className="custom-close" onClick={() => setShowDetailsModal(false)}>×</button>
                        <h5 className="modal-title">{modalTitle}</h5>
                        <hr className="modal-divider" />
                        <table className="table table-sm">
                            <tbody>
                                <tr><td><strong>Shipping Line:</strong></td><td>{selectedRow.name}</td></tr>
                                <tr><td><strong>SCAC:</strong></td><td>{selectedRow.scac}</td></tr>
                                <tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    /* ════════════════════════════════════════════════════
       RENDER — FORM VIEW
    ════════════════════════════════════════════════════ */
    const renderFormView = () => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="table-title mb-0">Shipping Line Details</h4>
            </div>

            <div className="card p-0 shadow-none border">
                <div className="card-body p-4">
                    <h5 className="mb-4" style={{ color: "#50a9e9", fontWeight: 600 }}>Create Shipping Line</h5>

                    <div className="row g-4 mb-2">
                        <div className="col-md-5">
                            <label className="qt-label">ShippingLine Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control qt-input" placeholder="Enter ShippingLine Name" value={formData.name} name="name" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="group-section">
                        <span className="group-label">General Information</span>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="qt-label">Alias</label>
                                <input type="text" className="form-control qt-input" placeholder="Alias" value={formData.alias} name="alias" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">SCAC <span className="text-danger">*</span></label>
                                <input type="text" className="form-control qt-input" placeholder="SCAC Code" value={formData.scac} name="scac" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Short Name <span className="text-danger">*</span></label>
                                <input type="text" className="form-control qt-input" placeholder="Short Name" value={formData.shortName} name="shortName" onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="group-section">
                        <span className="group-label">Links & Tracking</span>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="qt-label">Account Number</label>
                                <input type="text" className="form-control qt-input" placeholder="Account No" value={formData.accountNo} name="accountNo" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Home Page URL</label>
                                <input type="text" className="form-control qt-input" placeholder="https://example.com" value={formData.homepage} name="homepage" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Tracking URL</label>
                                <input type="text" className="form-control qt-input" placeholder="https://tracking.com" value={formData.tracking} name="tracking" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">BL Format</label>
                                <input type="text" className="form-control qt-input" placeholder="BL Format" value={formData.blFormat} name="blFormat" onChange={handleChange} />
                            </div>
                            <div className="col-md-4 d-flex align-items-center mt-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="nvocc" name="nvocc" checked={formData.nvocc} onChange={handleChange} />
                                    <label className="form-check-label fw-bold" htmlFor="nvocc" style={{ fontSize: "14px", color: "#566a7f" }}>NVOCC</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-md-12">
                            <label className="qt-label d-block mb-2">Status</label>
                            <div className="d-flex gap-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="status" id="stActive" value="Active" checked={formData.status === "Active"} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="stActive">Active</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="status" id="stInactive" value="Inactive" checked={formData.status === "Inactive"} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="stInactive">Inactive</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                        <button className="btn-secondary-custom" onClick={switchToTable}>
                            Cancel
                        </button>
                        <button className="btn-primary-custom" onClick={() => { switchToTable(); }}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <React.Fragment>
            {view === "table" ? renderTableView() : renderFormView()}
        </React.Fragment>
    );
};

export default ShippingLineMaster;