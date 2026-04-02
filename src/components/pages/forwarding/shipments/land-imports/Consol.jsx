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
const dummyConsols = [
  {
    _id: "1",
    consolNo: "LIC-001",
    consolDate: "2026-03-25",
    consolType: "Direct",
    cargoType: "General",
    origin: "Dubai",
    destination: "Riyadh",
    carrier: "Emirates Logistics",
    vehicleNo: "DXB-7890"
  },
  {
    _id: "2",
    consolNo: "LIC-002",
    consolDate: "2026-03-26",
    consolType: "Consol",
    cargoType: "Hazardous",
    origin: "Abu Dhabi",
    destination: "Jeddah",
    carrier: "Global Trans",
    vehicleNo: "AUH-1234"
  },
];

const LandImportConsol = ({ initialView = "table" }) => {
  const tableRef = useRef(null);
  const dtRef = useRef(null);
  const openedRowRef = useRef(null);

  const [view, setView] = useState(initialView);
  const [consols, setConsols] = useState(dummyConsols);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    handlerDetails: true,
    shippingDetails: true,
    routingDetails: true,
    diDetails: true,
    attachedHouse: true,
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
      data: consols,
      columns: [
        { data: "consolNo", title: "Consol No", responsivePriority: 1 },
        { data: "consolDate", title: "Consol Date", responsivePriority: 2 },
        { data: "consolType", title: "Consol Type", responsivePriority: 3 },
        { data: "cargoType", title: "Cargo Type", responsivePriority: 4 },
        { data: "origin", title: "Origin", responsivePriority: 5 },
        { data: "destination", title: "Destination", responsivePriority: 6 },
        { data: "carrier", title: "Transporter / Carrier", responsivePriority: 7 },
        { data: "vehicleNo", title: "Vehicle / Rail No", responsivePriority: 8 },
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
          title: "Delete",
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          render: (data) =>
            `<div class="d-flex align-items-center justify-content-center gap-2">
               <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Delete" style="font-size: 18px;"></i>
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
  }, [view, consols]);

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

        <h4 className="table-title mb-4">LI Consols</h4>

        <div className="ocean-card">
          <div className="ocean-title">
            <span className="bk-section-title">
              <div className="bk-icon-circle"><i className="bx bx-layer"></i></div> Consol List
            </span>
            <button className="btn-primary-custom" onClick={switchToForm}>
              <i className="bx bx-plus"></i> Create Consol
            </button>
          </div>
          <div className="card-datatable p-3">
            <table ref={tableRef} className="table dataTable dtr-inline w-100">
              <thead>
                <tr>
                  <th>Consol No</th><th>Consol Date</th><th>Consol Type</th><th>Cargo Type</th><th>Origin</th><th>Destination</th><th>Transporter / Carrier</th><th>Vehicle / Rail No</th><th className="no-export text-center">Edit</th><th className="no-export text-center">Delete</th>
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
                <p className="text-muted mb-4">You want to delete this consol? This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => { setConsols(prev => prev.filter(s => s._id !== deleteId)); setShowDeleteModal(false); }}>Yes, Delete it!</button>
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
        <h5 className="bk-form-heading mb-0" style={{ color: "#566a7f", fontSize: "1.125rem", fontWeight: 600 }}>Land Import Consol Details</h5>
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
            <div className="row g-3">
              <div className="col-md-3"><label className="qt-label">Consol No</label><input className="form-field qt-input" placeholder="LIC-000" /></div>
              <div className="col-md-3"><label className="qt-label">Consol Date</label><input type="date" className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Consol Type</label><select className="form-field qt-input"><option>Select Consol Type</option></select></div>
              <div className="col-md-3"><label className="qt-label">Cargo Type</label><select className="form-field qt-input"><option>Select Cargo Type</option></select></div>
              <div className="col-md-3"><label className="qt-label">Origin Agent</label><select className="form-field qt-input"><option>Select Origin Agent</option></select></div>
              <div className="col-md-3"><label className="qt-label">Destination Agent</label><select className="form-field qt-input"><option>Select Destination Agent</option></select></div>
              <div className="col-md-3"><label className="qt-label">Origin</label><select className="form-field qt-input"><option>Select Origin</option></select></div>
              <div className="col-md-3"><label className="qt-label">Destination</label><select className="form-field qt-input"><option>Select Destination</option></select></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. HANDLER DETAILS */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("handlerDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details</div>
          <i className={`bx ${openSections.handlerDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.handlerDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Origin Agent <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Destination Agent <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Selling Agent</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Ship To</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Ship" /></div></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Importer</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Imp" /></div></div>
              <div className="col-md-3"><label className="qt-label">Booking Party</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Book" /></div></div>
              <div className="col-md-3"><label className="qt-label">Seller</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Seller" /></div></div>
              <div className="col-md-3"><label className="qt-label">Buyer</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Buyer" /></div></div>
            </div>
            <div className="row g-3">
              <div className="col-md-3"><label className="qt-label">Transporter</label><div className="d-flex gap-1"><select className="form-field qt-input w-50"><option>Select</option></select><input className="form-field qt-input w-50" placeholder="Enter Trans" /></div></div>
            </div>
          </div>
        )}
      </div>

      {/* 3. SHIPPING DETAILS */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("shippingDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-package"></i></div> Shipping Details</div>
          <i className={`bx ${openSections.shippingDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.shippingDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Chasis No.</label><input className="form-field qt-input" placeholder="Enter Chasis No." /></div>
              <div className="col-md-3"><label className="qt-label">No. Of Pkgs</label><div className="d-flex gap-1"><select className="form-field qt-input w-75"><option>Select Unit</option></select><input className="form-field qt-input w-25" defaultValue="0" /></div></div>
              <div className="col-md-3"><label className="qt-label">Total Gross Weight</label><div className="d-flex gap-1"><select className="form-field qt-input w-75"><option>Select Unit</option></select><input className="form-field qt-input w-25" defaultValue="0.000" /></div></div>
              <div className="col-md-3"><label className="qt-label">Total Gross Wt.</label><div className="d-flex gap-1"><select className="form-field qt-input w-75"><option>Select Unit</option></select><input className="form-field qt-input w-25" defaultValue="0.000" /></div></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Total Net Wt.</label><div className="d-flex gap-1"><input className="form-field qt-input w-75" placeholder="Enter Net Wt." /><select className="form-field qt-input w-25"><option>KGS</option></select></div></div>
              <div className="col-md-3"><label className="qt-label">Total Volume</label><div className="d-flex gap-1"><select className="form-field qt-input w-75"><option>Select Unit</option></select><input className="form-field qt-input w-25" defaultValue="0.000" /></div></div>
              <div className="col-md-3"><label className="qt-label">Volume Wt.</label><div className="d-flex gap-1"><input className="form-field qt-input w-75" placeholder="Enter Volume Wt." /><select className="form-field qt-input w-25"><option>KGS</option></select></div></div>
              <div className="col-md-3"><label className="qt-label">Total Chrg. Wt.</label><div className="d-flex gap-1"><input className="form-field qt-input w-75" placeholder="Enter Charge Wt." /><select className="form-field qt-input w-25"><option>KGS</option></select></div></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Marks and Nos</label><textarea className="form-field qt-input" rows="2" placeholder="Enter Marks and Nos"></textarea></div>
              <div className="col-md-3"><label className="qt-label">Goods Desc.</label><textarea className="form-field qt-input" rows="2" placeholder="Enter Goods Description"></textarea></div>
              <div className="col-md-3"><label className="qt-label">Sales Person</label><select className="form-field qt-input"><option>Select Sales Person</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Origin</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Destination</label><select className="form-field qt-input"><option>Select</option></select></div>
              <div className="col-md-3"><label className="qt-label">Transporter / Carrier</label><select className="form-field qt-input"><option>Select Transporter / Carrier</option></select></div>
              <div className="col-md-3"><label className="qt-label">Vehicle / Rail No.</label><input className="form-field qt-input" placeholder="Enter Vehicle / Rail No." /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">Trade Lane</label><select className="form-field qt-input"><option>Select Trade Lane</option></select></div>
              <div className="col-md-3"><label className="qt-label">De-stuffing At</label><select className="form-field qt-input"><option>Select De-stuffing At</option></select></div>
              <div className="col-md-3"><label className="qt-label">Cont. Return Location</label><select className="form-field qt-input"><option>Select Cont. Return Location</option></select></div>
              <div className="col-md-3"><label className="qt-label">Orig. Agent Ref.</label><input className="form-field qt-input" placeholder="Enter Orig. Agent Ref." /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><label className="qt-label">AMS No.</label><input className="form-field qt-input" placeholder="Enter AMS No." /></div>
              <div className="col-md-3"><label className="qt-label">G.O. Date</label><input type="date" className="form-field qt-input" /></div>
              <div className="col-md-3"><label className="qt-label">Last Free Date</label><input type="date" className="form-field qt-input" /></div>
              <div className="col-md-3">
                <label className="qt-label">Co-Load Type</label>
                <select className="form-field qt-input">
                  <option>-- Not Applicable --</option>
                  <option>Applicable</option>
                </select>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-3"><label className="qt-label">Agent Name</label><select className="form-field qt-input"><option>Select Agent Name</option></select></div>
              <div className="col-md-3"><label className="qt-label">Agent CNote No</label><input className="form-field qt-input" placeholder="Enter Agent CNote No" /></div>
              <div className="col-md-3"><label className="qt-label">Agent Date</label><input type="date" className="form-field qt-input" /></div>
            </div>
          </div>
        )}
      </div>

      {/* 4. ROUTING DETAILS */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("routingDetails")}>
          <div className="d-flex align-items-center gap-3">
            <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-git-branch"></i></div> Routing Details</div>
            <button className="btn-primary-custom" style={{ height: 32, padding: "0 15px", fontSize: 12 }}>Add New</button>
          </div>
          <i className={`bx ${openSections.routingDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.routingDetails && (
          <div className="qt-section-body">
            <div className="bk-dynamic-table-wrapper">
              <table className="bk-dynamic-table">
                <thead><tr><th>Transport Mode</th><th>Type</th><th>From</th><th>To</th><th>ETD</th><th>ETA(Dest.)</th><th>Carrier</th><th>Flight/Vessel</th><th>Voyage No</th><th>Remarks</th></tr></thead>
                <tbody>{routeRows.map(row => (<tr key={row.id}><td><select className="form-field qt-input" style={{ height: 32 }}><option>Select</option></select></td><td><input className="form-field qt-input" style={{ height: 32 }} /></td><td><select className="form-field qt-input" style={{ height: 32 }}><option>Select</option></select></td><td><select className="form-field qt-input" style={{ height: 32 }}><option>Select</option></select></td><td><input type="date" className="form-field qt-input" style={{ height: 32 }} /></td><td><input type="date" className="form-field qt-input" style={{ height: 32 }} /></td><td><input className="form-field qt-input" style={{ height: 32 }} /></td><td><input className="form-field qt-input" style={{ height: 32 }} /></td><td><input className="form-field qt-input" style={{ height: 32 }} /></td><td><input className="form-field qt-input" style={{ height: 32 }} /></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. DI */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("diDetails")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-file"></i></div> DI</div>
          <i className={`bx ${openSections.diDetails ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.diDetails && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-4"><label className="qt-label">Type <span className="text-danger">*</span></label><select className="form-field qt-input"><option>Select Type</option></select></div>
              <div className="col-md-4"><label className="qt-label">Pickup From</label><select className="form-field qt-input"><option>Select Pickup From</option></select></div>
              <div className="col-md-4"><label className="qt-label">Pickup Address</label><textarea className="form-field qt-input" rows="2" placeholder="Enter Pickup Address"></textarea></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4"><label className="qt-label">EST Date & Time</label><input type="datetime-local" className="form-field qt-input" /></div>
              <div className="col-md-4"><label className="qt-label">Delivery Transporter</label><select className="form-field qt-input"><option>Select Delivery Transporter</option></select></div>
              <div className="col-md-4"><label className="qt-label">Transporter Ref No</label><input className="form-field qt-input" placeholder="Enter Transporter Ref No" /></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4"><label className="qt-label">Vehicle No</label><input className="form-field qt-input" placeholder="Enter Vehicle No" /></div>
              <div className="col-md-4"><label className="qt-label">Driver Name</label><input className="form-field qt-input" placeholder="Enter Driver Name" /></div>
              <div className="col-md-4"><label className="qt-label">Charge Type</label><select className="form-field qt-input"><option>Select Charge Type</option></select></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4"><label className="qt-label">Date</label><input type="date" className="form-field qt-input" /></div>
              <div className="col-md-4"><label className="qt-label">Deliver To</label><select className="form-field qt-input"><option>Select Deliver To</option></select></div>
              <div className="col-md-4"><label className="qt-label">Delivery Address</label><textarea className="form-field qt-input" rows="2" placeholder="Enter Delivery Address"></textarea></div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4"><label className="qt-label">EST Date & Time (Delivery)</label><input type="datetime-local" className="form-field qt-input" /></div>
              <div className="col-md-4"><label className="qt-label">Container No.</label><input className="form-field qt-input" placeholder="Enter Container No." /></div>
              <div className="col-md-4"><label className="qt-label">Total Weight</label><input className="form-field qt-input" value="0" /></div>
            </div>
            <div className="row g-3">
              <div className="col-md-12"><label className="qt-label">Remark</label><textarea className="form-field qt-input" rows="2" placeholder="Enter Remark"></textarea></div>
            </div>
          </div>
        )}
      </div>

      {/* 6. ATTACHED HOUSE */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("attachedHouse")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-link"></i></div> Attached House</div>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-sm btn-info text-white" style={{ fontSize: '13px', padding: '4px 12px' }}><i className="bx bx-paperclip"></i> Attach Shipment</button>
            <button className="btn btn-sm btn-success" style={{ fontSize: '13px', padding: '4px 12px' }}><i className="bx bx-plus"></i> New Shipment</button>
            <button className="btn btn-sm btn-danger" style={{ fontSize: '13px', padding: '4px 12px' }}><i className="bx bx-trash"></i> Detach</button>
          </div>
          <i className={`bx ${openSections.attachedHouse ? "bx-chevron-up" : "bx-chevron-down"} ms-2`}></i>
        </div>
        {openSections.attachedHouse && (
          <div className="qt-section-body">
            <div className="table-responsive">
              <table className="table table-bordered table-sm text-center">
                <thead className="table-light"><tr><th>Date</th><th>Shipment No</th><th>Cargo Type</th><th>Gross Wt</th><th>Charge Wt</th><th>Shipper</th><th>Consignee</th><th>Packages</th><th>Volume</th></tr></thead>
                <tbody><tr><td colSpan="9" className="text-muted py-3">No data available</td></tr></tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 7. CHARGE SHEET */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("chargeSheet")}>
          <div className="bk-section-title"><div className="bk-icon-circle"><i className="bx bx-calculator"></i></div> Charge Sheet</div>
          <i className={`bx ${openSections.chargeSheet ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.chargeSheet && (
          <div className="qt-section-body">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="qt-charge-card">
                  <div className="qt-charge-header qt-charge-revenue">
                    <span>Revenue Details</span>
                    <button className="legacy-add-btn-rev" onClick={() => setShowRevenueModal(true)}>Add +</button>
                  </div>
                  <div className="table-responsive"><table className="table table-sm text-center"><thead><tr><th>Charge Name</th><th>Rate</th><th>Currency</th><th>Edit</th><th>Del</th></tr></thead><tbody><tr><td colSpan="5" className="text-muted py-2">No revenue charges</td></tr></tbody></table></div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="qt-charge-card">
                  <div className="qt-charge-header qt-charge-cost">
                    <span>Cost Details</span>
                    <button className="legacy-add-btn-cost" onClick={() => setShowCostModal(true)}>Add +</button>
                  </div>
                  <div className="table-responsive"><table className="table table-sm text-center"><thead><tr><th>Charge Name</th><th>Rate</th><th>Currency</th><th>Edit</th><th>Del</th></tr></thead><tbody><tr><td colSpan="5" className="text-muted py-2">No cost charges</td></tr></tbody></table></div>
                </div>
              </div>
            </div>
            <div className="qt-summary-wrapper mt-4">
              <div className="table-responsive">
                <table className="table table-bordered qt-summary-table text-center">
                  <thead>
                    <tr>
                      <th colSpan="5">Revenue</th>
                      <th colSpan="3">Cost</th>
                      <th rowSpan="2">Profit</th>
                      <th rowSpan="2">Profit %</th>
                    </tr>
                    <tr>
                      <th>Services</th>
                      <th>Charge Name</th>
                      <th>Rate</th>
                      <th>Currency</th>
                      <th>Amount (FC)</th>
                      <th>Rate</th>
                      <th>Currency</th>
                      <th>Amount (FC)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total</td><td></td><td></td><td></td><td>0.00</td>
                      <td></td><td></td><td>0.00</td>
                      <td>0.00</td><td>0.00%</td>
                    </tr>
                  </tbody>
                </table>
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

export default LandImportConsol;
