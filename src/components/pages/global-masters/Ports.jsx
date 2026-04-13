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

const Ports = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dtRef1 = useRef(null);
    const dtRef2 = useRef(null);

    const [view, setView] = useState("table");
    const [loading, setLoading] = useState(false);
    const [ports, setPorts] = useState([]);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        portName: "",
        portCode: "",
        country: "",
        timeZone: "",
        stateProvince: "",
        tradeLine: "",
        iata: "",
        uneceCode: "",
        coordinates: "",
        isSeaPort: false,
        isRailTerminal: false,
        isRoadTerminal: false,
        isAirportTerminal: false,
        isPostalExchange: false,
        isMultimodal: false,
        isFixedTransport: false,
        isBorderCrossing: false,
        schedKCode: "",
        schedDCodeAirport: "",
        schedDCodeSeaport: "",
        status: "Active"
    });

    const API_BASE = "http://localhost:5005/api/ports";

    // ✅ Fetch Data
    const fetchData = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setPorts(data);
            }
        } catch (err) {
            console.error("Error fetching ports:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            portName: "", portCode: "", country: "", timeZone: "", stateProvince: "",
            tradeLine: "", iata: "", uneceCode: "", coordinates: "", isSeaPort: false,
            isRailTerminal: false, isRoadTerminal: false, isAirportTerminal: false,
            isPostalExchange: false, isMultimodal: false, isFixedTransport: false,
            isBorderCrossing: false, schedKCode: "", schedDCodeAirport: "",
            schedDCodeSeaport: "", status: "Active"
        });
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
    const [modalTitle, setModalTitle] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // lock scroll
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

        const buttonsConfig = [
            {
                extend: "collection",
                text: '<i class="bx bx-export"></i> Export',
                className: "export-btn",
                autoClose: true,
                dropIcon: false,
                buttons: ["print", "copy", "excel", "pdf"]
            },
            {
                extend: "colvis",
                text: '<i class="bx bx-columns"></i> Customise Columns',
                className: "custom-colvis",
                dropIcon: false
            }
        ];

        dtRef1.current = $(tableRef1.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>><'row px-3'<'col-sm-12'tr>><'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: true, data: ports, paging: true, buttons: buttonsConfig,
            columns: [
                { data: "portName", title: "Port Name" },
                { data: "portCode", title: "Port Code" },
                { data: "uneceCode", title: "UNECE Code" },
                { data: "iata", title: "IATA Code" },
                { data: "country", title: "Country" },
                { data: "timeZone", title: "Time Zone" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "View", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-show view-btn text-info cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        dtRef2.current = $(tableRef2.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>><'row px-3'<'col-sm-12'tr>><'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: true, data: ports, paging: true, buttons: buttonsConfig,
            columns: [
                { data: "portName", title: "Port Name" },
                { data: "portCode", title: "Port Code" },
                { data: "uneceCode", title: "UNECE Code" },
                { data: "iata", title: "IATA Code" },
                { data: "country", title: "Country" },
                { data: "timeZone", title: "Time Zone" },
                { data: "status", title: "Status", render: (d) => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>` },
                { data: null, title: "Edit", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
                { data: null, title: "Remove", className: "text-center", orderable: false, render: (d) => `<i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${d._id}" style="font-size:18px;"></i>` },
            ]
        });

        const table1 = $(tableRef1.current);
        const table2 = $(tableRef2.current);

        table1.off("click").on("click", ".view-btn", function () {
            const rowArr = ports.filter(p => String(p._id) === String($(this).data("id")));
            if (rowArr.length > 0) { setSelectedRow(rowArr[0]); setModalTitle("Port Details"); setShowDetailsModal(true); }
        });

        table2.off("click").on("click", ".edit-btn", function () {
            const rowArr = ports.filter(p => String(p._id) === String($(this).data("id")));
            if (rowArr.length > 0) { 
                setFormData(rowArr[0]); 
                setIsEditing(true); 
                setErrors({});
                setView("form");
                window.scrollTo(0,0);
            }
        });

        table2.on("click", ".remove-btn", function () { setDeleteId($(this).data("id")); setShowDeleteModal(true); });

        setTimeout(() => { $(".dt-button").removeClass("btn btn-secondary"); }, 0);
        return () => { cleanup1(); cleanup2(); };
    }, [view, ports]);

    const handleSave = async () => {
        const newErrors = {};
        const required = ["portName", "portCode", "country", "timeZone", "stateProvince", "uneceCode"];
        required.forEach(f => { if (!formData[f]) newErrors[f] = `${f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1')} is required`; });
        
        if (Object.keys(newErrors).length > 0) { 
            setErrors(newErrors); 
            window.scrollTo(0, 0);
            return; 
        }

        setLoading(true);
        try {
            const url = isEditing ? `${API_BASE}/${formData._id}` : API_BASE;
            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) { await fetchData(); switchToTable(); }
        } catch (err) { console.error("Error saving port:", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
            if (res.ok) { await fetchData(); setShowDeleteModal(false); }
        } catch (err) { console.error("Error deleting port:", err); }
        finally { setLoading(false); }
    };

    const renderTableView = () => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <h4 className="table-title mb-4">Port Masters</h4>
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0"><span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-map-pin"></i></div> Port Master Details</span></div>
                <div className="card-datatable pb-1 p-3">
                    <table ref={tableRef1} className="table dataTable dtr-inline w-100 shadow-none">
                        <thead><tr><th>Port Name</th><th>Port Code</th><th>UNECE Code</th><th>IATA Code</th><th>Country</th><th>Time Zone</th><th>Status</th><th className="text-center">View</th></tr></thead>
                    </table>
                </div>
            </div>
            <div className="ocean-card mt-4">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-globe"></i></div> Port Client Details</span>
                    <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={handleOpenCreate}><i className="bx bx-plus"></i> Create</button>
                </div>
                <div className="card-datatable pb-1 p-3">
                    <table ref={tableRef2} className="table dataTable dtr-inline w-100 shadow-none">
                        <thead><tr><th>Port Name</th><th>Port Code</th><th>UNECE Code</th><th>IATA Code</th><th>Country</th><th>Time Zone</th><th>Status</th><th className="text-center">Edit</th><th className="text-center">Remove</th></tr></thead>
                    </table>
                </div>
            </div>

            {showDetailsModal && selectedRow && (
                <div className="custom-modal-backdrop" style={{ zIndex: 9999 }}><div className="custom-modal-card" style={{ maxWidth: "500px" }}><button className="custom-close" onClick={() => setShowDetailsModal(false)}>×</button><h5 className="modal-title">{modalTitle}</h5><hr className="modal-divider" /><div className="p-3"><table className="table table-sm border-0"><tbody><tr><td width="40%"><strong>Port Name:</strong></td><td>{selectedRow.portName}</td></tr><tr><td><strong>Port Code:</strong></td><td>{selectedRow.portCode}</td></tr><tr><td><strong>UNECE Code:</strong></td><td>{selectedRow.uneceCode}</td></tr><tr><td><strong>IATA Code:</strong></td><td>{selectedRow.iata}</td></tr><tr><td><strong>Country:</strong></td><td>{selectedRow.country}</td></tr><tr><td><strong>Time Zone:</strong></td><td>{selectedRow.timeZone}</td></tr><tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr></tbody></table></div></div></div>
            )}
            {showDeleteModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}><div className="custom-modal-card" style={{ maxWidth: "400px" }}><div className="text-center p-4"><i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i><h4 className="mb-2">Are you sure?</h4><p className="text-muted mb-4">Delete this port permanently?</p><div className="d-flex justify-content-center gap-3"><button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn-danger-custom" style={{ background: "#ff3e1d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px" }} onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Yes, Delete!"}</button></div></div></div></div>
            )}
        </div>
    );

    const renderFormView = () => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="table-title">{isEditing ? "Edit" : "Create"}</h4><button className="btn-secondary-custom" onClick={switchToTable}><i className="bx bx-arrow-back me-1"></i> Back to List</button></div>
            <div className="card p-0 shadow-none border"><div className="card-body p-4">
                <div className="row g-4">
                    <div className="col-md-9">
                        <div className="mb-4">
                            <span className="inner-section-title">Basic Information</span>
                            <div className="row g-3 mt-1">
                                <div className="col-md-4"><label className="qt-label">Port Name <span className="text-danger">*</span></label><input type="text" name="portName" className="qt-input" value={formData.portName} onChange={handleFormChange} />{errors.portName && <small className="text-danger d-block mt-1">{errors.portName}</small>}</div>
                                <div className="col-md-4"><label className="qt-label">Port Code <span className="text-danger">*</span></label><input type="text" name="portCode" className="qt-input" value={formData.portCode} onChange={handleFormChange} />{errors.portCode && <small className="text-danger d-block mt-1">{errors.portCode}</small>}</div>
                                <div className="col-md-4"><label className="qt-label">Country <span className="text-danger">*</span></label><select name="country" className="qt-input" value={formData.country} onChange={handleFormChange}><option value="">--Select--</option><option value="India">India</option><option value="USA">USA</option><option value="UAE">UAE</option></select>{errors.country && <small className="text-danger d-block mt-1">{errors.country}</small>}</div>
                                <div className="col-md-4"><label className="qt-label">TimeZone <span className="text-danger">*</span></label><select name="timeZone" className="qt-input" value={formData.timeZone} onChange={handleFormChange}><option value="">Select TimeZone</option><option value="GMT+5:30">GMT+5:30</option><option value="GMT+4:00">GMT+4:00</option></select>{errors.timeZone && <small className="text-danger d-block mt-1">{errors.timeZone}</small>}</div>
                                <div className="col-md-4"><label className="qt-label">State / Province <span className="text-danger">*</span></label><input type="text" name="stateProvince" className="qt-input" value={formData.stateProvince} onChange={handleFormChange} />{errors.stateProvince && <small className="text-danger d-block mt-1">{errors.stateProvince}</small>}</div>
                                <div className="col-md-4"><label className="qt-label">Trade Line</label><select name="tradeLine" className="qt-input" value={formData.tradeLine} onChange={handleFormChange}><option value="">Select TradeLine</option></select></div>
                                <div className="col-md-4"><label className="qt-label">IATA</label><input type="text" name="iata" className="qt-input" placeholder="Enter IATA Code" value={formData.iata} onChange={handleFormChange} /></div>
                                <div className="col-md-4"><label className="qt-label">UNECE Code <span className="text-danger">*</span></label><input type="text" name="uneceCode" className="qt-input" placeholder="Enter UNECE Code" value={formData.uneceCode} onChange={handleFormChange} />{errors.uneceCode && <small className="text-danger d-block mt-1">{errors.uneceCode}</small>}</div>
                                <div className="col-md-4"><label className="qt-label">Coordinates</label><input type="text" name="coordinates" className="qt-input" placeholder="Enter Coordinates" value={formData.coordinates} onChange={handleFormChange} /></div>
                            </div>
                        </div>
                        <div className="row g-3 mt-1">
                            <div className="col-md-4"><label className="qt-label">Sched-K Code</label><input type="text" name="schedKCode" className="qt-input" value={formData.schedKCode} onChange={handleFormChange} /></div>
                            <div className="col-md-4"><label className="qt-label">Sched-D Code (Airport)</label><input type="text" name="schedDCodeAirport" className="qt-input" value={formData.schedDCodeAirport} onChange={handleFormChange} /></div>
                            <div className="col-md-4"><label className="qt-label">Sched-D Code (Seaport)</label><input type="text" name="schedDCodeSeaport" className="qt-input" value={formData.schedDCodeSeaport} onChange={handleFormChange} /></div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 border rounded-3 h-100" style={{ background: "#f8f9fa", borderColor: "#e2e5e8" }}>
                            <span className="inner-section-title mb-3 d-block">Port Function</span>
                            <div className="d-flex flex-column gap-2 mt-2">
                                {[
                                    { id: "SeaPort", label: "Sea Port", name: "isSeaPort" },
                                    { id: "RailTerminal", label: "Rail Terminal", name: "isRailTerminal" },
                                    { id: "RoadTerminal", label: "Road Terminal", name: "isRoadTerminal" },
                                    { id: "AirportTerminal", label: "Airport Terminal", name: "isAirportTerminal" },
                                    { id: "PostalExchange", label: "Postal Office", name: "isPostalExchange" },
                                    { id: "Multimodal", label: "Multimodal (ICD)", name: "isMultimodal" },
                                    { id: "FixedTransport", label: "Fixed Transport (Oil Platform)", name: "isFixedTransport" },
                                    { id: "BorderCrossing", label: "Border Crossing", name: "isBorderCrossing" },
                                ].map(item => (
                                    <div className="form-check" key={item.id}>
                                        <input className="form-check-input mt-1" type="checkbox" name={item.name} id={`chk${item.id}`} checked={formData[item.name]} onChange={handleFormChange} />
                                        <label className="form-check-label ms-2" htmlFor={`chk${item.id}`} style={{ color: "#566a7f", fontSize: "11px", fontWeight: "600" }}>{item.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-end gap-3 mt-5"><button className="btn-secondary-custom" onClick={switchToTable}>Cancel</button><button className="btn-primary-custom" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : (isEditing ? "Update" : "Create")}</button></div>
            </div></div>
        </div>
    );

    return <React.Fragment>{view === "table" ? renderTableView() : renderFormView()}</React.Fragment>;
};

export default Ports;
