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

const AirlineMaster = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dt1 = useRef(null);
    const dt2 = useRef(null);

    const [view, setView] = useState("table"); // table | form
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");

    const [formData, setFormData] = useState({
        airlineName: "",
        intlCode: "",
        intlFormat: "",
        intlPrefix: "",
        intlCheckDigit: false,
        domCode: "",
        domFormat: "",
        domPrefix: "",
        domCheckDigit: false,
        accountNo: "",
        homepage: "",
        tracking: "",
        isIata: false,
        status: "Active",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
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

        // ── Table 1: Airline Master Details ──
        dt1.current = $(tableRef1.current).DataTable({
            dom: domLayout,
            responsive: true,
            data: [],
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
                    columns: ":not(.no-export)",
                },
            ],
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "airlineName", title: "Airline Name" },
                { data: "intlCode", title: "Intl Code" },
                { data: "intlPrefix", title: "Intl Prefix" },
                { data: "accountNo", title: "Account No" },
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

        // ── Table 2: Airline Client Details ──
        dt2.current = $(tableRef2.current).DataTable({
            dom: domLayout,
            responsive: true,
            data: [],
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
                    columns: ":not(.no-export)",
                },
            ],
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "airlineName", title: "Airline Name" },
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
            setSelectedRow(row || { airlineName: "Example Airline", intlCode: "EY", status: "Active" });
            setModalTitle("Airline Details");
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
                    <h4 className="table-title">Airline Master</h4>
                </div>
            </div>

            {/* Card 1 */}
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-plane"></i></div> Airline Master Details
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
                        <div className="bk-icon-circle"><i className="bx bx-user"></i></div> Airline Client Details
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
                                <tr><td><strong>Airline Name:</strong></td><td>{selectedRow.airlineName}</td></tr>
                                <tr><td><strong>Intl Code:</strong></td><td>{selectedRow.intlCode}</td></tr>
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
                <h4 className="table-title mb-0">Airline Details</h4>
            </div>

            <div className="card p-0 shadow-none border">
                <div className="card-body p-4">
                    <h5 className="mb-4" style={{ color: "#50a9e9", fontWeight: 600 }}>Create Airline</h5>

                    <div className="row g-4 mb-2">
                        <div className="col-md-5">
                            <label className="qt-label">Airline Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control qt-input" placeholder="Enter Airline Name" value={formData.airlineName} name="airlineName" onChange={handleChange} />
                        </div>
                    </div>

                    {/* INTERNATIONAL SECTION */}
                    <div className="group-section">
                        <span className="group-label">International</span>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="qt-label">Airline Code</label>
                                <input type="text" className="form-control qt-input" placeholder="Enter upto 5 characters" value={formData.intlCode} name="intlCode" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">AWB Format</label>
                                <select className="form-select qt-input" value={formData.intlFormat} name="intlFormat" onChange={handleChange}>
                                    <option value="">-- Select Format --</option>
                                    <option value="Format1">Format 1</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">AWB Prefix</label>
                                <input type="text" className="form-control qt-input" placeholder="Enter 3 characters" value={formData.intlPrefix} name="intlPrefix" onChange={handleChange} />
                            </div>
                            <div className="col-md-3 pb-2">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="intlCheckDigit" name="intlCheckDigit" checked={formData.intlCheckDigit} onChange={handleChange} />
                                    <label className="form-check-label fw-bold" htmlFor="intlCheckDigit" style={{ fontSize: "12px", color: "#566a7f" }}>Check Digit</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DOMESTIC SECTION */}
                    <div className="group-section">
                        <span className="group-label">Domestic</span>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="qt-label">Airline Code</label>
                                <input type="text" className="form-control qt-input" placeholder="Enter upto 5 characters" value={formData.domCode} name="domCode" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">AWB Format</label>
                                <select className="form-select qt-input" value={formData.domFormat} name="domFormat" onChange={handleChange}>
                                    <option value="">-- Select Format --</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">AWB Prefix</label>
                                <input type="text" className="form-control qt-input" placeholder="Enter 3 characters" value={formData.domPrefix} name="domPrefix" onChange={handleChange} />
                            </div>
                            <div className="col-md-3 pb-2">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="domCheckDigit" name="domCheckDigit" checked={formData.domCheckDigit} onChange={handleChange} />
                                    <label className="form-check-label fw-bold" htmlFor="domCheckDigit" style={{ fontSize: "12px", color: "#566a7f" }}>Check Digit</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OTHERS SECTION */}
                    <div className="group-section">
                        <span className="group-label">Others</span>
                        <div className="row g-4 align-items-end">
                            <div className="col-md-3">
                                <label className="qt-label">Account No</label>
                                <input type="text" className="form-control qt-input" placeholder="Account No" value={formData.accountNo} name="accountNo" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Home Page URL</label>
                                <input type="text" className="form-control qt-input" placeholder="Home Page URL" value={formData.homepage} name="homepage" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Tracking URL</label>
                                <input type="text" className="form-control qt-input" placeholder="Tracking URL" value={formData.tracking} name="tracking" onChange={handleChange} />
                            </div>
                            <div className="col-md-3 pb-2">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="isIata" name="isIata" checked={formData.isIata} onChange={handleChange} />
                                    <label className="form-check-label fw-bold" htmlFor="isIata" style={{ fontSize: "12px", color: "#566a7f" }}>IS IATA</label>
                                </div>
                            </div>

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

export default AirlineMaster;