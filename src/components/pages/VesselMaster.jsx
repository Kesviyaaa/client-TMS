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

const VesselMaster = () => {
  const responsiveTableRef = useRef(null);
  const responsiveDt = useRef(null);
  const openedRowRef = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    vesselName: "",
    imoNumber: "",
    vesselCode: "",
    shippingLine: "",
    vesselType: "",
    countryFlag: "",
    callSign: "",
    lloydsCode: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAddModal]);

  /* HANDLE CHANGE */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  /* VALIDATION */

  const validateForm = () => {
    let newErrors = {};

    if (!formData.vesselName.trim()) {
      newErrors.vesselName = "Vessel Name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* DELETE */

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:5000/vessels/${deleteId}`, {
        method: "DELETE",
      });

      responsiveDt.current.ajax.reload(null, false);

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
    }
  };

  /* SUBMIT */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const newVessel = {
      vesselName: formData.vesselName,
      imoNumber: formData.imoNumber,
      vesselCode: formData.vesselCode,
      shippingLine: formData.shippingLine,
      vesselType: formData.vesselType,
      countryFlag: formData.countryFlag,
      callSign: formData.callSign,
      lloydsCode: formData.lloydsCode,
      status: formData.status === "Active",
      createdOn: new Date(),
    };

    try {
      const url = editingId
        ? `http://localhost:5000/vessels/${editingId}`
        : "http://localhost:5000/vessels";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVessel),
      });

      const result = await response.json();
      console.log("SERVER RESPONSE:", result);

      if (!response.ok) {
        console.error("Server Error:", result);
        return;
      }

      /* CLOSE MODAL */
      setShowAddModal(false);
      setEditingId(null);

      /* RESET FORM */
      setFormData({
        vesselName: "",
        imoNumber: "",
        vesselCode: "",
        shippingLine: "",
        vesselType: "",
        countryFlag: "",
        callSign: "",
        lloydsCode: "",
        status: "Active",
      });

      setErrors({});

      /* 🔥 RELOAD TABLE */
      /* RELOAD DATATABLE */
      if (responsiveDt.current) {
        responsiveDt.current.ajax.reload(null, false);
      }
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };

  /* DATATABLE */

  useEffect(() => {
    if (!responsiveTableRef.current) return;
    if (responsiveDt.current) return;

    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    responsiveDt.current = $(responsiveTableRef.current).DataTable({
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
            {
              extend: "print",
              text: '<i class="bx bx-printer"></i> Print',
              exportOptions: { columns: ":visible:not(.no-export)" },
            },
            {
              extend: "copy",
              text: '<i class="bx bx-copy"></i> Copy',
              exportOptions: { columns: ":visible:not(.no-export)" },
            },
            {
              extend: "excel",
              text: '<i class="bx bx-spreadsheet"></i> Excel',
              exportOptions: { columns: ":visible:not(.no-export)" },
            },
            {
              extend: "pdf",
              text: '<i class="bx bx-file"></i> PDF',
              exportOptions: { columns: ":visible:not(.no-export)" },
            },
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

      responsive: {
        details: {
          type: "inline",
        },
      },
      ajax: {
        url: "http://localhost:5000/vessels",
        dataSrc: "data",
      },

      columns: [
        { data: "vesselName", responsivePriority: 1 },
        { data: "imoNumber", responsivePriority: 2 },
        { data: "shippingLine", responsivePriority: 3 },
        { data: "vesselType", responsivePriority: 5 },
        { data: "countryFlag", responsivePriority: 6 },
        { data: "callSign", responsivePriority: 7 },
        { data: "lloydsCode", responsivePriority: 8 },
        { data: "createdOn", responsivePriority: 9 },

        {
          data: "status",
          responsivePriority: 4,
          render: function (data) {
            return data ? "Active" : "Inactive";
          },
        },

        {
          data: null,
          className: "no-export",
          responsivePriority: 1,
          render: function (data) {
            return `<i class="bx bx-edit edit-icon" data-id="${data._id}"></i>`;
          },
        },

        {
          data: null,
          className: "no-export",
          responsivePriority: 1,
          render: function (data) {
            return `<i class="bx bx-trash delete-icon" data-id="${data._id}"></i>`;
          },
        },
      ],

      order: [[0, "asc"]],
    });

    setTimeout(() => {
      $(".dt-button").removeClass("btn btn-secondary");
    }, 0);

    responsiveDt.current.on(
      "responsive-display",
      function (e, datatable, row, showHide) {
        if (showHide) {
          openedRowRef.current = row;

          const rowData = row.data();

          setSelectedRow(rowData);
          setShowDetailsModal(true);
        }
      }
    );

    /* DELETE CLICK */

    $(responsiveTableRef.current).on("click", ".delete-icon", function () {
      const id = $(this).data("id");

      setDeleteId(id);
      setShowDeleteModal(true);
    });

    /* EDIT CLICK */

    $(responsiveTableRef.current).on("click", ".edit-icon", function () {
      const rowData = responsiveDt.current.row($(this).parents("tr")).data();

      setFormData({
        vesselName: rowData.vesselName,
        imoNumber: rowData.imoNumber,
        vesselCode: rowData.vesselCode,
        shippingLine: rowData.shippingLine,
        vesselType: rowData.vesselType,
        countryFlag: rowData.countryFlag,
        callSign: rowData.callSign,
        lloydsCode: rowData.lloydsCode,
        status: rowData.status,
      });

      setEditingId(rowData._id);
      setShowAddModal(true);
    });
  }, []);

  return (
    <div className="container-xxl flex-grow-1 ">
      <div className="card">
        <div className="datatable-toolbar d-flex justify-content-between align-items-start">
          <div className="title-section">
            <h5 className="table-title">Vessel Master</h5>
            <div className="breadcrumb-text">
              Shipping Masters &gt; Vessel Master
            </div>
          </div>

          <button
            className="btn-add-record"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bx bx-plus"></i> Create Vessel
          </button>
        </div>

        <div className="card-datatable p-3">
          <table
            ref={responsiveTableRef}
            className="table dataTable dtr-inline"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Vessel Name</th>
                <th>IMO Number</th>
                <th>Shipping Line</th>
                <th>Vessel Type</th>
                <th>Country Flag</th>
                <th>Call Sign</th>
                <th>Lloyd's Code</th>
                <th>Created On</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Remove</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card">
            <button
              className="custom-close"
              onClick={() => setShowAddModal(false)}
            >
              ×
            </button>

            <h5 className="modal-title">
              {editingId ? "Edit Vessel" : "Create Vessel"}
            </h5>

            <hr className="modal-divider" />

            <div className="row g-3">
              {/* Vessel Name */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Vessel Name *</label>

                  <div className="input-icon position-relative">
                    <i className="bx bxs-ship input-icon-left"></i>

                    <input
                      type="text"
                      name="vesselName"
                      className="form-field"
                      placeholder="Enter Vessel Name"
                      value={formData.vesselName}
                      onChange={handleChange}
                    />
                  </div>

                  {errors.vesselName && (
                    <small className="text-danger">{errors.vesselName}</small>
                  )}
                </div>
              </div>

              {/* IMO Number */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">IMO Number</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-barcode input-icon-left"></i>

                    <input
                      type="text"
                      name="imoNumber"
                      className="form-field"
                      placeholder="Enter IMO Number"
                      value={formData.imoNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Vessel Code */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Vessel Code</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-code input-icon-left"></i>

                    <input
                      type="text"
                      name="vesselCode"
                      className="form-field"
                      placeholder="Enter Vessel Code"
                      value={formData.vesselCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Line */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Shipping Line</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-building input-icon-left"></i>

                    <select
                      name="shippingLine"
                      className="form-field"
                      value={formData.shippingLine}
                      onChange={handleChange}
                    >
                      <option value="">Select Shipping Line</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vessel Type */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Vessel Type</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-category input-icon-left"></i>

                    <select
                      name="vesselType"
                      className="form-field"
                      value={formData.vesselType}
                      onChange={handleChange}
                    >
                      <option value="">Select Vessel Type</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Country Flag */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Country Flag</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-flag input-icon-left"></i>

                    <select
                      name="countryFlag"
                      className="form-field"
                      value={formData.countryFlag}
                      onChange={handleChange}
                    >
                      <option value="">Select Country Flag</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Call Sign */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Call Sign</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-phone input-icon-left"></i>

                    <input
                      type="text"
                      name="callSign"
                      className="form-field"
                      placeholder="Enter Call Sign"
                      value={formData.callSign}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Lloyd's Code */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Lloyd's Code</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-barcode input-icon-left"></i>

                    <input
                      type="text"
                      name="lloydsCode"
                      className="form-field"
                      placeholder="Enter Lloyd's Code"
                      value={formData.lloydsCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="col-md-12">
                <label className="form-label">Status</label>

                <div className="d-flex gap-4 mt-1">
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={handleChange}
                    />{" "}
                    Active
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === "Inactive"}
                      onChange={handleChange}
                    />{" "}
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-submit" onClick={handleSubmit}>
                {editingId ? "Update" : "Create"}
              </button>

              <button
                className="btn-cancel"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                }}
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
              Are you sure you want to delete this Vessel?
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
            >
              ×
            </button>

            <h5 className="modal-title">Vessel Details</h5>

            <hr className="modal-divider" />

            <div className="row g-3">
              <div className="col-md-6">
                <strong>Vessel Name:</strong>
                <div>{selectedRow.vesselName}</div>
              </div>

              <div className="col-md-6">
                <strong>IMO Number:</strong>
                <div>{selectedRow.imoNumber}</div>
              </div>

              <div className="col-md-6">
                <strong>Shipping Line:</strong>
                <div>{selectedRow.shippingLine}</div>
              </div>

              <div className="col-md-6">
                <strong>Vessel Type:</strong>
                <div>{selectedRow.vesselType}</div>
              </div>

              <div className="col-md-6">
                <strong>Country Flag:</strong>
                <div>{selectedRow.countryFlag}</div>
              </div>

              <div className="col-md-6">
                <strong>Call Sign:</strong>
                <div>{selectedRow.callSign}</div>
              </div>

              <div className="col-md-6">
                <strong>Lloyd's Code:</strong>
                <div>{selectedRow.lloydsCode}</div>
              </div>

              <div className="col-md-6">
                <strong>Status:</strong>
                <div>{selectedRow.status ? "Active" : "Inactive"}</div>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VesselMaster;
