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

import "../../App.css";

const AirlineMaster = () => {
  const responsiveTableRef = useRef(null);
  const responsiveDt = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    airlineName: "",
    internationalCode: "",
    awbPrefix: "",
    status: false,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.airlineName.trim()) {
      newErrors.airlineName = "Airline Name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const newAirline = {
      airlineName: formData.airlineName,
      internationalCode: formData.internationalCode,
      awbPrefix: formData.awbPrefix,
      status: formData.status,
      createdOn: new Date(),
    };

    try {
      const url = editingId
        ? `http://localhost:5000/airlines/${editingId}`
        : "http://localhost:5000/airlines";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAirline),
      });

      const result = await response.json();

      console.log(result);

      if (responsiveDt.current) {
        responsiveDt.current.ajax.reload(null, false);
      }

      setShowAddModal(false);
      setEditingId(null);

      setFormData({
        airlineName: "",
        internationalCode: "",
        awbPrefix: "",
        status: false,
      });
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };

  useEffect(() => {
    if (!responsiveTableRef.current) return;

    if ($.fn.DataTable.isDataTable(responsiveTableRef.current)) {
      $(responsiveTableRef.current).DataTable().destroy(true);
      responsiveDt.current = null;
    }

    $(".dt-button-collection").remove();

    responsiveDt.current = $(responsiveTableRef.current).DataTable({
      dom:
        "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "t" +
        "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

      scrollY: "350px",
      scrollCollapse: true,
      scrollX: false,
      paging: true,

      language: {
        lengthMenu: "Show _MENU_ Entries",
      },

      buttons: {
        dom: {
          container: {
            className: "dt-buttons d-flex gap-2",
          },
          button: {
            className: "",
          },
        },

        buttons: [
          {
            extend: "collection",
            text: '<i class="bx bx-export"></i> Export',
            className: "export-btn rounded",
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
            columns: [0, 1],
            className: "custom-colvis",
            dropIcon: false,
            autoClose: false,
          },
        ],
      },

     

      ajax: {
        url: "http://localhost:5000/airlines",
        dataSrc: "data",
      },

      columns: [

        { data: "airlineName" },
      
        {
          data: "status",
          render: function (data) {
            return data
              ? `<span class="badge bg-success">Active</span>`
              : `<span class="badge bg-danger">Inactive</span>`;
          },
        },
      
        {
          data: null,
          className: "no-export",
          orderable: false,
          searchable: false,
          render: function (data) {
            return `<i class="bx bx-edit edit-icon" data-id="${data._id}" title="Edit"></i>`;
          },
        },
      
        {
          data: null,
          className: "no-export",
          orderable: false,
          searchable: false,
          render: function (data) {
            return `<i class="bx bx-trash delete-icon" data-id="${data._id}" title="Delete"></i>`;
          },
        }
      
      ],

      order: [[1, "asc"]],
    });

    $(responsiveTableRef.current).on("click", ".delete-icon", function () {
      const id = $(this).data("id");
      setDeleteId(id);
      setShowDeleteModal(true);
    });

    $(responsiveTableRef.current).on("click", ".edit-icon", function () {
      const rowData = responsiveDt.current.row($(this).parents("tr")).data();

      setFormData({
        airlineName: rowData.airlineName,
        internationalCode: rowData.internationalCode,
        awbPrefix: rowData.awbPrefix,
        status: rowData.status,
      });

      setEditingId(rowData._id);
      setShowAddModal(true);
    });

    return () => {
      if (responsiveDt.current) {
        responsiveDt.current.destroy(true);
        responsiveDt.current = null;
      }
    };
  }, []);

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:5000/airlines/${deleteId}`, {
        method: "DELETE",
      });

      responsiveDt.current.ajax.reload();

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
  
      <div className="card">
  
        <div className="datatable-toolbar d-flex justify-content-between align-items-start">
  
          <div className="title-section">
            <h5 className="table-title">Airline Master</h5>
            <div className="breadcrumb-text">Carrier Masters &gt; Airline Master</div>
          </div>
  
          <button
            className="btn-add-record"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bx bx-plus"></i> Add Airline
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
                <th>Airline Name</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Remove</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
  
  
      {/* ADD / EDIT MODAL */}
  
      {showAddModal && (
<div className="custom-modal-backdrop">
<div className="custom-modal-card airline-modal ">

<button
className="custom-close"
onClick={() => setShowAddModal(false)}
>
×
</button>

<h5 className="modal-title">
{editingId ? "Edit Airline" : "Create Airline"}
</h5>

<hr className="modal-divider" />

{/* Airline Name */}

<div className="row g-3">

<div className="col-md-12">

<label className="form-label">Airline Name *</label>

<div className="input-icon position-relative">

<i className="bx bxs-plane input-icon-left"></i>

<input
type="text"
name="airlineName"
className="form-field"
placeholder="Enter Airline Name"
value={formData.airlineName}
onChange={handleChange}
/>

</div>

{errors.airlineName && (
<small className="text-danger">{errors.airlineName}</small>
)}

</div>

</div>


{/* ================= INTERNATIONAL ================= */}
<div className="form-section">

<h6 className="section-title">International</h6>

<div className="row g-3">


<div className="col-md-3">

<label className="form-label">International Code</label>

<input
type="text"
name="internationalCode"
className="form-field"
placeholder="Enter upto 5 characters"
maxLength={5}
value={formData.internationalCode}
onChange={handleChange}
/>

</div>


<div className="col-md-3">

<label className="form-label">AWB Format</label>

<select
name="awbFormat"
className="form-field"
value={formData.awbFormat}
onChange={handleChange}
>
<option value="">Select Format</option>
<option value="awb">AWB</option>
<option value="delta">DELTA</option>
<option value="standard">STANDARD</option>
</select>

</div>


<div className="col-md-3">

<label className="form-label">AWB Prefix</label>

<input
type="text"
name="awbPrefix"
className="form-field"
placeholder="Enter 3 characters"
maxLength={3}
value={formData.awbPrefix}
onChange={handleChange}
/>

</div>


<div className="col-md-3 d-flex align-items-end">

<div className="form-check">

<input
type="checkbox"
className="form-check-input"
name="checkDigit"
checked={formData.checkDigit}
onChange={handleChange}
/>

<label className="form-check-label" style={{marginLeft:"6px"}}>
Check Digit
</label>

</div>

</div>


</div></div>


{/* ================= DOMESTIC ================= */}



<div className="form-section">

<h6 className="section-title">Domestic</h6>

<div className="row g-3">

<div className="col-md-3">

<label className="form-label">Domestic Code</label>

<input
type="text"
name="domesticCode"
className="form-field"
placeholder="Enter upto 5 characters"
maxLength={5}
value={formData.domesticCode}
onChange={handleChange}
/>

</div>


<div className="col-md-3">

<label className="form-label">AWB Format</label>

<select
name="domesticAwbFormat"
className="form-field"
value={formData.domesticAwbFormat}
onChange={handleChange}
>
<option value="">Select Format</option>
<option value="awb">AWB</option>
<option value="delta">DELTA</option>
<option value="standard">STANDARD</option>
</select>

</div>


<div className="col-md-3">

<label className="form-label">AWB Prefix</label>

<input
type="text"
name="domesticAwbPrefix"
className="form-field"
placeholder="Enter 3 characters"
maxLength={3}
value={formData.domesticAwbPrefix}
onChange={handleChange}
/>

</div>


<div className="col-md-3 d-flex align-items-end">

<div className="form-check">

<input
type="checkbox"
className="form-check-input"
name="domesticCheckDigit"
checked={formData.domesticCheckDigit}
onChange={handleChange}
/>

<label className="form-check-label" style={{marginLeft:"6px"}}>
Check Digit
</label>

</div>

</div>

</div>

</div>




{/* ================= OTHERS ================= */}

<div className="form-section">

<h6 className="section-title">Others</h6>

<div className="row g-3">

<div className="col-md-3">

<label className="form-label">Account No</label>

<input
type="text"
name="accountNo"
className="form-field"
value={formData.accountNo}
onChange={handleChange}
/>

</div>


<div className="col-md-3">

<label className="form-label">Home Page URL</label>

<input
type="text"
name="homePageUrl"
className="form-field"
value={formData.homePageUrl}
onChange={handleChange}
/>

</div>


<div className="col-md-3">

<label className="form-label">Tracking URL</label>

<input
type="text"
name="trackingUrl"
className="form-field"
value={formData.trackingUrl}
onChange={handleChange}
/>

</div>


<div className="col-md-3 d-flex align-items-end">

<div className="form-check">

<input
type="checkbox"
className="form-check-input"
name="isIata"
checked={formData.isIata}
onChange={handleChange}
/>

<label className="form-check-label" style={{marginLeft:"6px"}}>
IS IATA
</label>

</div>

</div>

</div>

</div>


{/* ================= STATUS ================= */}

<div className="row g-3">

<div className="col-md-12">

<label className="form-label">Status</label>

<div className="d-flex gap-4">

<label>
<input
type="radio"
name="status"
checked={formData.status === true}
onChange={() => setFormData({...formData,status:true})}
/>
&nbsp;Active
</label>

<label>
<input
type="radio"
name="status"
checked={formData.status === false}
onChange={() => setFormData({...formData,status:false})}
/>
&nbsp;Inactive
</label>

</div>

</div>

</div>


{/* Buttons */}

<div className="modal-buttons">

<button
className="btn-submit"
onClick={handleSubmit}
>
{editingId ? "Update" : "Create"}
</button>

<button
className="btn-cancel"
onClick={() => {
setShowAddModal(false);
setEditingId(null);
setFormData({
airlineName:"",
internationalCode:"",
awbPrefix:"",
status:false
});
}}
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
              Are you sure you want to delete this Airline?
            </p>
  
            <div className="modal-buttons">
              <button
                className="btn-submit btn-delete"
                onClick={confirmDelete}
              >
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
export default AirlineMaster;