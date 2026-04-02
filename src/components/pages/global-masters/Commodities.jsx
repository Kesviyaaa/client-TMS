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

const Commodities = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const openedRowRef = useRef(null);

    const [view, setView] = useState(initialView);
    const [commodities, setCommodities] = useState([]);

    /* ───── Modal State ───── */
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    /* ───── Form State ───── */
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        iataCode: "",
        nature: "",
        status: "Active",
    });

    // lock scroll when modal open
    useEffect(() => {
        if (showDetailsModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [showDetailsModal]);

    /* ───── Switch to form safely ───── */
    const switchToForm = () => {
        if (dtRef.current) {
            dtRef.current.destroy(true);
            dtRef.current = null;
        }
        setView("form");
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
        if (dtRef.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: true,
            scrollY: "400px",
            scrollCollapse: true,
            paging: true,
            data: commodities,
            language: {
                lengthMenu: "Show _MENU_ Entries",
                search: "Search:",
                emptyTable: "No data available in table",
            },
            pageLength: 10,
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
                    ],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                    columns: ":not(.no-export)",
                },
            ],
            columns: [
                { data: "name", title: "Name", responsivePriority: 1 },
                { data: "description", title: "Description", responsivePriority: 3 },
                { data: "nature", title: "Nature", responsivePriority: 2 },
                {
                    data: null,
                    title: "Edit",
                    className: "no-export text-center",
                    responsivePriority: 1,
                    orderable: false,
                    searchable: false,
                    render: (data) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${data.name}" title="Edit" style="font-size: 18px;"></i></div>`,
                },
                {
                    data: null,
                    title: "Delete",
                    className: "no-export text-center",
                    responsivePriority: 1,
                    orderable: false,
                    searchable: false,
                    render: (data) =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-trash delete-btn text-danger cursor-pointer" data-id="${data.name}" title="Delete" style="font-size: 18px;"></i></div>`,
                },
            ],
            order: [[0, "asc"]],
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        /* Details modal on responsive expand */
        dtRef.current.on("responsive-display", (e, datatable, row, showHide) => {
            if (showHide) {
                openedRowRef.current = row;
                const rowData = row.data();
                setSelectedRow(rowData);
                setShowDetailsModal(true);
            }
        });

        /* Edit click */
        $(tableRef.current).on("click", ".edit-btn", function () {
            const rowData = dtRef.current.row($(this).parents("tr")).data();
            if (rowData) {
                setFormData({
                    name: rowData.name || "",
                    description: rowData.description || "",
                    iataCode: rowData.iataCode || "",
                    nature: rowData.nature || "",
                    status: rowData.status || "Active",
                });
                switchToForm();
            }
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy(true);
                dtRef.current = null;
            }
        };
    }, [view, commodities]);

    /* ───── Form Handlers ───── */
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ name: "", description: "", iataCode: "", nature: "", status: "Active" });
    };

    /* ════════════════════════════════════════════════════
       RENDER — TABLE VIEW
    ════════════════════════════════════════════════════ */
    if (view === "table") {
        return (
            <div className="container-xxl container-p-y pb-5">
                
                <h4 className="table-title mb-4">Commodity Details</h4>

                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-package"></i></div> Commodity List
                        </span>
                        <button className="btn-primary-custom" onClick={() => { resetForm(); switchToForm(); }}>
                            <i className="bx bx-plus"></i> Create Commodity
                        </button>
                    </div>
                    <div className="card-datatable p-3">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100 shadow-none">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Nature</th>
                                    <th>Update</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                {/* ───── DETAILS MODAL (Quotations Style) ───── */}
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
                            >×</button>

                            <h5 className="modal-title">Commodity Details</h5>
                            <hr className="modal-divider" />

                            <table className="table table-sm">
                                <tbody>
                                    <tr><td><strong>Name:</strong></td><td>{selectedRow.name}</td></tr>
                                    <tr><td><strong>Description:</strong></td><td>{selectedRow.description}</td></tr>
                                    <tr><td><strong>Nature:</strong></td><td>{selectedRow.nature}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* ════════════════════════════════════════════════════
       RENDER — FORM VIEW (Create Commodities)
    ════════════════════════════════════════════════════ */
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="table-title mb-0">Create Commodities</h5>
            </div>

            <div className="ocean-card">
                <div className="p-4">
                    {/* Form Fields Row */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <label className="qt-label">Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="name"
                                className="form-control qt-input"
                                placeholder="Enter Name"
                                value={formData.name}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Description</label>
                            <input
                                type="text"
                                name="description"
                                className="form-control qt-input"
                                placeholder="Enter Description"
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">IATA Code <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="iataCode"
                                className="form-control qt-input"
                                placeholder="Enter IATA Code"
                                value={formData.iataCode}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="qt-label">Nature <span className="text-danger">*</span></label>
                            <select
                                name="nature"
                                className="form-control qt-input"
                                value={formData.nature}
                                onChange={handleFormChange}
                            >
                                <option value="">--Select Nature--</option>
                                <option value="Hazardous">Hazardous</option>
                                <option value="Non-Hazardous">Non-Hazardous</option>
                                <option value="Temperature Controlled">Temperature Controlled</option>
                            </select>
                        </div>
                    </div>

                    {/* Status Row */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="qt-label mb-2">Status</label>
                            <div className="d-flex align-items-center gap-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="status"
                                        id="statusActive"
                                        value="Active"
                                        checked={formData.status === "Active"}
                                        onChange={handleFormChange}
                                    />
                                    <label className="form-check-label" htmlFor="statusActive">Active</label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="status"
                                        id="statusInactive"
                                        value="Inactive"
                                        checked={formData.status === "Inactive"}
                                        onChange={handleFormChange}
                                    />
                                    <label className="form-check-label" htmlFor="statusInactive">Inactive</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex justify-content-end gap-2">
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

export default Commodities;
