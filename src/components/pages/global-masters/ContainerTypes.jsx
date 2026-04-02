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

import "../../css/global.css";

/* ───── initial form ───── */
const emptyForm = {
    iso: "", description: "", size: "", type: "", teus: "",
    isTankContainer: false, isTempControlled: false,
    tareWeight: "0.00", tareWeightUnit: "KG",
    payload: "0.00", payloadUnit: "KG",
    cubicCapacity: "0.00", cubicCapacityUnit: "CCM",
    outerL: "", outerB: "", outerH: "", outerUnit: "",
    innerL: "0.00", innerB: "0.00", innerH: "0.00",
    cgmCode: "",
};

const ContainerTypes = ({ initialView = "table" }) => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dtRef1 = useRef(null);
    const dtRef2 = useRef(null);
    const openedRowRef1 = useRef(null);
    const openedRowRef2 = useRef(null);

    const [view, setView] = useState(initialView);
    const [formData, setFormData] = useState(emptyForm);

    /* ───── Modal State ───── */
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (showDetailsModal || showDeleteModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [showDetailsModal, showDeleteModal]);

    /* ───── switchToForm (safe DT destroy) ───── */
    const switchToForm = () => {
        if (dtRef1.current) { dtRef1.current.destroy(true); dtRef1.current = null; }
        if (dtRef2.current) { dtRef2.current.destroy(true); dtRef2.current = null; }
        setView("form");
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef1.current || !tableRef2.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        const domLayout =
            "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
            "<'row px-3'<'col-sm-12'tr>>" +
            "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>";

        const buttonsDef = [
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
                ],
            },
            {
                extend: "colvis",
                text: '<i class="bx bx-columns"></i> Customise Columns',
                className: "custom-colvis",
                dropIcon: false,
                columns: ":not(.no-export)",
            },
        ];

        /* ── Table 1: Master Details ── */
        dtRef1.current = $(tableRef1.current).DataTable({
            dom: domLayout,
            responsive: true,
            paging: true,
            data: [],
            language: { lengthMenu: "Show _MENU_ entries", search: "Search:", emptyTable: "No data available in table" },
            buttons: buttonsDef,
            columns: [
                { data: "isoCode", title: "ISO Code", responsivePriority: 1 },
                { data: "size", title: "Size", responsivePriority: 2 },
                { data: "type", title: "Type", responsivePriority: 3 },
                { data: "tareWeight", title: "Tare Weight", responsivePriority: 4 },
                { data: "payload", title: "Payload", responsivePriority: 5 },
                { data: "cubicCapacity", title: "Cubic Capacity", responsivePriority: 6 },
                {
                    data: "status", title: "Status", responsivePriority: 7,
                    render: (d) => {
                        const cls = d === "Active" ? "bg-label-success" : "bg-label-danger";
                        return `<span class="badge ${cls}">${d || ""}</span>`;
                    },
                },
                {
                    data: null, title: "View",
                    className: "no-export text-center", responsivePriority: 1,
                    orderable: false, searchable: false,
                    render: (d) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-show view-master-btn text-info cursor-pointer" data-id="${d.isoCode}" title="View" style="font-size: 18px;"></i></div>`,
                },
            ],
            order: [[0, "asc"]],
        });

        /* ── Table 2: Client Details ── */
        dtRef2.current = $(tableRef2.current).DataTable({
            dom: domLayout,
            responsive: true,
            paging: true,
            data: [],
            language: { lengthMenu: "Show _MENU_ entries", search: "Search:", emptyTable: "No data available in table" },
            buttons: buttonsDef,
            columns: [
                { data: "isoCode", title: "ISO Code", responsivePriority: 1 },
                { data: "size", title: "Size", responsivePriority: 2 },
                { data: "type", title: "Type", responsivePriority: 3 },
                { data: "tareWeight", title: "Tare Weight", responsivePriority: 4 },
                { data: "payload", title: "Payload", responsivePriority: 5 },
                { data: "cubicCapacity", title: "Cubic Capacity", responsivePriority: 6 },
                {
                    data: "status", title: "Status", responsivePriority: 7,
                    render: (d) => {
                        const cls = d === "Active" ? "bg-label-success" : "bg-label-danger";
                        return `<span class="badge ${cls}">${d || ""}</span>`;
                    },
                },
                {
                    data: null, title: "Update",
                    className: "no-export text-center", responsivePriority: 1,
                    orderable: false, searchable: false,
                    render: (d) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-client-btn text-primary cursor-pointer" data-id="${d.isoCode}" title="Edit" style="font-size: 18px;"></i></div>`,
                },
                {
                    data: null, title: "Delete",
                    className: "no-export text-center", responsivePriority: 1,
                    orderable: false, searchable: false,
                    render: (d) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-trash remove-client-btn text-danger cursor-pointer" data-id="${d.isoCode}" title="Delete" style="font-size: 18px;"></i></div>`,
                },
            ],
            order: [[0, "asc"]],
        });

        setTimeout(() => { $(".dt-button").removeClass("btn btn-secondary"); }, 0);

        /* Table 1 events */
        dtRef1.current.on("responsive-display", (e, dt, row, showHide) => {
            if (showHide) {
                openedRowRef1.current = row;
                setSelectedRow(row.data());
                setModalTitle("Container Type Master Details");
                setShowDetailsModal(true);
            }
        });
        $(tableRef1.current).on("click", ".view-master-btn", function () {
            const rd = dtRef1.current.row($(this).parents("tr")).data();
            if (rd) { setSelectedRow(rd); setModalTitle("Container Type Master Details"); setShowDetailsModal(true); }
        });

        /* Table 2 events */
        dtRef2.current.on("responsive-display", (e, dt, row, showHide) => {
            if (showHide) {
                openedRowRef2.current = row;
                setSelectedRow(row.data());
                setModalTitle("Container Type Client Details");
                setShowDetailsModal(true);
            }
        });
        $(tableRef2.current).on("click", ".edit-client-btn", function () {
            const rd = dtRef2.current.row($(this).parents("tr")).data();
            if (rd) {
                setFormData({
                    iso: rd.isoCode || "", description: rd.description || "",
                    size: rd.size || "", type: rd.type || "", teus: rd.teus || "",
                    isTankContainer: false, isTempControlled: false,
                    tareWeight: rd.tareWeight || "0.00", tareWeightUnit: "KG",
                    payload: rd.payload || "0.00", payloadUnit: "KG",
                    cubicCapacity: rd.cubicCapacity || "0.00", cubicCapacityUnit: "CCM",
                    outerL: "", outerB: "", outerH: "", outerUnit: "",
                    innerL: "0.00", innerB: "0.00", innerH: "0.00", cgmCode: "",
                });
                switchToForm();
            }
        });
        $(tableRef2.current).on("click", ".remove-client-btn", function () {
            setDeleteId($(this).data("id"));
            setShowDeleteModal(true);
        });

        return () => {
            if (dtRef1.current) dtRef1.current.destroy(true);
            if (dtRef2.current) dtRef2.current.destroy(true);
            dtRef1.current = null;
            dtRef2.current = null;
        };
    }, [view]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    /* ════════ TABLE VIEW ════════ */
    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y pb-5">
                
                {/* header */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <h4 className="table-title">Container Types</h4>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0" style={{ fontSize: "13px" }}>
                            <li className="breadcrumb-item"><a href="/dashboard" style={{ color: "#50a9e9" }}>Dashboard</a></li>
                            <li className="breadcrumb-item active">Container Details</li>
                        </ol>
                    </nav>
                </div>

                {/* ── Master Details ── */}
                <div className="ocean-card">
                    <div className="ocean-title pb-1 m-0">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-package"></i></div> ContainerType Master Details
                        </span>
                    </div>
                    <div className="card-datatable pb-1">
                        <table ref={tableRef1} className="table dataTable dtr-inline w-100 shadow-none">
                            <thead>
                                <tr>
                                    <th>ISO Code</th><th>Size</th><th>Type</th>
                                    <th>Tare Weight</th><th>Payload</th><th>Cubic Capacity</th>
                                    <th>Status</th><th>View</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* ── Client Details ── */}
                <div className="ocean-card mt-4">
                    <div className="ocean-title pb-1 m-0">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-box"></i></div> ContainerType Client Details
                        </span>
                        <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }}
                            onClick={() => { setFormData(emptyForm); switchToForm(); }}>
                            <i className="bx bx-plus"></i> Create Container
                        </button>
                    </div>
                    <div className="card-datatable pb-1">
                        <table ref={tableRef2} className="table dataTable dtr-inline w-100 shadow-none">
                            <thead>
                                <tr>
                                    <th>ISO Code</th><th>Size</th><th>Type</th>
                                    <th>Tare Weight</th><th>Payload</th><th>Cubic Capacity</th>
                                    <th>Status</th><th>Update</th><th>Delete</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* Details Modal */}
                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop">
                        <div className="custom-modal-card">
                            <button className="custom-close" onClick={() => {
                                [openedRowRef1, openedRowRef2].forEach(r => {
                                    if (r.current) { $(r.current.node()).find("td.dtr-control").trigger("click"); r.current = null; }
                                });
                                setShowDetailsModal(false);
                            }}>×</button>
                            <h5 className="modal-title">{modalTitle}</h5>
                            <hr className="modal-divider" />
                            <table className="table table-sm">
                                <tbody>
                                    <tr><td><strong>ISO Code:</strong></td><td>{selectedRow.isoCode}</td></tr>
                                    <tr><td><strong>Size:</strong></td><td>{selectedRow.size}</td></tr>
                                    <tr><td><strong>Type:</strong></td><td>{selectedRow.type}</td></tr>
                                    <tr><td><strong>Tare Weight:</strong></td><td>{selectedRow.tareWeight}</td></tr>
                                    <tr><td><strong>Payload:</strong></td><td>{selectedRow.payload}</td></tr>
                                    <tr><td><strong>Cubic Capacity:</strong></td><td>{selectedRow.cubicCapacity}</td></tr>
                                    <tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                        <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                            <div className="text-center p-4">
                                <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                                <h4 className="mb-2">Are you sure?</h4>
                                <p className="text-muted mb-4">You want to delete this container type? This action cannot be undone.</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <button className="btn btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                    <button className="btn btn-danger" onClick={() => setShowDeleteModal(false)}>Yes, Delete it!</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* ════════ FORM VIEW (Create / Edit) ════════ */
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">

            {/* header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <h4 className="table-title">Global Masters</h4>
            </div>

            <div className="card p-0 shadow-none border">
                <div className="card-body p-4">
                    <h6 style={{ color: "#50a9e9", fontWeight: 600, marginBottom: "1.5rem" }}>Create Container Type</h6>

                    {/* Row 1: ISO, Description, Size, Type */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="qt-label">ISO <span className="text-danger">*</span></label>
                            <input type="text" name="iso" className="form-control qt-input" placeholder="Enter ISO" value={formData.iso} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Description <span className="text-danger">*</span></label>
                            <input type="text" name="description" className="form-control qt-input" placeholder="Enter Description" value={formData.description} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Size <span className="text-danger">*</span></label>
                            <select name="size" className="form-control qt-input" value={formData.size} onChange={handleChange}>
                                <option value="">--Select Size--</option>
                                <option value="20">20</option>
                                <option value="40">40</option>
                                <option value="45">45</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Type <span className="text-danger">*</span></label>
                            <input type="text" name="type" className="form-control qt-input" placeholder="Enter Type" value={formData.type} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Row 2: TEU's, Is Tank Container, Is Temperature Controlled, Tare Weight */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="qt-label">TEU's <span className="text-danger">*</span></label>
                            <input type="text" name="teus" className="form-control qt-input" placeholder="Enter TEU's" value={formData.teus} onChange={handleChange} />
                        </div>
                        <div className="col-md-3 d-flex flex-column justify-content-end pb-1">
                            <label className="qt-label">Is Tank Container</label>
                            <div className="form-check mt-1">
                                <input className="form-check-input" type="checkbox" name="isTankContainer" id="isTank"
                                    checked={formData.isTankContainer} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="isTank"></label>
                            </div>
                        </div>
                        <div className="col-md-3 d-flex flex-column justify-content-end pb-1">
                            <label className="qt-label">Is Temperature Controlled</label>
                            <div className="form-check mt-1">
                                <input className="form-check-input" type="checkbox" name="isTempControlled" id="isTemp"
                                    checked={formData.isTempControlled} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="isTemp"></label>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Tare Weight <span className="text-danger">*</span></label>
                            <div className="d-flex gap-2">
                                <input type="number" name="tareWeight" className="form-control qt-input" value={formData.tareWeight} onChange={handleChange} />
                                <select name="tareWeightUnit" className="form-control qt-input" style={{ width: "75px" }} value={formData.tareWeightUnit} onChange={handleChange}>
                                    <option value="KG">KG</option>
                                    <option value="LB">LB</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Payload, Cubic Capacity, Outer Dimensions, Inner Dimensions */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="qt-label">Payload <span className="text-danger">*</span></label>
                            <div className="d-flex gap-2">
                                <input type="number" name="payload" className="form-control qt-input" value={formData.payload} onChange={handleChange} />
                                <select name="payloadUnit" className="form-control qt-input" style={{ width: "75px" }} value={formData.payloadUnit} onChange={handleChange}>
                                    <option value="KG">KG</option>
                                    <option value="LB">LB</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Cubic Capacity <span className="text-danger">*</span></label>
                            <div className="d-flex gap-2">
                                <input type="number" name="cubicCapacity" className="form-control qt-input" value={formData.cubicCapacity} onChange={handleChange} />
                                <select name="cubicCapacityUnit" className="form-control qt-input" style={{ width: "75px" }} value={formData.cubicCapacityUnit} onChange={handleChange}>
                                    <option value="CCM">CCM</option>
                                    <option value="CFT">CFT</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Outer Dimensions (LBXH) <span className="text-danger">*</span></label>
                            <div className="d-flex gap-1 align-items-center">
                                <input type="number" name="outerL" className="form-control qt-input" placeholder="L" value={formData.outerL} onChange={handleChange} style={{ minWidth: 0 }} />
                                <input type="number" name="outerB" className="form-control qt-input" placeholder="B" value={formData.outerB} onChange={handleChange} style={{ minWidth: 0 }} />
                                <input type="number" name="outerH" className="form-control qt-input" placeholder="H" value={formData.outerH} onChange={handleChange} style={{ minWidth: 0 }} />
                                <select name="outerUnit" className="form-control qt-input" style={{ width: "70px" }} value={formData.outerUnit} onChange={handleChange}>
                                    <option value="">--</option>
                                    <option value="MM">MM</option>
                                    <option value="CM">CM</option>
                                    <option value="M">M</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Inner Dimensions (LBXH) <span className="text-danger">*</span></label>
                            <div className="d-flex gap-1">
                                <input type="number" name="innerL" className="form-control qt-input" placeholder="L" value={formData.innerL} onChange={handleChange} style={{ minWidth: 0 }} />
                                <input type="number" name="innerB" className="form-control qt-input" placeholder="B" value={formData.innerB} onChange={handleChange} style={{ minWidth: 0 }} />
                                <input type="number" name="innerH" className="form-control qt-input" placeholder="H" value={formData.innerH} onChange={handleChange} style={{ minWidth: 0 }} />
                            </div>
                        </div>
                    </div>

                    {/* Row 4: CGM Code */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <label className="qt-label">CGM Code</label>
                            <select name="cgmCode" className="form-control qt-input" value={formData.cgmCode} onChange={handleChange}>
                                <option value=""></option>
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <button className="btn-secondary-custom" onClick={() => setView("table")}>
                            <i className="bx bx-arrow-back me-1"></i> Back
                        </button>
                        <button className="btn-primary-custom" onClick={() => setView("table")}>
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContainerTypes;
