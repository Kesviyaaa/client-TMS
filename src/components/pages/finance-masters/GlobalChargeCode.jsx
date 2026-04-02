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

import "../../../App.css";
import "../../css/finance.css";

const GlobalChargeCode = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dt1 = useRef(null);
    const dt2 = useRef(null);
    const openedRowRef1 = useRef(null);
    const openedRowRef2 = useRef(null);

    const [view, setView] = useState("table"); // table | form | view
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");

    const [formData, setFormData] = useState({
        chargeCode: "",
        chargeName: "",
        applicableFor: "",
        chargeCategory: "",
        chargeType: "",
        status: "Active"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const switchToForm = () => {
        if (dt1.current) dt1.current.destroy();
        if (dt2.current) dt2.current.destroy();
        dt1.current = null;
        dt2.current = null;
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
        ];

        // ── Table 1: Global Charge Code List ──
        dt1.current = $(tableRef1.current).DataTable({
            dom: domLayout,
            data: [],
            responsive: true,
            buttons: commonButtons,
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "chargeCode", title: "Charge Code", responsivePriority: 1 },
                { data: "chargeName", title: "Charge Name", responsivePriority: 2 },
                { data: "applicableFor", title: "Applicable For", responsivePriority: 3 },
                { data: "chargeCategory", title: "Charge Category", responsivePriority: 4 },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    render: d => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>`
                },
                {
                    data: null,
                    title: "View",
                    className: "text-center no-export",
                    orderable: false,
                    responsivePriority: 1,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-show view-btn text-info cursor-pointer" title="View" style="font-size: 18px;"></i></div>`
                }
            ]
        });

        // ── Table 2: Charge Code Directory ──
        dt2.current = $(tableRef2.current).DataTable({
            dom: domLayout,
            data: [],
            responsive: true,
            buttons: commonButtons,
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "chargeCode", title: "Charge Code", responsivePriority: 1 },
                { data: "chargeName", title: "Charge Name", responsivePriority: 2 },
                { data: "chargeType", title: "Charge Type", responsivePriority: 3 },
                {
                    data: null,
                    title: "Edit",
                    className: "text-center no-export",
                    orderable: false,
                    responsivePriority: 1,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-btn text-primary cursor-pointer" title="Edit" style="font-size: 18px;"></i></div>`
                },
                {
                    data: null,
                    title: "Remove",
                    className: "text-center no-export",
                    orderable: false,
                    responsivePriority: 1,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-trash remove-btn text-danger cursor-pointer" title="Remove" style="font-size: 18px;"></i></div>`
                }
            ]
        });

        const handleResponsiveDisplay = (e, datatable, row, showHide, modalTle) => {
            if (showHide) {
                if (datatable === dt1.current) openedRowRef1.current = row;
                else openedRowRef2.current = row;

                const rowData = row.table().row(row.index()).data();
                setSelectedRow(rowData || { chargeCode: "OC", chargeName: "Ocean Freight", applicableFor: "Sea Shipment", chargeCategory: "Freight", chargeType: "Standard", status: "Active" });
                setModalTitle(modalTle);
                setShowDetailsModal(true);
            }
        };

        dt1.current.on("responsive-display", (e, datatable, row, showHide) => handleResponsiveDisplay(e, datatable, row, showHide, "Charge Code Details"));
        dt2.current.on("responsive-display", (e, datatable, row, showHide) => handleResponsiveDisplay(e, datatable, row, showHide, "Charge Code Directory"));

        const handleActionClick = (dt, modalTle) => {
            $(dt.table().container()).on("click", ".view-btn", function () {
                const rowData = dt.row($(this).parents("tr")).data();
                setSelectedRow(rowData || { chargeCode: "OC", chargeName: "Ocean Freight", applicableFor: "Sea Shipment", chargeCategory: "Freight", chargeType: "Standard", status: "Active" });
                setModalTitle(modalTle);
                setShowDetailsModal(true);
            });
        };

        handleActionClick(dt1.current, "Charge Code Details");

        return () => {
            if (dt1.current) dt1.current.destroy();
            if (dt2.current) dt2.current.destroy();
            dt1.current = null;
            dt2.current = null;
        };
    }, [view]);

    const renderTableView = () => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">

            <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="title-section">
                    <h4 className="table-title mb-0">Global Charge Codes</h4>
                </div>
            </div>

            {/* CARD 1: GLOBAL LIST */}
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-money"></i></div> Global Charge Code List
                    </span>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef1} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* CARD 2: DIRECTORY */}
            <div className="ocean-card mt-4">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-folder"></i></div> Charge Code Directory
                    </span>
                    <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={switchToForm}>
                        <i className="bx bx-plus me-1"></i> Create
                    </button>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef2} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {showDetailsModal && selectedRow && (
                <div className="custom-modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        if (openedRowRef1.current) {
                            $(openedRowRef1.current.node()).find("td.dtr-control").trigger("click");
                            openedRowRef1.current = null;
                        }
                        if (openedRowRef2.current) {
                            $(openedRowRef2.current.node()).find("td.dtr-control").trigger("click");
                            openedRowRef2.current = null;
                        }
                        setShowDetailsModal(false);
                    }
                }}>
                    <div className="custom-modal-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 style={{ color: "#50a9e9", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>{modalTitle}: {selectedRow.chargeName}</h5>
                            <button type="button" onClick={() => {
                                if (openedRowRef1.current) {
                                    $(openedRowRef1.current.node()).find("td.dtr-control").trigger("click");
                                    openedRowRef1.current = null;
                                }
                                if (openedRowRef2.current) {
                                    $(openedRowRef2.current.node()).find("td.dtr-control").trigger("click");
                                    openedRowRef2.current = null;
                                }
                                setShowDetailsModal(false);
                            }} style={{ background: "none", border: "none", color: "#566a7f", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer", padding: 0 }}>&times;</button>
                        </div>
                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />
                        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                            <table className="table table-sm">
                                <tbody>
                                    {Object.entries(selectedRow).map(([k, v]) => (
                                        k !== "status" && <tr key={k}>
                                            <td style={{ width: "40%" }}><strong>{k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong></td>
                                            <td>{String(v || "N/A")}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td><strong>Status:</strong></td>
                                        <td><span className={`badge ${selectedRow.status === "Active" ? "bg-label-success" : "bg-label-secondary"}`}>{selectedRow.status || "Active"}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderFormView = (isView = false) => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="table-title mb-0">{isView ? "View Charge Code" : "Create Global Charge Code"}</h4>
            </div>

            <div className="card border-0 shadow-sm p-0 overflow-hidden">
                <div className="card-body p-4">
                    <h5 className="mb-4" style={{ color: "#50a9e9", fontWeight: 600 }}>
                        {isView ? "Charge Code Information" : "Charge Code Registration"}
                    </h5>

                    {/* IDENTITY */}
                    <div className="group-section">
                        <span className="group-label">Identification</span>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="qt-label">Charge Code <span className="text-danger">*</span></label>
                                <input className="form-control qt-input" placeholder="Enter Charge Code" name="chargeCode" value={formData.chargeCode} onChange={handleChange} disabled={isView} />
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Charge Name <span className="text-danger">*</span></label>
                                <input className="form-control qt-input" placeholder="Enter Charge Name" name="chargeName" value={formData.chargeName} onChange={handleChange} disabled={isView} />
                            </div>
                        </div>
                    </div>

                    {/* CATEGORY & TYPE */}
                    <div className="group-section">
                        <span className="group-label">Classification</span>
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="qt-label">Applicable For *</label>
                                <select className="form-select qt-input" name="applicableFor" value={formData.applicableFor} onChange={handleChange} disabled={isView}>
                                    <option value="">-- Select Applicable For --</option>
                                    <option value="Air Export">Air Export</option>
                                    <option value="Air Import">Air Import</option>
                                    <option value="Sea Export">Sea Export</option>
                                    <option value="Sea Import">Sea Import</option>
                                    <option value="Land Export">Land Export</option>
                                    <option value="Land Import">Land Import</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Charge Category *</label>
                                <select className="form-select qt-input" name="chargeCategory" value={formData.chargeCategory} onChange={handleChange} disabled={isView}>
                                    <option value="">-- Select Charge Category --</option>
                                    <option value="Freight">Freight</option>
                                    <option value="Margin">Margin</option>
                                    <option value="Local">Local</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Charge Type *</label>
                                <select className="form-select qt-input" name="chargeType" value={formData.chargeType} onChange={handleChange} disabled={isView}>
                                    <option value="">-- Select Charge Type --</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Special">Special</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="group-section">
                        <span className="group-label">Status</span>
                        <div className="row g-4">
                            <div className="col-md-12">
                                <div className="d-flex gap-4 mt-1">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="stActive" value="Active" checked={formData.status === "Active"} onChange={handleChange} disabled={isView} />
                                        <label className="form-check-label" htmlFor="stActive">Active</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="stInactive" value="Inactive" checked={formData.status === "Inactive"} onChange={handleChange} disabled={isView} />
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
                        {!isView && (
                            <button className="btn-primary-custom" onClick={switchToTable}>
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <React.Fragment>
            {view === "table" ? renderTableView() : renderFormView(view === "view")}
        </React.Fragment>
    );
};

export default GlobalChargeCode;