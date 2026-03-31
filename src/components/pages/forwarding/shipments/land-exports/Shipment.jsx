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

import "../../../../../App.css";

/* ───── dummy data ───── */
const dummyShipments = [
  { 
    _id: "1", 
    shipmentNo: "LES-1001",
    shipmentDate: "2026-03-25",
    jobOrderNo: "JO-5001",
    quotationNo: "QTN-101",
  },
  { 
    _id: "2", 
    shipmentNo: "LES-1002",
    shipmentDate: "2026-03-26",
    jobOrderNo: "JO-5002",
    quotationNo: "QTN-101",
  },
];

const LandExportShipment = ({ initialView = "table" }) => {
  const tableRef = useRef(null);
  const dtRef = useRef(null);
  const openedRowRef = useRef(null);

  // views: "table" | "form"
  const [view, setView] = useState(initialView);

  // dummy data for DataTable
  const [shipments, setShipments] = useState(dummyShipments);

  // details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // collapsible sections
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    handlerDetails: true,
    transportDetails: true,
    cargoDetails: true,
    pickUp: true,
    routingDetails: true,
    internalDetails: true
  });

  const [routeRows, setRouteRows] = useState([{ id: Date.now() }]);
  const [internalTab, setInternalTab] = useState("revenue");

  /* ───── DataTable Init ───── */
  useEffect(() => {
    if (view !== "table" || !tableRef.current) return;
    if (dtRef.current) return;

    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    dtRef.current = $(tableRef.current).DataTable({
      dom:
        "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "t" +
        "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",
      scrollY: "400px",
      scrollCollapse: true,
      paging: true,
      language: { lengthMenu: "Show _MENU_ Entries" },
      buttons: [
        {
          extend: "collection",
          text: '<i class="bx bx-export"></i> Export',
          className: "export-btn",
          autoClose: true,
          dropIcon: false,
          buttons: [
            { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
          ],
        },
        {
          extend: "colvis",
          text: '<i class="bx bx-columns"></i> Customise Columns',
          className: "custom-colvis",
          columns: ":not(.no-export)",
          dropIcon: false,
        },
      ],
      responsive: true,
      data: shipments,
      columns: [
        { data: "shipmentNo", title: "Shipment Number", responsivePriority: 1 },
        { data: "shipmentDate", title: "Shipment Date", responsivePriority: 2 },
        { data: "jobOrderNo", title: "Job Order Number", responsivePriority: 3 },
        { data: "quotationNo", title: "Quotation Number", responsivePriority: 4 },
        {
          data: null,
          title: "Edit",
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          render: (data) =>
            `<div class="d-flex align-items-center justify-content-center gap-2">
               <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" title="Edit" style="font-size: 18px;"></i>
             </div>`,
        },
        {
          data: null,
          title: "Remove",
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          render: (data) =>
            `<div class="d-flex align-items-center justify-content-center gap-2">
               <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Remove" style="font-size: 18px;"></i>
             </div>`,
        },
      ],
    });

    // details modal on expand
    dtRef.current.on("responsive-display", function (e, datatable, row, showHide) {
      if (showHide) {
        openedRowRef.current = row;
        setSelectedRow(row.data());
        setShowDetailsModal(true);
      }
    });

    // edit click handler
    $(tableRef.current).on("click", ".edit-icon", function () {
      switchToForm();
    });

    // delete click handler
    $(tableRef.current).on("click", ".delete-icon", function () {
      const id = $(this).data("id");
      setDeleteId(id);
      setShowDeleteModal(true);
    });

    return () => {
      if (dtRef.current) {
        dtRef.current.destroy();
        dtRef.current = null;
      }
    };
  }, [view, shipments]);

  /* ───── Handlers ───── */
  const switchToForm = () => {
    if (dtRef.current) {
      dtRef.current.destroy();
      dtRef.current = null;
    }
    setView("form");
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  /* ════════════════════════════════════════════════════
     RENDER — TABLE VIEW
  ════════════════════════════════════════════════════ */
  if (view === "table") {
    return (
      <div className="container-xxl flex-grow-1 container-p-y pb-5">
        <div className="card">
          <div className="datatable-toolbar d-flex justify-content-between align-items-middle p-3">
            <h5 className="table-title mb-0">LE Shipments</h5>
            <button className="btn-primary-custom" onClick={switchToForm}>
              <i className="bx bx-plus"></i> Create Shipment
            </button>
          </div>

          <div className="card-datatable p-3">
            <table ref={tableRef} className="table dataTable dtr-inline w-100">
              <thead>
                <tr>
                  <th>Shipment Number</th>
                  <th>Shipment Date</th>
                  <th>Job Order Number</th>
                  <th>Quotation Number</th>
                  <th className="no-export text-center">Edit</th>
                  <th className="no-export text-center">Remove</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedRow && (
          <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
            <div className="custom-modal-card">
              <button 
                className="custom-close" 
                onClick={() => {
                  if (openedRowRef.current) {
                    const node = $(openedRowRef.current.node());
                    node.find("td.dtr-control").trigger("click");
                  }
                  setShowDetailsModal(false);
                }}
              >×</button>
              <h5 className="modal-title">Shipment Details</h5>
              <hr className="modal-divider" />
              <div className="modal-body p-0">
                <table className="table table-sm">
                  <tbody>
                    {Object.entries(selectedRow).map(([k, v]) => (
                        <tr key={k}><td><strong>{k}:</strong></td><td>{String(v)}</td></tr>
                    ))}
                  </tbody>
                </table>
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
                <p className="text-muted mb-4">You want to delete this shipment? This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-secondary-custom" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      setShipments(prev => prev.filter(s => s._id !== deleteId));
                      setShowDeleteModal(false);
                    }}
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
  }

  /* ════════════════════════════════════════════════════
     RENDER — FORM VIEW
  ════════════════════════════════════════════════════ */
  return (
    <div className="container-xxl flex-grow-1 container-p-y pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0" style={{ fontWeight: "700", color: "#566a7f" }}>Shipment Details</h5>
        <div className="d-flex gap-2">
            <button className="btn-secondary-custom" onClick={() => setView("table")}>
                <i className="bx bx-arrow-back me-1"></i> Back to List
            </button>
            <button className="btn-primary-custom" style={{ backgroundColor: '#00b5ff', borderColor: '#00b5ff' }}>Save Shipment</button>
        </div>
      </div>

      {/* 1. BASIC INFORMATION */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("basicInfo")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Basic Information
          </span>
          <i className={`bx ${openSections.basicInfo ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.basicInfo && (
          <div className="qt-section-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="qt-label">Job Order No. <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option>Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Quotation No. <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option>Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Consol No. <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option>Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Shipment No. <span className="text-danger">*</span></label>
                <input className="form-field qt-input" placeholder="LES-1001" />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Shipment Date <span className="text-danger">*</span></label>
                <input type="date" className="form-field qt-input" />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Shipment Type <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option>Direct</option><option>Consol</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Sales Person <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option>Select</option></select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. HANDLER DETAILS */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("handlerDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details
          </span>
          <i className={`bx ${openSections.handlerDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.handlerDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Shipper <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Consignee <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Origin Agent <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Destination Agent <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Selling Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Booking Party</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Notify</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Ship To</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3">
              <div className="col-md-3"><label className="qt-label">Importer</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Seller</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Buyer</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Transporter</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
          </div>
        )}
      </div>

      {/* 3. TRANSPORT DETAILS */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("transportDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Transport Details
          </span>
          <i className={`bx ${openSections.transportDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.transportDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Origin <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Destination <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Carrier / Transporter <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Vehicle / Rail No.</label><input className="form-field qt-input" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Vehicle Type</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Loading Port</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Discharge Port</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">ETD Origin</label><input type="date" className="form-field qt-input" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">ETA Destination</label><input type="date" className="form-field qt-input" /></div>
            </div>
          </div>
        )}
      </div>

      {/* 4. CARGO DETAILS */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("cargoDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-package"></i></div> Cargo Details
          </span>
          <i className={`bx ${openSections.cargoDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.cargoDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Package Type</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">No. Of Pkgs</label><div className="d-flex gap-1"><input className="form-field qt-input w-50" defaultValue="0" /><select className="form-field qt-input w-50"><option>Unit</option></select></div></div>
              <div className="col-md-3"><label className="qt-label">Total Gross Wt</label><div className="d-flex gap-1"><input className="form-field qt-input w-50" defaultValue="0.000" /><select className="form-field qt-input w-50"><option>Unit</option></select></div></div>
              <div className="col-md-3"><label className="qt-label">Total Net Wt</label><input className="form-field qt-input" defaultValue="0.000" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Total Volume</label><div className="d-flex gap-1"><input className="form-field qt-input w-50" defaultValue="0.000" /><select className="form-field qt-input w-50"><option>Unit</option></select></div></div>
              <div className="col-md-3"><label className="qt-label">Volume Wt.</label><input className="form-field qt-input" defaultValue="0.000" /></div>
              <div className="col-md-3"><label className="qt-label">Total Charge Wt.</label><input className="form-field qt-input" defaultValue="0.000" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6"><label className="qt-label">Marks & Numbers</label><textarea className="form-field qt-input" rows="2"></textarea></div>
              <div className="col-md-6"><label className="qt-label">Description of Goods</label><textarea className="form-field qt-input" rows="2"></textarea></div>
            </div>
          </div>
        )}
      </div>

      {/* 5. PICK UP & DELIVERY (Mini) */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("pickUp")}>
            <span className="bk-section-title">
               <div className="bk-icon-circle"><i className="bx bxs-truck"></i></div> Pick Up & Delivery
            </span>
            <i className={`bx ${openSections.pickUp ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.pickUp && (
            <div className="qt-section-body">
                <div className="row g-3">
                    <div className="col-md-3"><label className="qt-label">Pickup From</label><select className="form-field qt-input"><option>Select</option></select></div>
                    <div className="col-md-3"><label className="qt-label">Delivery To</label><select className="form-field qt-input"><option>Select</option></select></div>
                </div>
            </div>
        )}
      </div>

      {/* 6. ROUTING DETAILS */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("routingDetails")}>
          <div className="d-flex align-items-center gap-3">
            <span className="bk-section-title" style={{ marginBottom: 0 }}>
              <div className="bk-icon-circle"><i className="bx bx-git-branch"></i></div> Routing Details
            </span>
            <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setRouteRows([...routeRows, { id: Date.now() }]); }}>Add New</button>
          </div>
          <i className={`bx ${openSections.routingDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.routingDetails && (
          <div className="qt-section-body">
            <div className="bk-dynamic-table-wrapper">
              <table className="bk-dynamic-table">
                <thead>
                  <tr>
                    <th>Transport Mode</th><th>Type</th><th>From</th><th>To</th><th>ETD</th><th>ETA(Dest.)</th><th>Carrier</th><th>Flight/Vessel</th><th>Voyage No</th><th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {routeRows.map(row => (
                    <tr key={row.id}>
                      <td><select className="form-field qt-input" style={{height: 32}}><option>Select</option></select></td>
                      <td><input className="form-field qt-input" style={{height: 32}}/></td>
                      <td><select className="form-field qt-input" style={{height: 32}}><option>Select</option></select></td>
                      <td><select className="form-field qt-input" style={{height: 32}}><option>Select</option></select></td>
                      <td><input type="date" className="form-field qt-input" style={{height: 32}}/></td>
                      <td><input type="date" className="form-field qt-input" style={{height: 32}}/></td>
                      <td><input className="form-field qt-input" style={{height: 32}}/></td>
                      <td><input className="form-field qt-input" style={{height: 32}}/></td>
                      <td><input className="form-field qt-input" style={{height: 32}}/></td>
                      <td className="text-center"><button className="bk-remove-btn" onClick={() => setRouteRows(routeRows.filter(r => r.id !== row.id))}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 7. INTERNAL / JOB SHEET SECTION */}
      <div className="qt-section-card job-sheet-card border-primary">
        <div className="bk-section-header" style={{ backgroundColor: '#f4f5fa' }} onClick={() => toggleSection("internalDetails")}>
          <span className="bk-section-title text-primary">
            <div className="bk-icon-circle" style={{ backgroundColor: '#e7e7ff' }}><i className="bx bx-file text-primary"></i></div> Job Sheet / Internal Details
          </span>
          <i className={`bx ${openSections.internalDetails ? "bx-chevron-up" : "bx-chevron-down"} text-primary`}></i>
        </div>
        {openSections.internalDetails && (
          <div className="qt-section-body p-0">
            {/* TABS */}
            <div className="nav-tabs-shadow nav-align-top">
              <ul className="nav nav-tabs" role="tablist" style={{ borderBottom: '1px solid #d9dee3' }}>
                {["revenue", "cost", "p&l", "invoice", "voucher"].map((tab) => (
                  <li className="nav-item" key={tab}>
                    <button
                      type="button"
                      className={`nav-link ${internalTab === tab ? "active" : ""}`}
                      onClick={() => setInternalTab(tab)}
                      style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: '600' }}
                    >
                      {tab === "p&l" ? "P&L" : tab}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="tab-content p-4">
                {internalTab === "revenue" && (
                  <div className="tab-pane fade show active">
                    <div className="row g-3 align-items-end mb-4">
                      <div className="col-md-2"><label className="qt-label">Customer</label><select className="form-field qt-input"><option>Select</option></select></div>
                      <div className="col-md-2"><label className="qt-label">Charge Code</label><select className="form-field qt-input"><option>Select</option></select></div>
                      <div className="col-md-1"><label className="qt-label">Curr</label><select className="form-field qt-input"><option>USD</option></select></div>
                      <div className="col-md-2"><label className="qt-label">Rate</label><input className="form-field qt-input" placeholder="0.00" /></div>
                      <div className="col-md-1"><label className="qt-label">Qty</label><input className="form-field qt-input" placeholder="1" /></div>
                      <div className="col-md-2"><label className="qt-label">Total</label><input className="form-field qt-input" placeholder="0.00" readOnly /></div>
                      <div className="col-md-2 text-end"><button className="btn btn-primary" style={{ backgroundColor: '#50a9e9', border: 'none' }}><i className="bx bx-plus me-1"></i> Add Revenue</button></div>
                    </div>
                    <div className="table-responsive border rounded">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr><th>Customer</th><th>Charge Name</th><th>Currency</th><th>Rate</th><th>Qty</th><th>Total</th><th>Action</th></tr>
                        </thead>
                        <tbody><tr><td colSpan="7" className="text-center py-3 text-muted">No revenue entries</td></tr></tbody>
                      </table>
                    </div>
                  </div>
                )}
                {internalTab === "cost" && (
                   <div className="tab-pane fade show active">
                     <div className="row g-3 align-items-end mb-4">
                        <div className="col-md-2"><label className="qt-label">Vendor</label><select className="form-field qt-input"><option>Select</option></select></div>
                        <div className="col-md-2"><label className="qt-label">Charge Code</label><select className="form-field qt-input"><option>Select</option></select></div>
                        <div className="col-md-1"><label className="qt-label">Curr</label><select className="form-field qt-input"><option>USD</option></select></div>
                        <div className="col-md-2"><label className="qt-label">Rate</label><input className="form-field qt-input" placeholder="0.00" /></div>
                        <div className="col-md-1"><label className="qt-label">Qty</label><input className="form-field qt-input" placeholder="1" /></div>
                        <div className="col-md-2"><label className="qt-label">Total</label><input className="form-field qt-input" placeholder="0.00" readOnly /></div>
                        <div className="col-md-2 text-end"><button className="btn btn-danger" style={{ backgroundColor: '#ff4c51', border: 'none' }}><i className="bx bx-plus me-1"></i> Add Cost</button></div>
                     </div>
                     <div className="table-responsive border rounded">
                       <table className="table table-hover mb-0">
                         <thead className="table-light">
                           <tr><th>Vendor</th><th>Charge Name</th><th>Currency</th><th>Rate</th><th>Qty</th><th>Total</th><th>Action</th></tr>
                         </thead>
                         <tbody><tr><td colSpan="7" className="text-center py-3 text-muted">No cost entries</td></tr></tbody>
                       </table>
                     </div>
                   </div>
                )}
                {internalTab === "p&l" && <div className="text-center py-5 text-muted">Profit & Loss Summary will appear here.</div>}
                {internalTab === "invoice" && <div className="text-center py-5 text-muted">Invoices related to this shipment.</div>}
                {internalTab === "voucher" && <div className="text-center py-5 text-muted">Vouchers and Payment details.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM SUMMARY */}
      <div className="fixed-bottom-summary p-3 bg-white border-top shadow-lg" style={{ position: 'sticky', bottom: 0, zIndex: 10, margin: '0 -24px -24px -24px', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
        <div className="container-xxl">
            <div className="row align-items-center">
                <div className="col-md-3 border-end"><div className="d-flex justify-content-between px-3"><span>Revenue Total:</span><strong className="text-primary">USD 0.00</strong></div></div>
                <div className="col-md-3 border-end"><div className="d-flex justify-content-between px-3"><span>Cost Total:</span><strong className="text-danger">USD 0.00</strong></div></div>
                <div className="col-md-3 border-end"><div className="d-flex justify-content-between px-3"><span>Net Profit:</span><strong className="text-success">USD 0.00</strong></div></div>
                <div className="col-md-3"><div className="d-flex justify-content-between px-3"><span>Profit %:</span><strong className="text-success">0.00%</strong></div></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandExportShipment;
