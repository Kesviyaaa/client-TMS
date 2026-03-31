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

import "../../../App.css";

const TerminalOperator = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        terminalName: "",
        terminalCode: "",
        country: "",
        port: "",
        status: "Active",
        isAir: false,
        isSea: false,
    });

    /* ───── Static Data ───── */
    const [operators] = useState([
        { name: "Terminal A", country: "India", port: "JNPT", status: "Active", isAir: false, isSea: true },
        { name: "Terminal B", country: "USA", port: "New York", status: "Active", isAir: true, isSea: true },
        { name: "Terminal C", country: "UAE", port: "Jebel Ali", status: "Inactive", isAir: false, isSea: true },
    ]);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            terminalName: "",
            terminalCode: "",
            country: "",
            port: "",
            status: "Active",
            isAir: false,
            isSea: false,
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (!tableRef.current) return;
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
            data: operators,

            language: {
                lengthMenu: "Show _MENU_ entries",
                search: "Search:",
                emptyTable: "No data available in table",
            },

            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: "Print", exportOptions: { columns: ":visible" } },
                        { extend: "copy", text: "Copy", exportOptions: { columns: ":visible" } },
                        { extend: "excel", text: "Excel", exportOptions: { columns: ":visible" } },
                        { extend: "pdf", text: "PDF", exportOptions: { columns: ":visible" } },
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
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,

            columns: [
                { data: "name", title: "Operator Name", responsivePriority: 1 },
                { data: "country", title: "Country", responsivePriority: 2 },
                { data: "port", title: "Port", responsivePriority: 3 },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    render: (d) => {
                        const cls = d === "Active" ? "bg-label-success" : "bg-label-danger";
                        return `<span class="badge ${cls}">${d}</span>`;
                    },
                },
                {
                    data: null,
                    title: "Edit",
                    className: "text-center no-export",
                    orderable: false,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-icon text-primary cursor-pointer" title="Edit" style="font-size: 18px;"></i></div>`,
                },
                {
                    data: null,
                    title: "Delete",
                    className: "text-center no-export",
                    orderable: false,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-trash delete-icon text-danger cursor-pointer" title="Delete" style="font-size: 18px;"></i></div>`,
                }
            ],

            order: [[0, "asc"]],
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        /* Edit Handler */
        $(tableRef.current).on("click", ".edit-icon", function () {
            const rowData = dtRef.current.row($(this).parents("tr")).data();
            setFormData({
                terminalName: rowData.name,
                terminalCode: "", // code not in static data
                country: rowData.country,
                port: rowData.port,
                status: rowData.status,
                isAir: rowData.isAir,
                isSea: rowData.isSea,
            });
            setEditingId(true);
            setShowModal(true);
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [operators]);

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="card">
                <div className="datatable-toolbar d-flex justify-content-between align-items-start p-3">
                    <div className="title-section">
                        <h5 className="table-title">Terminal Operators</h5>
                    </div>
                    <button
                        className="btn-add-record btn-primary-custom"
                        onClick={() => {
                            setEditingId(null);
                            setShowModal(true);
                        }}
                    >
                        <i className="bx bx-plus"></i> Create
                    </button>
                </div>
                <div className="card-datatable p-3">
                    <table ref={tableRef} className="table dataTable dtr-inline w-100">
                        <thead>
                            <tr>
                                <th>Operator Name</th>
                                <th>Country</th>
                                <th>Port</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
                    <div className="custom-modal-card" style={{ maxWidth: "600px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 style={{ color: "#50a9e9", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                                {editingId ? "Edit Terminal Operator" : "Create Terminal Operator"}
                            </h5>
                            <button type="button" onClick={handleClose} style={{ background: "none", border: "none", color: "#566a7f", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer", padding: 0 }}>&times;</button>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

                        <div className="row g-4 mb-4">
                            {/* Terminal Name */}
                            <div className="col-md-6">
                                <label className="qt-label">
                                    Terminal Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="terminalName"
                                    className="form-control"
                                    placeholder="Enter Terminal Name"
                                    value={formData.terminalName}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Terminal Code */}
                            <div className="col-md-6">
                                <label className="qt-label">
                                    Terminal Code <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="terminalCode"
                                    className="form-control"
                                    placeholder="Enter Terminal Code"
                                    value={formData.terminalCode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Status */}
                            <div className="col-md-6">
                                <label className="qt-label">Status</label>
                                <div className="d-flex gap-3 mt-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="status"
                                            id="statusActive"
                                            value="Active"
                                            checked={formData.status === "Active"}
                                            onChange={handleChange}
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
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="statusInactive">Inactive</label>
                                    </div>
                                </div>
                            </div>

                            {/* Port Type */}
                            <div className="col-md-6">
                                <label className="qt-label">Port</label>
                                <div className="d-flex gap-4 mt-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="isAir"
                                            id="portAir"
                                            checked={formData.isAir}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="portAir">Air</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="isSea"
                                            id="portSea"
                                            checked={formData.isSea}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="portSea">Sea</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

                        <div className="d-flex justify-content-end gap-3">
                            <button className="btn-secondary-custom" onClick={handleClose}>
                                Cancel
                            </button>
                            <button className="btn-primary-custom" onClick={() => { handleClose(); }}>
                                {editingId ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TerminalOperator;
