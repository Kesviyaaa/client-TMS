import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-responsive";
import "datatables.net-responsive-bs5";
import "datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css";

import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.colVis";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs;

import "../../App.css";

const TerminalOperator = () => {
  const tableRef = useRef(null);
  const dtRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    terminalName: "",
    terminalCode: "",
    status: "Active",
    air: false,
    sea: false,
  });

  /* ───── HANDLE CHANGE ───── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ───── STATIC DATA ───── */
  const data = [
    { terminalName: "Chennai Terminal", terminalCode: "CHE01", status: "Active" },
    { terminalName: "Mumbai Terminal", terminalCode: "MUM01", status: "Inactive" },
  ];

  /* ───── DATATABLE ───── */
  useEffect(() => {
    if (!tableRef.current) return;
    if (dtRef.current) return;

    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    dtRef.current = $(tableRef.current).DataTable({
      dom:
        "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "t" +
        "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

      scrollY: "350px",
      scrollCollapse: true,
      paging: true,

      data: data,

      buttons: [
        {
          extend: "collection",
          text: '<i class="bx bx-export"></i> Export',
          className: "export-btn",
          autoClose: true,
          dropIcon: false,
          buttons: [
            { extend: "print", text: "Print", exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "copy", text: "Copy", exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "excel", text: "Excel", exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "pdf", text: "PDF", exportOptions: { columns: ":visible:not(.no-export)" } },
          ],
        },
        {
          extend: "colvis",
          text: '<i class="bx bx-columns"></i> Customise Columns',
          className: "custom-colvis",
          columns: ":not(.no-export)", // ❗ Edit excluded
          dropIcon: false,
        },
      ],

      columns: [
        { data: "terminalName", title: "Terminal Name" },
        { data: "terminalCode", title: "Terminal Code" },
        { data: "status", title: "Status" },
        {
          data: null,
          className: "no-export text-center",
          title: "Edit",
          orderable: false,
          render: () =>
            `<i class="bx bx-edit edit-icon" style="cursor:pointer;"></i>`,
        },
      ],
    });

    setTimeout(() => {
      $(".dt-button").removeClass("btn btn-secondary");
    }, 0);

    /* EDIT CLICK */
    $(tableRef.current).on("click", ".edit-icon", function () {
      const rowData = dtRef.current.row($(this).parents("tr")).data();

      setFormData({
        terminalName: rowData.terminalName,
        terminalCode: rowData.terminalCode,
        status: rowData.status,
        air: false,
        sea: false,
      });

      setEditingId(true);
      setShowModal(true);
    });

    return () => {
      if (dtRef.current) {
        dtRef.current.destroy();
        dtRef.current = null;
      }
    };
  }, []);

  return (
    <div className="container-xxl flex-grow-1">

      {/* CARD */}
      <div className="card">

        {/* TOOLBAR */}
        <div className="datatable-toolbar d-flex justify-content-between align-items-start">

          <div className="title-section">
            <h5 className="table-title">Terminal Operator</h5>
            <div className="breadcrumb-text">Global Masters &gt; Terminal Operator</div>
          </div>

          <button
            className="btn-add-record btn-primary-custom"
            onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}
          >
            <i className="bx bx-plus"></i> Create
          </button>
        </div>

        {/* TABLE */}
        <div className="card-datatable p-3">
          <table ref={tableRef} className="table dataTable dtr-inline w-100">
            <thead>
              <tr>
                <th>Terminal Name</th>
                <th>Terminal Code</th>
                <th>Status</th>
                <th>Edit</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="custom-modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="custom-modal-card" style={{ maxWidth: "600px" }}>

            <div className="d-flex justify-content-between align-items-center">
              <h5 style={{ color: "#50a9e9", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                {editingId ? "Edit Terminal Operator" : "Create Terminal Operator"}
              </h5>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#566a7f", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer", padding: 0 }}>&times;</button>
            </div>

            <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

            <div className="row g-3">

              {/* Terminal Name */}
              <div className="col-md-6">
                <label className="qt-label">Terminal Name *</label>
                <input
                  type="text"
                  name="terminalName"
                  className="qt-input"
                  placeholder="Enter Terminal Name"
                  value={formData.terminalName}
                  onChange={handleChange}
                />
              </div>

              {/* Terminal Code */}
              <div className="col-md-6">
                <label className="qt-label">Terminal Code *</label>
                <input
                  type="text"
                  name="terminalCode"
                  className="qt-input"
                  placeholder="Enter Terminal Code"
                  value={formData.terminalCode}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label className="qt-label">Status</label>
                <div className="d-flex gap-4 mt-2">
                  <div className="form-check">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Active</label>
                  </div>

                  <div className="form-check">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === "Inactive"}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Inactive</label>
                  </div>
                </div>
              </div>

              {/* Port (Air/Sea) */}
              <div className="col-md-6">
                <label className="qt-label">Port</label>

                <div className="d-flex gap-4 mt-2">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="air"
                      checked={formData.air}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Air</label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="sea"
                      checked={formData.sea}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Sea</label>
                  </div>
                </div>
              </div>

            </div>

            <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

            {/* BUTTONS */}
            <div className="d-flex justify-content-end gap-3">
              <button
                className="btn-secondary-custom"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn-primary-custom">
                {editingId ? "Update" : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalOperator;