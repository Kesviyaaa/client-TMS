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
    iso: "", description: "", size: "", type: "", teus: "",
    isTankContainer: false, isTempControlled: false,
    tareWeight: "", tareWeightUnit: "KG",
    payload: "", payloadUnit: "KG",
    cubicCapacity: "", cubicCapacityUnit: "CCM",
    outerL: "", outerB: "", outerH: "", outerUnit: "MM",
    innerL: "", innerB: "", innerH: "",
    cgmCode: "", status: "Active"
};

const ContainerTypes = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dtRef1 = useRef(null);
    const dtRef2 = useRef(null);

    const [view, setView] = useState("table");
    const [loading, setLoading] = useState(false);
    const [containerTypes, setContainerTypes] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const API_BASE = "http://localhost:5005/api/container-types";

    const fetchData = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setContainerTypes(data);
            }
        } catch (err) { console.error("Error fetching container types:", err); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const switchToForm = () => {
        setView("form");
        window.scrollTo(0, 0);
    };

    const switchToTable = () => {
        setView("table");
    };

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (showDetailsModal || showDeleteModal) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [showDetailsModal, showDeleteModal]);

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
            dom: domLayout, responsive: true, data: containerTypes, paging: true, buttons: buttonsDef,
            columns: [
                { data: "iso", title: "ISO Code" },
                { data: "size", title: "Size" },
                { data: "type", title: "Type" },
                { data: "tareWeight", title: "Tare Weight" },
                { data: "payload", title: "Payload" },
                { data: "cubicCapacity", title: "Cubic Capacity" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "View", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-show view-btn text-info cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        dtRef2.current = $(tableRef2.current).DataTable({
            dom: domLayout, responsive: true, data: containerTypes, paging: true, buttons: buttonsDef,
            columns: [
                { data: "iso", title: "ISO Code" },
                { data: "size", title: "Size" },
                { data: "type", title: "Type" },
                { data: "tareWeight", title: "Tare Weight" },
                { data: "payload", title: "Payload" },
                { data: "cubicCapacity", title: "Cubic Capacity" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "Update", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Delete", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        const table1 = $(tableRef1.current);
        const table2 = $(tableRef2.current);

        table1.on("click", ".view-btn", function() {
            const row = containerTypes.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setSelectedRow(row); setModalTitle("Container Type Details"); setShowDetailsModal(true); }
        });

        table2.on("click", ".edit-btn", function() {
            const row = containerTypes.find(u => String(u._id) === String($(this).data("id")));
            if (row) { setFormData(row); setIsEditing(true); switchToForm(); }
        });

        table2.on("click", ".remove-btn", function() { setDeleteId($(this).data("id")); setShowDeleteModal(true); });

        setTimeout(() => { $(".dt-button").removeClass("btn btn-secondary"); }, 0);
        return () => { cleanup1(); cleanup2(); };
    }, [view, containerTypes]);

    const handleSave = async () => {
        const newErrors = {};
        if (!formData.iso) newErrors.iso = "ISO Code is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.size) newErrors.size = "Size is required";
        if (!formData.type) newErrors.type = "Type is required";
        if (!formData.teus) newErrors.teus = "TEU's is required";
        if (!formData.tareWeight) newErrors.tareWeight = "Tare Weight is required";
        if (!formData.payload) newErrors.payload = "Payload is required";
        if (!formData.cubicCapacity) newErrors.cubicCapacity = "Cubic Capacity is required";
        if (!formData.outerL || !formData.outerB || !formData.outerH) newErrors.outerDimensions = "Outer Dimensions are required";
        if (!formData.innerL || !formData.innerB || !formData.innerH) newErrors.innerDimensions = "Inner Dimensions are required";

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); window.scrollTo(0, 0); return; }

        setLoading(true);
        try {
            const res = await fetch(isEditing ? `${API_BASE}/${formData._id}` : API_BASE, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) { await fetchData(); switchToTable(); }
        } catch (err) { console.error("Error saving container type:", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
            if (res.ok) { await fetchData(); setShowDeleteModal(false); }
        } catch (err) { console.error("Error deleting container type:", err); }
        finally { setLoading(false); }
    };

    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y pb-5">
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <h4 className="table-title">Container Types</h4>
                </div>

                <div className="ocean-card">
                    <div className="ocean-title pb-1 m-0">
                        <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-package"></i></div> ContainerType Master Details</span>
                    </div>
                    <div className="card-datatable pb-1 p-3">
                        <table ref={tableRef1} className="table dataTable dtr-inline w-100 shadow-none">
                            <thead><tr><th>ISO Code</th><th>Size</th><th>Type</th><th>Tare Weight</th><th>Payload</th><th>Cubic Capacity</th><th>Status</th><th>View</th></tr></thead>
                        </table>
                    </div>
                </div>

                <div className="ocean-card mt-4">
                    <div className="ocean-title pb-1 m-0">
                        <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-box"></i></div> ContainerType Client Details</span>
                        <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={() => { setFormData(emptyForm); setIsEditing(false); switchToForm(); }}><i className="bx bx-plus"></i> Create</button>
                    </div>
                    <div className="card-datatable pb-1 p-3">
                        <table ref={tableRef2} className="table dataTable dtr-inline w-100 shadow-none">
                            <thead><tr><th>ISO Code</th><th>Size</th><th>Type</th><th>Tare Weight</th><th>Payload</th><th>Cubic Capacity</th><th>Status</th><th>Update</th><th>Delete</th></tr></thead>
                        </table>
                    </div>
                </div>

                {showDetailsModal && selectedRow && (
                    <div className="custom-modal-backdrop">
                        <div className="custom-modal-card" style={{ maxWidth: "500px" }}>
                            <button className="custom-close" onClick={() => setShowDetailsModal(false)}>×</button>
                            <h5 className="modal-title">{modalTitle}</h5>
                            <hr className="modal-divider" />
                            <table className="table table-sm border-0">
                                <tbody>
                                    <tr><td width="40%"><strong>ISO Code:</strong></td><td>{selectedRow.iso}</td></tr>
                                    <tr><td><strong>Size:</strong></td><td>{selectedRow.size}</td></tr>
                                    <tr><td><strong>Type:</strong></td><td>{selectedRow.type}</td></tr>
                                    <tr><td><strong>Tare Weight:</strong></td><td>{selectedRow.tareWeight} {selectedRow.tareWeightUnit}</td></tr>
                                    <tr><td><strong>Payload:</strong></td><td>{selectedRow.payload} {selectedRow.payloadUnit}</td></tr>
                                    <tr><td><strong>Cubic Capacity:</strong></td><td>{selectedRow.cubicCapacity} {selectedRow.cubicCapacityUnit}</td></tr>
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
                                <p className="text-muted mb-4">You want to delete this container type?</p>
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
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="table-title">{isEditing ? "Edit Container Type" : "Create"}</h4><button className="btn-secondary-custom" onClick={switchToTable}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List</button></div>
            <div className="card p-0 shadow-none border"><div className="card-body p-4">
                <div className="row g-3 mb-4">
                    <div className="col-md-3"><label className="qt-label">ISO <span className="text-danger">*</span></label><input type="text" name="iso" className="qt-input" placeholder="Enter ISO" value={formData.iso} onChange={handleChange} />{errors.iso && <small className="text-danger d-block mt-1">{errors.iso}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Description <span className="text-danger">*</span></label><input type="text" name="description" className="qt-input" placeholder="Enter Description" value={formData.description} onChange={handleChange} />{errors.description && <small className="text-danger d-block mt-1">{errors.description}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Size <span className="text-danger">*</span></label><select name="size" className="qt-input" value={formData.size} onChange={handleChange}><option value="">--Select Size--</option><option value="20">20</option><option value="40">40</option><option value="45">45</option></select>{errors.size && <small className="text-danger d-block mt-1">{errors.size}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Type <span className="text-danger">*</span></label><input type="text" name="type" className="qt-input" placeholder="Enter Type" value={formData.type} onChange={handleChange} />{errors.type && <small className="text-danger d-block mt-1">{errors.type}</small>}</div>
                </div>
                <div className="row g-3 mb-4">
                    <div className="col-md-3"><label className="qt-label">TEU's <span className="text-danger">*</span></label><input type="text" name="teus" className="qt-input" placeholder="Enter TEU's" value={formData.teus} onChange={handleChange} />{errors.teus && <small className="text-danger d-block mt-1">{errors.teus}</small>}</div>
                    <div className="col-md-3">
                        <label className="qt-label">Options</label>
                        <div className="d-flex gap-4 mt-2">
                            <div className="form-check"><input className="form-check-input" type="checkbox" name="isTankContainer" id="isTank" checked={formData.isTankContainer} onChange={handleChange} /><label className="form-check-label ms-1" htmlFor="isTank" style={{ fontSize: "12px", fontWeight: "600" }}>Tank</label></div>
                            <div className="form-check"><input className="form-check-input" type="checkbox" name="isTempControlled" id="isTemp" checked={formData.isTempControlled} onChange={handleChange} /><label className="form-check-label ms-1" htmlFor="isTemp" style={{ fontSize: "12px", fontWeight: "600" }}>Temp Controlled</label></div>
                        </div>
                    </div>
                    <div className="col-md-3"><label className="qt-label">Tare Weight <span className="text-danger">*</span></label><div className="d-flex gap-2"><input type="number" name="tareWeight" className="qt-input" value={formData.tareWeight} onChange={handleChange} /><select name="tareWeightUnit" className="qt-input" style={{ width: "80px" }} value={formData.tareWeightUnit} onChange={handleChange}><option value="KG">KG</option><option value="LB">LB</option></select></div>{errors.tareWeight && <small className="text-danger d-block mt-1">{errors.tareWeight}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Payload <span className="text-danger">*</span></label><div className="d-flex gap-2"><input type="number" name="payload" className="qt-input" value={formData.payload} onChange={handleChange} /><select name="payloadUnit" className="qt-input" style={{ width: "80px" }} value={formData.payloadUnit} onChange={handleChange}><option value="KG">KG</option><option value="LB">LB</option></select></div>{errors.payload && <small className="text-danger d-block mt-1">{errors.payload}</small>}</div>
                </div>
                <div className="row g-3 mb-4">
                    <div className="col-md-3"><label className="qt-label">Cubic Capacity <span className="text-danger">*</span></label><div className="d-flex gap-2"><input type="number" name="cubicCapacity" className="qt-input" value={formData.cubicCapacity} onChange={handleChange} /><select name="cubicCapacityUnit" className="qt-input" style={{ width: "80px" }} value={formData.cubicCapacityUnit} onChange={handleChange}><option value="CCM">CCM</option><option value="CFT">CFT</option></select></div>{errors.cubicCapacity && <small className="text-danger d-block mt-1">{errors.cubicCapacity}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Outer Dimensions (LBXH) <span className="text-danger">*</span></label><div className="d-flex gap-1"><input type="number" name="outerL" className="qt-input" placeholder="L" value={formData.outerL} onChange={handleChange} /><input type="number" name="outerB" className="qt-input" placeholder="B" value={formData.outerB} onChange={handleChange} /><input type="number" name="outerH" className="qt-input" placeholder="H" value={formData.outerH} onChange={handleChange} /><select name="outerUnit" className="qt-input" style={{ width: "80px" }} value={formData.outerUnit} onChange={handleChange}><option value="">--</option><option value="MM">MM</option><option value="CM">CM</option><option value="M">M</option></select></div>{errors.outerDimensions && <small className="text-danger d-block mt-1">{errors.outerDimensions}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">Inner Dimensions (LBXH) <span className="text-danger">*</span></label><div className="d-flex gap-1"><input type="number" name="innerL" className="qt-input" placeholder="L" value={formData.innerL} onChange={handleChange} /><input type="number" name="innerB" className="qt-input" placeholder="B" value={formData.innerB} onChange={handleChange} /><input type="number" name="innerH" className="qt-input" placeholder="H" value={formData.innerH} onChange={handleChange} /></div>{errors.innerDimensions && <small className="text-danger d-block mt-1">{errors.innerDimensions}</small>}</div>
                    <div className="col-md-3"><label className="qt-label">CGM Code</label><select name="cgmCode" className="qt-input" value={formData.cgmCode} onChange={handleChange}><option value=""></option></select></div>
                </div>
                <div className="row mb-5"><div className="col-md-6"><label className="qt-label mb-2">Status</label><div className="d-flex align-items-center gap-4 mt-2"><div className="form-check"><input className="form-check-input" type="radio" name="status" id="statActive" value="Active" checked={formData.status === "Active"} onChange={handleChange} /><label className="form-check-label ms-1" htmlFor="statActive" style={{ fontSize: "13px" }}>Active</label></div><div className="form-check"><input className="form-check-input" type="radio" name="status" id="statInActive" value="Inactive" checked={formData.status === "Inactive"} onChange={handleChange} /><label className="form-check-label ms-1" htmlFor="statInActive" style={{ fontSize: "13px" }}>Inactive</label></div></div></div></div>
                <div className="d-flex justify-content-end gap-3 mt-4"><button className="btn-secondary-custom" onClick={switchToTable}>Cancel</button><button className="btn-primary-custom" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : (isEditing ? "Update" : "Create")}</button></div>
            </div></div>
        </div>
    );
};

export default ContainerTypes;
