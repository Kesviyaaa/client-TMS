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

const emptyForm = {
    displayName: "",
    description: "",
    ediCode: "",
};

const BLWBClause = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState("table");
    const [loading, setLoading] = useState(false);
    const [clauses, setClauses] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const API_BASE = "http://localhost:5005/api/clauses";

    const fetchData = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setClauses(data);
            }
        } catch (err) { console.error("Error fetching clauses:", err); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const switchToForm = () => {
        setView("form");
        window.scrollTo(0, 0);
    };

    const switchToTable = () => {
        setView("table");
    };

    /* ───── Modal State ───── */
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (showDetailsModal || showDeleteModal) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [showDetailsModal, showDeleteModal]);

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;

        const cleanup = () => { if (dtRef.current) { dtRef.current.destroy(); $(tableRef.current).empty(); dtRef.current = null; } };
        cleanup();

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        const buttonsDef = [
            { extend: "collection", text: '<i class="bx bx-export"></i> Export', className: "export-btn", autoClose: true, dropIcon: false, buttons: ["print", "copy", "excel", "pdf"] },
            { extend: "colvis", text: '<i class="bx bx-columns"></i> Customise Columns', className: "custom-colvis", dropIcon: false },
        ];
        const domLayout = "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>><'row px-3'<'col-sm-12'tr>><'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>";

        dtRef.current = $(tableRef.current).DataTable({
            dom: domLayout, responsive: true, data: clauses, paging: true, buttons: buttonsDef,
            columns: [
                { data: "displayName", title: "Display Name" },
                { data: "description", title: "Clause Description" },
                { data: "ediCode", title: "EDI Code" },
                { data: "createdOn", title: "Created On" },
                { data: null, title: "View", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-show view-btn text-info cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Edit", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Delete", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ],
            order: [[3, "desc"]],
        });

        const table = $(tableRef.current);

        table.on("click", ".view-btn", function() {
            const row = clauses.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setSelectedRow(row); setShowDetailsModal(true); }
        });

        table.on("click", ".edit-btn", function() {
            const row = clauses.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setFormData(row); setIsEditing(true); switchToForm(); }
        });

        table.on("click", ".remove-btn", function() { setDeleteId($(this).data("id")); setShowDeleteModal(true); });

        setTimeout(() => { $(".dt-button").removeClass("btn btn-secondary"); }, 0);
        return () => { cleanup(); };
    }, [view, clauses]);

    const handleSave = async () => {
        const newErrors = {};
        if (!formData.displayName) newErrors.displayName = "Display Name is required";
        if (!formData.description) newErrors.description = "Description is required";

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); window.scrollTo(0, 0); return; }

        setLoading(true);
        try {
            const res = await fetch(isEditing ? `${API_BASE}/${formData._id}` : API_BASE, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) { await fetchData(); switchToTable(); }
        } catch (err) { console.error("Error saving clause:", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
            if (res.ok) { await fetchData(); setShowDeleteModal(false); }
        } catch (err) { console.error("Error deleting clause:", err); }
        finally { setLoading(false); }
    };

    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y pb-5">
                <h4 className="table-title mb-4">BL/WB Clause Details</h4>

                <div className="ocean-card">
                    <div className="ocean-title pb-1 m-0">
                        <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-list-check"></i></div> Clause List</span>
                        <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={() => { setFormData(emptyForm); setIsEditing(false); switchToForm(); }}><i className="bx bx-plus"></i> Create Clause</button>
                    </div>
                    <div className="card-datatable pb-1 p-3">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100 shadow-none"></table>
                    </div>
                </div>

                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop">
                        <div className="custom-modal-card" style={{ maxWidth: "500px" }}>
                            <button className="custom-close" onClick={() => setShowDetailsModal(false)}>×</button>
                            <h5 className="modal-title">Clause Details</h5>
                            <hr className="modal-divider" />
                            <table className="table table-sm border-0">
                                <tbody>
                                    <tr><td width="40%"><strong>Display Name:</strong></td><td>{selectedRow.displayName}</td></tr>
                                    <tr><td><strong>EDI Code:</strong></td><td>{selectedRow.ediCode}</td></tr>
                                    <tr><td><strong>Created On:</strong></td><td>{selectedRow.createdOn}</td></tr>
                                    <tr><td><strong>Description:</strong></td><td style={{ whiteSpace: "pre-wrap" }}>{selectedRow.description}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                        <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                            <div className="text-center p-4">
                                <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                                <h4 className="mb-2">Are you sure?</h4>
                                <p className="text-muted mb-4">You want to remove this clause record?</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                    <button className="btn-danger-custom" style={{ background: "#ff3e1d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px" }} onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Yes, Delete!"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="table-title">{isEditing ? "Edit WB/BL Clause" : "Create"}</h4><button className="btn-secondary-custom" onClick={switchToTable}><i className="bx bx-arrow-back me-1"></i> Back to List</button></div>
            <div className="card p-0 shadow-none border"><div className="card-body p-4">
                <div className="row g-4 mb-4">
                    <div className="col-md-6"><label className="qt-label">Display Name <span className="text-danger">*</span></label><input type="text" name="displayName" className="qt-input" placeholder="Enter Display Name" value={formData.displayName} onChange={handleChange} />{errors.displayName && <small className="text-danger d-block mt-1">{errors.displayName}</small>}</div>
                    <div className="col-md-6"><label className="qt-label">EDI Code</label><input type="text" name="ediCode" className="qt-input" placeholder="Enter EDI Code" value={formData.ediCode} onChange={handleChange} /></div>
                </div>
                <div className="row mb-5"><div className="col-md-12"><label className="qt-label">Clause Description <span className="text-danger">*</span></label><textarea name="description" className="qt-input" placeholder="Enter Clause Description" rows="4" value={formData.description} onChange={handleChange} />{errors.description && <small className="text-danger d-block mt-1">{errors.description}</small>}</div></div>
                <div className="d-flex justify-content-end gap-3 mt-4"><button className="btn-secondary-custom" onClick={switchToTable}>Cancel</button><button className="btn-primary-custom" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : (isEditing ? "Update" : "Save")}</button></div>
            </div></div>
        </div>
    );
};

export default BLWBClause;