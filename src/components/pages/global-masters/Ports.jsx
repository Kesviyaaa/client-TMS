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

const Ports = () => {
  const tableRef1 = useRef(null);
  const tableRef2 = useRef(null);
  const dtRef1 = useRef(null);
  const dtRef2 = useRef(null);
  const openedRowRef1 = useRef(null);
  const openedRowRef2 = useRef(null);

  const [view, setView] = useState("table");
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
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const switchToForm = () => {
    if (dtRef1.current) dtRef1.current.destroy();
    if (dtRef2.current) dtRef2.current.destroy();
    dtRef1.current = null;
    dtRef2.current = null;
    setView("form");
  };

  const switchToTable = () => {
    setView("table");
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  /* ───── Modal State ───── */
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // lock scroll when modals open
  useEffect(() => {
    if (showDetailsModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [showDetailsModal, showDeleteModal]);

  /* ───── DataTable Init ───── */
  useEffect(() => {
    if (view !== "table" || !tableRef1.current || !tableRef2.current) return;
    if (dtRef1.current || dtRef2.current) return;

    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    /* ── Table 1: Port Master Details ── */
    dtRef1.current = $(tableRef1.current).DataTable({
      dom:
        "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "<'row px-3'<'col-sm-12'tr>>" +
        "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
      responsive: true,
      scrollY: "400px",
      scrollCollapse: true,
      paging: true,
      data: [],
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
            { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
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
      columns: [
        { data: "portName", title: "Port Name", responsivePriority: 1 },
        { data: "portCode", title: "Port Code", responsivePriority: 2 },
        { data: "uneceCode", title: "UNECE Code", responsivePriority: 3 },
        { data: "iataCode", title: "IATA Code", responsivePriority: 4 },
        { data: "country", title: "Country", responsivePriority: 5 },
        { data: "timeZone", title: "Time Zone", responsivePriority: 6 },
        {
          data: "status",
          title: "Status",
          responsivePriority: 7,
          render: (data) => {
            const cls = data === "Active" ? "bg-label-success" : "bg-label-secondary";
            return `<span class="badge ${cls}">${data || ""}</span>`;
          },
        },
        {
          data: null,
          title: "View",
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          searchable: false,
          render: (data) =>
            `<div class="d-flex justify-content-center">
                 <i class="bx bx-show view-btn text-info cursor-pointer" data-id="${data.portCode}" title="View" style="font-size: 18px;"></i>
             </div>`,
        },
      ],
      order: [[0, "asc"]],
    });

    /* ── Table 2: Port Client Details ── */
    dtRef2.current = $(tableRef2.current).DataTable({
      dom:
        "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "<'row px-3'<'col-sm-12'tr>>" +
        "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
      responsive: true,
      scrollY: "400px",
      scrollCollapse: true,
      paging: true,
      data: [],
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
            { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
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
      columns: [
        { data: "portName", title: "Port Name", responsivePriority: 1 },
        { data: "portCode", title: "Port Code", responsivePriority: 2 },
        { data: "uneceCode", title: "UNECE Code", responsivePriority: 3 },
        { data: "iataCode", title: "IATA Code", responsivePriority: 4 },
        { data: "country", title: "Country", responsivePriority: 5 },
        { data: "timeZone", title: "Time Zone", responsivePriority: 6 },
        {
          data: "status",
          title: "Status",
          responsivePriority: 7,
          render: (data) => {
            const cls = data === "Active" ? "bg-label-success" : "bg-label-secondary";
            return `<span class="badge ${cls}">${data || ""}</span>`;
          },
        },
        {
          data: null,
          title: "Edit",
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          searchable: false,
          render: (data) =>
            `<div class="d-flex justify-content-center"><i class="bx bx-edit edit-btn text-primary cursor-pointer" data-id="${data.portCode}" title="Edit" style="font-size: 18px;"></i></div>`,
        },
        {
          data: null,
          title: "Remove",
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          searchable: false,
          render: (data) =>
            `<div class="d-flex justify-content-center"><i class="bx bx-trash remove-btn text-danger cursor-pointer" data-id="${data.portCode}" title="Remove" style="font-size: 18px;"></i></div>`,
        },
      ],
      order: [[0, "asc"]],
    });

    setTimeout(() => {
      $(".dt-button").removeClass("btn btn-secondary");
    }, 0);

    /* ── Table 1 Event Handlers ── */
    dtRef1.current.on("responsive-display", (e, datatable, row, showHide) => {
      if (showHide) {
        openedRowRef1.current = row;
        const rowData = row.data();
        setSelectedRow(rowData);
        setModalTitle("Port Master Details");
        setShowDetailsModal(true);
      }
    });

    $(tableRef1.current).on("click", ".view-btn", function () {
      const rowData = dtRef1.current.row($(this).parents("tr")).data();
      if (rowData) {
        setSelectedRow(rowData);
        setModalTitle("Port Master Details");
        setShowDetailsModal(true);
      }
    });

    /* ── Table 2 Event Handlers ── */
    dtRef2.current.on("responsive-display", (e, datatable, row, showHide) => {
      if (showHide) {
        openedRowRef2.current = row;
        const rowData = row.data();
        setSelectedRow(rowData);
        setModalTitle("Port Client Details");
        setShowDetailsModal(true);
      }
    });

    $(tableRef2.current).on("click", ".edit-btn", function () {
      const rowData = dtRef2.current.row($(this).parents("tr")).data();
      if (rowData) {
        setSelectedRow(rowData);
        setModalTitle("Edit Port Client");
        setShowDetailsModal(true);
      }
    });

    $(tableRef2.current).on("click", ".remove-btn", function () {
      const id = $(this).data("id");
      setDeleteId(id);
      setShowDeleteModal(true);
    });

    return () => {
      if (dtRef1.current) dtRef1.current.destroy();
      if (dtRef2.current) dtRef2.current.destroy();
      dtRef1.current = null;
      dtRef2.current = null;
    };
  }, [view]);

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  const renderTableView = () => (
    <div className="container-xxl flex-grow-1 container-p-y pb-5">
      <style>{`
        .ocean-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0.125rem 0.25rem rgba(161, 172, 184, 0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin-bottom: 20px;
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
        .dataTables_wrapper .dataTables_paginate .paginate_button {
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          background: transparent !important;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <h4 className="table-title">Port Masters</h4>
      </div>

      {/* ── Port Master Details Card ── */}
      <div className="ocean-card">
        <div className="ocean-title pb-1 m-0">
          <span className="bk-section-title">
            <div className="bk-icon-circle"><i className="bx bx-map-pin"></i></div> Port Master Details
          </span>
        </div>
        <div className="card-datatable pb-1">
          <table ref={tableRef1} className="table dataTable dtr-inline w-100">
            {/* Headers generated by DataTables */}
          </table>
        </div>
      </div>

      {/* ── Port Client Details Card ── */}
      <div className="ocean-card mt-4">
        <div className="ocean-title pb-1 m-0">
          <span className="bk-section-title">
            <div className="bk-icon-circle"><i className="bx bx-globe"></i></div> Port Client Details
          </span>
          <button className="btn-primary-custom" style={{ fontSize: "13px", padding: "6px 18px" }} onClick={() => { resetForm(); switchToForm(); }}>
            <i className="bx bx-plus"></i> Create
          </button>
        </div>
        <div className="card-datatable pb-1">
          <table ref={tableRef2} className="table dataTable dtr-inline w-100">
            {/* Headers generated by DataTables */}
          </table>
        </div>
      </div>

      {/* ───── DETAILS MODAL (Quotations Style) ───── */}
      {showDetailsModal && selectedRow && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card">
            <button
              className="custom-close"
              onClick={() => {
                if (openedRowRef1.current) {
                  const tr = $(openedRowRef1.current.node());
                  tr.find("td.dtr-control").trigger("click");
                  openedRowRef1.current = null;
                }
                if (openedRowRef2.current) {
                  const tr = $(openedRowRef2.current.node());
                  tr.find("td.dtr-control").trigger("click");
                  openedRowRef2.current = null;
                }
                setShowDetailsModal(false);
              }}
            >×</button>

            <h5 className="modal-title">{modalTitle}</h5>
            <hr className="modal-divider" />

            <table className="table table-sm">
              <tbody>
                <tr><td><strong>Port Name:</strong></td><td>{selectedRow.portName}</td></tr>
                <tr><td><strong>Port Code:</strong></td><td>{selectedRow.portCode}</td></tr>
                <tr><td><strong>UNECE Code:</strong></td><td>{selectedRow.uneceCode}</td></tr>
                <tr><td><strong>IATA Code:</strong></td><td>{selectedRow.iataCode}</td></tr>
                <tr><td><strong>Country:</strong></td><td>{selectedRow.country}</td></tr>
                <tr><td><strong>Time Zone:</strong></td><td>{selectedRow.timeZone}</td></tr>
                <tr><td><strong>Status:</strong></td><td>{selectedRow.status}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───── DELETE CONFIRMATION MODAL ───── */}
      {showDeleteModal && (
        <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
          <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
            <div className="text-center p-4">
              <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
              <h4 className="mb-2">Are you sure?</h4>
              <p className="text-muted mb-4">You want to delete this port? This action cannot be undone.</p>
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Yes, Delete it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFormView = () => (
    <div className="container-xxl flex-grow-1 container-p-y pb-5">
      <style>{`
        .ocean-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0.125rem 0.25rem rgba(161, 172, 184, 0.4);
          margin-bottom: 20px;
        }
        .form-check-input:checked {
          background-color: #50a9e9;
          border-color: #50a9e9;
        }
        .section-header-text {
          color: #566a7f;
          font-weight: 700;
          font-size: 1.125rem;
        }
        .inner-section-title {
          color: #50a9e9;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 20px;
          display: block;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <h4 className="table-title">Port Masters</h4>

      </div>

      <div className="card p-0">
        <div className="card-body p-4">
          <h6 style={{ color: "#50a9e9", fontWeight: 600, marginBottom: "1.5rem" }}>Create Port Master</h6>

          <div className="row g-4">
            {/* Left Area: Basic Info & Codes */}
            <div className="col-md-9">
              <div className="mb-4">
                <span className="inner-section-title">Basic Information</span>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="qt-label">Port Name <span className="text-danger">*</span></label>
                    <input type="text" name="portName" className="form-field qt-input" placeholder="Enter PortName" value={formData.portName} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">Port Code <span className="text-danger">*</span></label>
                    <input type="text" name="portCode" className="form-field qt-input" placeholder="Enter PortCode" value={formData.portCode} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">Country <span className="text-danger">*</span></label>
                    <select name="country" className="form-field qt-input" value={formData.country} onChange={handleFormChange}>
                      <option value="">--Select Country--</option>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">TimeZone <span className="text-danger">*</span></label>
                    <select name="timeZone" className="form-field qt-input" value={formData.timeZone} onChange={handleFormChange}>
                      <option value="">Select TimeZone</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">State / Province <span className="text-danger">*</span></label>
                    <input type="text" name="stateProvince" className="form-field qt-input" value={formData.stateProvince} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">Trade Line</label>
                    <select name="tradeLine" className="form-field qt-input" value={formData.tradeLine} onChange={handleFormChange}>
                      <option value="">--Select TradeLine--</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">IATA</label>
                    <input type="text" name="iata" className="form-field qt-input" placeholder="Enter IATA Code" value={formData.iata} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">UNECE Code <span className="text-danger">*</span></label>
                    <input type="text" name="uneceCode" className="form-field qt-input" placeholder="Enter UNECE Code" value={formData.uneceCode} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">Coordinates</label>
                    <input type="text" name="coordinates" className="form-field qt-input" placeholder="Enter Coordinates" value={formData.coordinates} onChange={handleFormChange} />
                  </div>
                </div>
              </div>

              <div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="qt-label">Sched-K Code</label>
                    <input type="text" name="schedKCode" className="form-field qt-input" placeholder="Sched-K Code" value={formData.schedKCode} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">Sched-D Code (Airport)</label>
                    <input type="text" name="schedDCodeAirport" className="form-field qt-input" placeholder="Sched-D Code (Airport)" value={formData.schedDCodeAirport} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">Sched-D Code (Seaport)</label>
                    <input type="text" name="schedDCodeSeaport" className="form-field qt-input" placeholder="Sched-D Code (Seaport)" value={formData.schedDCodeSeaport} onChange={handleFormChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Port Function */}
            <div className="col-md-3">
              <div className="p-3 border rounded-3 h-100" style={{ background: "#f8f9fa", borderColor: "#e2e5e8 !important" }}>
                <span className="inner-section-title mb-3">Port Function</span>
                <div className="d-flex flex-column gap-2 mt-2">
                  {[
                    { id: "SeaPort", label: "Sea Port", name: "isSeaPort" },
                    { id: "RailTerminal", label: "Rail Terminal", name: "isRailTerminal" },
                    { id: "RoadTerminal", label: "Road Terminal", name: "isRoadTerminal" },
                    { id: "AirportTerminal", label: "Airport Terminal", name: "isAirportTerminal" },
                    { id: "PostalExchange", label: "Postal Exchange Office", name: "isPostalExchange" },
                    { id: "Multimodal", label: "Multimodal (ICD)", name: "isMultimodal" },
                    { id: "FixedTransport", label: "Fixed Transport (Oil Platform)", name: "isFixedTransport" },
                    { id: "BorderCrossing", label: "Border Crossing", name: "isBorderCrossing" },
                  ].map((item) => (
                    <div className="form-check" key={item.id}>
                      <input className="form-check-input" type="checkbox" name={item.name} id={`chk${item.id}`} checked={formData[item.name]} onChange={handleFormChange} />
                      <label className="form-check-label ms-2" htmlFor={`chk${item.id}`} style={{ color: "#566a7f", fontSize: "13px" }}>{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-5">
            <button className="btn-secondary-custom" onClick={switchToTable}>
              <i className="bx bx-arrow-back me-1"></i> Back
            </button>
            <button className="btn-primary-custom" onClick={() => { /* submit logic */ setView("table"); }}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      {view === "table" ? renderTableView() : renderFormView()}
    </React.Fragment>
  );
};

export default Ports;

