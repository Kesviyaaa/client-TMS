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
    shipmentNo: "LIS-1001",
    shipmentDate: "2026-03-25",
    jobNo: "LIJ-2001",
    quotationNo: "QTN-3001"
  },
  { 
    _id: "2", 
    shipmentNo: "LIS-1002",
    shipmentDate: "2026-03-26",
    jobNo: "LIJ-2002",
    quotationNo: "QTN-3002"
  },
];

const LandImportShipment = ({ initialView = "table" }) => {
  const tableRef = useRef(null);
  const dtRef = useRef(null);

  const [view, setView] = useState(initialView);
  const [shipments, setShipments] = useState(dummyShipments);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [openSections, setOpenSections] = useState({
    shipmentDetails: true,
    basicInfo: true,
    handlerDetails: true,
    otherDetails: true,
    dateDetails: true,
    routingDetails: true,
    invoices: true,
    chargeSheet: true
  });

  const [routeRows, setRouteRows] = useState([{ id: Date.now() }]);

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
        { data: "jobNo", title: "Job Order Number", responsivePriority: 3 },
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

    $(tableRef.current).on("click", ".edit-icon", function () {
      switchToForm();
    });

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

  if (view === "table") {
    return (
      <div className="container-xxl flex-grow-1 container-p-y pb-5">
        <div className="card">
          <div className="datatable-toolbar d-flex justify-content-between align-items-middle p-3">
            <h5 className="table-title mb-0">LI Shipments</h5>
            <button className="btn-primary-custom" onClick={switchToForm}>
              <i className="bx bx-plus"></i> Create Shipment
            </button>
          </div>
          <div className="card-datatable p-3">
            <table ref={tableRef} className="table dataTable dtr-inline w-100">
              <thead>
                <tr>
                  <th>Shipment Number</th><th>Shipment Date</th><th>Job Order Number</th><th>Quotation Number</th><th className="no-export text-center">Edit</th><th className="no-export text-center">Remove</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
            <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
              <div className="text-center p-4">
                <i className="bx bx-error-circle text-warning mb-3" style={{ fontSize: "5rem" }}></i>
                <h4 className="mb-2">Are you sure?</h4>
                <p className="text-muted mb-4">You want to remove this shipment? This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => { setShipments(prev => prev.filter(s => s._id !== deleteId)); setShowDeleteModal(false); }}>Yes, Remove it!</button>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0" style={{ fontWeight: "700", color: "#566a7f" }}>Shipments Details</h5>
        <div className="d-flex gap-2">
            <button className="btn-secondary-custom" onClick={() => setView("table")}><i className="bx bx-arrow-back me-1"></i> Back to List</button>
            <button className="btn-primary-custom">Save Shipment</button>
        </div>
      </div>

      {/* 1. SHIPMENT DETAILS (IMPORT SPECIFIC) */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("shipmentDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-data"></i></div> Shipment Details</div>
          <i className={`bx ${openSections.shipmentDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.shipmentDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Import Date <span className="text-danger">*</span></label><input type="date" className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">LI Job No. <span className="text-danger">*</span></label><input className="form-field qt-input" placeholder="Enter Job No." /></div>
              <div className="col-md-3"><label className="qt-label">Booking Through <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Quoted Number <span className="text-danger">*</span></label><input className="form-field qt-input" placeholder="Enter Quoted No." /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Job Opened By <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Created Date</label><input type="date" className="form-field qt-input" readOnly /></div>
              <div className="col-md-3"><label className="qt-label">Status <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Current Stage</option></select></div>
              <div className="col-md-3"><label className="qt-label">Job Number</label><input className="form-field qt-input" placeholder="Enter Job Number" /></div>
            </div>
            <div className="row g-3">
              <div className="col-md-3"><label className="qt-label">Master No. <span className="text-danger">*</span></label><input className="form-field qt-input" placeholder="Select Transport Mode First" /></div>
              <div className="col-md-3"><label className="qt-label">Division <span className="text-danger">*</span></label><select className="form-field qt-input"><option>All Division</option></select></div>
              <div className="col-md-3"><label className="qt-label">Job Status <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. HANDLER DETAILS (EXTENSIVE) */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("handlerDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details</div>
          <i className={`bx ${openSections.handlerDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.handlerDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Shipper <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Shipper</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Consignee <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Consignee</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Customer <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Billing Party</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Notify</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Designed To Dubai</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Forwarder Party</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Main Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Main To</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Profoma Invoice</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Booking Party</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Broker</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Buyer</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Importer</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Actual Shipper</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Actual Consignee</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Consolidator</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Draft Invoice</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3">
              <div className="col-md-3"><label className="qt-label">Bill For</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Flight/Line Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Transporter</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
          </div>
        )}
      </div>

      {/* 3. OTHER DETAILS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("otherDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-cog"></i></div> Other Details</div>
          <i className={`bx ${openSections.otherDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.otherDetails && (
          <div className="qt-section-body">
            <div className="row g-3">
              <div className="col-md-3"><label className="qt-label">Origin <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Destination <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Shipment Clause <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Nature Of Cargo</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
          </div>
        )}
      </div>

      {/* 4. CHARGE SHEET DETAILS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("chargeSheet")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-calculator"></i></div> Charge Sheet Details</div>
          <i className={`bx ${openSections.chargeSheet ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.chargeSheet && (
          <div className="qt-section-body">
             <div className="row g-4">
              <div className="col-md-6">
                <div className="qt-charge-card">
                  <div className="qt-charge-header qt-charge-revenue">Revenue Details <button className="btn btn-sm btn-light">Add +</button></div>
                  <div className="table-responsive"><table className="table table-sm text-center"><thead><tr><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Edit</th><th>Del</th></tr></thead><tbody><tr><td colSpan="5" className="text-muted py-2">No revenue charges</td></tr></tbody></table></div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="qt-charge-card">
                  <div className="qt-charge-header qt-charge-cost">Cost Details <button className="btn btn-sm btn-light">Add +</button></div>
                  <div className="table-responsive"><table className="table table-sm text-center"><thead><tr><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Edit</th><th>Del</th></tr></thead><tbody><tr><td colSpan="5" className="text-muted py-2">No cost charges</td></tr></tbody></table></div>
                </div>
              </div>
            </div>
            <div className="qt-summary-wrapper mt-4">
              <div className="table-responsive">
                <table className="table table-bordered qt-summary-table text-center mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Revenue</th>
                      <th>Cost</th>
                      <th>Profit</th>
                      <th>Profit %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>0.00</td>
                      <td>0.00</td>
                      <td>0.00</td>
                      <td>0.00%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-secondary" onClick={() => setView("table")}>Back</button>
        <button className="btn btn-primary" style={{backgroundColor: '#50A9E9', borderColor: '#50A9E9'}}>Save</button>
      </div>
    </div>
  );
};

export default LandImportShipment;
