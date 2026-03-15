import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-responsive";
import "datatables.net-responsive-bs5";
import "datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css";

import "datatables.net-buttons";
import "datatables.net-buttons-dt/css/buttons.dataTables.min.css";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.colVis";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs;

import "../../App.css";
const Currencies = () => {
  const responsiveTableRef = useRef(null);
  const responsiveDt = useRef(null);
  const openedRowRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    currencyName: "",
    currencyCode: "",
    majorUnit: "",
    minorUnit: "",
    scale: "",
    symbol: "",
    roundTo: "",
    minimum: "",
  });

  const openCreateModal = () => {
    setEditingId(null);

    setFormData({
      currencyName: "",
      currencyCode: "",
      majorUnit: "",
      minorUnit: "",
      scale: "",
      symbol: "",
      roundTo: "",
      minimum: "",
    });

    setShowModal(true);
  };

  const [errors, setErrors] = useState({});

  /* ---------------- MODAL SCROLL LOCK ---------------- */

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

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    let newErrors = {};

    if (!formData.currencyName.trim()) {
      newErrors.currencyName = "Currency Name is required";
    }

    if (!formData.currencyCode.trim()) {
      newErrors.currencyCode = "Currency Code is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let url = "http://localhost:5000/currencies";
      let method = "POST";

      if (editingId) {
        url = `http://localhost:5000/currencies/${editingId}`;
        method = "PUT";
      }

      await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (responsiveDt.current) {
        responsiveDt.current.ajax.reload(null, false);
      }

      setShowModal(false);
      setEditingId(null);

      setFormData({
        currencyName: "",
        currencyCode: "",
        majorUnit: "",
        minorUnit: "",
        scale: "",
        symbol: "",
        roundTo: "",
        minimum: "",
      });

      setErrors({});
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- DELETE ---------------- */

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:5000/currencies/${deleteId}`, {
        method: "DELETE",
      });

      responsiveDt.current.ajax.reload(null, false);

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- DATATABLE ---------------- */

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
        },
      ],

      responsive: true,

      ajax: {
        url: "http://localhost:5000/currencies",
        dataSrc: "data",
      },

      columns: [
        { data: "currencyName", responsivePriority: 1 },
        { data: "currencyCode", responsivePriority: 2 },
        { data: "majorUnit", responsivePriority: 3 },
        { data: "minorUnit", responsivePriority: 4 },
        { data: "scale", responsivePriority: 5 },

        { data: "symbol", responsivePriority: 100 },
        { data: "roundTo", responsivePriority: 100 },
        { data: "minimum", responsivePriority: 100 },

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

      order: [[1, "asc"]],
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

    /* ---------------- RESPONSIVE MODAL ---------------- */

    /* ---------------- EDIT ---------------- */

    $(responsiveTableRef.current).on("click", ".edit-icon", function () {
      const rowData = responsiveDt.current.row($(this).parents("tr")).data();

      setFormData({
        currencyName: rowData.currencyName,
        currencyCode: rowData.currencyCode,
        majorUnit: rowData.majorUnit,
        minorUnit: rowData.minorUnit,
        scale: rowData.scale,
        symbol: rowData.symbol,
        roundTo: rowData.roundTo,
        minimum: rowData.minimum,
      });

      setEditingId(rowData._id);
      setShowModal(true);
    });

    /* ---------------- DELETE ---------------- */

    $(responsiveTableRef.current).on("click", ".delete-icon", function () {
      const id = $(this).data("id");

      setDeleteId(id);
      setShowDeleteModal(true);
    });
  }, []);

  return (
    <div className="container-xxl flex-grow-1">
      <div className="card">
        <div className="datatable-toolbar d-flex justify-content-between align-items-start">
          <div className="title-section">
            <h5 className="table-title">Currency Details</h5>
            <div className="breadcrumb-text">
              Global Masters &gt; Currencies
            </div>
          </div>

          <button className="btn-add-record" onClick={openCreateModal}>
            <i className="bx bx-plus"></i> Create Currency
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
                <th>Currency Name</th>
                <th>Currency Code</th>
                <th>Major Unit</th>
                <th>Minor Unit</th>
                <th>Scale</th>
                <th>Symbol</th>
                <th>Round To</th>
                <th>Minimum</th>
                <th>Edit</th>
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
              {editingId ? "Edit Currency" : "Create Currency"}
            </h5>

            <hr className="modal-divider" />

            <div className="row g-3">
              {/* Currency Name */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Currency Name *</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-money input-icon-left"></i>

                    <input
                      type="text"
                      name="currencyName"
                      className="form-field"
                      placeholder="Enter Currency Name"
                      value={formData.currencyName}
                      onChange={handleChange}
                    />
                  </div>

                  {errors.currencyName && (
                    <small className="text-danger">{errors.currencyName}</small>
                  )}
                </div>
              </div>

              {/* Currency Code */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Currency Code *</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-barcode input-icon-left"></i>

                    <input
                      type="text"
                      name="currencyCode"
                      className="form-field"
                      placeholder="Enter Code"
                      value={formData.currencyCode}
                      onChange={handleChange}
                    />
                  </div>

                  {errors.currencyCode && (
                    <small className="text-danger">{errors.currencyCode}</small>
                  )}
                </div>
              </div>

              {/* Major Unit */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Major Unit</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-coin input-icon-left"></i>

                    <input
                      type="text"
                      name="majorUnit"
                      className="form-field"
                      placeholder="Eg: Rupee"
                      value={formData.majorUnit}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Minor Unit */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Minor Unit</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-coin-stack input-icon-left"></i>

                    <input
                      type="text"
                      name="minorUnit"
                      className="form-field"
                      placeholder="Eg: Paise"
                      value={formData.minorUnit}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Scale */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Scale</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-calculator input-icon-left"></i>

                    <input
                      type="number"
                      name="scale"
                      className="form-field"
                      placeholder="Enter Scale"
                      value={formData.scale}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Symbol */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Symbol</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-dollar input-icon-left"></i>

                    <input
                      type="text"
                      name="symbol"
                      className="form-field"
                      placeholder="Enter Symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Round To */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Round To</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-reset input-icon-left"></i>

                    <input
                      type="number"
                      name="roundTo"
                      className="form-field"
                      placeholder="Enter Round To"
                      value={formData.roundTo}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Minimum */}

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Minimum</label>

                  <div className="input-icon position-relative">
                    <i className="bx bx-trending-down input-icon-left"></i>

                    <input
                      type="number"
                      name="minimum"
                      className="form-field"
                      placeholder="Enter Minimum"
                      value={formData.minimum}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className={editingId ? "btn-update" : "btn-submit"}
                onClick={handleSubmit}
              >
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

            <h5 className="modal-title">
              Details of {selectedRow.currencyName}
            </h5>

            <hr className="modal-divider" />

            <table className="table table-sm">
              <tbody>
                <tr>
                  <td>Currency Name:</td>
                  <td>{selectedRow.currencyName}</td>
                </tr>

                <tr>
                  <td>Currency Code:</td>
                  <td>{selectedRow.currencyCode}</td>
                </tr>

                <tr>
                  <td>Major Unit:</td>
                  <td>{selectedRow.majorUnit}</td>
                </tr>

                <tr>
                  <td>Minor Unit:</td>
                  <td>{selectedRow.minorUnit}</td>
                </tr>

                <tr>
                  <td>Scale:</td>
                  <td>{selectedRow.scale}</td>
                </tr>

                <tr>
                  <td>Symbol:</td>
                  <td>{selectedRow.symbol}</td>
                </tr>

                <tr>
                  <td>Round To:</td>
                  <td>{selectedRow.roundTo}</td>
                </tr>

                <tr>
                  <td>Minimum:</td>
                  <td>{selectedRow.minimum}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card">
            <h5 className="modal-title">Confirm Delete</h5>

            <p style={{ marginTop: "10px" }}>
              Are you sure you want to delete this Currency?
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

export default Currencies;
