import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";

import "../../css/system.css";

/* ---------------- Dummy Data ---------------- */
const initialData = [
    {
        _id: "1",
        orgCode: "ORG001",
        companyName: "ABC Logistics",
        branchName: "Chennai",
        email: "abc@gmail.com",
        address: "Chennai, India",
        createdOn: "2026-03-25",
        status: "Active",
    },
];

const Organisation = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState(initialView);
    const [data, setData] = useState(initialData);
    const [activeTab, setActiveTab] = useState("Basic Information");
    const [documentRows, setDocumentRows] = useState([]);
    const [registrationRows, setRegistrationRows] = useState([]);

    const [formData, setFormData] = useState({
        orgCode: "",
        companyName: "",
        phone: "",
        email: "",
        address1: "",
        address2: "",
        country: "",
        state: "",
        city: "",
        postcode: "",
        mobile: "",
        fax: "",
        website: "",
        salesPerson: "",
        isPrimary: true,
        notes: "",
        seaPort: "",
        airPort: ""
    });

    const tabs = [
        "Basic Information",
        "Bank Details",
        "Contact Details",
        "Account Manager",
        "Document Details",
        "Agent",
        "Consignor",
        "Consignee",
        "Carrier",
        "Services"
    ];

    /* ───── Switch View Helpers ───── */
    const switchToForm = () => {
        setView("form");
    };

    const switchToTable = () => {
        setView("table");
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /* ---------------- DataTable ---------------- */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
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
            responsive: true,
            data: data,
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: ["print", "copy", "excel", "pdf"],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                },
            ],
            columns: [
                { title: "Organization Code", data: "orgCode" },
                { title: "Company Name", data: "companyName" },
                { title: "Branch Name", data: "branchName" },
                { title: "Email", data: "email" },
                { title: "Address", data: "address" },
                { title: "Created On", data: "createdOn" },
                { title: "Status", data: "status" },
                {
                    title: "Edit",
                    data: null,
                    orderable: false,
                    className: "text-center no-export",
                    responsivePriority: 1,
                    render: (row) => `
                        <div class="d-flex justify-content-center">
                            <i class="bx bx-edit text-primary cursor-pointer edit-btn" data-id="${row._id}" style="font-size:18px;"></i>
                        </div>
                    `,
                },
            ],
        });

        const table = $(tableRef.current);
        table.on("click", ".edit-btn", function () {
            switchToForm();
        });

        setTimeout(() => $(".dt-button").removeClass("btn btn-secondary"), 0);

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [view, data]);

    const handleCreate = () => {
        const newOrg = {
            _id: Date.now().toString(),
            orgCode: formData.orgCode || "NEW_ORG",
            companyName: formData.companyName || "Untitled Co",
            branchName: formData.city || "Head Office",
            email: formData.email || "-",
            address: formData.address1 || "-",
            createdOn: new Date().toISOString().split('T')[0],
            status: "Active"
        };
        setData([...data, newOrg]);
        switchToTable();
    };

    /* ---------------- TABLE VIEW ---------------- */
    if (view === "table") {
        return (
            <div className="container-xxl container-p-y pb-5" key="org-table-view">
                <h4 className="table-title mb-4">Organization Master</h4>

                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-buildings"></i></div> Organization Details
                        </span>

                        <button className="btn-add-record btn-primary-custom" onClick={switchToForm}>
                            <i className="bx bx-plus"></i> Create Organization
                        </button>
                    </div>

                    <div className="card-datatable p-3">
                        <table
                            ref={tableRef}
                            className="table dataTable dtr-inline w-100"
                        ></table>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------- FORM VIEW ---------------- */
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5" key="org-form-view">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0">Create Organization</h5>
                <button className="btn-secondary-custom" onClick={switchToTable}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            <div className="org-wrapper-card">
                <div className="org-top-checkboxes">
                    {['Agent', 'Consignor', 'Consignee', 'Carrier', 'Services', 'Receivable', 'Payable', 'Warehouse'].map(cb => (
                        <div className="form-check m-0 d-flex align-items-center gap-2" key={cb}>
                            <input type="checkbox" className="form-check-input mt-0" id={`cb-${cb}`} />
                            <label className="form-check-label" htmlFor={`cb-${cb}`}>{cb}</label>
                        </div>
                    ))}
                </div>

                <div className="d-flex align-items-start gap-4">
                    {/* SIDEBAR TABS */}
                    <div className="org-sidebar">
                        {tabs.map(tab => (
                            <div
                                key={tab}
                                className={`org-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    {/* CONTENT AREA */}
                    <div className="org-content-card">
                        <div className="org-content-header d-flex align-items-center gap-2">
                            <div className="bk-icon-circle" style={{ width: "24px", height: "24px", fontSize: "14px" }}>
                                <i className={
                                    activeTab === "Basic Information" ? "bx bx-info-circle" :
                                    activeTab === "Bank Details" ? "bx bx-building-house" :
                                    activeTab === "Contact Details" ? "bx bx-phone-call" :
                                    activeTab === "Account Manager" ? "bx bx-user-pin" :
                                    activeTab === "Document Details" ? "bx bx-file" : "bx bx-label"
                                }></i>
                            </div>
                            {activeTab}
                        </div>
                        <div className="org-content-body">

                            {activeTab === "Basic Information" && (
                                <>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-3">
                                            <label className="qt-label">Organization Code <span className="required-mark">*</span></label>
                                            <input name="orgCode" className="qt-input" value={formData.orgCode} onChange={handleChange} placeholder="ORG_024" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Company Name <span className="required-mark">*</span></label>
                                            <input name="companyName" className="qt-input" value={formData.companyName} onChange={handleChange} placeholder="Enter Company Name" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Phone <span className="required-mark">*</span></label>
                                            <input name="phone" className="qt-input" value={formData.phone} onChange={handleChange} placeholder="Enter Phone" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Email <span className="required-mark">*</span></label>
                                            <input name="email" className="qt-input" value={formData.email} onChange={handleChange} placeholder="Enter Email" />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="qt-label">Address1 <span className="required-mark">*</span></label>
                                            <input name="address1" className="qt-input" value={formData.address1} onChange={handleChange} placeholder="Enter Address1" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Address2</label>
                                            <input name="address2" className="qt-input" value={formData.address2} onChange={handleChange} placeholder="Enter Address2" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Country/Region <span className="required-mark">*</span></label>
                                            <select name="country" className="qt-input" value={formData.country} onChange={handleChange}>
                                                <option value="">Select Country/Region</option>
                                                <option value="India">India</option>
                                                <option value="UAE">UAE</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">State</label>
                                            <input name="state" className="qt-input" value={formData.state} onChange={handleChange} placeholder="Enter State" />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="qt-label">City</label>
                                            <input name="city" className="qt-input" value={formData.city} onChange={handleChange} placeholder="Enter City" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Postcode <span className="required-mark">*</span></label>
                                            <input name="postcode" className="qt-input" value={formData.postcode} onChange={handleChange} placeholder="Enter Postcode" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Mobile</label>
                                            <input name="mobile" className="qt-input" value={formData.mobile} onChange={handleChange} placeholder="Enter Mobile" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="qt-label">Fax</label>
                                            <input name="fax" className="qt-input" value={formData.fax} onChange={handleChange} placeholder="Enter Fax" />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <div className="form-check m-0">
                                                <label className="qt-label mb-2">Is Primary</label>
                                                <input name="isPrimary" type="checkbox" className="form-check-input" checked={formData.isPrimary} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="qt-label">Notes</label>
                                            <textarea name="notes" className="qt-input" value={formData.notes} onChange={handleChange} placeholder="Enter Notes" rows="2"></textarea>
                                        </div>
                                    </div>

                                    <div className="sub-section-title mt-2">Default Loading / Discharge Port</div>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="qt-label">Sea</label>
                                            <select name="seaPort" className="qt-input" value={formData.seaPort} onChange={handleChange}><option value="">Select Sea Port</option></select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="qt-label">Air</label>
                                            <select name="airPort" className="qt-input" value={formData.airPort} onChange={handleChange}><option value="">Select Air Port</option></select>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center sub-section-title mb-0">
                                        <span>Registration Details</span>
                                        <button 
                                            className="btn-primary-custom" 
                                            style={{ height: "28px", padding: "0 12px", fontSize: "12px" }}
                                            onClick={() => setRegistrationRows([...registrationRows, { id: Date.now() }])}
                                        >
                                            Add New
                                        </button>
                                    </div>
                                    <div className="grid-table-head mt-3" style={{ gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr 80px" }}>
                                        <div>Registration Type</div><div>Branch</div><div>Registration Number</div><div>Valid From</div><div>Valid Upto</div><div className="text-center">Remove</div>
                                    </div>
                                    {registrationRows.length === 0 ? (
                                        <div className="p-3 text-center text-muted" style={{ fontSize: "12px", border: "1px solid #d9dee3", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                                            No registration details added.
                                        </div>
                                    ) : (
                                        registrationRows.map((row) => (
                                            <div key={row.id} className="grid-table-row" style={{ gridTemplateColumns: "1fr 1fr 1.5fr 1fr 1fr 80px" }}>
                                                <input className="qt-input m-0" placeholder="Type" />
                                                <input className="qt-input m-0" placeholder="Branch" />
                                                <input className="qt-input m-0" placeholder="Number" />
                                                <input type="date" className="qt-input m-0" style={{ padding: "4px 8px" }} />
                                                <input type="date" className="qt-input m-0" style={{ padding: "4px 8px" }} />
                                                <div className="d-flex justify-content-center">
                                                    <button 
                                                        className="btn btn-danger btn-sm" 
                                                        style={{ height: "30px", fontSize: "12px", background: "#ff4d4f", borderColor: "#ff4d4f" }}
                                                        onClick={() => setRegistrationRows(registrationRows.filter(r => r.id !== row.id))}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}

                            {activeTab === "Bank Details" && (
                                <div className="row g-4">
                                    <div className="col-md-4"><label className="qt-label">Bank Name</label><input className="qt-input" placeholder="Enter Name of the Bank" /></div>
                                    <div className="col-md-4"><label className="qt-label">Account Holder Name</label><input className="qt-input" placeholder="Enter Account Holder Name" /></div>
                                    <div className="col-md-4"><label className="qt-label">Account Number</label><input className="qt-input" placeholder="Enter Account Number" /></div>
                                    <div className="col-md-4"><label className="qt-label">IFSC Code/Swift Code</label><input className="qt-input" placeholder="Enter IFSC Code" /></div>
                                    <div className="col-md-4"><label className="qt-label">Branch</label><input className="qt-input" placeholder="Enter Branch" /></div>
                                    <div className="col-md-4"><label className="qt-label">Bank Address</label><input className="qt-input" placeholder="Enter Bank Address" /></div>
                                </div>
                            )}

                            {activeTab === "Contact Details" && (
                                <div className="row g-4">
                                    <div className="col-md-4"><label className="qt-label">Contact Name</label><input className="qt-input" placeholder="Enter Contact Name" /></div>
                                    <div className="col-md-4"><label className="qt-label">Title / Designation</label><input className="qt-input" placeholder="Enter Designation" /></div>
                                    <div className="col-md-4"><label className="qt-label">Department</label><input className="qt-input" placeholder="Enter Department" /></div>
                                    <div className="col-md-4"><label className="qt-label">Telephone</label><input className="qt-input" placeholder="Enter Telephone Number" /></div>
                                    <div className="col-md-4"><label className="qt-label">Mobile</label><input className="qt-input" placeholder="Enter Mobile Number" /></div>
                                    <div className="col-md-4"><label className="qt-label">Email</label><input className="qt-input" placeholder="Enter Email Address" /></div>
                                </div>
                            )}

                            {activeTab === "Document Details" && (
                                <>
                                    <div className="d-flex justify-content-end mb-3">
                                        <button 
                                            className="btn-primary-custom" 
                                            style={{ height: "30px", padding: "0 15px", fontSize: "12px" }}
                                            onClick={() => setDocumentRows([...documentRows, { id: Date.now() }])}
                                        >
                                            Add New
                                        </button>
                                    </div>
                                    <div className="grid-table-head" style={{ gridTemplateColumns: "2fr 2fr 80px" }}>
                                        <div>Document Name</div><div>Upload File</div><div className="text-center">Remove</div>
                                    </div>
                                    {documentRows.length === 0 ? (
                                        <div className="p-4 text-center text-muted" style={{ fontSize: "13px", border: "1px solid #d9dee3", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                                            No documents uploaded.
                                        </div>
                                    ) : (
                                        documentRows.map((row) => (
                                            <div key={row.id} className="grid-table-row" style={{ gridTemplateColumns: "2fr 2fr 80px" }}>
                                                <select className="qt-input m-0">
                                                    <option>-- Select Document --</option>
                                                </select>
                                                <input type="file" className="qt-input m-0" style={{ padding: "4px 8px" }} />
                                                <div className="d-flex justify-content-center">
                                                    <button 
                                                        className="btn btn-danger btn-sm" 
                                                        style={{ height: "30px", fontSize: "12px", background: "#ff4d4f", borderColor: "#ff4d4f" }}
                                                        onClick={() => setDocumentRows(documentRows.filter(r => r.id !== row.id))}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}

                            {!["Basic Information", "Bank Details", "Contact Details", "Account Manager", "Document Details"].includes(activeTab) && (
                                <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: "200px" }}>
                                    Form content for {activeTab} goes here.
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4 pt-3">
                    <button className="btn-secondary-custom" onClick={switchToTable}>
                        <i className="bx bx-arrow-back me-1"></i> Cancel
                    </button>
                    <button className="btn-primary-custom" onClick={handleCreate}>Create Organisation</button>
                </div>
            </div>
        </div>
    );
};

export default Organisation;