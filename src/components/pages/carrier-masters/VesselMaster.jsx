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

const VesselsMaster = () => {
    const tableRef1 = useRef(null);
    const tableRef2 = useRef(null);
    const dt1 = useRef(null);
    const dt2 = useRef(null);
    const openedRowRef1 = useRef(null);
    const openedRowRef2 = useRef(null);

    const [view, setView] = useState("table"); // table | form | view
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [modalTitle, setModalTitle] = useState("");

    const [formData, setFormData] = useState({
        vesselName: "",
        vesselCode: "",
        imo: "",
        shippingLine: "",
        vesselType: "",
        countryFlag: "",
        callSign: "",
        lloyd: "",
        status: "Active"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const switchToForm = () => {
        if (dt1.current) dt1.current.destroy();
        if (dt2.current) dt2.current.destroy();
        dt1.current = null;
        dt2.current = null;
        setView("form");
    };

    const switchToTable = () => {
        setView("table");
    };

    /* ───────────── DATATABLE INIT ───────────── */
    useEffect(() => {
        if (view !== "table" || !tableRef1.current || !tableRef2.current) return;
        if (dt1.current || dt2.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        const domLayout =
            "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
            "<'row px-3'<'col-sm-12'tr>>" +
            "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>";

        const commonButtons = [
            {
                extend: "collection",
                text: '<i class="bx bx-export"></i> Export',
                className: "export-btn",
                dropIcon: false,
                autoClose: true,
                buttons: [
                    { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
                    { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
                    { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
                    { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
                ]
            },
            {
                extend: "colvis",
                text: '<i class="bx bx-columns"></i> Customise Columns',
                className: "custom-colvis",
                dropIcon: false,
                columns: ":not(.no-export)"
            }
        ];

        // ── Table 1: Vessel Master Details ──
        dt1.current = $(tableRef1.current).DataTable({
            dom: domLayout,
            data: [],
            responsive: true,
            buttons: commonButtons,
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "vesselName", title: "Vessel Name", responsivePriority: 1 },
                { data: "imo", title: "IMO Number", responsivePriority: 2 },
                { data: "shippingLine", title: "Shipping Line", responsivePriority: 3 },
                { data: "vesselType", title: "Vessel Type", responsivePriority: 4 },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    render: d => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>`
                },
                {
                    data: null,
                    title: "View",
                    className: "text-center no-export",
                    orderable: false,
                    responsivePriority: 1,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-show view-btn text-info cursor-pointer" title="View" style="font-size: 18px;"></i></div>`
                }
            ]
        });

        // ── Table 2: Vessels Details (Client Space) ──
        dt2.current = $(tableRef2.current).DataTable({
            dom: domLayout,
            data: [],
            responsive: true,
            buttons: commonButtons,
            language: { lengthMenu: "Show _MENU_ Entries" },
            pageLength: 10,
            columns: [
                { data: "vesselName", title: "Vessel Name", responsivePriority: 1 },
                { data: "callSign", title: "Call Sign", responsivePriority: 3 },
                { data: "lloyd", title: "Lloyd's Code", responsivePriority: 4 },
                { data: "countryFlag", title: "Flag", responsivePriority: 2 },
                {
                    data: null,
                    title: "Edit",
                    className: "text-center no-export",
                    orderable: false,
                    responsivePriority: 1,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-btn text-primary cursor-pointer" title="Edit" style="font-size: 18px;"></i></div>`
                },
                {
                    data: null,
                    title: "Remove",
                    className: "text-center no-export",
                    orderable: false,
                    responsivePriority: 1,
                    render: () => `<div class="d-flex justify-content-center"><i class="bx bx-trash remove-btn text-danger cursor-pointer" title="Remove" style="font-size: 18px;"></i></div>`
                }
            ]
        });

        const handleResponsiveDisplay = (e, datatable, row, showHide, modalTle) => {
            if (showHide) {
                if (datatable === dt1.current) openedRowRef1.current = row;
                else openedRowRef2.current = row;

                const rowData = row.table().row(row.index()).data();
                setSelectedRow(rowData || { vesselName: "Example Vessel", imo: "9318151", shippingLine: "ZIM", vesselType: "Container", status: "Active", callSign: "ABCD123", lloyd: "LLOYD456" });
                setModalTitle(modalTle);
                setShowDetailsModal(true);
            }
        };

        dt1.current.on("responsive-display", (e, datatable, row, showHide) => handleResponsiveDisplay(e, datatable, row, showHide, "Vessel Master Details"));
        dt2.current.on("responsive-display", (e, datatable, row, showHide) => handleResponsiveDisplay(e, datatable, row, showHide, "Vessel Client Details"));

        const handleActionClick = (dt, modalTle) => {
            $(dt.table().container()).on("click", ".view-btn", function () {
                const rowData = dt.row($(this).parents("tr")).data();
                setSelectedRow(rowData || { vesselName: "ZIM USA", imo: "9318151", shippingLine: "ZIM", vesselType: "Container", status: "Active" });
                setModalTitle(modalTle);
                setShowDetailsModal(true);
            });
        };

        handleActionClick(dt1.current, "Vessel Master Details");

        return () => {
            if (dt1.current) dt1.current.destroy();
            if (dt2.current) dt2.current.destroy();
            dt1.current = null;
            dt2.current = null;
        };
    }, [view]);

    const renderTableView = () => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <style>{`
                .ocean-card {
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0.125rem 0.25rem rgba(161, 172, 184, 0.4);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    margin-bottom: 20px;
                    overflow: hidden;
                }
                .ocean-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.25rem 0.5rem rgba(161, 172, 184, 0.6);
                }
                .ocean-title {
                    color: #566a7f;
                    font-size: 1.125rem;
                    font-weight: 600;
                    padding: 1.25rem;
                    margin-bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .bk-section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .table-title {
                    color: #566a7f;
                    font-size: 1.35rem;
                    font-weight: 700;
                    font-family: "Public Sans", sans-serif;
                }
                /* DataTable Responsive Control (+ circle) styling */
                table.dataTable.dtr-inline.collapsed > tbody > tr > td.dtr-control:before {
                    background-color: #50a9e9 !important;
                    border: 2px solid #fff !important;
                    box-shadow: 0 0 3px rgba(0,0,0,0.2) !important;
                }
                .modal-divider {
                    margin: 1rem 0;
                    border-color: #e9ecef;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="title-section">
                    <h4 className="table-title mb-0">Vessels Master</h4>
                </div>
            </div>

            {/* CARD 1: MASTER LIST */}
            <div className="ocean-card">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Vessel Master Details
                    </span>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef1} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* CARD 2: CLIENT DETAILS */}
            <div className="ocean-card mt-4">
                <div className="ocean-title pb-1 m-0">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-list-ul"></i></div> Vessels Details
                    </span>
                    <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={switchToForm}>
                        <i className="bx bx-plus me-1"></i> Create
                    </button>
                </div>
                <div className="card-datatable pb-1">
                    <table ref={tableRef2} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {showDetailsModal && selectedRow && (
                <div className="custom-modal-backdrop" style={{ zIndex: 1060 }}>
                    <div className="custom-modal-card">
                        <button className="custom-close" onClick={() => {
                            if (openedRowRef1.current) {
                                $(openedRowRef1.current.node()).find("td.dtr-control").trigger("click");
                                openedRowRef1.current = null;
                            }
                            if (openedRowRef2.current) {
                                $(openedRowRef2.current.node()).find("td.dtr-control").trigger("click");
                                openedRowRef2.current = null;
                            }
                            setShowDetailsModal(false);
                        }}>×</button>
                        <h5 className="modal-title" style={{ color: "#50a9e9", fontWeight: 700 }}>{modalTitle}: {selectedRow.vesselName}</h5>
                        <hr className="modal-divider" />
                        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                            <table className="table table-sm">
                                <tbody>
                                    {Object.entries(selectedRow).map(([k, v]) => (
                                        k !== "status" && <tr key={k}>
                                            <td style={{ width: "40%" }}><strong>{k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong></td>
                                            <td>{String(v || "N/A")}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td><strong>Status:</strong></td>
                                        <td><span className={`badge ${selectedRow.status === "Active" ? "bg-label-success" : "bg-label-secondary"}`}>{selectedRow.status || "Active"}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderFormView = (isView = false) => (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <style>{`
                .group-section {
                    border: 1px solid #d9dee3;
                    border-radius: 8px;
                    padding: 24px;
                    position: relative;
                    margin-top: 30px;
                    margin-bottom: 24px;
                    background: #fff;
                }
                .group-label {
                    position: absolute;
                    top: -12px;
                    left: 20px;
                    background: #fff;
                    padding: 0 12px;
                    color: #50a9e9;
                    font-weight: 600;
                    font-size: 14px;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="table-title mb-0">{isView ? "View Vessel" : "Create Vessel"}</h4>
            </div>

            <div className="card border-0 shadow-sm p-0 overflow-hidden">
                <div className="card-body p-4">
                    <h5 className="mb-4" style={{ color: "#50a9e9", fontWeight: 600 }}>
                        {isView ? "Vessel Information" : "Vessel Registration"}
                    </h5>

                    {/* VESSEL IDENTITY */}
                    <div className="group-section">
                        <span className="group-label">Identification</span>
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="qt-label">Vessel Name <span className="text-danger">*</span></label>
                                <input className="form-control qt-input" placeholder="Enter Vessel Name" name="vesselName" value={formData.vesselName} onChange={handleChange} disabled={isView} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Vessel Code</label>
                                <input className="form-control qt-input" placeholder="Enter Code" name="vesselCode" value={formData.vesselCode} onChange={handleChange} disabled={isView} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">IMO Number</label>
                                <input className="form-control qt-input" placeholder="Enter 7-digit IMO" name="imo" value={formData.imo} onChange={handleChange} disabled={isView} />
                            </div>
                        </div>
                    </div>

                    {/* REGISTRATION & FLAGS */}
                    <div className="group-section">
                        <span className="group-label">Registration & Classification</span>
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="qt-label">Shipping Line</label>
                                <select className="form-select qt-input" name="shippingLine" value={formData.shippingLine} onChange={handleChange} disabled={isView}>
                                    <option value="">-- Select Shipping Line --</option>
                                    <option value="MAERSK">MAERSK</option>
                                    <option value="MSC">MSC</option>
                                    <option value="CMA CGM">CMA CGM</option>
                                    <option value="COSCO">COSCO</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Vessel Type</label>
                                <select className="form-select qt-input" name="vesselType" value={formData.vesselType} onChange={handleChange} disabled={isView}>
                                    <option value="">-- Select Vessel Type --</option>
                                    <option value="Container">Container</option>
                                    <option value="Bulk">Bulk</option>
                                    <option value="Tanker">Tanker</option>
                                    <option value="Ro-Ro">Ro-Ro</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Country Flag</label>
                                <select className="form-select qt-input" name="countryFlag" value={formData.countryFlag} onChange={handleChange} disabled={isView}>
                                    <option value="">-- Select Flag --</option>
                                    <option value="Panama">Panama</option>
                                    <option value="Liberia">Liberia</option>
                                    <option value="Marshall Islands">Marshall Islands</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* TECHNICAL INFO */}
                    <div className="group-section">
                        <span className="group-label">Technical Details</span>
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="qt-label">Call Sign</label>
                                <input className="form-control qt-input" placeholder="Enter Call Sign" name="callSign" value={formData.callSign} onChange={handleChange} disabled={isView} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Lloyd's Code</label>
                                <input className="form-control qt-input" placeholder="Enter Lloyd's Code" name="lloyd" value={formData.lloyd} onChange={handleChange} disabled={isView} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label d-block mb-3">Status</label>
                                <div className="d-flex gap-4 mt-1">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="stActive" value="Active" checked={formData.status === "Active"} onChange={handleChange} disabled={isView} />
                                        <label className="form-check-label" htmlFor="stActive">Active</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="status" id="stInactive" value="Inactive" checked={formData.status === "Inactive"} onChange={handleChange} disabled={isView} />
                                        <label className="form-check-label" htmlFor="stInactive">Inactive</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                        <button className="btn-secondary-custom" onClick={switchToTable}>
                            Cancel
                        </button>
                        {!isView && (
                            <button className="btn-primary-custom" onClick={switchToTable}>
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <React.Fragment>
            {view === "table" ? renderTableView() : renderFormView(view === "view")}
        </React.Fragment>
    );
};

export default VesselsMaster;