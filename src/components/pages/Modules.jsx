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

import "../../App.css";

const Modules = () => {
    const responsiveTableRef = useRef(null);
    const responsiveDt = useRef(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (showAddModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showAddModal]);

    const [formData, setFormData] = useState({
        moduleName: "",
        description: "",
        status: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.moduleName.trim()) {
            newErrors.moduleName = "Module Name is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const newModule = {
            moduleName: formData.moduleName,
            description: formData.description,
            status: formData.status,
            createdOn: new Date(),
        };

        try {
            const url = editingId
                ? `http://localhost:5000/modules/${editingId}`
                : "http://localhost:5000/modules";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newModule),
            });

            const result = await response.json();

            console.log(result);

            if (responsiveDt.current) {
                responsiveDt.current.ajax.reload(null, false);
            }

            setShowAddModal(false);
            setEditingId(null);

            setFormData({
                moduleName: "",
                description: "",
                status: false,
            });
        } catch (error) {
            console.error("Submit Error:", error);
        }
    };

    useEffect(() => {
        if (!responsiveTableRef.current) return;

        // destroy if already exists
        if ($.fn.DataTable.isDataTable(responsiveTableRef.current)) {
            $(responsiveTableRef.current).DataTable().destroy(true);
            responsiveDt.current = null;
        }

        $(".dt-button-collection").remove();

        responsiveDt.current = $(responsiveTableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "t" +
                "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

            scrollY: "350px",
            scrollCollapse: true,
            scrollX: false,
            paging: true,

            language: {
                lengthMenu: "Show _MENU_ Entries",
            },

            buttons: {
                dom: {
                    container: {
                        className: "dt-buttons d-flex gap-2"
                    },
                    button: {
                        className: ""
                    }
                },

                buttons: [
                    {
                        extend: "collection",
                        text: '<i class="bx bx-export"></i> Export',
                        className: "export-btn rounded",
                        autoClose: true,
                        dropIcon: false,
                        buttons: [
                            {
                                extend: "print",
                                text: '<i class="bx bx-printer"></i> Print',
                                exportOptions: {
                                    columns: ":visible:not(.no-export)"
                                }
                            },
                            {
                                extend: "copy",
                                text: '<i class="bx bx-copy"></i> Copy',
                                exportOptions: {
                                    columns: ":visible:not(.no-export)"
                                }
                            },
                            {
                                extend: "excel",
                                text: '<i class="bx bx-spreadsheet"></i> Excel',
                                exportOptions: {
                                    columns: ":visible:not(.no-export)"
                                }
                            },
                            {
                                extend: "pdf",
                                text: '<i class="bx bx-file"></i> PDF',
                                exportOptions: {
                                    columns: ":visible:not(.no-export)"
                                }
                            }
                        ]
                    },

                    {
                        extend: "colvis",
                        text: '<i class="bx bx-columns"></i> Customise Columns',
                        columns: [1, 2, 3, 4],
                        className: "custom-colvis",
                        dropIcon: false,
                        autoClose: false
                    }
                ]
            },

            responsive: {
                details: {
                    type: "column",
                    target: 0,
                },
            },

            columnDefs: [{ className: "control", orderable: false, targets: 0 }],

            ajax: {
                url: "http://localhost:5000/modules",
                dataSrc: "data",
            },

            columns: [
                {
                    className: "control",
                    orderable: false,
                    searchable: false,
                    data: null,
                    defaultContent: "",
                },

                { data: "moduleName" },
                { data: "description" },

                {
                    data: "status",
                    render: function (data) {
                        if (data) {
                            return `<span class="badge bg-success">Active</span>`;
                        } else {
                            return `<span class="badge bg-danger">Inactive</span>`;
                        }
                    },
                },

                {
                    data: "createdOn",
                    render: function (data) {
                        if (!data) return "";
                        return new Date(data).toLocaleString();
                    },
                },

                {
                    data: null,
                    className: "no-export",
                    orderable: false,
                    searchable: false,
                    render: function (data) {
                        return `<i class="bx bx-edit edit-icon" data-id="${data._id}" title="Edit"></i>`;
                    },
                },

                {
                    data: null,
                    className: "no-export",
                    orderable: false,
                    searchable: false,
                    render: function (data) {
                        return `<i class="bx bx-trash delete-icon" data-id="${data._id}" title="Delete"></i>`;
                    },
                },
            ],

            order: [[1, "asc"]],
        });

        $(responsiveTableRef.current).on(
            "click",
            ".delete-icon",
            function () {
                const id = $(this).data("id");
                setDeleteId(id);
                setShowDeleteModal(true);
            }
        );

        $(responsiveTableRef.current).on("click", ".edit-icon", function () {
            const rowData = responsiveDt.current.row($(this).parents("tr")).data();

            setFormData({
                moduleName: rowData.moduleName,
                description: rowData.description,
                status: rowData.status,
            });

            setEditingId(rowData._id);
            setShowAddModal(true);
        });
        return () => {
            if (responsiveDt.current) {
                responsiveDt.current.destroy(true);
                responsiveDt.current = null;
            }
        };
    }, []);

    const confirmDelete = async () => {
        try {
            await fetch(`http://localhost:5000/modules/${deleteId}`, {
                method: "DELETE",
            });

            responsiveDt.current.ajax.reload();

            setShowDeleteModal(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">

            <div className="card">

                <div className="datatable-toolbar d-flex justify-content-between align-items-start">

                    <div className="title-section">
                        <h5 className="table-title">Module Details</h5>
                        <div className="breadcrumb-text">Menu &gt; Modules</div>
                    </div>

                    <button
                        className="btn-add-record"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="bx bx-plus"></i> Add Module
                    </button>
                </div>

                <div className="card-datatable p-3">
                    <table
                        ref={responsiveTableRef}
                        className="table dataTable dtr-inline"
                        style={{ width: "100%" }}
                    >
                        <thead>
                            <tr>
                                <th></th>
                                <th>Module Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Created On</th>
                                <th>Edit</th>
                                <th>Remove</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>



            {/* ADD / EDIT MODAL */}

            {showAddModal && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal-card">
                        <button
                            className="custom-close"
                            onClick={() => setShowAddModal(false)}
                        >
                            ×
                        </button>

                        <h5 className="modal-title">
                            {editingId ? "Edit Module" : "Create Module"}
                        </h5>

                        <hr className="modal-divider" />

                        {/* Module Name */}

                        <div className="form-group">
                            <label className="form-label">Module Name *</label>

                            <div className="input-icon position-relative">
                                <i className="bx bx-layer input-icon-left"></i>

                                <input
                                    type="text"
                                    name="moduleName"
                                    className="form-field"
                                    placeholder="ENTER MODULE NAME"
                                    value={formData.moduleName}
                                    onChange={handleChange}
                                />
                            </div>

                            {errors.moduleName && (
                                <small className="text-danger">{errors.moduleName}</small>
                            )}
                        </div>

                        {/* Description */}

                        <div className="form-group">
                            <label className="form-label">Description</label>

                            <div className="input-icon position-relative">
                                <i className="bx bx-file input-icon-left"></i>

                                <input
                                    type="text"
                                    name="description"
                                    className="form-field"
                                    placeholder="ENTER DESCRIPTION"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Active */}

                        <div className="form-group">
                            <label className="form-label">Active</label>

                            <div className="d-flex align-items-center mt-1">
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={formData.status}
                                    onChange={handleChange}
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        marginRight: "8px",
                                        cursor: "pointer",
                                    }}
                                />

                                <span>Active</span>
                            </div>
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="btn-submit"
                                onClick={handleSubmit}
                            >
                                {editingId ? "Update" : "Create"}
                            </button>

                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingId(null);
                                    setFormData({
                                        moduleName: "",
                                        description: "",
                                        status: false,
                                    });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}

            {showDeleteModal && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal-card">
                        <h5 className="modal-title">Confirm Delete</h5>

                        <p style={{ marginTop: "10px" }}>
                            Are you sure you want to delete this Module?
                        </p>

                        <div className="modal-buttons">
                            <button
                                className="btn-submit btn-delete"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>

                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteId(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Modules;
