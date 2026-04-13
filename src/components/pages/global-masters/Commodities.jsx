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

const Commodities = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState("table");
    const [loading, setLoading] = useState(false);
    const [commodities, setCommodities] = useState([]);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        iataCode: "",
        nature: "",
        status: "Active",
    });

    const API_BASE = "http://localhost:5005/api/commodities";

    const fetchData = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setCommodities(data);
            }
        } catch (err) { console.error("Error fetching commodities:", err); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleOpenCreate = () => {
        setFormData({ name: "", description: "", iataCode: "", nature: "", status: "Active" });
        setIsEditing(false);
        setErrors({});
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

        dtRef.current = $(tableRef.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>><'row px-3'<'col-sm-12'tr>><'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: true, data: commodities, paging: true,
            buttons: [
                { extend: "collection", text: '<i class="bx bx-export"></i> Export', className: "export-btn", autoClose: true, dropIcon: false, buttons: ["print", "copy", "excel", "pdf"] },
                { extend: "colvis", text: '<i class="bx bx-columns"></i> Customise Columns', className: "custom-colvis", dropIcon: false }
            ],
            columns: [
                { data: "name", title: "Name" },
                { data: "description", title: "Description" },
                { data: "nature", title: "Nature" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "View", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-show view-btn text-info cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Edit", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Remove", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        const table = $(tableRef.current);
        table.off("click").on("click", ".view-btn", function() {
            const row = commodities.find(c => String(c._id) === String($(this).data("id")));
            if (row) { setSelectedRow(row); setShowDetailsModal(true); }
        });
        table.on("click", ".edit-btn", function() {
            const row = commodities.find(c => String(c._id) === String($(this).data("id")));
            if (row) { setFormData(row); setIsEditing(true); setErrors({}); setView("form"); window.scrollTo(0, 0); }
        });
        table.on("click", ".remove-btn", function() { setDeleteId($(this).data("id")); setShowDeleteModal(true); });

        setTimeout(() => { $(".dt-button").removeClass("btn btn-secondary"); }, 0);
        return cleanup;
    }, [view, commodities]);

    const handleSave = async () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.iataCode) newErrors.iataCode = "IATA Code is required";
        if (!formData.nature) newErrors.nature = "Nature is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo(0, 0);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(isEditing ? `${API_BASE}/${formData._id}` : API_BASE, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) { await fetchData(); setView("table"); }
        } catch (err) { console.error("Error saving:", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
            if (res.ok) { await fetchData(); setShowDeleteModal(false); }
        } catch (err) { console.error("Error deleting:", err); }
        finally { setLoading(false); }
    };

    const renderTableView = () => (
        <div className="container-xxl container-p-y pb-5">
            <h4 className="table-title mb-4">Commodity Master</h4>
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-package"></i></div> Commodity List</span>
                    <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={handleOpenCreate}><i className="bx bx-plus"></i> Create</button>
                </div>
                <div className="card-datatable pb-1 p-3">
                    <table ref={tableRef} className="table dataTable dtr-inline w-100 shadow-none">
                        <thead><tr><th>Name</th><th>Description</th><th>Nature</th><th>Status</th><th className="text-center">View</th><th className="text-center">Edit</th><th className="text-center">Remove</th></tr></thead>
                    </table>
                </div>
            </div>

            {showDetailsModal && selectedRow && (
                <div className="custom-modal-backdrop" style={{ zIndex: 9999 }}>
                    <div className="custom-modal-card" style={{ maxWidth: "500px" }}><button className="custom-close" onClick={() => setShowDetailsModal(false)}>×</button><h5 className="modal-title">Commodity Details</h5><hr className="modal-divider" /><div className="p-3"><table className="table table-sm border-0"><tbody><tr><td width="40%"><strong>Name:</strong></td><td>{selectedRow.name}</td></tr><tr><td><strong>Description:</strong></td><td>{selectedRow.description}</td></tr><tr><td><strong>IATA Code:</strong></td><td>{selectedRow.iataCode}</td></tr><tr><td><strong>Nature:</strong></td><td>{selectedRow.nature}</td></tr><tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr></tbody></table></div></div>
                </div>
            )}
            {showDeleteModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                    <div className="custom-modal-card" style={{ maxWidth: "400px" }}><div className="text-center p-4"><i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i><h4 className="mb-2">Are you sure?</h4><p className="text-muted mb-4">Delete this commodity permanently?</p><div className="d-flex justify-content-center gap-3"><button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn-danger-custom" style={{ background: "#ff3e1d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px" }} onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Yes, Delete!"}</button></div></div></div>
                </div>
            )}
        </div>
    );

    const renderFormView = () => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="table-title">{isEditing ? "Edit Commodity" : "Create"}</h4><button className="btn-secondary-custom" onClick={switchToTable}><i className="bx bx-arrow-back me-1"></i> Back to List</button></div>
            <div className="card p-0 shadow-none border"><div className="card-body p-4">
                <div className="row g-4 mb-4">
                    <div className="col-md-3"><label className="qt-label">Name <span className="text-danger">*</span></label><input type="text" name="name" className="qt-input" value={formData.name} onChange={handleFormChange} />{errors.name && <small className="text-danger d-block mt-1">{errors.name}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Description</label><input type="text" name="description" className="qt-input" value={formData.description} onChange={handleFormChange} /></div>
                    <div className="col-md-3"><label className="qt-label">IATA Code <span className="text-danger">*</span></label><input type="text" name="iataCode" className="qt-input" value={formData.iataCode} onChange={handleFormChange} />{errors.iataCode && <small className="text-danger d-block mt-1">{errors.iataCode}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Nature <span className="text-danger">*</span></label><select name="nature" className="qt-input" value={formData.nature} onChange={handleFormChange}><option value="">--Select Nature--</option><option value="Hazardous">Hazardous</option><option value="Non-Hazardous">Non-Hazardous</option><option value="Temperature Controlled">Temperature Controlled</option></select>{errors.nature && <small className="text-danger d-block mt-1">{errors.nature}</small>}</div>
                </div>
                <div className="row mb-5"><div className="col-md-6"><label className="qt-label mb-2">Status</label><div className="d-flex align-items-center gap-4 mt-2"><div className="form-check"><input className="form-check-input" type="radio" name="status" id="statActive" value="Active" checked={formData.status === "Active"} onChange={handleFormChange} /><label className="form-check-label ms-1" htmlFor="statActive" style={{ fontSize: "13px" }}>Active</label></div><div className="form-check"><input className="form-check-input" type="radio" name="status" id="statInActive" value="Inactive" checked={formData.status === "Inactive"} onChange={handleFormChange} /><label className="form-check-label ms-1" htmlFor="statInActive" style={{ fontSize: "13px" }}>Inactive</label></div></div></div></div>
                <div className="d-flex justify-content-end gap-3 mt-4"><button className="btn-secondary-custom" onClick={switchToTable}>Cancel</button><button className="btn-primary-custom" id="commodity-save-btn" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : (isEditing ? "Update" : "Create")}</button></div>
            </div></div>
        </div>
    );

    return <React.Fragment>{view === "table" ? renderTableView() : renderFormView()}</React.Fragment>;
};

export default Commodities;
