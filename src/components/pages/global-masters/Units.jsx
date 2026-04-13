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

    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    /* ───── Modal State ───── */
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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

    const API_BASE = "http://localhost:5005/api/units";

    const fetchData = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setUnits(data);
            }
        } catch (err) { console.error("Error fetching units:", err); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleCreateClose = () => {
        setShowCreateModal(false);
        setCreateFormData({
            description: "", uneceCode: "", code: "", type: "", plural: "",
            noOfDecimals: "", conversionFactorValue: "", conversionFactorUnit: "", status: "Active",
        });
        setErrors({});
        setIsEditing(false);
    };

    useEffect(() => {
        if (showDetailsModal || showDeleteModal || showCreateModal) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [showDetailsModal, showDeleteModal, showCreateModal]);

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (!tableRef1.current || !tableRef2.current) return;

        const cleanup1 = () => { if (dtRef1.current) { dtRef1.current.destroy(); $(tableRef1.current).empty(); dtRef1.current = null; } };
        const cleanup2 = () => { if (dtRef2.current) { dtRef2.current.destroy(); $(tableRef2.current).empty(); dtRef2.current = null; } };

        cleanup1(); cleanup2();
        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        const buttonsDef = [
            { extend: "collection", text: '<i class="bx bx-export"></i> Export', className: "export-btn", autoClose: true, dropIcon: false, buttons: ["print", "copy", "excel", "pdf"] },
            { extend: "colvis", text: '<i class="bx bx-columns"></i> Customise Columns', className: "custom-colvis", dropIcon: false },
        ];

        const domFull = "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>><'row px-3'<'col-sm-12'tr>><'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>";

        dtRef1.current = $(tableRef1.current).DataTable({
            dom: domFull, responsive: true, data: units, buttons: buttonsDef,
            columns: [
                { data: "description", title: "Description" },
                { data: "code", title: "Code" },
                { data: "uneceCode", title: "UNECE Code" },
                { data: "type", title: "Type" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "View", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-show view-btn text-info cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        dtRef2.current = $(tableRef2.current).DataTable({
            dom: domFull, responsive: true, data: units, buttons: buttonsDef,
            columns: [
                { data: "description", title: "Description" },
                { data: "code", title: "Code" },
                { data: "uneceCode", title: "UNECE Code" },
                { data: "type", title: "Type" },
                { data: null, title: "Edit", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Remove", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        const table1 = $(tableRef1.current);
        const table2 = $(tableRef2.current);

        table1.on("click", ".view-btn", function() {
            const row = units.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setSelectedRow(row); setModalTitle("Unit Details"); setShowDetailsModal(true); }
        });

        table2.on("click", ".edit-btn", function() {
            const row = units.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setCreateFormData(row); setIsEditing(true); setShowCreateModal(true); }
        });

        table2.on("click", ".remove-btn", function() { setDeleteId($(this).data("id")); setShowDeleteModal(true); });

        setTimeout(() => { $(".dt-button").removeClass("btn btn-secondary"); }, 0);
        return () => { cleanup1(); cleanup2(); };
    }, [units]);

    const handleSave = async () => {
        const newErrors = {};
        if (!createFormData.description) newErrors.description = "Required";
        if (!createFormData.code) newErrors.code = "Required";
        if (!createFormData.type) newErrors.type = "Required";

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setLoading(true);
        try {
            const res = await fetch(isEditing ? `${API_BASE}/${createFormData._id}` : API_BASE, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createFormData)
            });
            if (res.ok) { await fetchData(); handleCreateClose(); }
        } catch (err) { console.error("Error saving unit:", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
            if (res.ok) { await fetchData(); setShowDeleteModal(false); }
        } catch (err) { console.error("Error deleting unit:", err); }
        finally { setLoading(false); }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <h4 className="table-title mb-4">Unit Master</h4>

            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-ruler"></i></div> Master Units</span>
                </div>
                <div className="card-datatable pb-1 p-3">
                    <table ref={tableRef1} className="table dataTable dtr-inline w-100 shadow-none">
                        <thead><tr><th>Description</th><th>Code</th><th>UNECE Code</th><th>Type</th><th>Status</th><th>View</th></tr></thead>
                    </table>
                </div>
            </div>

            <div className="ocean-card mt-4">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-list-ul"></i></div> Client Units</span>
                    <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={() => { setIsEditing(false); setShowCreateModal(true); }}><i className="bx bx-plus"></i> Create</button>
                </div>
                <div className="card-datatable pb-1 p-3">
                    <table ref={tableRef2} className="table dataTable dtr-inline w-100 shadow-none">
                        <thead><tr><th>Description</th><th>Code</th><th>UNECE Code</th><th>Type</th><th>Edit</th><th>Remove</th></tr></thead>
                    </table>
                </div>
            </div>

            {/* ───── CREATE/EDIT MODAL ───── */}
            {showCreateModal && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal-card" style={{ maxWidth: "700px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="modal-title">{isEditing ? "Edit Unit Master" : "Create Unit Master"}</h5>
                            <button className="custom-close" onClick={handleCreateClose}>×</button>
                        </div>
                        <hr className="modal-divider" />

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="qt-label">Description <span className="text-danger">*</span></label>
                                <div className="input-icon">
                                    <i className="bx bx-detail input-icon-left"></i>
                                    <input type="text" name="description" className="qt-input" value={createFormData.description} onChange={handleCreateChange} placeholder="Enter Description" />
                                </div>
                                {errors.description && <small className="text-danger">{errors.description}</small>}
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">UNECE Code</label>
                                <div className="input-icon">
                                    <i className="bx bx-barcode input-icon-left"></i>
                                    <input type="text" name="uneceCode" className="qt-input" value={createFormData.uneceCode} onChange={handleCreateChange} placeholder="Enter UNECE Code" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Code <span className="text-danger">*</span></label>
                                <div className="input-icon">
                                    <i className="bx bx-hash input-icon-left"></i>
                                    <input type="text" name="code" className="qt-input" value={createFormData.code} onChange={handleCreateChange} placeholder="Enter Code" />
                                </div>
                                {errors.code && <small className="text-danger">{errors.code}</small>}
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Type <span className="text-danger">*</span></label>
                                <div className="input-icon">
                                    <i className="bx bx-list-ul input-icon-left"></i>
                                    <select name="type" className="qt-input" value={createFormData.type} onChange={handleCreateChange}>
                                        <option value="">--Select Type--</option>
                                        <option value="Area">Area</option>
                                        <option value="Number">Number</option>
                                        <option value="Weight">Weight</option>
                                        <option value="Volume">Volume</option>
                                    </select>
                                </div>
                                {errors.type && <small className="text-danger">{errors.type}</small>}
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Plural</label>
                                <div className="input-icon">
                                    <i className="bx bx-rename input-icon-left"></i>
                                    <input type="text" name="plural" className="qt-input" value={createFormData.plural} onChange={handleCreateChange} placeholder="Enter Plural" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">No of Decimals</label>
                                <div className="input-icon">
                                    <i className="bx bx-calculator input-icon-left"></i>
                                    <input type="number" name="noOfDecimals" className="qt-input" value={createFormData.noOfDecimals} onChange={handleCreateChange} placeholder="Enter Number of Decimals" />
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="qt-label">Conversion Factor</label>
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontSize: "14px", fontWeight: "600", minWidth: "30px" }}>1 =</span>
                                    <input type="number" name="conversionFactorValue" className="qt-input" style={{ width: "120px" }} value={createFormData.conversionFactorValue} onChange={handleCreateChange} />
                                    <select name="conversionFactorUnit" className="qt-input" style={{ width: "150px" }} value={createFormData.conversionFactorUnit} onChange={handleCreateChange}>
                                        <option value="">--Select--</option>
                                        <option value="KGS">KGS</option>
                                        <option value="CBM">CBM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="qt-label d-block">Status</label>
                                <div className="d-flex gap-4 mt-2">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="statusActive" value="Active" checked={createFormData.status === "Active"} onChange={handleCreateChange} />
                                        <label className="form-check-label ms-2" htmlFor="statusActive">Active</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="statusInactive" value="Inactive" checked={createFormData.status === "Inactive"} onChange={handleCreateChange} />
                                        <label className="form-check-label ms-2" htmlFor="statusInactive">Inactive</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="modal-divider" />
                        <div className="modal-buttons mt-4">
                            <button className="btn-secondary-custom px-4" onClick={handleCreateClose}>Cancel</button>
                            <button className="btn-primary-custom px-4" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : (isEditing ? "Update" : "Create")}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ───── DETAILS MODAL ───── */}
            {showDetailsModal && selectedRow && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal-card" style={{ maxWidth: "500px" }}>
                        <button className="custom-close" onClick={() => setShowDetailsModal(false)}>×</button>
                        <h5 className="modal-title">{modalTitle}</h5>
                        <hr className="modal-divider" />
                        <table className="table table-sm border-0">
                            <tbody>
                                <tr><td width="40%"><strong>Description:</strong></td><td>{selectedRow.description}</td></tr>
                                <tr><td><strong>Code:</strong></td><td>{selectedRow.code}</td></tr>
                                <tr><td><strong>UNECE Code:</strong></td><td>{selectedRow.uneceCode}</td></tr>
                                <tr><td><strong>Type:</strong></td><td>{selectedRow.type}</td></tr>
                                {selectedRow.plural && <tr><td><strong>Plural:</strong></td><td>{selectedRow.plural}</td></tr>}
                                {selectedRow.conversionFactorValue && <tr><td><strong>Conversion:</strong></td><td>1 = {selectedRow.conversionFactorValue} {selectedRow.conversionFactorUnit}</td></tr>}
                                <tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr>
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
                                <button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn-danger-custom" style={{ background: "#ff3e1d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px" }} onClick={handleDelete} disabled={loading}>{loading ? "Removing..." : "Yes, Remove it!"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Units;
