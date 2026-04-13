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
import "../../css/finance.css";

const AirlineCommission = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [commissions, setCommissions] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        airlineName: "",
        airlineCode: "",
        commissionPercentage: "",
        type: "Standard",
        applicableFrom: "",
        status: "Active"
    });

    const API_BASE = "http://localhost:5005/api/airline-commission";

    // ✅ Fetch Data
    const fetchData = async () => {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) {
                console.error("Fetch failed:", response.status);
                return;
            }
            const data = await response.json();
            setCommissions(data);
        } catch (error) {
            console.error("Error fetching commissions:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ✅ Lock scroll on modal open
    useEffect(() => {
        if (showModal || showDeleteModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [showModal, showDeleteModal]);

    // ✅ Save Data (Create/Update)
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        
        const newErrors = {};
        if (!formData.airlineName || !formData.airlineName.trim()) newErrors.airlineName = "Airline Name is required";
        if (!formData.airlineCode || !formData.airlineCode.trim()) newErrors.airlineCode = "Airline Code is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const url = isEditing ? `${API_BASE}/${formData._id}` : API_BASE;
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                await fetchData();
                handleClose();
            } else {
                alert(`Error: ${result.error || "Failed to save"}`);
            }
        } catch (error) {
            console.error("Error saving commission:", error);
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete Data
    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/${deleteId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                await fetchData();
                setShowDeleteModal(false);
                setDeleteId(null);
            } else {
                alert("Failed to delete record.");
            }
        } catch (error) {
            console.error("Error deleting commission:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            airlineName: "",
            airlineCode: "",
            commissionPercentage: "",
            type: "Standard",
            applicableFrom: "",
            status: "Active"
        });
        setErrors({});
        setIsEditing(false);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (!tableRef.current) return;

        if (dtRef.current) {
            dtRef.current.destroy();
            dtRef.current = null;
        }

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
            data: commissions,

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
                { data: "airlineName", title: "Airline Name" },
                { data: "airlineCode", title: "Airline Code" },
                {
                    data: "commissionPercentage",
                    title: "Airline Commission",
                    render: (d) => d ? `${d}%` : "0%"
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    render: d => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>`
                },
                {
                    data: null,
                    title: "Edit",
                    className: "text-center no-export",
                    orderable: false,
                    render: (row) =>
                        `<div class="d-flex justify-content-center">
                            <i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${row._id}" style="font-size:18px;"></i>
                        </div>`,
                },
                {
                    data: null,
                    title: "Remove",
                    className: "text-center no-export",
                    orderable: false,
                    render: (row) =>
                        `<div class="d-flex justify-content-center">
                            <i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${row._id}" style="font-size:18px;"></i>
                        </div>`,
                }
            ],

            order: [[0, "asc"]],
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        /* Action Handlers */
        $(tableRef.current).off("click").on("click", ".edit-btn", function () {
            const id = String($(this).data("id"));
            const rowData = commissions.find(item => String(item._id) === id);
            if (rowData) {
                setFormData(rowData);
                setIsEditing(true);
                setShowModal(true);
            }
        });

        $(tableRef.current).on("click", ".remove-btn", function () {
            const id = String($(this).data("id"));
            if (id) {
                setDeleteId(id);
                setShowDeleteModal(true);
            }
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
            $(tableRef.current).off("click");
        };
    }, [commissions]);

    return (
        <div className="container-xxl container-p-y pb-5">

            <h4 className="table-title mb-4">Airline Commission Details</h4>

            <div className="ocean-card">
                <div className="ocean-title">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-plane-take-off"></i></div> Commission List
                    </span>
                    <button className="btn-add-record btn-primary-custom" onClick={handleOpenCreate}>
                        <i className="bx bx-plus"></i> Create Commission
                    </button>
                </div>
                <div className="card-datatable p-3">
                    <div className="table-responsive">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100 shadow-none"></table>
                    </div>
                </div>
            </div>

            {/* Main Create/Edit Modal */}
            {showModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
                    <div className="custom-modal-card" style={{ maxWidth: "600px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="modal-title-custom">
                                {isEditing ? "Edit Airline Commission" : "Create Airline Commission"}
                            </h5>
                            <button type="button" className="modal-close-btn" onClick={handleClose}>&times;</button>
                        </div>

                        <hr className="modal-divider" />

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="qt-label">Airline Name <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    name="airlineName"
                                    value={formData.airlineName}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select --</option>
                                    <option value="Emirates">Emirates</option>
                                    <option value="Qatar Airways">Qatar Airways</option>
                                    <option value="Indigo">Indigo</option>
                                    <option value="Air India">Air India</option>
                                    <option value="British Airways">British Airways</option>
                                </select>
                                {errors.airlineName && <small className="text-danger d-block mt-1">{errors.airlineName}</small>}
                            </div>

                            <div className="col-12">
                                <label className="qt-label">Airline Code <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="airlineCode"
                                    className="form-control"
                                    placeholder="e.g. EK"
                                    value={formData.airlineCode}
                                    onChange={handleChange}
                                />
                                {errors.airlineCode && <small className="text-danger d-block mt-1">{errors.airlineCode}</small>}
                            </div>

                            <div className="col-12">
                                <label className="qt-label">Airline Commission (%)</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="number"
                                        name="commissionPercentage"
                                        className="form-control"
                                        placeholder="0.00"
                                        value={formData.commissionPercentage}
                                        onChange={handleChange}
                                    />
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#697a8d" }}>%</span>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="qt-label">Status</label>
                                <div className="d-flex gap-4 mt-2">
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

                        <hr className="modal-divider" />

                        <div className="d-flex justify-content-end gap-3">
                            <button className="btn-secondary-custom" onClick={handleClose} disabled={loading}>
                                Cancel
                            </button>
                            <button className="btn-primary-custom" onClick={handleSave} disabled={loading}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-1"></span> Processing...</>
                                ) : (
                                    isEditing ? "Update" : "Create"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                    <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                        <div className="text-center p-4">
                            <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                            <h4 className="mb-2">Are you sure?</h4>
                            <p className="text-muted mb-4">You want to delete this commission? This action cannot be undone.</p>
                            <div className="d-flex justify-content-center gap-3">
                                <button
                                    className="btn-secondary-custom"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-danger-custom"
                                    style={{ background: "#ff3e1d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px" }}
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    {loading ? "Deleting..." : "Yes, Delete it!"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AirlineCommission;
