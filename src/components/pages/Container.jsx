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

const Container = () => {
  const responsiveTableRef = useRef(null);
  const responsiveDt = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    isoCode: "",
    description: "",
    size: "",
    type: "",
    teus: "",
    isTank: false,
    isTemp: false,
    tareWeight: "",
    payload: "",
    cubicCapacity: "",

    outerLength: "",
    outerBreadth: "",
    outerHeight: "",

    innerLength: "",
    innerBreadth: "",
    innerHeight: "",

    cgmCode: "",
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

    if (!formData.isoCode.trim()) {
      newErrors.isoCode = "ISO Code is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.size) {
      newErrors.size = "Size is required";
    }

    if (!formData.type.trim()) {
      newErrors.type = "Type is required";
    }

    if (!formData.teus) {
      newErrors.teus = "TEU is required";
    }

    if (!formData.tareWeight) {
      newErrors.tareWeight = "Tare Weight required";
    }

    if (!formData.payload) {
      newErrors.payload = "Payload required";
    }

    if (!formData.cubicCapacity) {
      newErrors.cubicCapacity = "Cubic Capacity required";
    }

    if (!formData.outerLength) {
      newErrors.outerLength = "Outer Length required";
    }

    if (!formData.outerBreadth) {
      newErrors.outerBreadth = "Outer Breadth required";
    }

    if (!formData.outerHeight) {
      newErrors.outerHeight = "Outer Height required";
    }

    if (!formData.innerLength) {
      newErrors.innerLength = "Inner Length required";
    }

    if (!formData.innerBreadth) {
      newErrors.innerBreadth = "Inner Breadth required";
    }

    if (!formData.innerHeight) {
      newErrors.innerHeight = "Inner Height required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* DELETE */

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:5000/containers/${deleteId}`, {
        method: "DELETE",
      });

      responsiveDt.current.ajax.reload(null, false);

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* SUBMIT */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `http://localhost:5000/containers/${editingId}`
        : "http://localhost:5000/containers";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,

          teus: Number(formData.teus),
          tareWeight: Number(formData.tareWeight),
          payload: Number(formData.payload),
          cubicCapacity: Number(formData.cubicCapacity),

          outerLength: Number(formData.outerLength),
          outerBreadth: Number(formData.outerBreadth),
          outerHeight: Number(formData.outerHeight),

          innerLength: Number(formData.innerLength),
          innerBreadth: Number(formData.innerBreadth),
          innerHeight: Number(formData.innerHeight),

          createdOn: new Date(),
        }),
      });

      responsiveDt.current.ajax.reload(null, false);

      setShowAddModal(false);
      setEditingId(null);

      setFormData({
        isoCode: "",
        description: "",
        size: "",
        type: "",
        teus: "",
        isTank: false,
        isTemp: false,
        tareWeight: "",
        payload: "",
        cubicCapacity: "",
        outerLength: "",
        outerBreadth: "",
        outerHeight: "",
        innerLength: "",
        innerBreadth: "",
        innerHeight: "",
        cgmCode: "",
      });
    } catch (err) {
      console.error(err);
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
              text: "Print",
              exportOptions: {
                columns: ":visible:not(.no-export)",
              },
            },
            {
              extend: "copy",
              text: "Copy",
              exportOptions: {
                columns: ":visible:not(.no-export)",
              },
            },
            {
              extend: "excel",
              text: "Excel",
              exportOptions: {
                columns: ":visible:not(.no-export)",
              },
            },
            {
              extend: "pdf",
              text: "PDF",
              exportOptions: {
                columns: ":visible:not(.no-export)",
              },
            },
          ],
        },

        {
          extend: "colvis",
          text: '<i class="bx bx-columns"></i> Customise Columns',
          dropIcon: false,
          autoClose: false,
          className: "custom-colvis",
          columns: ":not(.no-export)",
        },
      ],

      responsive: true,

      ajax: {
        url: "http://localhost:5000/containers",
        dataSrc: "data",
      },

      columns: [
        { data: "isoCode" },
        { data: "size" },
        { data: "type" },
        { data: "tareWeight" },
        { data: "payload" },
        { data: "cubicCapacity" },

        {
          data: null,
          className: "no-export",
          render: (data) =>
            `<i class="bx bx-edit edit-icon" data-id="${data._id}"></i>`,
        },

        {
          data: null,
          className: "no-export",
          render: (data) =>
            `<i class="bx bx-trash delete-icon" data-id="${data._id}"></i>`,
        },
      ],

      order: [[0, "asc"]],
    });

    /* DELETE */

    $(responsiveTableRef.current).on("click", ".delete-icon", function () {
      const id = $(this).data("id");

      setDeleteId(id);
      setShowDeleteModal(true);
    });

    /* EDIT */

    $(responsiveTableRef.current).on("click", ".edit-icon", function () {
      const rowData = responsiveDt.current.row($(this).parents("tr")).data();

      setFormData(rowData);

      setEditingId(rowData._id);
      setShowAddModal(true);
    });
  }, []);

  return (
    <div className="container-xxl flex-grow-1">
      <div className="card">
        <div className="datatable-toolbar d-flex justify-content-between align-items-start">
          <div className="title-section">
            <h5 className="table-title">Container Types</h5>
            <div className="breadcrumb-text">
              Shipping Masters &gt; Container Types
            </div>
          </div>

          <button
            className="btn-add-record"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bx bx-plus"></i> Create Container
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
                <th>ISO Code</th>
                <th>Size</th>
                <th>Type</th>
                <th>Tare Weight</th>
                <th>Payload</th>
                <th>Cubic Capacity</th>
                <th>Update</th>
                <th>Remove</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}

      {showAddModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card container-modal">
            <button
              className="custom-close"
              onClick={() => setShowAddModal(false)}
            >
              ×
            </button>

            <h5 className="modal-title">
              {editingId ? "Edit Container" : "Create Container"}
            </h5>

            <hr className="modal-divider" />

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">ISO *</label>

                <input
                  name="isoCode"
                  className="form-field"
                  placeholder="Enter ISO"
                  value={formData.isoCode}
                  onChange={handleChange}
                />
                {errors.isoCode && (
                  <small className="error-text">{errors.isoCode}</small>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">Description *</label>

                <input
                  name="description"
                  className="form-field"
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <small className="error-text">{errors.description}</small>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">Size *</label>

                <select
                  name="size"
                  className="form-field"
                  value={formData.size}
                  onChange={handleChange}
                >
                  <option value="">Select Size</option>
                  <option>20</option>
                  <option>40</option>
                  <option>45</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Type *</label>

                <input
                  name="type"
                  className="form-field"
                  placeholder="Enter Type"
                  value={formData.type}
                  onChange={handleChange}
                />
                {errors.type && (
                  <small className="error-text">{errors.type}</small>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">TEU's *</label>

                <input
                  name="teus"
                  className="form-field"
                  placeholder="Enter TEU"
                  value={formData.teus}
                  onChange={handleChange}
                />
                {errors.teus && (
                  <small className="error-text">{errors.teus}</small>
                )}
              </div>

              <div className="col-md-3 d-flex align-items-center">
                <label className="form-label mb-0">
                  <input
                    type="checkbox"
                    name="isTank"
                    checked={formData.isTank}
                    onChange={handleChange}
                    style={{ marginRight: "6px" }}
                  />
                  Is Tank Container
                </label>
              </div>

              <div className="col-md-3 d-flex align-items-center">
                <label className="form-label mb-0">
                  <input
                    type="checkbox"
                    name="isTemp"
                    checked={formData.isTemp}
                    onChange={handleChange}
                    style={{ marginRight: "6px" }}
                  />
                  Temperature Controlled
                </label>
              </div>

              <div className="col-md-3">
                <label className="form-label">Tare Weight *</label>

                <input
                  name="tareWeight"
                  className="form-field"
                  placeholder="0.00"
                  value={formData.tareWeight}
                  onChange={handleChange}
                />
                {errors.tareWeight && (
                  <small className="error-text">{errors.tareWeight}</small>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">Payload *</label>

                <input
                  name="payload"
                  className="form-field"
                  placeholder="0.00"
                  value={formData.payload}
                  onChange={handleChange}
                />
                {errors.payload && (
                  <small className="error-text">{errors.payload}</small>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">Cubic Capacity *</label>

                <input
                  name="cubicCapacity"
                  className="form-field"
                  placeholder="0.00"
                  value={formData.cubicCapacity}
                  onChange={handleChange}
                />
                {errors.cubicCapacity && (
                  <small className="error-text">{errors.cubicCapacity}</small>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">CGM Code</label>

                <input
                  type="text"
                  name="cgmCode"
                  className="form-field"
                  placeholder="Enter CGM Code"
                  value={formData.cgmCode}
                  onChange={handleChange}
                />
              </div>
              {/* Outer Dimensions */}
              <div className="col-md-12">
                <label className="form-label">Outer Dimensions (L×B×H) *</label>

                <div className="d-flex gap-2">
                  <input
                    type="text"
                    name="outerLength"
                    className="form-field"
                    placeholder="0.00"
                    value={formData.outerLength}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="outerBreadth"
                    className="form-field"
                    placeholder="0.00"
                    value={formData.outerBreadth}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="outerHeight"
                    className="form-field"
                    placeholder="0.00"
                    value={formData.outerHeight}
                    onChange={handleChange}
                  />

                  <select className="form-field" style={{ maxWidth: "90px" }}>
                    <option>CMS</option>
                  </select>
                </div>
              </div>

              {/* Inner Dimensions */}
              <div className="col-md-12">
                <label className="form-label">Inner Dimensions (L×B×H) *</label>

                <div className="d-flex gap-2">
                  <input
                    type="text"
                    name="innerLength"
                    className="form-field"
                    placeholder="0.00"
                    value={formData.innerLength}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="innerBreadth"
                    className="form-field"
                    placeholder="0.00"
                    value={formData.innerBreadth}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="innerHeight"
                    className="form-field"
                    placeholder="0.00"
                    value={formData.innerHeight}
                    onChange={handleChange}
                  />
                  <select className="form-field" style={{ maxWidth: "90px" }}>
                    <option>CMS</option>
                  </select>
                </div>
              </div>

              {/* CGM Code */}
            </div>

            <div className="modal-buttons">
              <button className="btn-submit" onClick={handleSubmit}>
                {editingId ? "Update" : "Create"}
              </button>

              <button
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {showDeleteModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card">
            <h5 className="modal-title">Confirm Delete</h5>

            <p style={{ marginTop: "10px" }}>
              Are you sure you want to delete this Container?
            </p>

            <div className="modal-buttons">
              <button className="btn-submit btn-delete" onClick={confirmDelete}>
                Delete
              </button>

              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
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

export default Container;
