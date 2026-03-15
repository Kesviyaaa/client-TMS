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

const Company = () => {
  const responsiveTableRef = useRef(null);
  const responsiveDt = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    password: "",
    phone: "",
    address1: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    timezone: "",
    currency: "",
    postalCode: "",
    webAddress: "",
    companyRegNo: "",
    customRegNo: "",
    status: true,
    modules: [],
  });

  const modulesList = [
    "Forwarding",
    "Menus",
    "Performance",
    "React",
    "Tracking",
  ];

  const clearFieldError = (name) => {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    clearFieldError(name);
  };

  const handleModuleChange = (module) => {
    let updatedModules = [...formData.modules];

    if (updatedModules.includes(module)) {
      updatedModules = updatedModules.filter((m) => m !== module);
    } else {
      updatedModules.push(module);
    }

    setFormData((prev) => ({
      ...prev,
      modules: updatedModules,
    }));

    clearFieldError("modules");
  };

  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.companyName?.trim()) {
        newErrors.companyName = "Company Name is required";
      }

      if (!formData.contactPerson?.trim()) {
        newErrors.contactPerson = "Contact Person is required";
      }

      if (!formData.email?.trim()) {
        newErrors.email = "Email is required";
      }

      if (!formData.password?.trim()) {
        newErrors.password = "Password is required";
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = "Phone is required";
      }
    }

    if (step === 2) {
      if (!formData.address1?.trim()) {
        newErrors.address1 = "Address Line 1 is required";
      }

      if (!formData.country?.trim()) {
        newErrors.country = "Country is required";
      }

      if (!formData.state?.trim()) {
        newErrors.state = "State is required";
      }

      if (!formData.city?.trim()) {
        newErrors.city = "City is required";
      }

      if (!formData.postalCode?.trim()) {
        newErrors.postalCode = "Postal Code is required";
      }
    }

    if (step === 3) {
      if (!formData.timezone?.trim()) {
        newErrors.timezone = "Timezone is required";
      }

      if (!formData.currency?.trim()) {
        newErrors.currency = "Currency is required";
      }

      if (!formData.companyRegNo?.trim()) {
        newErrors.companyRegNo = "Company Register No is required";
      }

      if (!formData.customRegNo?.trim()) {
        newErrors.customRegNo = "Custom Register No is required";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    let url = "http://localhost:5000/company";
    let method = "POST";

    if (editingId) {
      url = `http://localhost:5000/company/${editingId}`;
      method = "PUT";
    }

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    responsiveDt.current.ajax.reload(null, false);

    setShowAddModal(false);
    setEditingId(null);
    setStep(1);

    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      password: "",
      phone: "",
      address1: "",
      address2: "",
      country: "",
      state: "",
      city: "",
      timezone: "",
      currency: "",
      postalCode: "",
      webAddress: "",
      companyRegNo: "",
      customRegNo: "",
      status: true,
      modules: [],
    });

    setErrors({});
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    await fetch(`http://localhost:5000/company/${deleteId}`, {
      method: "DELETE",
    });

    responsiveDt.current.ajax.reload(null, false);

    setShowDeleteModal(false);
    setDeleteId(null);
  };

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

      language: {
        lengthMenu: "Show _MENU_ Entries",
      },

      buttons: [
        {
          extend: "collection",
          text: '<i class="bx bx-export"></i> Export',
          className: "export-btn rounded",
          dropIcon: false,
          autoClose: true,
          buttons: [
            {
              extend: "print",
              exportOptions: {
                columns: ":visible:not(.no-export)",
              },
            },

            {
              extend: "copy",
              exportOptions: {
                columns: ":visible:not(.no-export)",
              },
            },

            {
              extend: "excel",
              exportOptions: {
                columns: ":visible:not(.no-export)",
              },
            },

            {
              extend: "pdf",
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
        url: "http://localhost:5000/company",
        dataSrc: "data",
      },

      columns: [
        { data: "companyName", responsivePriority: 1 },

        { data: "address1", responsivePriority: 2 },

        { data: "contactPerson", responsivePriority: 3 },

        { data: "email", responsivePriority: 4 },

        {
          data: "createdDate",
          render: (data) => {
            const d = new Date(data);

            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();

            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            const seconds = String(d.getSeconds()).padStart(2, "0");

            return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
          },
        },

        {
          data: "status",
          responsivePriority: 6,
          render: (data) =>
            data
              ? `<span class="badge bg-success">Active</span>`
              : `<span class="badge bg-danger">Inactive</span>`,
        },

        {
          data: null,
          className: "no-export",
          responsivePriority: 1,
          render: function (data) {
            return `<i class="bx bx-edit edit-icon" data-id="${data._id}"></i>`;
          },
        },
      ],
    });
    responsiveDt.current.on(
      "responsive-display",
      function (e, datatable, row, showHide) {
        if (showHide) {
          const rowData = row.data();

          setSelectedRow(rowData);
          setShowDetailsModal(true);
        }
      }
    );

    $(responsiveTableRef.current).on("click", ".edit-icon", function () {
      const rowData = responsiveDt.current.row($(this).parents("tr")).data();

      setFormData({
        ...rowData,
      });

      setEditingId(rowData._id);
      setShowAddModal(true);
    });
  }, []);

  return (
    <div className="container-xxl flex-grow-1 company-page">
      <div className="card">
        <div className="datatable-toolbar d-flex justify-content-between align-items-start">
          <div className="title-section">
            <h5 className="table-title">Company Details</h5>
            <div className="breadcrumb-text">Global Masters &gt; Company</div>
          </div>

          <button
            className="btn-add-record"
            onClick={() => {
              setStep(1);
              setShowAddModal(true);
            }}
          >
            <i className="bx bx-plus"></i> Create Company
          </button>
        </div>

        <div className="card-datatable p-3">
          <table
            ref={responsiveTableRef}
            className="table dataTable"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Address Line1</th>
                <th>Username</th>
                <th>Email</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Edit</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}

      {/* ================= CREATE MODAL ================= */}

      {showAddModal && (

<div className="custom-modal-backdrop">
  <div className="company-modal-card" style={{ width: "900px" }}>
    <button
      className="custom-close"
      onClick={() => setShowAddModal(false)}
    >
      ×
    </button>
<h5 className="modal-title">Create Company</h5>

<hr className="modal-divider" />

{/* STEP PROGRESS */}

<div className="company-stepper">
  <div className={`company-step ${step >= 1 ? "active" : ""}`}>
    1<span>Basic</span>
  </div>

  <div className={`company-step ${step >= 2 ? "active" : ""}`}>
    2<span>Address</span>
  </div>

  <div className={`company-step ${step >= 3 ? "active" : ""}`}>
    3<span>Business</span>
  </div>

  <div className={`company-step ${step >= 4 ? "active" : ""}`}>
    4<span>Modules</span>
  </div>

  <div
    className="company-step-progress"
    style={{ width: `${(step - 1) * 33}%` }}
  ></div>
</div>

{/* ================= STEP 1 ================= */}

{step === 1 && (
  <div className="row g-3">

    <div className="col-md-6">
      <label className="form-label">Company Name *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-buildings input-icon-left"></i>

        <input
          name="companyName"
          className={`company-form-field ${errors.companyName ? "input-error" : ""}`}
          placeholder="Enter Company Name"
          value={formData.companyName}
          onChange={handleChange}
        />
      </div>

      {errors.companyName && (
        <div className="error-text">{errors.companyName}</div>
      )}
    </div>

    <div className="col-md-6">
      <label className="form-label">Contact Person *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-user input-icon-left"></i>

        <input
          name="contactPerson"
          className={`company-form-field ${errors.contactPerson ? "input-error" : ""}`}
          placeholder="Enter Contact Person"
          value={formData.contactPerson}
          onChange={handleChange}
        />
      </div>

      {errors.contactPerson && (
        <div className="error-text">{errors.contactPerson}</div>
      )}
    </div>

    <div className="col-md-6">
      <label className="form-label">Email *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-envelope input-icon-left"></i>

        <input
          name="email"
          className={`company-form-field ${errors.email ? "input-error" : ""}`}
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {errors.email && (
        <div className="error-text">{errors.email}</div>
      )}
    </div>

    <div className="col-md-6">
      <label className="form-label">Password *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-lock input-icon-left"></i>

        <input
          name="password"
          className={`company-form-field ${errors.password ? "input-error" : ""}`}
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {errors.password && (
        <div className="error-text">{errors.password}</div>
      )}
    </div>

    <div className="col-md-6">
      <label className="form-label">Phone *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-phone input-icon-left"></i>

        <input
          name="phone"
          className={`company-form-field ${errors.phone ? "input-error" : ""}`}
          placeholder="Enter Phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {errors.phone && (
        <div className="error-text">{errors.phone}</div>
      )}
    </div>

  </div>
)}

{/* ================= STEP 2 ================= */}

{step === 2 && (
  <div className="row g-3">

    <div className="col-md-6">
      <label className="form-label">Address Line1 *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-map input-icon-left"></i>

        <input
          name="address1"
          className={`company-form-field ${errors.address1 ? "input-error" : ""}`}
          placeholder="Enter Address Line1"
          value={formData.address1}
          onChange={handleChange}
        />
      </div>

      {errors.address1 && (
        <div className="error-text">{errors.address1}</div>
      )}
    </div>

    <div className="col-md-6">
      <label className="form-label">Address Line2</label>

      <div className="input-icon position-relative">
        <i className="bx bx-map input-icon-left"></i>

        <input
          name="address2"
          className="company-form-field"
          placeholder="Enter Address Line2"
          value={formData.address2}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="col-md-4">
      <label className="form-label">Country *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-globe input-icon-left"></i>

        <input
          name="country"
          className={`company-form-field ${errors.country ? "input-error" : ""}`}
          placeholder="Select Country"
          value={formData.country}
          onChange={handleChange}
        />
      </div>

      {errors.country && (
        <div className="error-text">{errors.country}</div>
      )}
    </div>

    <div className="col-md-4">
      <label className="form-label">State *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-map-pin input-icon-left"></i>

        <input
          name="state"
          className={`company-form-field ${errors.state ? "input-error" : ""}`}
          placeholder="Enter State"
          value={formData.state}
          onChange={handleChange}
        />
      </div>

      {errors.state && (
        <div className="error-text">{errors.state}</div>
      )}
    </div>

    <div className="col-md-4">
      <label className="form-label">City *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-building input-icon-left"></i>

        <input
          name="city"
          className={`company-form-field ${errors.city ? "input-error" : ""}`}
          placeholder="Enter City"
          value={formData.city}
          onChange={handleChange}
        />
      </div>

      {errors.city && (
        <div className="error-text">{errors.city}</div>
      )}
    </div>

    <div className="col-md-4">
      <label className="form-label">Postal Code *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-mail-send input-icon-left"></i>

        <input
          name="postalCode"
          className={`company-form-field ${errors.postalCode ? "input-error" : ""}`}
          placeholder="Enter Postal Code"
          value={formData.postalCode}
          onChange={handleChange}
        />
      </div>

      {errors.postalCode && (
        <div className="error-text">{errors.postalCode}</div>
      )}
    </div>

  </div>
)}

{/* ================= STEP 3 ================= */}

{step === 3 && (
  <div className="row g-3">

    <div className="col-md-4">
      <label className="form-label">Timezone *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-time input-icon-left"></i>

        <input
          name="timezone"
          className={`company-form-field ${errors.timezone ? "input-error" : ""}`}
          placeholder="Select Timezone"
          value={formData.timezone}
          onChange={handleChange}
        />
      </div>

      {errors.timezone && (
        <div className="error-text">{errors.timezone}</div>
      )}
    </div>

    <div className="col-md-4">
      <label className="form-label">Currency *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-money input-icon-left"></i>

        <input
          name="currency"
          className={`company-form-field ${errors.currency ? "input-error" : ""}`}
          placeholder="Select Currency"
          value={formData.currency}
          onChange={handleChange}
        />
      </div>

      {errors.currency && (
        <div className="error-text">{errors.currency}</div>
      )}
    </div>

    <div className="col-md-4">
      <label className="form-label">Company Reg No *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-id-card input-icon-left"></i>

        <input
          name="companyRegNo"
          className={`company-form-field ${errors.companyRegNo ? "input-error" : ""}`}
          placeholder="Enter Company Reg No"
          value={formData.companyRegNo}
          onChange={handleChange}
        />
      </div>

      {errors.companyRegNo && (
        <div className="error-text">{errors.companyRegNo}</div>
      )}
    </div>

    <div className="col-md-4">
      <label className="form-label">Custom Reg No *</label>

      <div className="input-icon position-relative">
        <i className="bx bx-barcode input-icon-left"></i>

        <input
          name="customRegNo"
          className={`company-form-field ${errors.customRegNo ? "input-error" : ""}`}
          placeholder="Enter Custom Reg No"
          value={formData.customRegNo}
          onChange={handleChange}
        />
      </div>

      {errors.customRegNo && (
        <div className="error-text">{errors.customRegNo}</div>
      )}
    </div>

    <div className="col-md-4">
      <label className="form-label">Web Address</label>

      <div className="input-icon position-relative">
        <i className="bx bx-link input-icon-left"></i>

        <input
          name="webAddress"
          className="company-form-field"
          placeholder="https://example.com"
          value={formData.webAddress}
          onChange={handleChange}
        />
      </div>
    </div>

  </div>
)}

{/* ================= STEP 4 ================= */}

{step === 4 && (
  <div className="row g-3">
    {modulesList.map((module) => {
      const active = formData.modules.includes(module);

      return (
        <div className="col-md-4" key={module}>
          <div
            className={`company-module-card ${active ? "active" : ""}`}
            onClick={() => handleModuleChange(module)}
          >
            <i className="bx bx-layer company-module-icon"></i>
            <h6>{module}</h6>
          </div>
        </div>
      );
    })}
  </div>
)}

{/* BUTTONS */}

<div className="modal-buttons">

  {step > 1 && (
    <button
      className="btn-cancel"
      onClick={() => setStep(step - 1)}
    >
      Back
    </button>
  )}

  {step < 4 && (
    <button
      className="btn-submit"
      onClick={() => {
        if (validateStep()) {
          setStep(step + 1);
        }
      }}
    >
      Next
    </button>
  )}

  {step === 4 && (
    <button className="btn-submit" onClick={handleSubmit}>
      {editingId ? "Update" : "Create"}
    </button>
  )}

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
              Are you sure you want to delete this Company?
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
              onClick={() => setShowDetailsModal(false)}
            >
              ×
            </button>

            <h5 className="modal-title">
              Details of {selectedRow.companyName}
            </h5>

            <hr className="modal-divider" />

            <table className="table table-sm">
              <tbody>
                <tr>
                  <td>Company Name</td>
                  <td>{selectedRow.companyName}</td>
                </tr>

                <tr>
                  <td>Contact Person</td>
                  <td>{selectedRow.contactPerson}</td>
                </tr>

                <tr>
                  <td>Email</td>
                  <td>{selectedRow.email}</td>
                </tr>

                <tr>
                  <td>Phone</td>
                  <td>{selectedRow.phone}</td>
                </tr>

                <tr>
                  <td>Address</td>
                  <td>{selectedRow.address1}</td>
                </tr>

                <tr>
                  <td>City</td>
                  <td>{selectedRow.city}</td>
                </tr>

                <tr>
                  <td>Country</td>
                  <td>{selectedRow.country}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
