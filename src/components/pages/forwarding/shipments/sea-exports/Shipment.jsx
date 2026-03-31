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
    bookingNo: "BKG-101", 
    quotationNo: "QTN-001", 
    quotationDate: "2026-03-10T00:00:00", 
    consignor: "Swift Logistics", 
    consignee: "Global Traders", 
    transportMode: "SEA",
    shipmentNo: "SHP-501",
    bookingThrough: "Online",
    consolType: "FCL",
    deliveryMode: "Door to Door",
    client: "Swift Logistics",
    origin: "Dubai",
    destination: "London"
  },
  { 
    _id: "2", 
    bookingNo: "BKG-102", 
    quotationNo: "QTN-005", 
    quotationDate: "2026-03-15T00:00:00", 
    consignor: "Indigo Corp", 
    consignee: "Blue Port Ltd", 
    transportMode: "SEA",
    shipmentNo: "SHP-502",
    bookingThrough: "Direct",
    consolType: "LCL",
    deliveryMode: "Port to Port",
    client: "Indigo Corp",
    origin: "Singapore",
    destination: "New York"
  },
];

const Shipment = ({ initialView = "table" }) => {
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

  // form state (consolidated)
  const [formData, setFormData] = useState({
    // Cargo Details
    shipmentNo: "", bookingNo: "", bookingThrough: "", quotationNo: "",
    consolType: "", deliveryMode: "", bookingJobOwner: "", docUser: "",
    validFrom: "", validTo: "", client: "", consignor: "", consignee: "",
    transportMode: "", origin: "", destination: "",

    // Shipment Details
    blIssuedBy: "", blNo: "", blDate: "",

    // Console Details
    consolNo: "", consolDate: "", masterBlNo: "", carrierBookingRef: "",
    issuedAt: "", issuedDate: "",

    // Routing Details
    routingTransportMode: "", routingType: "", shippingLine: "", 
    vesselVoyage: "", fromUnloco: "", toUnloco: "", etd: "", eta: "", remarks: "",

    // Container Details
    containerNo: "", containerType: "", shipperSealNo: "", carrierSealNo: "",
    customerSealNo: "", ctoSealNo: "", weightUnit: "", payload: "", 
    tareWeight: "", movementType: "", isoCode: "",

    // Co Load Details
    coLoadType: "", agentName: "", agentBlNo: "", agentBlDate: "", 
    coLoadOtherDetails: "", leadNo: "", shipperRefNo: "", consigneeRefNo: "", 
    coLoadMovementType: "", coLoadOrigin: "", placeOfReceipt: "", 
    portOfLoading: "", portOfDischarge: "", placeOfDelivery: "", 
    coLoadDestination: "", coLoadShippingLine: "", coLoadVesselVoyage: "", 
    incoTerms: "", stuffingAtType: "", stuffingAtLocation: "", 
    contract: "", invoice: "", coLoadCurrency: "", releaseType: "",

    // Charge Sheet
    chargeCode: "", chargeName: "", chargeType: "", chargeCurrency: "",
    estimatedCost: "0.00", actualCost: "0.00", totalAmount: "0.00",
    taxPct: "0", exchangeRate: "1.00", profitLoss: "0.00",
    creditor: "", debitor: "", chargeRemarks: "", eDoc: null
  });

  // collapsible sections
  const [openSections, setOpenSections] = useState({
    cargoDetails: true,
    shipmentDetails: true,
    consoleDetails: true,
    routingDetails: true,
    containerDetails: true,
    coLoadDetails: true,
    chargeSheet: true
  });

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
        { data: "bookingNo", responsivePriority: 1 },
        { data: "quotationNo", responsivePriority: 2 },
        { 
          data: "quotationDate", 
          render: (d) => d ? new Date(d).toLocaleDateString() : "" 
        },
        { data: "consignor", responsivePriority: 3 },
        { data: "consignee", responsivePriority: 4 },
        { data: "transportMode", responsivePriority: 5 },
        {
          data: null,
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          render: (data) =>
            `<div class="d-flex align-items-center justify-content-center gap-2">
               <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" title="Edit" style="font-size: 18px;"></i>
               <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Delete" style="font-size: 18px;"></i>
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
      const data = dtRef.current.row($(this).parents("tr")).data();
      if (data) {
        setFormData(prev => ({ ...prev, ...data }));
        setView("form");
      }
    });

    // delete click handler
    $(tableRef.current).on("click", ".delete-icon", function () {
      const id = $(this).data("id");
      setDeleteId(id);
      setShowDeleteModal(true);
    });

    return () => {
      if (dtRef.current) {
        dtRef.current.destroy(true);
        dtRef.current = null;
      }
    };
  }, [view, shipments]);

  /* ───── Handlers ───── */
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ════════════════════════════════════════════════════
     RENDER — TABLE VIEW
  ════════════════════════════════════════════════════ */
  if (view === "table") {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="card">
          <div className="datatable-toolbar d-flex justify-content-between align-items-middle p-3">
            <h5 className="table-title mb-0">SE Shipments</h5>
            <button className="btn-primary-custom" onClick={() => setView("form")}>
              <i className="bx bx-plus"></i> Create Shipment
            </button>
          </div>

          <div className="card-datatable p-3">
            <table ref={tableRef} className="table dataTable dtr-inline w-100">
              <thead>
                <tr>
                  <th>Booking Number</th>
                  <th>Quotation Number</th>
                  <th>Quotation Date</th>
                  <th>Consignor</th>
                  <th>Consignee</th>
                  <th>Transport Mode</th>
                  <th className="no-export text-center">Edit</th>
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
                    <tr><td><strong>Booking No:</strong></td><td>{selectedRow.bookingNo}</td></tr>
                    <tr><td><strong>Consignor:</strong></td><td>{selectedRow.consignor}</td></tr>
                    <tr><td><strong>Consignee:</strong></td><td>{selectedRow.consignee}</td></tr>
                    <tr><td><strong>Transport:</strong></td><td>{selectedRow.transportMode}</td></tr>
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
        <button className="btn-secondary-custom" onClick={() => setView("table")}>
          <i className="bx bx-arrow-back me-1"></i> Back to List
        </button>
      </div>

      {/* ───── SECTION: CARGO DETAILS ───── */}
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
              <div className="col-md-3">
                <label className="qt-label">Shipment Number</label>
                <input name="shipmentNo" className="form-field qt-input" value={formData.shipmentNo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Booking Number</label>
                <input name="bookingNo" className="form-field qt-input" value={formData.bookingNo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Booking Through</label>
                <input name="bookingThrough" className="form-field qt-input" value={formData.bookingThrough} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Quotation No</label>
                <input name="quotationNo" className="form-field qt-input" value={formData.quotationNo} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Consol Type</label>
                <input name="consolType" className="form-field qt-input" value={formData.consolType} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Delivery Mode</label>
                <input name="deliveryMode" className="form-field qt-input" value={formData.deliveryMode} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Booking Job Owner</label>
                <select name="bookingJobOwner" className="form-field qt-input" value={formData.bookingJobOwner} onChange={handleChange}>
                  <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Doc User</label>
                <select name="docUser" className="form-field qt-input" value={formData.docUser} onChange={handleChange}>
                  <option value="">Select</option>
                </select>
              </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                <label className="qt-label">Valid From <span className="text-danger">*</span></label>
                <input type="date" name="validFrom" className="form-field qt-input" value={formData.validFrom} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Valid To <span className="text-danger">*</span></label>
                <input type="date" name="validTo" className="form-field qt-input" value={formData.validTo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Client <span className="text-danger">*</span></label>
                <select name="client" className="form-field qt-input" value={formData.client} onChange={handleChange}>
                  <option value="">Select Client</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Consignor <span className="text-danger">*</span></label>
                <select name="consignor" className="form-field qt-input" value={formData.consignor} onChange={handleChange}>
                  <option value="">Select Consignor</option>
                </select>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="qt-label">Consignee <span className="text-danger">*</span></label>
                <select name="consignee" className="form-field qt-input" value={formData.consignee} onChange={handleChange}>
                  <option value="">Select Consignee</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Transport Mode <span className="text-danger">*</span></label>
                <input name="transportMode" className="form-field qt-input" value={formData.transportMode} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Origin <span className="text-danger">*</span></label>
                <select name="origin" className="form-field qt-input" value={formData.origin} onChange={handleChange}>
                  <option value="">Select Origin</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Destination <span className="text-danger">*</span></label>
                <select name="destination" className="form-field qt-input" value={formData.destination} onChange={handleChange}>
                  <option value="">Select Destination</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── SECTION: SHIPMENT DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("shipmentDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Shipment Details
          </span>
          <i className={`bx ${openSections.shipmentDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.shipmentDetails && (
          <div className="qt-section-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="qt-label">BL Issued By</label>
                <select name="blIssuedBy" className="form-field qt-input" value={formData.blIssuedBy} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">BL No</label>
                <input name="blNo" className="form-field qt-input" placeholder="Enter BL Number" value={formData.blNo} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="qt-label">BL Date</label>
                <input type="date" name="blDate" className="form-field qt-input" value={formData.blDate} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── SECTION: CONSOLE DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("consoleDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-layer"></i></div> Console Details
          </span>
          <i className={`bx ${openSections.consoleDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.consoleDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Consol No</label>
                <input name="consolNo" className="form-field qt-input" placeholder="Enter Consol Number" value={formData.consolNo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Consol Date</label>
                <input type="date" name="consolDate" className="form-field qt-input" value={formData.consolDate} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">BL No</label>
                <input name="masterBlNo" className="form-field qt-input" placeholder="Enter Master BL" value={formData.masterBlNo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Carrier Booking Reference</label>
                <input name="carrierBookingRef" className="form-field qt-input" placeholder="Carrier Ref No" value={formData.carrierBookingRef} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="qt-label">Issued At</label>
                <input name="issuedAt" className="form-field qt-input" placeholder="City / Port" value={formData.issuedAt} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="qt-label">Issued Date</label>
                <input type="date" name="issuedDate" className="form-field qt-input" value={formData.issuedDate} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── SECTION: ROUTING DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("routingDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-git-branch"></i></div> Routing Details
          </span>
          <i className={`bx ${openSections.routingDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.routingDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                 <label className="qt-label">Transport Mode</label>
                 <input name="routingTransportMode" className="form-field qt-input" value={formData.routingTransportMode} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                 <label className="qt-label">Type</label>
                 <input name="routingType" className="form-field qt-input" placeholder="Main / Pre / On" value={formData.routingType} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                 <label className="qt-label">Shipping Line</label>
                 <select name="shippingLine" className="form-field qt-input" value={formData.shippingLine} onChange={handleChange}>
                   <option value="">Select</option>
                 </select>
              </div>
              <div className="col-md-3">
                 <label className="qt-label">Vessel / Voyage / Flight</label>
                 <input name="vesselVoyage" className="form-field qt-input" placeholder="Vessel / Flight No" value={formData.vesselVoyage} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                 <label className="qt-label">From (UNLOCO)</label>
                 <select name="fromUnloco" className="form-field qt-input" value={formData.fromUnloco} onChange={handleChange}>
                    <option value="">Select</option>
                 </select>
              </div>
              <div className="col-md-3">
                 <label className="qt-label">To (UNLOCO)</label>
                 <select name="toUnloco" className="form-field qt-input" value={formData.toUnloco} onChange={handleChange}>
                    <option value="">Select</option>
                 </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">ETD</label>
                <input type="date" name="etd" className="form-field qt-input" value={formData.etd} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">ETA</label>
                <input type="date" name="eta" className="form-field qt-input" value={formData.eta} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="qt-label">Remarks</label>
                <textarea name="remarks" className="form-field qt-input" rows={2} style={{ height: "auto" }} value={formData.remarks} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── SECTION: CONTAINER DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("containerDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-package"></i></div> Container Details
          </span>
          <i className={`bx ${openSections.containerDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.containerDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                 <label className="qt-label">Container No</label>
                 <input name="containerNo" className="form-field qt-input" placeholder="Enter Container Number" value={formData.containerNo} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Container Type</label>
                 <input name="containerType" className="form-field qt-input" value={formData.containerType} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Shipper Seal No</label>
                 <input name="shipperSealNo" className="qt-input" value={formData.shipperSealNo} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Carrier Seal No</label>
                 <input name="carrierSealNo" className="form-field qt-input" value={formData.carrierSealNo} onChange={handleChange} />
               </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                 <label className="qt-label">Customer Seal No</label>
                 <input name="customerSealNo" className="form-field qt-input" value={formData.customerSealNo} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">CTO Seal No</label>
                 <input name="ctoSealNo" className="form-field qt-input" value={formData.ctoSealNo} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Weight / Unit</label>
                 <input name="weightUnit" className="form-field qt-input" placeholder="KGS / MT" value={formData.weightUnit} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Payload</label>
                 <input name="payload" className="form-field qt-input" value={formData.payload} onChange={handleChange} />
               </div>
            </div>
            <div className="row g-3">
               <div className="col-md-4">
                 <label className="qt-label">Tare Weight</label>
                 <input name="tareWeight" className="form-field qt-input" value={formData.tareWeight} onChange={handleChange} />
               </div>
               <div className="col-md-4">
                 <label className="qt-label">Movement Type</label>
                 <input name="movementType" className="form-field qt-input" value={formData.movementType} onChange={handleChange} />
               </div>
               <div className="col-md-4">
                 <label className="qt-label">ISO Code</label>
                 <input name="isoCode" className="form-field qt-input" placeholder="Eg: 22G1" value={formData.isoCode} onChange={handleChange} />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── SECTION: CO LOAD DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("coLoadDetails")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-group"></i></div> Co Load Details
          </span>
          <i className={`bx ${openSections.coLoadDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.coLoadDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                 <label className="qt-label">Co Load Type</label>
                 <input name="coLoadType" className="form-field qt-input" value={formData.coLoadType} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                 <label className="qt-label">Agent Name</label>
                 <select name="agentName" className="form-field qt-input" value={formData.agentName} onChange={handleChange}>
                   <option value="">Select</option>
                 </select>
              </div>
              <div className="col-md-3">
                 <label className="qt-label">Agent BL No</label>
                 <input name="agentBlNo" className="form-field qt-input" value={formData.agentBlNo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                 <label className="qt-label">Agent BL Date</label>
                 <input type="date" name="agentBlDate" className="form-field qt-input" value={formData.agentBlDate} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                 <label className="qt-label">Other Details</label>
                 <textarea name="coLoadOtherDetails" className="form-field qt-input" rows={2} value={formData.coLoadOtherDetails} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Lead No</label>
                <input name="leadNo" className="form-field qt-input" value={formData.leadNo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Shipper Ref No</label>
                <input name="shipperRefNo" className="form-field qt-input" value={formData.shipperRefNo} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Consignee Ref No</label>
                <input name="consigneeRefNo" className="form-field qt-input" value={formData.consigneeRefNo} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Movement Type</label>
                <input name="coLoadMovementType" className="form-field qt-input" value={formData.coLoadMovementType} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Origin</label>
                <select name="coLoadOrigin" className="form-field qt-input" value={formData.coLoadOrigin} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Place of Receipt</label>
                <select name="placeOfReceipt" className="form-field qt-input" value={formData.placeOfReceipt} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-3">
               <label className="qt-label">Port of Loading</label>
                <select name="portOfLoading" className="form-field qt-input" value={formData.portOfLoading} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Port of Discharge</label>
                <select name="portOfDischarge" className="form-field qt-input" value={formData.portOfDischarge} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Place of Delivery</label>
                <select name="placeOfDelivery" className="form-field qt-input" value={formData.placeOfDelivery} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Destination</label>
                <input name="coLoadDestination" className="form-field qt-input" value={formData.coLoadDestination} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                <label className="qt-label">Shipping Line</label>
                <select name="coLoadShippingLine" className="form-field qt-input" value={formData.coLoadShippingLine} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Vessel / Voyage</label>
                <input name="coLoadVesselVoyage" className="form-field qt-input" value={formData.coLoadVesselVoyage} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Inco Terms</label>
                <input name="incoTerms" className="form-field qt-input" value={formData.incoTerms} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Stuffing At (Type)</label>
                <input name="stuffingAtType" className="form-field qt-input" value={formData.stuffingAtType} onChange={handleChange} />
              </div>
            </div>
            <div className="row g-3">
               <div className="col-md-3">
                <label className="qt-label">Stuffing At (Location)</label>
                <select name="stuffingAtLocation" className="form-field qt-input" value={formData.stuffingAtLocation} onChange={handleChange}>
                   <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Contract</label>
                <input name="contract" className="form-field qt-input" value={formData.contract} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Invoice</label>
                <input name="invoice" className="form-field qt-input" value={formData.invoice} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Currency</label>
                <input name="coLoadCurrency" className="form-field qt-input" value={formData.coLoadCurrency} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── SECTION: CHARGE SHEET ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("chargeSheet")}>
          <span className="bk-section-title">
             <div className="bk-icon-circle"><i className="bx bx-money"></i></div> Charge Sheet
          </span>
          <i className={`bx ${openSections.chargeSheet ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.chargeSheet && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                 <label className="qt-label">Charge Code</label>
                 <select name="chargeCode" className="form-field qt-input" value={formData.chargeCode} onChange={handleChange}>
                   <option value="">Select</option>
                 </select>
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Charge Name</label>
                 <input name="chargeName" className="form-field qt-input" value={formData.chargeName} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Charge Type</label>
                 <select name="chargeType" className="form-field qt-input" value={formData.chargeType} onChange={handleChange}>
                   <option value="">Select</option>
                 </select>
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Currency</label>
                 <input name="chargeCurrency" className="form-field qt-input" value={formData.chargeCurrency} onChange={handleChange} />
               </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                 <label className="qt-label">Estimated Cost</label>
                 <input name="estimatedCost" className="form-field qt-input" value={formData.estimatedCost} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Actual Cost</label>
                 <input name="actualCost" className="form-field qt-input" value={formData.actualCost} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Total Amount</label>
                 <input name="totalAmount" className="form-field qt-input" value={formData.totalAmount} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Tax %</label>
                 <input name="taxPct" className="form-field qt-input" placeholder="%" value={formData.taxPct} onChange={handleChange} />
               </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-3">
                 <label className="qt-label">Exchange Rate</label>
                 <input name="exchangeRate" className="form-field qt-input" value={formData.exchangeRate} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Profit / Loss</label>
                 <input name="profitLoss" className="form-field qt-input" value={formData.profitLoss} onChange={handleChange} />
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Creditor</label>
                 <select name="creditor" className="form-field qt-input" value={formData.creditor} onChange={handleChange}>
                   <option value="">Select</option>
                 </select>
               </div>
               <div className="col-md-3">
                 <label className="qt-label">Debitor</label>
                 <select name="debitor" className="form-field qt-input" value={formData.debitor} onChange={handleChange}>
                   <option value="">Select</option>
                 </select>
               </div>
            </div>
            <div className="row g-3 mb-3">
               <div className="col-md-6">
                 <label className="qt-label">Remarks</label>
                 <textarea name="chargeRemarks" className="form-field qt-input" rows={2} value={formData.chargeRemarks} onChange={handleChange} />
               </div>
               <div className="col-md-6">
                 <label className="qt-label">E-Doc</label>
                 <div className="d-flex align-items-center gap-2 mt-1">
                    <button className="btn-secondary-custom p-1 px-3" style={{ height: 38 }}>Choose file</button>
                    <span style={{ fontSize: 13, color: "#a1acb8" }}>No file chosen</span>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="d-flex justify-content-end gap-3 mt-4 mx-2">
        <button className="btn-secondary-custom" onClick={() => setView("table")}>
          Cancel
        </button>
        <button className="btn-primary-custom" onClick={() => setView("table")}>
          Save
        </button>
      </div>

    </div>
  );
};

export default Shipment;
