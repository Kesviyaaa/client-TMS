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

const Units = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dtRef1 = useRef(null);
    const dtRef2 = useRef(null);
    const openedRowRef1 = useRef(null);
    const openedRowRef2 = useRef(null);

    /* ───── Modal State ───── */
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        description: "",
        uneceCode: "",
        code: "",
        type: "",
        plural: "",
        noOfDecimals: "",
        conversionFactorValue: "",
        conversionFactorUnit: "",
        status: "Active",
    });

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateClose = () => {
        setShowCreateModal(false);
        setCreateFormData({
            description: "",
            uneceCode: "",
            code: "",
            type: "",
            plural: "",
            noOfDecimals: "",
            conversionFactorValue: "",
            conversionFactorUnit: "",
            status: "Active",
        });
    };

    useEffect(() => {
        if (showDetailsModal || showDeleteModal || showCreateModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [showDetailsModal, showDeleteModal, showCreateModal]);

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (!tableRef1.current || !tableRef2.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

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

        const domFull =
            "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
            "<'row px-3'<'col-sm-12'tr>>" +
            "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>";

        /* ── Table 1: Master Units ── */
        dtRef1.current = $(tableRef1.current).DataTable({
            dom: domFull,
            responsive: true,
            paging: true,
            data: [],
            language: {
                lengthMenu: "Show _MENU_ Entries",
                search: "Search:",
                emptyTable: "No data available in table",
            },
            pageLength: 10,
            buttons: buttonsDef,
            columns: [
                { data: "description", title: "Description", responsivePriority: 1 },
                { data: "code", title: "Code", responsivePriority: 2 },
                { data: "uneceCode", title: "UNECE Code", responsivePriority: 3 },
                { data: "type", title: "Type", responsivePriority: 4 },
                {
                    data: "status",
                    title: "Status",
                    responsivePriority: 5,
                    render: (data) => {
                        const cls = data === "Active" ? "bg-label-success" : "bg-label-danger";
                        return `<span class="badge ${cls}">${data || ""}</span>`;
                    },
                },
                {
                    data: null,
                    title: "View",
                    className: "no-export text-center",
                    responsivePriority: 1,
                    orderable: false,
                    searchable: false,
                    render: (data) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-show view-master-btn text-info cursor-pointer" data-id="${data.code}" title="View" style="font-size: 18px;"></i></div>`,
                },
            ],
            order: [[0, "asc"]],
        });

        /* ── Table 2: Client Units ── */
        dtRef2.current = $(tableRef2.current).DataTable({
            dom: domFull,
            responsive: true,
            paging: true,
            data: [],
            language: {
                lengthMenu: "Show _MENU_ entries",
                search: "Search:",
                emptyTable: "No data available in table",
            },
            buttons: buttonsDef,
            columns: [
                { data: "description", title: "Description", responsivePriority: 1 },
                { data: "code", title: "Code", responsivePriority: 2 },
                { data: "uneceCode", title: "UNECE Code", responsivePriority: 3 },
                { data: "type", title: "Type", responsivePriority: 4 },
                {
                    data: null,
                    title: "Edit",
                    className: "no-export text-center",
                    responsivePriority: 1,
                    orderable: false,
                    searchable: false,
                    render: (data) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-client-btn text-primary cursor-pointer" data-id="${data.code}" title="Edit" style="font-size: 18px;"></i></div>`,
                },
                {
                    data: null,
                    title: "Remove",
                    className: "no-export text-center",
                    responsivePriority: 1,
                    orderable: false,
                    searchable: false,
                    render: (data) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-trash remove-client-btn text-danger cursor-pointer" data-id="${data.code}" title="Remove" style="font-size: 18px;"></i></div>`,
                },
            ],
            order: [[0, "asc"]],
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        /* ── Table 1 Events ── */
        dtRef1.current.on("responsive-display", (e, dt, row, showHide) => {
            if (showHide) {
                openedRowRef1.current = row;
                setSelectedRow(row.data());
                setModalTitle("Master Unit Details");
                setShowDetailsModal(true);
            }
        });

        $(tableRef1.current).on("click", ".view-master-btn", function () {
            const rowData = dtRef1.current.row($(this).parents("tr")).data();
            if (rowData) {
                setSelectedRow(rowData);
                setModalTitle("Master Unit Details");
                setShowDetailsModal(true);
            }
        });

        /* ── Table 2 Events ── */
        dtRef2.current.on("responsive-display", (e, dt, row, showHide) => {
            if (showHide) {
                openedRowRef2.current = row;
                setSelectedRow(row.data());
                setModalTitle("Client Unit Details");
                setShowDetailsModal(true);
            }
        });

        $(tableRef2.current).on("click", ".edit-client-btn", function () {
            const rowData = dtRef2.current.row($(this).parents("tr")).data();
            if (rowData) {
                setSelectedRow(rowData);
                setModalTitle("Edit Client Unit");
                setShowDetailsModal(true);
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
    }, []);

    /* ════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════ */
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            
            {/* Page header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <h4 className="table-title">Unit Master</h4>

            </div>

            {/* ── Master Units Card ── */}
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-ruler"></i></div> Master Units
                    </span>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef1} className="table dataTable dtr-inline w-100 shadow-none">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Code</th>
                                <th>UNECE Code</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>View</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            {/* ── Client Units Card ── */}
            <div className="ocean-card mt-4">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-list-ul"></i></div> Client Units
                    </span>
                    <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={() => setShowCreateModal(true)}>
                        <i className="bx bx-plus"></i> Create
                    </button>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef2} className="table dataTable dtr-inline w-100 shadow-none">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Code</th>
                                <th>UNECE Code</th>
                                <th>Type</th>
                                <th>Update</th>
                                <th>Remove</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            {/* ───── CREATE MODAL ───── */}
            {showCreateModal && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal-card" style={{ maxWidth: "700px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="modal-title">Create Unit Master</h5>
                            <button className="custom-close" onClick={handleCreateClose}>×</button>
                        </div>
                        <hr className="modal-divider" />

                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="qt-label">Description <span className="text-danger">*</span></label>
                                    <div className="input-icon position-relative">
                                        <i className="bx bx-detail input-icon-left"></i>
                                        <input
                                            type="text"
                                            name="description"
                                            className="form-control qt-input"
                                            value={createFormData.description}
                                            onChange={handleCreateChange}
                                            placeholder="Enter Description"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="qt-label">UNECE Code</label>
                                    <div className="input-icon position-relative">
                                        <i className="bx bx-barcode input-icon-left"></i>
                                        <input
                                            type="text"
                                            name="uneceCode"
                                            className="form-control qt-input"
                                            value={createFormData.uneceCode}
                                            onChange={handleCreateChange}
                                            placeholder="Enter UNECE Code"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="qt-label">Code <span className="text-danger">*</span></label>
                                    <div className="input-icon position-relative">
                                        <i className="bx bx-hash input-icon-left"></i>
                                        <input
                                            type="text"
                                            name="code"
                                            className="form-control qt-input"
                                            value={createFormData.code}
                                            onChange={handleCreateChange}
                                            placeholder="Enter Code"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="qt-label">Type <span className="text-danger">*</span></label>
                                    <div className="input-icon position-relative">
                                        <i className="bx bx-list-ul input-icon-left"></i>
                                        <select
                                            name="type"
                                            className="form-control qt-input"
                                            value={createFormData.type}
                                            onChange={handleCreateChange}
                                        >
                                            <option value="">--Select Type--</option>
                                            <option value="Area">Area</option>
                                            <option value="Number">Number</option>
                                            <option value="Weight">Weight</option>
                                            <option value="Volume">Volume</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="qt-label">Plural</label>
                                    <div className="input-icon position-relative">
                                        <i className="bx bx-rename input-icon-left"></i>
                                        <input
                                            type="text"
                                            name="plural"
                                            className="form-control qt-input"
                                            value={createFormData.plural}
                                            onChange={handleCreateChange}
                                            placeholder="Enter Plural"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="qt-label">No of Decimals</label>
                                    <div className="input-icon position-relative">
                                        <i className="bx bx-calculator input-icon-left"></i>
                                        <input
                                            type="number"
                                            name="noOfDecimals"
                                            className="form-control qt-input"
                                            value={createFormData.noOfDecimals}
                                            onChange={handleCreateChange}
                                            placeholder="Enter Number of Decimals"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="qt-label">Conversion Factor</label>
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontSize: "14px", fontWeight: "600", minWidth: "30px" }}>1 =</span>
                                    <input
                                        type="number"
                                        name="conversionFactorValue"
                                        className="form-control qt-input"
                                        style={{ width: "120px" }}
                                        value={createFormData.conversionFactorValue}
                                        onChange={handleCreateChange}
                                    />
                                    <select
                                        name="conversionFactorUnit"
                                        className="form-control qt-input"
                                        style={{ width: "150px" }}
                                        value={createFormData.conversionFactorUnit}
                                        onChange={handleCreateChange}
                                    >
                                        <option value="">--Select--</option>
                                        <option value="KGS">KGS</option>
                                        <option value="CBM">CBM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="qt-label d-block">Status</label>
                                <div className="d-flex gap-4 mt-2">
                                    <div className="form-check custom-radio">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="status"
                                            id="statusActive"
                                            value="Active"
                                            checked={createFormData.status === "Active"}
                                            onChange={handleCreateChange}
                                        />
                                        <label className="form-check-label ms-2" htmlFor="statusActive">Active</label>
                                    </div>
                                    <div className="form-check custom-radio">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="status"
                                            id="statusInactive"
                                            value="Inactive"
                                            checked={createFormData.status === "Inactive"}
                                            onChange={handleCreateChange}
                                        />
                                        <label className="form-check-label ms-2" htmlFor="statusInactive">Inactive</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="modal-divider" />

                        <div className="modal-buttons mt-4">
                            <button className="btn-secondary-custom px-4" onClick={handleCreateClose}>Cancel</button>
                            <button className="btn-primary-custom px-4" onClick={handleCreateClose}>Create</button>
                        </div>
                    </div>
                </div>
            )}


            {/* ───── DETAILS MODAL ───── */}
            {showDetailsModal && selectedRow && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal-card">
                        <button
                            className="custom-close"
                            onClick={() => {
                                [openedRowRef1, openedRowRef2].forEach(ref => {
                                    if (ref.current) {
                                        $(ref.current.node()).find("td.dtr-control").trigger("click");
                                        ref.current = null;
                                    }
                                });
                                setShowDetailsModal(false);
                            }}
                        >×</button>
                        <h5 className="modal-title">{modalTitle}</h5>
                        <hr className="modal-divider" />
                        <table className="table table-sm">
                            <tbody>
                                <tr><td><strong>Description:</strong></td><td>{selectedRow.description}</td></tr>
                                <tr><td><strong>Code:</strong></td><td>{selectedRow.code}</td></tr>
                                <tr><td><strong>UNECE Code:</strong></td><td>{selectedRow.uneceCode}</td></tr>
                                <tr><td><strong>Type:</strong></td><td>{selectedRow.type}</td></tr>
                                {selectedRow.status && <tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ───── DELETE MODAL ───── */}
            {showDeleteModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                    <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                        <div className="text-center p-4">
                            <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                            <h4 className="mb-2">Are you sure?</h4>
                            <p className="text-muted mb-4">You want to remove this unit? This action cannot be undone.</p>
                            <div className="d-flex justify-content-center gap-3">
                                <button className="btn btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn btn-danger" onClick={() => setShowDeleteModal(false)}>Yes, Remove it!</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Units;
