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
import "../../css/forwarding.css";

/* ───── dummy data ───── */
const dummyQuotations = [
  { _id: "1", quotationNumber: "QTN-001", companyCode: "C001", companyName: "infologia", quotationDate: "2026-04-09T00:00:00", validFrom: "2026-03-26T00:00:00", validTill: "2026-04-09T00:00:00" },
  { _id: "2", quotationNumber: "QTN-002", companyCode: "C002", companyName: "infologia", quotationDate: "2026-03-26T00:00:00", validFrom: "2026-03-26T00:00:00", validTill: "2026-03-31T00:00:00" },
  { _id: "3", quotationNumber: "QTN-003", companyCode: "C003", companyName: "infologia", quotationDate: "2026-03-26T00:00:00", validFrom: "2026-03-26T00:00:00", validTill: "2026-03-20T00:00:00" },
  { _id: "4", quotationNumber: "QTN-004", companyCode: "C004", companyName: "infologia", quotationDate: "2026-03-10T00:00:00", validFrom: "2026-01-01T00:00:00", validTill: "2026-01-01T00:00:00" },
  { _id: "5", quotationNumber: "QTN-005", companyCode: "C005", companyName: "infologia", quotationDate: "2026-03-15T00:00:00", validFrom: "2026-01-15T00:00:00", validTill: "2026-01-01T00:00:00" },
];

const lobOptions = [
  "Air Import",
  "Air Export",
  "Rail Import",
  "Rail Export",
  "Road Import",
  "Road Export",
  "Sea Import",
  "Sea Export",
];

/* ───── component ───── */
const Quotations = ({ initialView = "table" }) => {
  const tableRef = useRef(null);
  const dtRef = useRef(null);
  const openedRowRef = useRef(null);

  // views: "table" | "form"
  const [view, setView] = useState(initialView);
  const [quotations, setQuotations] = useState(dummyQuotations);

  // LOB modal
  const [showLobModal, setShowLobModal] = useState(false);
  const [selectedLob, setSelectedLob] = useState("");

  // details modal (on row expand)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // form data
  const [formData, setFormData] = useState({
    organisation: "",
    quotationDate: "",
    validFrom: "",
    validTo: "",
    contactPerson: "",
    organisationRole: "Shipper",
    cargoStatus: "",
    cargoDate: "",
    quotedBy: "",
    salesCoordinator: "",
    location: "",
  });

  // collapsible sections
  const [openSections, setOpenSections] = useState({
    basic: true,
    handler: false,
    cargo: false,
    movement: false,
    chargeSheet: true,
  });

  // charge sheet modals
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);

  // charge sheet form
  const [chargeForm, setChargeForm] = useState({
    chargeCode: "",
    chargeDescription: "",
    chargeType: "",
    ppcc: "",
    type: "Receivable",
    paidTo: "",
    contractNo: "",
    basis: "",
    basisType: "",
    rateType: "",
    date: "",
    rate: "",
    rateCurrency: "",
    paidBy: "",
  });

  // revenue / cost entries
  const [revenueEntries, setRevenueEntries] = useState([]);
  const [costEntries, setCostEntries] = useState([]);

  // lock body scroll when modals open
  useEffect(() => {
    if (showLobModal || showRevenueModal || showCostModal || showDetailsModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [showLobModal, showRevenueModal, showCostModal, showDetailsModal, showDeleteModal]);

  /* ───── DataTable init ───── */
  useEffect(() => {
    if (view !== "table" || !tableRef.current) return;
    if (dtRef.current) {
      dtRef.current.destroy();
      dtRef.current = null;
    }

    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    dtRef.current = $(tableRef.current).DataTable({
      dom:
        "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "t" +
        "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

      scrollY: "350px",
      scrollCollapse: true,
      scrollX: false,
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
            { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
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

      data: quotations,

      columns: [
        { data: "quotationNumber", responsivePriority: 1 },
        { data: "companyCode", responsivePriority: 2 },
        { data: "companyName", responsivePriority: 3 },
        {
          data: "quotationDate", responsivePriority: 4,
          render: (d) => d ? new Date(d).toLocaleString() : "",
        },
        {
          data: "validFrom", responsivePriority: 5,
          render: (d) => d ? new Date(d).toLocaleString() : "",
        },
        {
          data: "validTill", responsivePriority: 100,
          render: (d) => d ? new Date(d).toLocaleString() : "",
        },
        {
          data: null,
          className: "no-export text-center",
          responsivePriority: 1,
          orderable: false,
          searchable: false,
          render: (data) =>
            `<div class="d-flex align-items-center justify-content-center gap-2">
               <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" title="Edit" style="font-size: 18px;"></i>
               <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Delete" style="font-size: 18px;"></i>
             </div>`,
        },
      ],

      order: [[0, "asc"]],
    });

    setTimeout(() => {
      $(".dt-button").removeClass("btn btn-secondary");
    }, 0);

    /* Details modal on responsive expand */
    dtRef.current.on("responsive-display", function (e, datatable, row, showHide) {
      if (showHide) {
        openedRowRef.current = row;
        const rowData = row.data();
        setSelectedRow(rowData);
        setShowDetailsModal(true);
      }
    });

    /* Edit click */
    $(tableRef.current).on("click", ".edit-icon", function () {
      const rowData = dtRef.current.row($(this).parents("tr")).data();
      if (rowData) {
        setFormData({
          organisation: rowData.companyName || "",
          quotationDate: rowData.quotationDate ? rowData.quotationDate.split("T")[0] : "",
          validFrom: rowData.validFrom ? rowData.validFrom.split("T")[0] : "",
          validTo: rowData.validTill ? rowData.validTill.split("T")[0] : "",
          contactPerson: "",
          organisationRole: "Shipper",
          cargoStatus: "",
          cargoDate: "",
          quotedBy: "",
          salesCoordinator: "",
          location: "",
        });
        switchToForm();
      }
    });

    /* Delete click */
    $(tableRef.current).on("click", ".delete-icon", function (e) {
      e.stopPropagation();
      const rowData = dtRef.current.row($(this).parents("tr")).data();
      if (rowData) {
        setDeleteId(rowData._id);
        setShowDeleteModal(true);
      }
    });

    /* Row click → details modal */
    $(tableRef.current).on("click", "tbody tr td:first-child", function () {
      const tr = $(this).closest("tr");
      const row = dtRef.current.row(tr);
      const rowData = row.data();
      if (!rowData) return;
      setSelectedRow(rowData);
      setShowDetailsModal(true);
    });

    return () => {
      if (dtRef.current) {
        dtRef.current.destroy();
        dtRef.current = null;
      }
    };
  }, [view, quotations]);

  /* ───── helpers ───── */
  const switchToForm = () => {
    if (dtRef.current) {
      dtRef.current.destroy();
      dtRef.current = null;
    }
    setView("form");
  };

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChargeChange = (e) => {
    const { name, value } = e.target;
    setChargeForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetChargeForm = () =>
    setChargeForm({
      chargeCode: "", chargeDescription: "", chargeType: "", ppcc: "",
      type: "Receivable", paidTo: "", contractNo: "", basis: "",
      basisType: "", rateType: "", date: "", rate: "", rateCurrency: "", paidBy: "",
    });

  const handleCreateRevenue = () => {
    setRevenueEntries((prev) => [...prev, { ...chargeForm, id: Date.now() }]);
    resetChargeForm();
    setShowRevenueModal(false);
  };

  const handleCreateCost = () => {
    const entry = { ...chargeForm, type: "Payable", id: Date.now() };
    setCostEntries((prev) => [...prev, entry]);
    resetChargeForm();
    setShowCostModal(false);
  };

  const deleteRevenue = (id) => setRevenueEntries((prev) => prev.filter((e) => e.id !== id));
  const deleteCost = (id) => setCostEntries((prev) => prev.filter((e) => e.id !== id));

  const openCreateModal = () => {
    setSelectedLob("");
    setShowLobModal(true);
  };

  const handleLobOk = () => {
    if (!selectedLob) return;
    setShowLobModal(false);
    setFormData({
      organisation: "", quotationDate: "", validFrom: "", validTo: "",
      contactPerson: "", organisationRole: "Shipper", cargoStatus: "",
      cargoDate: "", quotedBy: "", salesCoordinator: "", location: "",
    });
    setRevenueEntries([]);
    setCostEntries([]);
    switchToForm();
  };

  const totalRevenue = revenueEntries.reduce((s, e) => s + (parseFloat(e.rate) || 0), 0);
  const totalCost = costEntries.reduce((s, e) => s + (parseFloat(e.rate) || 0), 0);
  const profit = totalRevenue - totalCost;
  const profitPct = totalRevenue ? ((profit / totalRevenue) * 100).toFixed(2) : "0.00";

  /* ════════════════════════════════════════════════════
     RENDER — TABLE VIEW
  ════════════════════════════════════════════════════ */
  if (view === "table") {
    return (
      <div className="container-xxl container-p-y pb-5">
        <h4 className="table-title mb-4">Quotation</h4>

        <div className="ocean-card">
          <div className="ocean-title">
            <span className="bk-section-title">
              <div className="bk-icon-circle"><i className="bx bx-file"></i></div> Quotation List
            </span>
            <button className="btn-add-record btn-primary-custom" onClick={openCreateModal}>
              <i className="bx bx-plus"></i> Create Quotation
            </button>
          </div>

          <div className="card-datatable p-3">
            <table ref={tableRef} className="table dataTable dtr-inline" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Quotation Number</th>
                  <th>Company Code</th>
                  <th>Company Name</th>
                  <th>Quotation Date</th>
                  <th>Valid From</th>
                  <th>Valid Till</th>
                  <th>Edit</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* ───── DETAILS MODAL ───── */}
        {showDetailsModal && selectedRow && (
          <div className="custom-modal-backdrop">
            <div className="custom-modal-card">
              <button
                className="custom-close"
                onClick={() => {
                  if (openedRowRef.current) {
                    const tr = $(openedRowRef.current.node());
                    tr.find("td.dtr-control").trigger("click");
                    openedRowRef.current = null;
                  }
                  setShowDetailsModal(false);
                }}
              >×</button>

              <h5 className="modal-title">
                Details of {selectedRow.quotationNumber}
              </h5>

              <hr className="modal-divider" />

              <table className="table table-sm">
                <tbody>
                  <tr><td><strong>Quotation Number:</strong></td><td>{selectedRow.quotationNumber}</td></tr>
                  <tr><td><strong>Company Code:</strong></td><td>{selectedRow.companyCode}</td></tr>
                  <tr><td><strong>Company Name:</strong></td><td>{selectedRow.companyName}</td></tr>
                  <tr><td><strong>Quotation Date:</strong></td><td>{selectedRow.quotationDate ? new Date(selectedRow.quotationDate).toLocaleString() : ""}</td></tr>
                  <tr><td><strong>Valid From:</strong></td><td>{selectedRow.validFrom ? new Date(selectedRow.validFrom).toLocaleString() : ""}</td></tr>
                  <tr><td><strong>Valid Till:</strong></td><td>{selectedRow.validTill ? new Date(selectedRow.validTill).toLocaleString() : ""}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───── LOB MODAL ───── */}
        {showLobModal && (
          <div className="custom-modal-backdrop">
            <div className="custom-modal-card" style={{ width: 420 }}>
              <button className="custom-close" onClick={() => setShowLobModal(false)}>×</button>
              <h5 className="modal-title" style={{ background: "#50a9e9", color: "#fff", margin: "-1.5rem -1.75rem 0", padding: "14px 20px", borderRadius: "0.5rem 0.5rem 0 0" }}>
                Create Quotation
              </h5>

              <div style={{ padding: "24px 0 0" }}>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: 10 }}>LOB Name</label>
                <select
                  className="form-field"
                  value={selectedLob}
                  onChange={(e) => setSelectedLob(e.target.value)}
                  style={{ paddingLeft: 12, cursor: "pointer" }}
                >
                  <option value="">--Select LOB--</option>
                  {lobOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="modal-buttons" style={{ marginTop: 24 }}>
                <button className="btn-secondary-custom" onClick={() => setShowLobModal(false)}>Close</button>
                <button className="btn-primary-custom" onClick={handleLobOk}>Ok</button>
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
                <p className="text-muted mb-4">You want to delete this quotation? This action cannot be undone.</p>
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
                      setQuotations(prev => prev.filter(q => q._id !== deleteId));
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
        <h5 className="bk-form-heading mb-0" style={{ color: "#566a7f", fontSize: "1.125rem", fontWeight: 600 }}>Quotes Details</h5>
        <button className="btn-secondary-custom" onClick={() => setView("table")}>
          <i className="bx bx-arrow-back me-1"></i> Back to List
        </button>
      </div>

      {/* ───── BASIC INFORMATION ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("basic")}>
          <span className="bk-section-title">
            <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Basic Information
          </span>
          <i className={`bx ${openSections.basic ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.basic && (
          <div className="qt-section-body">
            {/* row 1 */}
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Organisation <span className="text-danger">*</span></label>
                <select name="organisation" className="form-field qt-input" value={formData.organisation} onChange={handleFormChange}>
                  <option value="">Select</option>
                  <option value="infologia">infologia</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Quotation Date <span className="text-danger">*</span></label>
                <input type="date" name="quotationDate" className="form-field qt-input" value={formData.quotationDate} onChange={handleFormChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Valid From</label>
                <input type="date" name="validFrom" className="form-field qt-input" value={formData.validFrom} onChange={handleFormChange} />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Valid To <span className="text-danger">*</span></label>
                <input type="date" name="validTo" className="form-field qt-input" value={formData.validTo} onChange={handleFormChange} />
              </div>
            </div>

            {/* row 2 */}
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Contact Person</label>
                <select name="contactPerson" className="form-field qt-input" value={formData.contactPerson} onChange={handleFormChange}>
                  <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Organisation Role <span className="text-danger">*</span></label>
                <select name="organisationRole" className="form-field qt-input" value={formData.organisationRole} onChange={handleFormChange}>
                  <option value="Shipper">Shipper</option>
                  <option value="Consignee">Consignee</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Cargo Status</label>
                <select name="cargoStatus" className="form-field qt-input" value={formData.cargoStatus} onChange={handleFormChange}>
                  <option value="">Select Cargo Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Cargo Date</label>
                <input type="date" name="cargoDate" className="form-field qt-input" value={formData.cargoDate} onChange={handleFormChange} />
              </div>
            </div>

            {/* row 3 */}
            <div className="row g-3">
              <div className="col-md-3">
                <label className="qt-label">Quoted By <span className="text-danger">*</span></label>
                <select name="quotedBy" className="form-field qt-input" value={formData.quotedBy} onChange={handleFormChange}>
                  <option value="">Select Quoted By</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Sales Coordinator</label>
                <select name="salesCoordinator" className="form-field qt-input" value={formData.salesCoordinator} onChange={handleFormChange}>
                  <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Location <span className="text-danger">*</span></label>
                <select name="location" className="form-field qt-input" value={formData.location} onChange={handleFormChange}>
                  <option value="">Select</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── HANDLER DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("handler")}>
          <span className="bk-section-title">
            <div className="bk-icon-circle"><i className="bx bx-user"></i></div> Handler Details
          </span>
          <i className={`bx ${openSections.handler ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.handler && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Shipper</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Consignee</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Origin Agent</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Destination Agent</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Selling Agent</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Notify 1</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Notify 2</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Notify 3</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="qt-label">Customs Broker</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Terminal Operator</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Transporter</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Customer</label>
                <input type="text" className="form-field qt-input" disabled style={{ background: "#f5f5f5" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── CARGO DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("cargo")}>
          <span className="bk-section-title">
            <div className="bk-icon-circle"><i className="bx bx-package"></i></div> Cargo Details
          </span>
          <i className={`bx ${openSections.cargo ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.cargo && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Transport Mode</label>
                <input type="text" className="form-field qt-input" value="Air" readOnly />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Transport Type</label>
                <input type="text" className="form-field qt-input" value="Import" readOnly />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Shipment Type <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option value="">Select Shipment Type</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Cargo Type <span className="text-danger">*</span></label>
                <input type="text" className="form-field qt-input" value="Loose" readOnly />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Business Dimensions</label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Stuff Type</label>
                <input type="text" className="form-field qt-input" value="Any" readOnly />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Commodity <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option value="">Select</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Commodity Type <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option value="">Select Commodity Type</option></select>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="qt-label">Description</label>
                <textarea className="form-field qt-input" rows={3} style={{ height: "auto" }}></textarea>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Humidity</label>
                <input type="text" className="form-field qt-input" />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Gross Weight <span className="text-danger">*</span></label>
                <div className="d-flex gap-2">
                  <input type="text" className="form-field qt-input" placeholder="GrossWeight" />
                  <select className="form-field qt-input" style={{ width: "80px" }}><option value="">Select</option></select>
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Net Weight</label>
                <input type="text" className="form-field qt-input" />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Dimensions <span className="text-danger">*</span></label>
                <div className="d-flex gap-1 align-items-center">
                  <input type="text" className="form-field qt-input" placeholder="Length" />
                  <input type="text" className="form-field qt-input" placeholder="Width" />
                  <input type="text" className="form-field qt-input" placeholder="Height" />
                </div>
              </div>
              <div className="col-md-6">
                <label className="qt-label">Packages</label>
                <div className="d-flex gap-2">
                  <select className="form-field qt-input"><option value="">Select Type</option></select>
                  <input type="text" className="form-field qt-input" placeholder="Packages" />
                  <select className="form-field qt-input" style={{ width: "80px" }}><option value="">Select</option></select>
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="qt-label">Volume <span className="text-danger">*</span></label>
                <div className="d-flex gap-2 align-items-center">
                  <input type="text" className="form-field qt-input" />
                  <select className="form-field qt-input" style={{ width: "80px" }}><option value="">Select</option></select>
                  <button className="btn btn-sm btn-info" style={{ height: 38 }}><i className="bx bx-calculator"></i></button>
                </div>
              </div>
              <div className="col-md-4">
                <label className="qt-label">Volume Weight</label>
                <input type="text" className="form-field qt-input" />
              </div>
              <div className="col-md-4">
                <label className="qt-label">Chargeable Weight <span className="text-danger">*</span></label>
                <input type="text" className="form-field qt-input" />
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="qt-label">Vehicle Type</label>
                <textarea className="form-field qt-input" rows={2} style={{ height: "auto" }}></textarea>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── MOVEMENT DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("movement")}>
          <span className="bk-section-title">
            <div className="bk-icon-circle"><i className="bx bxs-truck"></i></div> Movement Details
          </span>
          <i className={`bx ${openSections.movement ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
        </div>
        {openSections.movement && (
          <div className="qt-section-body">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="qt-label">Movement Type <span className="text-danger">*</span></label>
                <select className="form-field qt-input"><option value="">Select Movement Type</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Inco Terms</label>
                <select className="form-field qt-input"><option value="">Select IncoTerms</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">AWB Issued By</label>
                <select className="form-field qt-input"><option value="">--Select AWB Issued By--</option></select>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Carrier</label>
                <select className="form-field qt-input"><option value="">--Select Carrier--</option></select>
              </div>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="qt-label">Contract No</label>
                <input type="text" className="form-field qt-input" placeholder="Enter Contract No" />
              </div>
              <div className="col-md-3">
                <label className="qt-label">TransitDest/Days</label>
                <div className="d-flex gap-2">
                  <select className="form-field qt-input"><option value="">Select</option></select>
                  <input type="text" className="form-field qt-input" />
                </div>
              </div>
              <div className="col-md-3">
                <label className="qt-label">Cargo Value</label>
                <input type="text" className="form-field qt-input" placeholder="Enter Cargo Value" />
              </div>
              <div className="col-md-3">
                <label className="qt-label">Remark</label>
                <textarea className="form-field qt-input" rows={2} style={{ height: "auto" }}></textarea>
              </div>
            </div>

            {/* Movements Sub-section */}
            <div className="bk-section-card mb-4" style={{ boxShadow: "none", border: "1px solid #eef0f2" }}>
              <div className="bk-section-header" style={{ padding: "8px 15px", background: "#f8f9fa" }}>
                <span className="bk-section-title" style={{ fontSize: "14px", color: "#3b5998" }}>Movements</span>
              </div>
              <div className="qt-section-body" style={{ padding: "15px" }}>
                <div className="row g-3 mb-3">
                  <div className="col-md-3"><label className="qt-label">Origin</label><select className="form-field qt-input"><option value="">Select</option></select></div>
                  <div className="col-md-3"><label className="qt-label">Place of Receipt</label><select className="form-field qt-input"><option value="">Select</option></select></div>
                  <div className="col-md-3"><label className="qt-label">Port of Loading</label><select className="form-field qt-input"><option value="">Select</option></select></div>
                  <div className="col-md-3"><label className="qt-label">Port of Discharge</label><select className="form-field qt-input"><option value="">Select</option></select></div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-3"><label className="qt-label">Place of Delivery</label><select className="form-field qt-input"><option value="">Select</option></select></div>
                  <div className="col-md-3"><label className="qt-label">Final Destination</label><select className="form-field qt-input"><option value="">Select</option></select></div>
                  <div className="col-md-3"><label className="qt-label">Trade Line</label><input type="text" className="form-field qt-input" /></div>
                  <div className="col-md-3"><label className="qt-label">Pickup Address</label><select className="form-field qt-input"><option value="">Select Pickup Address</option></select></div>
                </div>
                <div className="row g-3">
                  <div className="col-md-3"><label className="qt-label">Delivery Address</label><select className="form-field qt-input"><option value="">Select Delivery Address</option></select></div>
                </div>
              </div>
            </div>

            {/* Carbon Emission Sub-section */}
            <div className="bk-section-card" style={{ boxShadow: "none", border: "1px solid #eef0f2" }}>
              <div className="bk-section-header" style={{ padding: "8px 15px", background: "#f8f9fa" }}>
                <span className="bk-section-title" style={{ fontSize: "14px", color: "#3b5998" }}>Carbon Emission</span>
              </div>
              <div className="qt-section-body" style={{ padding: "15px" }}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="qt-label">Pre Carriage Emission</label>
                    <div className="d-flex gap-2 align-items-center">
                      <input type="text" className="form-field qt-input" />
                      <label className="qt-label mb-0">CO2</label>
                      <select className="form-field qt-input"><option value="">Select CO2</option></select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">On Carriage Emission</label>
                    <div className="d-flex gap-2 align-items-center">
                      <input type="text" className="form-field qt-input" />
                      <label className="qt-label mb-0">CO2</label>
                      <select className="form-field qt-input"><option value="">Select CO2</option></select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="qt-label">Main Carriage Emission</label>
                    <div className="d-flex gap-2 align-items-center">
                      <input type="text" className="form-field qt-input" />
                      <label className="qt-label mb-0">CO2</label>
                      <select className="form-field qt-input"><option value="">Select CO2</option></select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── CHARGE SHEET DETAILS ───── */}
      <div className="qt-section-card">
        <div className="bk-section-header" onClick={() => toggleSection("chargeSheet")}>
          <span className="bk-section-title">
            <div className="bk-icon-circle" style={{ color: "#1976d2" }}><i className="bx bx-dollar"></i></div> Charge Sheet Details
          </span>
          <i className={`bx ${openSections.chargeSheet ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ color: "#1976d2" }}></i>
        </div>
        {openSections.chargeSheet && (
          <div className="qt-section-body">
            {/* Revenue + Cost side-by-side */}
            <div className="row g-4 mb-4">
              {/* REVENUE */}
              <div className="col-md-6">
                <div className="qt-charge-card">
                  <div className="qt-charge-header qt-charge-revenue">
                    <span>Revenue Details</span>
                    <button className="legacy-add-btn-rev" onClick={() => { resetChargeForm(); setChargeForm((p) => ({ ...p, type: "Receivable" })); setShowRevenueModal(true); }}>Add $</button>
                  </div>
                  <div className="table-responsive">
                    <table className="table qt-charge-table">
                      <thead>
                        <tr>
                          <th>Charge Name</th>
                          <th>Amount</th>
                          <th>Curr</th>
                          <th>Edit</th>
                          <th>Del</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueEntries.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "#a1acb8" }}>No entries</td></tr>
                        ) : revenueEntries.map((e) => (
                          <tr key={e.id}>
                            <td>{e.chargeCode}</td>
                            <td>{e.rate || "0.00"}</td>
                            <td>{e.rateCurrency || "-"}</td>
                            <td><i className="bx bx-edit edit-icon"></i></td>
                            <td><i className="bx bx-trash delete-icon" onClick={() => deleteRevenue(e.id)}></i></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* COST */}
              <div className="col-md-6">
                <div className="qt-charge-card">
                  <div className="qt-charge-header qt-charge-cost">
                    <span>Cost Details</span>
                    <button className="legacy-add-btn-cost" onClick={() => { resetChargeForm(); setChargeForm((p) => ({ ...p, type: "Payable" })); setShowCostModal(true); }}>Add $</button>
                  </div>
                  <div className="table-responsive">
                    <table className="table qt-charge-table">
                      <thead>
                        <tr>
                          <th>Charge Name</th>
                          <th>Amount</th>
                          <th>Curr</th>
                          <th>Edit</th>
                          <th>Del</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costEntries.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "#a1acb8" }}>No entries</td></tr>
                        ) : costEntries.map((e) => (
                          <tr key={e.id}>
                            <td>{e.chargeCode}</td>
                            <td>{e.rate || "0.00"}</td>
                            <td>{e.rateCurrency || "-"}</td>
                            <td><i className="bx bx-edit edit-icon"></i></td>
                            <td><i className="bx bx-trash delete-icon" onClick={() => deleteCost(e.id)}></i></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="qt-summary-wrapper">
              <div className="qt-charge-header">
                <span>Quotation Summary</span>
              </div>
              <div className="table-responsive">
                <table className="table qt-summary-table">
                  <thead>
                    <tr>
                      <th className="qt-sum-empty"></th>
                      <th className="qt-sum-empty"></th>
                      <th colSpan={3} className="qt-sum-rev-head">Revenue</th>
                      <th colSpan={3} className="qt-sum-cost-head">Cost</th>
                      <th className="qt-sum-empty"></th>
                      <th className="qt-sum-empty"></th>
                    </tr>
                    <tr>
                      <th>Services</th>
                      <th>Charge Name</th>
                      <th>Amount</th><th>Curr</th><th>Amount (HC)</th>
                      <th>Amount</th><th>Curr</th><th>Amount (HC)</th>
                      <th>Profit</th>
                      <th>Profit %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td></td>
                      <td className="qt-summary-total-label">Total</td>
                      <td>{totalRevenue.toFixed(2)}</td>
                      <td></td>
                      <td>{totalRevenue.toFixed(2)}</td>
                      <td>{totalCost.toFixed(2)}</td>
                      <td></td>
                      <td>{totalCost.toFixed(2)}</td>
                      <td>{profit.toFixed(2)}</td>
                      <td>{profitPct}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
        <button className="btn-secondary-custom" onClick={() => setView("table")}>
          Cancel
        </button>
        <button className="btn-primary-custom">
          Save
        </button>
      </div>

      {/* ───── REVENUE CHARGE MODAL ───── */}
      {showRevenueModal && renderChargeModal("Create Revenue Charge Sheet", "Receivable", handleCreateRevenue, () => setShowRevenueModal(false))}

      {/* ───── COST CHARGE MODAL ───── */}
      {showCostModal && renderChargeModal("Create Cost Charge Sheet", "Payable", handleCreateCost, () => setShowCostModal(false))}
    </div>
  );

  /* ───── charge modal renderer ───── */
  function renderChargeModal(title, typeDefault, onCreate, onClose) {
    return (
      <div className="custom-modal-backdrop">
        <div className="custom-modal-card" style={{ width: 680, maxHeight: "85vh", overflowY: "auto" }}>
          <button className="custom-close" onClick={onClose}>×</button>
          <h5 className="modal-title" style={{ background: "#50a9e9", color: "#fff", margin: "-1.5rem -1.75rem 0", padding: "14px 20px", borderRadius: "0.5rem 0.5rem 0 0" }}>
            {title}
          </h5>
          <div style={{ paddingTop: 20 }}>
            {/* row 1 */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="qt-label">Charge Code <span className="text-danger">*</span></label>
                <select name="chargeCode" className="form-field qt-input" value={chargeForm.chargeCode} onChange={handleChargeChange}>
                  <option value="">Select</option>
                  <option value="FREIGHT">FREIGHT</option>
                  <option value="THC">THC</option>
                  <option value="DOC">DOC</option>
                  <option value="BL">BL</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="qt-label">Charge Description</label>
                <textarea name="chargeDescription" className="form-field qt-input" rows={2} value={chargeForm.chargeDescription} onChange={handleChargeChange} style={{ height: 60, paddingTop: 8 }} />
              </div>
            </div>
            {/* row 2 */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="qt-label">Charge Type</label>
                <select name="chargeType" className="form-field qt-input" value={chargeForm.chargeType} onChange={handleChargeChange}>
                  <option value="">Select</option>
                  <option value="Freight">Freight</option>
                  <option value="Local">Local</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">PP/CC</label>
                <select name="ppcc" className="form-field qt-input" value={chargeForm.ppcc} onChange={handleChargeChange}>
                  <option value="">Select</option>
                  <option value="PP">PP</option>
                  <option value="CC">CC</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">Type</label>
                <input type="text" className="form-field qt-input" value={typeDefault} readOnly style={{ background: "#f5f5f5" }} />
              </div>
            </div>
            {/* row 3 */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="qt-label">Paid To</label>
                <select name="paidTo" className="form-field qt-input" value={chargeForm.paidTo} onChange={handleChargeChange}>
                  <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">Contract No</label>
                <select name="contractNo" className="form-field qt-input" value={chargeForm.contractNo} onChange={handleChargeChange}>
                  <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">Basis</label>
                <select name="basis" className="form-field qt-input" value={chargeForm.basis} onChange={handleChargeChange}>
                  <option value="">Select</option>
                </select>
              </div>
            </div>
            {/* row 4 */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="qt-label">Basis Type</label>
                <select name="basisType" className="form-field qt-input" value={chargeForm.basisType} onChange={handleChargeChange}>
                  <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">Rate Type</label>
                <select name="rateType" className="form-field qt-input" value={chargeForm.rateType} onChange={handleChargeChange}>
                  <option value="">Select</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">Date</label>
                <input type="date" name="date" className="form-field qt-input" value={chargeForm.date} onChange={handleChargeChange} />
              </div>
            </div>
            {/* row 5 */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="qt-label">Rate</label>
                <input type="number" name="rate" className="form-field qt-input" value={chargeForm.rate} onChange={handleChargeChange} placeholder="0.00" />
              </div>
              <div className="col-md-4">
                <label className="qt-label">Rate Currency</label>
                <select name="rateCurrency" className="form-field qt-input" value={chargeForm.rateCurrency} onChange={handleChargeChange}>
                  <option value="">Select</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="qt-label">Paid BY</label>
                <select name="paidBy" className="form-field qt-input" value={chargeForm.paidBy} onChange={handleChargeChange}>
                  <option value="">Select</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-buttons" style={{ marginTop: 16 }}>
            <button className="btn-secondary-custom" onClick={onClose}>Close</button>
            <button className="btn-primary-custom" onClick={onCreate}>Create</button>
          </div>
        </div>
      </div>
    );
  }
};

export default Quotations;
