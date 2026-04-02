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
import "../../../../css/forwarding.css";

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
    cargoDetails: true,
    routingDetails: true,
    financials: true,
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
      <div className="container-xxl container-p-y pb-5">

        <h4 className="table-title mb-4">LI Shipments</h4>

        <div className="ocean-card">
          <div className="ocean-title">
            <span className="bk-section-title">
              <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Shipment List
            </span>
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
        <h5 className="bk-form-heading mb-0" style={{ color: "#566a7f", fontSize: "1.125rem", fontWeight: 600 }}>Shipments Details</h5>
        <div className="d-flex gap-2">
          <button className="btn-secondary-custom" onClick={() => setView("table")}><i className="bx bx-arrow-back me-1"></i> Back to List</button>
        </div>
      </div>

      {/* 1. BASIC INFORMATION */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("basicInfo")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Basic Information</div>
          <i className={`bx ${openSections.basicInfo ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.basicInfo && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Shipment Date</label><input type="date" className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Job Order No <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Job Order</option></select></div>
              <div className="col-md-3"><label className="qt-label">Booking Through <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Booking Through</option></select></div>
              <div className="col-md-3"><label className="qt-label">Quotation No <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Quotation Number</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Consol Type <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Consol Type</option></select></div>
              <div className="col-md-3"><label className="qt-label">Delivery Mode</label><select className="form-field qt-input"><option>Select Delivery Mode</option></select></div>
              <div className="col-md-3"><label className="qt-label">Cargo Type <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Cargo Type</option></select></div>
              <div className="col-md-3"><label className="qt-label">Job Owner</label><select className="form-field qt-input"><option>Select Job Owner</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Transport Mode <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Transport Mode</option></select></div>
              <div className="col-md-3"><label className="qt-label">Doc User</label><select className="form-field qt-input"><option>Select Doc User</option></select></div>
              <div className="col-md-3"><label className="qt-label">Sub Shipment</label><input className="form-field qt-input" placeholder="Enter Sub Shipment" /></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. HANDLER DETAILS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("handlerDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details</div>
          <i className={`bx ${openSections.handlerDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.handlerDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Consignee <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Shipper</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Customer <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Origin Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Destination Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Selling Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Notify</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Consigned To Order</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Second Notify</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Third Notify</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Ship To</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Customs Broker</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Booking Party</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Seller</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Buyer</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Importer</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Actual Shipper</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Actual Consignee</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Consolidator</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Stuffing Location</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">ISF Filer</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">High Sea Seller</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Transporter</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
          </div>
        )}
      </div>

      {/* 3. SHIPMENT DETAILS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("shipmentDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-detail"></i></div> Shipment Details</div>
          <i className={`bx ${openSections.shipmentDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.shipmentDetails && (
          <div className="qt-section-body">
            <div className="row g-3">
              <div className="col-md-6"><label className="qt-label">HC Note</label><input className="form-field qt-input" placeholder="Enter HC Note" /></div>
              <div className="col-md-6"><label className="qt-label">Date</label><input type="date" className="form-field qt-input" /></div>
            </div>
          </div>
        )}
      </div>

      {/* 4. OTHER DETAILS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("otherDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-cog"></i></div> Other Details</div>
          <i className={`bx ${openSections.otherDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.otherDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Shipper's Ref.</label><input className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Consignee's Ref.</label><input className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Sales Person</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">PO/Con Ref No</label><input className="form-field qt-input" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Business Dims.</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">AMS CNote No</label><input className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Last Free Date</label><input type="date" className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Co-Load Type</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Agent Name</label><input className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Agent CNote No</label><input className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Agent CNote Date</label><input type="date" className="form-field qt-input" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Origin</label><select className="form-field qt-input"><option>-- Select Origin --</option></select></div>
              <div className="col-md-3"><label className="qt-label">Zip</label><input className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Destination</label><select className="form-field qt-input"><option>-- Select Destination --</option></select></div>
              <div className="col-md-3"><label className="qt-label">Zip</label><input className="form-field qt-input" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Trade Lane</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Transporter / Carrier</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Vehicle / Rail No.</label><input className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Incoterms</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">NMFC Class</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">NMFC Code</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">De-Stuffing At</label><select className="form-field qt-input"><option>Select</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6"><label className="qt-label">Pickup Address</label><textarea className="form-field qt-input" rows="2"></textarea></div>
              <div className="col-md-6"><label className="qt-label">Delivery Address</label><textarea className="form-field qt-input" rows="2"></textarea></div>
            </div>
            <div className="row g-3">
              <div className="col-md-12"><label className="qt-label">Remarks</label><textarea className="form-field qt-input" rows="2"></textarea></div>
            </div>
          </div>
        )}
      </div>

      {/* 5. CARGO DETAILS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("cargoDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-box"></i></div> Cargo Details</div>
          <i className={`bx ${openSections.cargoDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.cargoDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-6"><label className="qt-label">Description</label><textarea className="form-field qt-input" rows="1"></textarea></div>
              <div className="col-md-3">
                <label className="qt-label">Packages</label>
                <div className="d-flex gap-1"><input className="form-field qt-input" defaultValue="0" /><select className="form-field qt-input" style={{ width: 80 }}><option>Select</option></select></div>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Inner Pkgs</label>
                <div className="d-flex gap-1"><input className="form-field qt-input" defaultValue="0" /><select className="form-field qt-input" style={{ width: 80 }}><option>Select</option></select></div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Gross Wt</label>
                <div className="d-flex gap-1"><input className="form-field qt-input" defaultValue="0.000" /><select className="form-field qt-input" style={{ width: 80 }}><option>Select</option></select></div>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Net Wt</label>
                <div className="d-flex gap-1"><input className="form-field qt-input" defaultValue="0.000" /><select className="form-field qt-input" style={{ width: 80 }}><option>Select</option></select></div>
              </div>
              <div className="col-md-6">
                <label className="qt-label">Dimension (L*B*H)</label>
                <div className="d-flex gap-1 align-items-center">
                  <input className="form-field qt-input" defaultValue="0.000" />
                  <span>x</span>
                  <input className="form-field qt-input" defaultValue="0.000" />
                  <span>x</span>
                  <input className="form-field qt-input" defaultValue="0.000" />
                  <select className="form-field qt-input" style={{ width: 80 }}><option>Select</option></select>
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Volume</label>
                <div className="d-flex gap-1"><input className="form-field qt-input" defaultValue="0.000" /><select className="form-field qt-input" style={{ width: 80 }}><option>Select</option></select></div>
              </div>
              <div className="col-md-3"><label className="qt-label">Commodity</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Commodity Type</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Humidity (%)</label><input className="form-field qt-input" defaultValue="0.00" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">HS Code</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Volume Wt</label><input className="form-field qt-input" defaultValue="0.000" /></div>
              <div className="col-md-3">
                <label className="qt-label">Chargeable Wt</label>
                <div className="d-flex gap-1"><input className="form-field qt-input" defaultValue="0.000" /><select className="form-field qt-input" style={{ width: 80 }}><option>Select</option></select></div>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-12"><label className="qt-label">Marks and Nos</label><textarea className="form-field qt-input" rows="2"></textarea></div>
            </div>
          </div>
        )}
      </div>

      {/* 6. ROUTING DETAILS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("routingDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-git-branch"></i></div> Routing Details</div>
          <i className={`bx ${openSections.routingDetails ? "bx-chevron-up" : "bx-chevron-down"} ms-auto`}></i>
        </div>
        {openSections.routingDetails && (
          <div className="qt-section-body">
            <div className="table-responsive">
              <table className="table table-bordered table-sm text-center">
                <thead className="table-light">
                  <tr><th>Transport Mode</th><th>Type</th><th>From</th><th>To</th><th>ETD</th><th>ETA(Dest.)</th><th>Transport No</th><th>Remarks</th><th>Remove</th></tr>
                </thead>
                <tbody><tr><td colSpan="9" className="text-muted py-3">No routing details available</td></tr></tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 7. FINANCIALS */}
      <div className="qt-section-card mt-4">
        <div className="bk-section-header" onClick={() => toggleSection("financials")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-calculator"></i></div> Financials</div>
          <i className={`bx ${openSections.financials ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.financials && (
          <div className="qt-section-body">
            {/* AP INVOICE */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3" style={{ color: '#566a7f' }}>AP Invoice (Accounts Payable)</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <label className="qt-label">Pay To</label>
                  <div className="d-flex gap-1"><select className="form-field qt-input"><option>-- Select Type --</option></select><select className="form-field qt-input"><option>-- Select --</option></select></div>
                </div>
                <div className="col-md-3"><label className="qt-label">Vendor Address</label><select className="form-field qt-input"><option>-- Select --</option></select></div>
                <div className="col-md-3"><label className="qt-label">Register Date</label><input type="date" className="form-field qt-input" /></div>
                <div className="col-md-3"><label className="qt-label">Payment Method</label><select className="form-field qt-input"><option>-- Select PaymentMethod --</option></select></div>
              </div>
              <div className="row g-3 mb-3 align-items-center">
                <div className="col-md-3 d-flex align-items-center gap-2"><input type="checkbox" id="urgent" /><label htmlFor="urgent" className="qt-label mb-0">Mark As Urgent</label></div>
                <div className="col-md-3"><label className="qt-label">Payment Amount</label><input className="form-field qt-input" placeholder="0.00" /></div>
                <div className="col-md-3">
                  <label className="qt-label">Rate</label>
                  <div className="d-flex gap-1"><select className="form-field qt-input"><option>-- Select Rate --</option></select><input className="form-field qt-input" placeholder="Exchange Rate" /></div>
                </div>
                <div className="col-md-3"><label className="qt-label">Branch</label><select className="form-field qt-input"><option>-- Select Branch --</option></select></div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-3"><label className="qt-label">Against</label><select className="form-field qt-input"><option>-- Select --</option></select></div>
                <div className="col-md-3"><label className="qt-label">Job Expenses</label><input type="checkbox" /></div>
                <div className="col-md-3"><label className="qt-label">Non Job Expenses</label><input type="checkbox" /></div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-3"><label className="qt-label">Reference No</label><div className="d-flex gap-1"><input className="form-field qt-input" /><input type="date" className="form-field qt-input" /></div></div>
                <div className="col-md-6">
                  <label className="qt-label">Job No</label>
                  <div className="d-flex gap-1"><select className="form-field qt-input"><option>-- Select Job Type--</option></select><select className="form-field qt-input"><option>-- Select Shipment Type--</option></select><select className="form-field qt-input"><option>-- Select Shipment No --</option></select></div>
                </div>
              </div>
              <div className="row g-3 mb-4"><div className="col-md-12"><label className="qt-label">Notes</label><textarea className="form-field qt-input" rows="1"></textarea></div></div>

              <h6 className="fw-bold mb-3" style={{ color: '#566a7f' }}>Bank Transfer Details</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-3"><label className="qt-label">Bank Amount</label><input className="form-field qt-input" /></div>
                <div className="col-md-3"><label className="qt-label">Payment Ref</label><input className="form-field qt-input" /></div>
                <div className="col-md-2"><label className="qt-label">Bank Code</label><input className="form-field qt-input" /></div>
                <div className="col-md-2"><label className="qt-label">Currency Code</label><input className="form-field qt-input" /></div>
                <div className="col-md-2"><label className="qt-label">Value Date</label><input type="date" className="form-field qt-input" /></div>
              </div>
              <div className="row g-3 mb-4"><div className="col-md-6"><label className="qt-label">Account</label><select className="form-field qt-input"><option>Select Account</option></select></div></div>

              <h6 className="fw-bold mb-3" style={{ color: '#566a7f' }}>Charge Details</h6>
              <div className="table-responsive mb-4">
                <table className="table table-bordered table-sm text-center">
                  <thead className="table-light"><tr><th>Charges Type</th><th>VAT Type</th><th>VAT %</th><th>Currency</th><th>Amount</th><th>Notes</th><th>Action</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><select className="form-field qt-input"><option>--Select--</option></select></td>
                      <td><select className="form-field qt-input"><option>--Select--</option></select></td>
                      <td><input className="form-field qt-input" defaultValue="0" /></td>
                      <td><select className="form-field qt-input"><option>--Select--</option></select></td>
                      <td><input className="form-field qt-input" defaultValue="0" /></td>
                      <td><input className="form-field qt-input" /></td>
                      <td><button className="btn btn-sm btn-danger">X</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="row justify-content-end mb-4">
                <div className="col-md-3">
                  <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><span className="fw-bold">0.00</span></div>
                  <div className="d-flex justify-content-between mb-1"><span>VAT Total</span><span className="fw-bold">0.00</span></div>
                  <div className="d-flex justify-content-between border-top pt-1 text-primary fw-bold"><span>Net Total</span><span>0.00</span></div>
                </div>
              </div>
            </div>

            {/* AR INVOICE (CHARGE SHEET) */}
            <div className="pt-4 border-top">
              <h6 className="fw-bold mb-3" style={{ color: '#566a7f' }}>AR Invoice / Charge Sheet Details</h6>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="qt-charge-card">
                    <div className="qt-charge-header qt-charge-revenue"><span>Revenue Details</span><button className="legacy-add-btn-rev">Add +</button></div>
                    <div className="table-responsive"><table className="table table-sm text-center"><thead><tr><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Edit</th><th>Del</th></tr></thead><tbody><tr><td colSpan="5" className="text-muted py-2">No revenue charges</td></tr></tbody></table></div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="qt-charge-card">
                    <div className="qt-charge-header qt-charge-cost"><span>Cost Details</span><button className="legacy-add-btn-cost">Add +</button></div>
                    <div className="table-responsive"><table className="table table-sm text-center"><thead><tr><th>Charge Name</th><th>Amount</th><th>Curr</th><th>Edit</th><th>Del</th></tr></thead><tbody><tr><td colSpan="5" className="text-muted py-2">No cost charges</td></tr></tbody></table></div>
                  </div>
                </div>
              </div>
              <div className="qt-summary-wrapper">
                <div className="table-responsive">
                  <table className="table table-bordered qt-summary-table text-center mb-0">
                    <thead className="table-light">
                      <tr><th colSpan="3">Revenue</th><th colSpan="3">Cost</th><th rowSpan="2">Profit</th><th rowSpan="2">Profit %</th></tr>
                      <tr><th>Amount</th><th>Curr</th><th>Amount (HC)</th><th>Amount</th><th>Curr</th><th>Amount (HC)</th></tr>
                    </thead>
                    <tbody><tr><td>Total</td><td>0.00</td><td></td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00%</td></tr></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn-secondary-custom" onClick={() => setView("table")}>Back</button>
        <button className="btn-primary-custom" onClick={() => { }}>Save</button>
      </div>
    </div>
  );
};

export default LandImportShipment;
