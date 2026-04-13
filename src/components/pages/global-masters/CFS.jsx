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
    cfsName: "",
    cfsCode: "",
    address: "",
    contactPerson: "",
    mobile: "",
    status: "Active",
};

const CFS = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dtRef1 = useRef(null);
    const dtRef2 = useRef(null);

    const [view, setView] = useState("table");
    const [loading, setLoading] = useState(false);
    const [cfsList, setCfsList] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const API_BASE = "http://localhost:5005/api/cfs";

    const fetchData = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setCfsList(data);
            }
        } catch (err) { console.error("Error fetching CFS:", err); }
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
        if (view !== "table" || !tableRef1.current || !tableRef2.current) return;

        const cleanup1 = () => { if (dtRef1.current) { dtRef1.current.destroy(); $(tableRef1.current).empty(); dtRef1.current = null; } };
        const cleanup2 = () => { if (dtRef2.current) { dtRef2.current.destroy(); $(tableRef2.current).empty(); dtRef2.current = null; } };
        cleanup1(); cleanup2();

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        const buttonsDef = [
            { extend: "collection", text: '<i class="bx bx-export"></i> Export', className: "export-btn", autoClose: true, dropIcon: false, buttons: ["print", "copy", "excel", "pdf"] },
            { extend: "colvis", text: '<i class="bx bx-columns"></i> Customise Columns', className: "custom-colvis", dropIcon: false },
        ];
        const domLayout = "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>><'row px-3'<'col-sm-12'tr>><'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>";

        dtRef1.current = $(tableRef1.current).DataTable({
            dom: domLayout, responsive: true, data: cfsList, paging: true, buttons: buttonsDef,
            columns: [
                { data: "cfsName", title: "CFS / Yard Name" },
                { data: "cfsCode", title: "Code" },
                { data: "contactPerson", title: "Contact Person" },
                { data: "mobile", title: "Mobile" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "View", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-show view-btn text-info cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        dtRef2.current = $(tableRef2.current).DataTable({
            dom: domLayout, responsive: true, data: cfsList, paging: true, buttons: buttonsDef,
            columns: [
                { data: "cfsName", title: "CFS / Yard Name" },
                { data: "cfsCode", title: "Code" },
                { data: "contactPerson", title: "Contact Person" },
                { data: "mobile", title: "Mobile" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "Edit", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Delete", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        const table1 = $(tableRef1.current);
        const table2 = $(tableRef2.current);

        table1.on("click", ".view-btn", function() {
            const row = cfsList.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setSelectedRow(row); setShowDetailsModal(true); }
        });

        table2.on("click", ".edit-btn", function() {
            const row = cfsList.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setFormData(row); setIsEditing(true); switchToForm(); }
        });

        table2.on("click", ".remove-btn", function() { setDeleteId($(this).data("id")); setShowDeleteModal(true); });

        setTimeout(() => { $(".dt-button").removeClass("btn btn-secondary"); }, 0);
        return () => { cleanup1(); cleanup2(); };
    }, [view, cfsList]);

    const handleSave = async () => {
        const newErrors = {};
        if (!formData.cfsName) newErrors.cfsName = "CFS Name is required";
        if (!formData.cfsCode) newErrors.cfsCode = "Code is required";

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); window.scrollTo(0, 0); return; }

        setLoading(true);
        try {
            const res = await fetch(isEditing ? `${API_BASE}/${formData._id}` : API_BASE, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) { await fetchData(); switchToTable(); }
        } catch (err) { console.error("Error saving CFS:", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
            if (res.ok) { await fetchData(); setShowDeleteModal(false); }
        } catch (err) { console.error("Error deleting CFS:", err); }
        finally { setLoading(false); }
    };

    if (view === "table") {
        return (
            <div className="container-xxl container-p-y pb-5">
                <h4 className="table-title mb-4">CFS / Yard Master</h4>

                <div className="ocean-card">
                    <div className="ocean-title pb-1 m-0">
                        <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-map-pin"></i></div> CFS Master Details</span>
                    </div>
                    <div className="card-datatable pb-1 p-3">
                        <table ref={tableRef1} className="table dataTable dtr-inline w-100 shadow-none">
                            <thead><tr><th>CFS / Yard Name</th><th>Code</th><th>Contact Person</th><th>Mobile</th><th>Status</th><th>View</th></tr></thead>
                        </table>
                    </div>
                </div>

                <div className="ocean-card mt-4">
                    <div className="ocean-title pb-1 m-0">
                        <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-buildings"></i></div> CFS Client Details</span>
                        <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={() => { setFormData(emptyForm); setIsEditing(false); switchToForm(); }}><i className="bx bx-plus"></i> Create</button>
                    </div>
                    <div className="card-datatable pb-1 p-3">
                        <table ref={tableRef2} className="table dataTable dtr-inline w-100 shadow-none">
                            <thead><tr><th>CFS / Yard Name</th><th>Code</th><th>Contact Person</th><th>Mobile</th><th>Status</th><th>Edit</th><th>Delete</th></tr></thead>
                        </table>
                    </div>
                </div>

                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop">
                        <div className="custom-modal-card" style={{ maxWidth: "500px" }}>
                            <button className="custom-close" onClick={() => setShowDetailsModal(false)}>×</button>
                            <h5 className="modal-title">CFS / Yard Details</h5>
                            <hr className="modal-divider" />
                            <table className="table table-sm border-0">
                                <tbody>
                                    <tr><td width="40%"><strong>Name:</strong></td><td>{selectedRow.cfsName}</td></tr>
                                    <tr><td><strong>Code:</strong></td><td>{selectedRow.cfsCode}</td></tr>
                                    <tr><td><strong>Contact Person:</strong></td><td>{selectedRow.contactPerson}</td></tr>
                                    <tr><td><strong>Mobile:</strong></td><td>{selectedRow.mobile}</td></tr>
                                    <tr><td><strong>Address:</strong></td><td>{selectedRow.address}</td></tr>
                                    <tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr>
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
                                <p className="text-muted mb-4">You want to delete this CFS record?</p>
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
        <div className="container-xxl container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="table-title">{isEditing ? "Edit CFS / Yard Master" : "Create"}</h4><button className="btn-secondary-custom" onClick={switchToTable}><i className="bx bx-arrow-back me-1"></i> Back to List</button></div>
            <div className="card p-0 shadow-none border"><div className="card-body p-4">
                <div className="row g-4 mb-4">
                    <div className="col-md-6"><label className="qt-label">Name <span className="text-danger">*</span></label><input type="text" name="cfsName" className="qt-input" placeholder="Enter CFS / Yard Name" value={formData.cfsName} onChange={handleChange} />{errors.cfsName && <small className="text-danger d-block mt-1">{errors.cfsName}</small>}</div>
                    <div className="col-md-6"><label className="qt-label">Code <span className="text-danger">*</span></label><input type="text" name="cfsCode" className="qt-input" placeholder="Enter Code" value={formData.cfsCode} onChange={handleChange} />{errors.cfsCode && <small className="text-danger d-block mt-1">{errors.cfsCode}</small>}</div>
                </div>
                <div className="row g-4 mb-4">
                    <div className="col-md-6"><label className="qt-label">Contact Person</label><input type="text" name="contactPerson" className="qt-input" placeholder="Enter Name" value={formData.contactPerson} onChange={handleChange} /></div>
                    <div className="col-md-6"><label className="qt-label">Mobile</label><input type="text" name="mobile" className="qt-input" placeholder="Enter Contact Number" value={formData.mobile} onChange={handleChange} /></div>
                </div>
                <div className="row g-4 mb-4"><div className="col-md-12"><label className="qt-label">Address</label><textarea name="address" className="qt-input" placeholder="Enter Full Address" rows="3" value={formData.address} onChange={handleChange} /></div></div>
                <div className="row mb-5"><div className="col-md-6"><label className="qt-label mb-2">Status</label><div className="d-flex align-items-center gap-4 mt-2"><div className="form-check"><input className="form-check-input" type="radio" name="status" id="stActive" value="Active" checked={formData.status === "Active"} onChange={handleChange} /><label className="form-check-label ms-1" htmlFor="stActive" style={{ fontSize: "13px" }}>Active</label></div><div className="form-check"><input className="form-check-input" type="radio" name="status" id="stInactive" value="Inactive" checked={formData.status === "Inactive"} onChange={handleChange} /><label className="form-check-label ms-1" htmlFor="stInactive" style={{ fontSize: "13px" }}>Inactive</label></div></div></div></div>
                <div className="d-flex justify-content-end gap-3 mt-4"><button className="btn-secondary-custom" onClick={switchToTable}>Cancel</button><button className="btn-primary-custom" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : (isEditing ? "Update" : "Create")}</button></div>
            </div></div>
        </div>
    );
};

export default CFS;
