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
import "datatables.net-buttons/js/buttons.colVis";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs;

import "../../App.css";

const Global = () => {
  const tableRef = useRef(null);
  const dt = useRef(null);

  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    chargeCode: "",
    chargeName: "",
    applicableFor: "",
    chargeCategory: "",
    chargeType: "",
    status: "Active",
  });

  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    let url = "http://localhost:5000/global-charges";
    let method = "POST";

    if (editingId) {
      url = `http://localhost:5000/global-charges/${editingId}`;
      method = "PUT";
    }

    const payload = {
      ...formData,
      status: formData.status === "Active",
    };

    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    dt.current.ajax.reload(null, false);

    setShowModal(false);
    setEditingId(null);

    setFormData({
      chargeCode: "",
      chargeName: "",
      applicableFor: "",
      chargeCategory: "",
      chargeType: "",
      status: "Active",
    });
  };
  const confirmDelete = async () => {
    if (!deleteId) return;

    await fetch(`http://localhost:5000/global-charges/${deleteId}`, {
      method: "DELETE",
    });

    dt.current.ajax.reload(null, false);

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  useEffect(() => {
    if (dt.current) return;

    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    dt.current = $(tableRef.current).DataTable({
      dom:
        "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "t" +
        "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

      scrollY: "350px",
      scrollCollapse: true,
      scrollX: false,
      paging: true,

      language: { lengthMenu: "Show _MENU_ Entries" },

      buttons: {
        dom: {
          container: {
            className: "dt-buttons d-flex gap-2",
          },
        },

        buttons: [
          {
            extend: "collection",
            text: '<i class="bx bx-export"></i> Export',
            className: "export-btn",
            autoClose: true,
            dropIcon: false,

            buttons: [
              {
                extend: "print",
                text: '<i class="bx bx-printer"></i> Print',
                exportOptions: {
                  columns: ":visible:not(.no-export)",
                },
              },
              {
                extend: "copy",
                text: '<i class="bx bx-copy"></i> Copy',
                exportOptions: {
                  columns: ":visible:not(.no-export)",
                },
              },
              {
                extend: "excel",
                text: '<i class="bx bx-spreadsheet"></i> Excel',
                exportOptions: {
                  columns: ":visible:not(.no-export)",
                },
              },
              {
                extend: "pdf",
                text: '<i class="bx bx-file"></i> PDF',
                exportOptions: {
                  columns: ":visible:not(.no-export)",
                },
              },
            ],
          },

          {
            extend: "colvis",
            text: '<i class="bx bx-columns"></i> Customise Columns',
            className: "custom-colvis",
            columns: ":not(.no-export)",
            dropIcon: false,
            autoClose: false,
          },
        ],
      },

      responsive: true,

      ajax: {
        url: "http://localhost:5000/global-charges",
        dataSrc: "data",
      },

      columns: [
        { data: "chargeCode", responsivePriority: 1 },

        { data: "chargeName", responsivePriority: 2 },

        { data: "applicableFor", responsivePriority: 3 },

        { data: "chargeCategory", responsivePriority: 4 },

        { data: "chargeType", responsivePriority: 5 },

        {
          data: null,
          orderable: false,
          className: "no-export",
          render: function (data) {
            return `
<i class="bx bx-edit edit-icon me-2" data-id="${data._id}" style="cursor:pointer;"></i>
`;
          },
        },

        {
          data: null,
          orderable: false,
          className: "no-export",
          render: function (data) {
            return `
<i class="bx bx-trash delete-icon" data-id="${data._id}" style="cursor:pointer;"></i>
`;
          },
        },
      ],

      order: [[0, "asc"]],
    });

    $(tableRef.current).on("click", ".edit-icon", function () {
      let tr = $(this).closest("tr");

      if (tr.hasClass("child")) {
        tr = tr.prev();
      }

      const rowData = dt.current.row(tr).data();

      setEditingId(rowData._id);

      setFormData({
        chargeCode: rowData.chargeCode,
        chargeName: rowData.chargeName,
        applicableFor: rowData.applicableFor,
        chargeCategory: rowData.chargeCategory,
        chargeType: rowData.chargeType,
        status: rowData.status ? "Active" : "Inactive",
      });

      setShowModal(true);
    });
    $(tableRef.current).on("click", ".delete-icon", function () {
      let tr = $(this).closest("tr");

      if (tr.hasClass("child")) {
        tr = tr.prev();
      }

      const rowData = dt.current.row(tr).data();

      setDeleteId(rowData._id);
      setShowDeleteModal(true);
    });
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);
  return (
    <div className="container-xxl flex-grow-1">
      <div className="card">
        <div className="datatable-toolbar d-flex justify-content-between align-items-start">
          <div className="title-section">
            <h5 className="table-title">Global Charge Codes</h5>
            <div className="breadcrumb-text">
              Finance Masters &gt; Global Charge Codes
            </div>
          </div>

          <button className="btn-add-record" onClick={() => setShowModal(true)}>
            <i className="bx bx-plus"></i> Create Global Charge Code
          </button>
        </div>

        <div className="card-datatable p-3">
          <table
            ref={tableRef}
            className="table table-hover dataTable dtr-inline"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Charge Code</th>
                <th>Charge Name</th>
                <th>Applicable For</th>
                <th>Charge Category</th>
                <th>Charge Type</th>
                <th>Update</th>
                <th>Remove</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card">
            <button
              className="custom-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <h5 className="modal-title">
              {editingId
                ? "Edit Global Charge Code"
                : "Create Global Charge Code"}
            </h5>

            <hr className="modal-divider" />

            <div className="row">
              {/* Charge Code */}

              <div className="col-md-6">
                <div className="form-group">
                  <label>Charge Code *</label>

                  <div className="input-icon">
                    <i className="bx bx-hash"></i>

                    <input
                      type="text"
                      name="chargeCode"
                      className="form-field"
                      placeholder="Enter Charge Code"
                      value={formData.chargeCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Charge Name */}

              <div className="col-md-6">
                <div className="form-group">
                  <label>Charge Name *</label>

                  <div className="input-icon">
                    <i className="bx bx-file"></i>

                    <input
                      type="text"
                      name="chargeName"
                      className="form-field"
                      placeholder="Enter Charge Name"
                      value={formData.chargeName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Applicable For */}

              <div className="col-md-6">
                <div className="form-group">
                  <label>Applicable For *</label>

                  <div className="input-icon">
                    <i className="bx bx-world"></i>

                    <select
                      name="applicableFor"
                      className="form-field"
                      value={formData.applicableFor}
                      onChange={handleChange}
                    >
                      <option value="">Select Applicable For</option>
                      <option value="Import">Import</option>
                      <option value="Export">Export</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Charge Category */}

              <div className="col-md-6">
                <div className="form-group">
                  <label>Charge Category *</label>

                  <div className="input-icon">
                    <i className="bx bx-category"></i>

                    <select
                      name="chargeCategory"
                      className="form-field"
                      value={formData.chargeCategory}
                      onChange={handleChange}
                    >
                      <option value="">Select Charge Category</option>
                      <option value="Freight">Freight</option>
                      <option value="Handling">Handling</option>
                      <option value="Documentation">Documentation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Charge Type */}

              <div className="col-md-6">
                <div className="form-group">
                  <label>Charge Type *</label>

                  <div className="input-icon">
                    <i className="bx bx-cube"></i>

                    <select
                      name="chargeType"
                      className="form-field"
                      value={formData.chargeType}
                      onChange={handleChange}
                    >
                      <option value="">Select Charge Type</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}

              <div className="col-md-12">
                <div className="form-group">
                  <label>Status</label>

                  <div className="d-flex gap-4 mt-2">
                    <label className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === "Active"}
                        onChange={handleChange}
                      />
                      Active
                    </label>

                    <label className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formData.status === "Inactive"}
                        onChange={handleChange}
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-submit" onClick={handleSubmit}>
                {editingId ? "Update" : "Create"}
              </button>

              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card">
            <h5 className="modal-title">Confirm Delete</h5>

            <p style={{ marginTop: "10px" }}>
              Are you sure you want to delete this Global Charge Code?
            </p>

            <div className="modal-buttons">
              <button className="btn-submit btn-delete" onClick={confirmDelete}>
                Delete
              </button>

              <button
                className="btn-cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Global;
