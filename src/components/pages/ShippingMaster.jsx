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

const ShippingMaster = () => {

const responsiveTableRef = useRef(null);
const responsiveDt = useRef(null);
const openedRowRef = useRef(null);

const [showAddModal,setShowAddModal] = useState(false);
const [editingId,setEditingId] = useState(null);

const [showDetailsModal,setShowDetailsModal] = useState(false);
const [selectedRow,setSelectedRow] = useState(null);

const [showDeleteModal,setShowDeleteModal] = useState(false);
const [deleteId,setDeleteId] = useState(null);

const [formData,setFormData] = useState({
shippingLineName:"",
alias:"",
scac:"",
shortName:"",
accountNumber:"",
homePageUrl:"",
trackingUrl:"",
blFormat:"",
nvocc:false,
status:false
});

const [errors,setErrors] = useState({});


useEffect(()=>{

if(showAddModal){
document.body.style.overflow="hidden";
}else{
document.body.style.overflow="auto";
}

return()=>{
document.body.style.overflow="auto";
}

},[showAddModal]);


/* HANDLE CHANGE */

const handleChange = (e)=>{

const {name,value,type,checked} = e.target;

setFormData({
...formData,
[name]: type === "checkbox" ? checked : value
});

setErrors({
...errors,
[name]:""
});

};


/* VALIDATION */

const validateForm = ()=>{

let newErrors={};

if(!formData.shippingLineName.trim()){
newErrors.shippingLineName="Shipping Line Name is required";
}

if(!formData.scac.trim()){
newErrors.scac="SCAC is required";
}

if(!formData.shortName.trim()){
newErrors.shortName="Short Name is required";
}

setErrors(newErrors);

return Object.keys(newErrors).length===0;

};


/* DELETE */

const confirmDelete = async()=>{

try{

await fetch(`http://localhost:5000/shipping-lines/${deleteId}`,{
method:"DELETE"
});

responsiveDt.current.ajax.reload(null,false);

setShowDeleteModal(false);
setDeleteId(null);

}catch(error){
console.error(error);
}

};


/* SUBMIT */

const handleSubmit = async()=>{

if(!validateForm()) return;

const newShippingLine={

shippingLineName:formData.shippingLineName,
alias:formData.alias,
scac:formData.scac,
shortName:formData.shortName,
accountNumber:formData.accountNumber,
homePageUrl:formData.homePageUrl,
trackingUrl:formData.trackingUrl,
blFormat:formData.blFormat,
nvocc:formData.nvocc,
status:formData.status,
createdOn:new Date()

};

try{

const url = editingId
? `http://localhost:5000/shipping-lines/${editingId}`
: "http://localhost:5000/shipping-lines";

const method = editingId ? "PUT":"POST";

const response = await fetch(url,{
method:method,
headers:{"Content-Type":"application/json"},
body:JSON.stringify(newShippingLine)
});

await response.json();

if(responsiveDt.current){
responsiveDt.current.ajax.reload(null,false);
}

setShowAddModal(false);
setEditingId(null);

setFormData({
shippingLineName:"",
alias:"",
scac:"",
shortName:"",
accountNumber:"",
homePageUrl:"",
trackingUrl:"",
blFormat:"",
nvocc:false,
status:false
});

setErrors({});

}catch(error){
console.error("Submit Error:",error);
}

};


/* DATATABLE */

useEffect(()=>{

if(!responsiveTableRef.current) return;
if(responsiveDt.current) return;

$.fn.dataTable.Buttons.defaults.dom.button.className="export-btn";

responsiveDt.current=$(responsiveTableRef.current).DataTable({

dom:
"<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>"+
"t"+
"<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

scrollY:"350px",
scrollCollapse:true,
scrollX:false,
paging:true,

language:{lengthMenu:"Show _MENU_ Entries"},

buttons:[
{
extend:"collection",
text:'<i class="bx bx-export"></i> Export',
className:"export-btn",
autoClose:true,
dropIcon:false,

buttons:[
{
extend:"print",
text:'<i class="bx bx-printer"></i> Print',
exportOptions:{columns:":visible:not(.no-export)"}
},
{
extend:"copy",
text:'<i class="bx bx-copy"></i> Copy',
exportOptions:{columns:":visible:not(.no-export)"}
},
{
extend:"excel",
text:'<i class="bx bx-spreadsheet"></i> Excel',
exportOptions:{columns:":visible:not(.no-export)"}
},
{
extend:"pdf",
text:'<i class="bx bx-file"></i> PDF',
exportOptions:{columns:":visible:not(.no-export)"}
}
]
},

{
extend:"colvis",
text:'<i class="bx bx-columns"></i> Customise Columns',
className:"custom-colvis",
columns:":not(.no-export)",
dropIcon:false
}

],

responsive:true,

ajax:{
url:"http://localhost:5000/shipping-lines",
dataSrc:"data"
},

columns:[

    {data:"shippingLineName",defaultContent:"",responsivePriority:1},
    {data:"scac",defaultContent:"",responsivePriority:2},
    {data:"shortName",defaultContent:"",responsivePriority:3},

{
data:"nvocc",
render:function(data){
return data
? `<span class="badge bg-success">Yes</span>`
: `<span class="badge bg-secondary">No</span>`;
}
},

{
data:"status",
render:function(data){
return data
? `<span class="badge bg-success">Active</span>`
: `<span class="badge bg-danger">Inactive</span>`;
}
},

{
data:null,
className:"no-export",
render:function(data){
return `<i class="bx bx-edit edit-icon" data-id="${data._id}"></i>`;
}
},

{
data:null,
className:"no-export",
render:function(data){
return `<i class="bx bx-trash delete-icon" data-id="${data._id}"></i>`;
}
}

],

order:[[0,"asc"]]

});


setTimeout(()=>{
$(".dt-button").removeClass("btn btn-secondary");
},0);


/* DELETE CLICK */

$(responsiveTableRef.current).on("click",".delete-icon",function(){

const id=$(this).data("id");

setDeleteId(id);
setShowDeleteModal(true);

});


/* EDIT CLICK */

$(responsiveTableRef.current).on("click",".edit-icon",function(){

const rowData=responsiveDt.current.row($(this).parents("tr")).data();

setFormData({

shippingLineName:rowData.shippingLineName,
alias:rowData.alias,
scac:rowData.scac,
shortName:rowData.shortName,
accountNumber:rowData.accountNumber,
homePageUrl:rowData.homePageUrl,
trackingUrl:rowData.trackingUrl,
blFormat:rowData.blFormat,
nvocc:rowData.nvocc,
status:rowData.status

});

setEditingId(rowData._id);
setShowAddModal(true);

});

},[]);



return (

    <div className="container-xxl flex-grow-1">
    
    <div className="card">
    
    <div className="datatable-toolbar d-flex justify-content-between align-items-start">
    
    <div className="title-section">
    <h5 className="table-title">Shipping Line Master</h5>
    <div className="breadcrumb-text">Carrier Masters &gt; Shipping Line</div>
    </div>
    
    <button
    className="btn-add-record"
    onClick={() => setShowAddModal(true)}
    >
    <i className="bx bx-plus"></i> Create Shipping Line
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
    <th>Shipping Line Name</th>
    <th>SCAC Code</th>
    <th>Short Name</th>
    <th>NVOCC</th>
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
    
    <div className="custom-modal-card">
    
    <button
    className="custom-close"
    onClick={() => setShowAddModal(false)}
    >
    ×
    </button>
    
    <h5 className="modal-title">
    {editingId ? "Edit Shipping Line" : "Create Shipping Line"}
    </h5>
    
    <hr className="modal-divider" />
    
    <div className="row g-3">
    
    {/* Shipping Line Name */}
    
    <div className="col-md-6">
    <label className="form-label">Shipping Line Name *</label>
    
    <input
    type="text"
    name="shippingLineName"
    className="form-field"
    placeholder="Enter Shipping Line Name"
    value={formData.shippingLineName}
    onChange={handleChange}
    />
    
    {errors.shippingLineName && (
    <small className="text-danger">
    {errors.shippingLineName}
    </small>
    )}
    
    </div>
    
    {/* Alias */}
    
    <div className="col-md-6">
    <label className="form-label">Alias</label>
    
    <input
    type="text"
    name="alias"
    className="form-field"
    placeholder="Enter Alias"
    value={formData.alias}
    onChange={handleChange}
    />
    
    </div>
    
    {/* SCAC */}
    
    <div className="col-md-6">
    <label className="form-label">SCAC *</label>
    
    <input
    type="text"
    name="scac"
    className="form-field"
    placeholder="Enter SCAC"
    value={formData.scac}
    onChange={handleChange}
    />
    
    {errors.scac && (
    <small className="text-danger">
    {errors.scac}
    </small>
    )}
    
    </div>
    
    {/* Short Name */}
    
    <div className="col-md-6">
    <label className="form-label">Short Name *</label>
    
    <input
    type="text"
    name="shortName"
    className="form-field"
    placeholder="Enter Short Name"
    value={formData.shortName}
    onChange={handleChange}
    />
    
    {errors.shortName && (
    <small className="text-danger">
    {errors.shortName}
    </small>
    )}
    
    </div>
    
    {/* Account Number */}
    
    <div className="col-md-6">
    <label className="form-label">Account Number</label>
    
    <input
    type="text"
    name="accountNumber"
    className="form-field"
    placeholder="Enter Account Number"
    value={formData.accountNumber}
    onChange={handleChange}
    />
    
    </div>
    
    {/* Home Page URL */}
    
    <div className="col-md-6">
    <label className="form-label">Home Page URL</label>
    
    <input
    type="text"
    name="homePageUrl"
    className="form-field"
    placeholder="Enter URL"
    value={formData.homePageUrl}
    onChange={handleChange}
    />
    
    </div>
    
    {/* Tracking URL */}
    
    <div className="col-md-6">
    <label className="form-label">Tracking URL</label>
    
    <input
    type="text"
    name="trackingUrl"
    className="form-field"
    placeholder="Enter Tracking URL"
    value={formData.trackingUrl}
    onChange={handleChange}
    />
    
    </div>
    
    {/* BL Format */}
    
    <div className="col-md-6">
    <label className="form-label">BL Format</label>
    
    <input
    type="text"
    name="blFormat"
    className="form-field"
    placeholder="Enter BL Format"
    value={formData.blFormat}
    onChange={handleChange}
    />
    
    </div>
    
    {/* NVOCC */}
    
    <div className="col-md-6 d-flex align-items-end">
    
    <div className="form-check">
    
    <input
    type="checkbox"
    className="form-check-input"
    name="nvocc"
    checked={formData.nvocc}
    onChange={handleChange}
    />
    
    <label
    className="form-check-label"
    style={{ marginLeft: "6px" }}
    >
    NVOCC
    </label>
    
    </div>
    
    </div>
    
    {/* Status */}
    
    <div className="col-md-12">
    
    <label className="form-label">Status</label>
    
    <div className="d-flex gap-4">
    
    <label>
    
    <input
    type="radio"
    name="status"
    checked={formData.status === true}
    onChange={() =>
    setFormData({ ...formData, status: true })
    }
    />
    
    &nbsp;Active
    
    </label>
    
    <label>
    
    <input
    type="radio"
    name="status"
    checked={formData.status === false}
    onChange={() =>
    setFormData({ ...formData, status: false })
    }
    />
    
    &nbsp;Inactive
    
    </label>
    
    </div>
    
    </div>
    
    </div>
    
    {/* BUTTONS */}
    
    <div className="modal-buttons">
    
    <button
    className={editingId ? "btn-update" : "btn-submit"}
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
    shippingLineName: "",
    alias: "",
    scac: "",
    shortName: "",
    accountNumber: "",
    homePageUrl: "",
    trackingUrl: "",
    blFormat: "",
    nvocc: false,
    status: false
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
    Are you sure you want to delete this Shipping Line?
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
export default ShippingMaster;