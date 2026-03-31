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

const CFS = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        cfsName: "",
        cfsCode: "",
        address: "",
        contactPerson: "",
        mobile: "",
        status: "Active",
    });

    /* ───── Static Data ───── */
    const [cfsList] = useState([
        { name: "Oceanic CFS", code: "OCF01", address: "Navi Mumbai", person: "Amit Sharma", mobile: "9876543210", status: "Active" },
        { name: "Global Yard", code: "GYD02", address: "Chennai Port", person: "Vijay Kumar", mobile: "9988776655", status: "Active" },
        { name: "Metro ICD", code: "MIC03", address: "Ludhiana", person: "Sandeep Singh", mobile: "9123456789", status: "Inactive" },
    ]);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            cfsName: "",
            cfsCode: "",
            address: "",
            contactPerson: "",
            mobile: "",
            status: "Active",
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            data: cfsList,

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
            pageLength: 10,

            columns: [
                { data: "name", title: "CFS / Yard Name", responsivePriority: 1 },
                { data: "code", title: "Code", responsivePriority: 2 },
                { data: "person", title: "Contact Person", responsivePriority: 3 },
                { data: "mobile", title: "Mobile", responsivePriority: 4 },
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
                cfsName: rowData.name,
                cfsCode: rowData.code,
                address: rowData.address,
                contactPerson: rowData.person,
                mobile: rowData.mobile,
                status: rowData.status,
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
    }, [cfsList]);

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="card">
                <div className="datatable-toolbar d-flex justify-content-between align-items-start p-3">
                    <div className="title-section">
                        <h5 className="table-title">CFS / Yard Master</h5>
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
                                <th>CFS / Yard Name</th>
                                <th>Code</th>
                                <th>Contact Person</th>
                                <th>Mobile</th>
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
                    <div className="custom-modal-card" style={{ maxWidth: "700px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 style={{ color: "#50a9e9", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                                {editingId ? "Edit CFS / Yard Master" : "Create CFS / Yard Master"}
                            </h5>
                            <button type="button" onClick={handleClose} style={{ background: "none", border: "none", color: "#566a7f", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer", padding: 0 }}>&times;</button>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="qt-label">Name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="cfsName"
                                    className="form-control"
                                    placeholder="Enter CFS / Yard Name"
                                    value={formData.cfsName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Code <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="cfsCode"
                                    className="form-control"
                                    placeholder="Enter Code"
                                    value={formData.cfsCode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="qt-label">Contact Person</label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    className="form-control"
                                    placeholder="Enter Name"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Mobile</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    className="form-control"
                                    placeholder="Enter Contact Number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-md-12">
                                <label className="qt-label">Address</label>
                                <textarea
                                    name="address"
                                    className="form-control"
                                    placeholder="Enter Full Address"
                                    rows="2"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <label className="qt-label">Status</label>
                                <div className="d-flex gap-4 mt-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="status"
                                            id="stActive"
                                            value="Active"
                                            checked={formData.status === "Active"}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="stActive">Active</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="status"
                                            id="stInactive"
                                            value="Inactive"
                                            checked={formData.status === "Inactive"}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="stInactive">Inactive</label>
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

export default CFS;
