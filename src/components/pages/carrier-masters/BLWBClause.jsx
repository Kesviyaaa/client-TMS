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

const BLWBClause = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(false);

    const [formData, setFormData] = useState({
        displayName: "",
        description: "",
        ediCode: "",
    });

    /* ───── Sample Data ───── */
    const [clauses] = useState([
        {
            displayName: "Freight Prepaid",
            description: "Freight prepaid clause",
            ediCode: "FP001",
            createdOn: "03/03/2026",
        },
    ]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setShowModal(false);
        setEditing(false);
        setFormData({
            displayName: "",
            description: "",
            ediCode: "",
        });
    };

    /* ───── DataTable ───── */
    useEffect(() => {
        if (!tableRef.current) return;
        if (dtRef.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",

            responsive: true,
            data: clauses,
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,

            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: ["print", "copy", "excel", "pdf"],
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
                { data: "displayName", title: "Display Name" },
                { data: "description", title: "Clause Description" },
                { data: "ediCode", title: "EDI Code" },
                { data: "createdOn", title: "Created On" },
                {
                    data: null,
                    title: "Edit",
                    className: "no-export text-center",
                    render: () =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-btn text-primary cursor-pointer" title="Edit" style="font-size: 18px;"></i></div>`,
                },
                {
                    data: null,
                    title: "Remove",
                    className: "no-export text-center",
                    render: () =>
                        `<div class="d-flex justify-content-center"><i class="bx bx-trash remove-btn text-danger cursor-pointer" title="Remove" style="font-size: 18px;"></i></div>`,
                },
            ],
        });

        /* EDIT CLICK */
        $(tableRef.current).on("click", ".edit-btn", function () {
            const rowData = dtRef.current.row($(this).parents("tr")).data();
            setFormData({
                displayName: rowData.displayName,
                description: rowData.description,
                ediCode: rowData.ediCode,
            });
            setEditing(true);
            setShowModal(true);
        });

        return () => {
            if (dtRef.current) dtRef.current.destroy();
        };
    }, [clauses]);

    return (
        <div className="container-xxl container-p-y pb-5">

            {/* TABLE */}
            <div className="card">
                <div className="datatable-toolbar d-flex justify-content-between p-3">
                    <h5 className="table-title">BL/WB Clause Details</h5>
                    <button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="bx bx-plus"></i> Create
                    </button>
                </div>

                <div className="card-datatable p-3">
                    <table ref={tableRef} className="table w-100"></table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
                    <div className="custom-modal-card" style={{ maxWidth: "500px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 style={{ color: "#50a9e9", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                                {editing ? "Edit WB/BL Clause" : "Create WB/BL Clause"}
                            </h5>
                            <button type="button" onClick={handleClose} style={{ background: "none", border: "none", color: "#566a7f", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer", padding: 0 }}>&times;</button>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="qt-label">Display Name</label>
                                <input
                                    name="displayName"
                                    className="form-control"
                                    placeholder="Enter Display Name"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12">
                                <label className="qt-label">Clause Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    placeholder="Enter Clause Description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12">
                                <label className="qt-label">EDI Code</label>
                                <input
                                    name="ediCode"
                                    className="form-control"
                                    placeholder="Enter EDI Code"
                                    value={formData.ediCode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

                        <div className="d-flex justify-content-end gap-3">
                            <button className="btn-secondary-custom" onClick={handleClose}>
                                Cancel
                            </button>
                            <button className="btn-primary-custom" onClick={() => { handleClose(); }}>
                                {editing ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BLWBClause;