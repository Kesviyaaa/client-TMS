import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";

/* ---------------- Dummy Data ---------------- */
const dummyOrganizations = [
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

const Organization = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState(initialView);
    const [data, setData] = useState(dummyOrganizations);

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
        "Services",
        "Receivable",
        "Payable",
        "Warehouse"
    ];
    const [activeTab, setActiveTab] = useState("Basic Information");
    const [documentRows, setDocumentRows] = useState([]);
    const [registrationRows, setRegistrationRows] = useState([]);

    /* ---------------- DataTable ---------------- */
    useEffect(() => {
        if (view !== "table") return;

        if (dtRef.current) dtRef.current.destroy();

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
            data: data,
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
            setView("form");
        });

        setTimeout(() => $(".dt-button").removeClass("btn btn-secondary"), 0);

        return () => dtRef.current?.destroy();
    }, [view, data]);

    /* ---------------- TABLE VIEW ---------------- */
    if (view === "table") {
        return (
            <div className="container-xxl container-p-y pb-5">
                <style>{`
                    .ocean-card {
                        background: #fff;
                        border-radius: 8px;
                        box-shadow: 0 0.125rem 0.25rem rgba(161, 172, 184, 0.4);
                        margin-bottom: 20px;
                    }
                    .ocean-title {
                        color: #566a7f;
                        font-size: 1.125rem;
                        font-weight: 600;
                        padding: 1.25rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .bk-section-title {
                        color: #50a9e9;
                        font-size: 15px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .bk-icon-circle {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: rgba(80, 169, 233, 0.1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #50a9e9;
                    }
                `}</style>

                <h4 className="table-title mb-4">Organization Master</h4>

                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-buildings"></i></div> Organization Details
                        </span>

                        <button className="btn-add-record btn-primary-custom" onClick={() => setView("form")}>
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
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <style>{`
                .org-top-checkboxes {
                    border: 1px solid #d9dee3;
                    border-radius: 8px;
                    background: #fff;
                    padding: 12px 20px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                }
                .org-top-checkboxes label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #566a7f;
                    margin-bottom: 0;
                    cursor: pointer;
                }
                .org-sidebar {
                    width: 250px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .org-tab {
                    padding: 12px 20px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #566a7f;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }
                .org-tab:hover {
                    background: rgba(80, 169, 233, 0.05);
                }
                .org-tab.active {
                    background: #5c6ea4;
                    color: #fff;
                    box-shadow: 0 2px 4px rgba(92, 110, 164, 0.3);
                }
                .org-content-card {
                    flex-grow: 1;
                    background: #fff;
                    border-radius: 8px;
                    border: 1px solid #d9dee3;
                    min-height: 500px;
                }
                .org-content-header {
                    padding: 15px 20px;
                    border-bottom: 1px solid #f0f2f4;
                    color: #50a9e9;
                    font-size: 14px;
                    font-weight: 700;
                    background: #fdfdfd;
                }
                .org-content-body {
                    padding: 20px;
                }
                .qt-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #566a7f;
                    margin-bottom: 4px;
                    display: block;
                }
                .qt-input {
                    font-size: 13px;
                    border: 1px solid #d9dee3;
                    border-radius: 5px;
                    padding: 7px 12px;
                    width: 100%;
                    outline: none;
                    background: #fff;
                    color: #3b4d61;
                }
                .required-mark {
                    color: #ff3e1d;
                }
                .sub-section-title {
                    color: #50a9e9;
                    font-size: 13px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px dashed #d9dee3;
                }
                .grid-table-head {
                    display: grid;
                    gap: 10px;
                    padding: 10px;
                    background: #eef1f4;
                    font-weight: 700;
                    font-size: 11px;
                    color: #566a7f;
                    border-radius: 4px 4px 0 0;
                    border: 1px solid #d9dee3;
                }
                .grid-table-row {
                    display: grid;
                    gap: 10px;
                    padding: 8px 10px;
                    border: 1px solid #d9dee3;
                    border-top: none;
                    align-items: center;
                }
                .org-wrapper-card {
                    background: #fff;
                    border-radius: 8px;
                    border: 1px solid #d9dee3;
                    box-shadow: 0 0.125rem 0.25rem rgba(161, 172, 184, 0.4);
                    padding: 24px;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0" style={{ color: "#566a7f", fontSize: "1.125rem", fontWeight: 600 }}>Create Organization</h5>
                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "13px" }}>
                </div>
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
                                    <div className="col-md-3"><label className="qt-label">Organization Code <span className="required-mark">*</span></label><input className="qt-input" placeholder="ORG_024" /></div>
                                    <div className="col-md-3"><label className="qt-label">Company Name <span className="required-mark">*</span></label><input className="qt-input" placeholder="Enter Company Name" /></div>
                                    <div className="col-md-3"><label className="qt-label">Phone <span className="required-mark">*</span></label><input className="qt-input" placeholder="Enter Phone" /></div>
                                    <div className="col-md-3"><label className="qt-label">Email <span className="required-mark">*</span></label><input className="qt-input" placeholder="Enter Email" /></div>

                                    <div className="col-md-3"><label className="qt-label">Address1 <span className="required-mark">*</span></label><input className="qt-input" placeholder="Enter Address1" /></div>
                                    <div className="col-md-3"><label className="qt-label">Address2</label><input className="qt-input" placeholder="Enter Address2" /></div>
                                    <div className="col-md-3"><label className="qt-label">Country/Region <span className="required-mark">*</span></label><select className="qt-input"><option>Select Country/Region</option></select></div>
                                    <div className="col-md-3"><label className="qt-label">State</label><input className="qt-input" placeholder="" /></div>

                                    <div className="col-md-3"><label className="qt-label">City</label><input className="qt-input" placeholder="Enter City" /></div>
                                    <div className="col-md-3"><label className="qt-label">Postcode <span className="required-mark">*</span></label><input className="qt-input" placeholder="Enter Postcode" /></div>
                                    <div className="col-md-3"><label className="qt-label">Mobile</label><input className="qt-input" placeholder="Enter Mobile" /></div>
                                    <div className="col-md-3"><label className="qt-label">Fax</label><input className="qt-input" placeholder="Enter Fax" /></div>

                                    <div className="col-md-3"><label className="qt-label">Website URL</label><input className="qt-input" placeholder="Enter URL" /></div>
                                    <div className="col-md-3"><label className="qt-label">Home New Branch</label><input className="qt-input" placeholder="" /></div>
                                    <div className="col-md-3"><label className="qt-label">UNLOCO</label><input className="qt-input" placeholder="" /></div>
                                    <div className="col-md-3"><label className="qt-label">Sales Person <span className="required-mark">*</span></label><select className="qt-input"><option>Select Sales Person</option></select></div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="form-check m-0">
                                            <label className="qt-label mb-2">Is Primary</label>
                                            <input type="checkbox" className="form-check-input" defaultChecked />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="qt-label">Notes</label>
                                        <textarea className="qt-input" placeholder="Enter Notes" rows="2"></textarea>
                                    </div>
                                </div>

                                <div className="sub-section-title mt-2">Default Loading / Discharge Port</div>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6"><label className="qt-label">Sea</label><select className="qt-input"><option>Select Sea Port</option></select></div>
                                    <div className="col-md-6"><label className="qt-label">Air</label><select className="qt-input"><option>Select Air Port</option></select></div>
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
                                <div className="col-md-4">
                                    <label className="qt-label">Mobile</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <input type="checkbox" className="form-check-input m-0" />
                                        <input className="qt-input" placeholder="Enter Mobile Number" />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="qt-label">Email</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <input type="checkbox" className="form-check-input m-0" />
                                        <input className="qt-input" placeholder="Enter Email Address" />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="setPrimary" />
                                        <label className="form-check-label" htmlFor="setPrimary" style={{ fontSize: "12px", fontWeight: 600 }}>Set as Primary</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Account Manager" && (
                            <div className="row g-4">
                                <div className="col-md-6"><label className="qt-label">Shipper Air</label><select className="qt-input"><option>--Select Air --</option></select></div>
                                <div className="col-md-6"><label className="qt-label">Shipper Sea</label><select className="qt-input"><option>--Select Sea --</option></select></div>

                                <div className="col-md-6"><label className="qt-label">Shipper Land</label><select className="qt-input"><option>--Select Land --</option></select></div>
                                <div className="col-md-6"><label className="qt-label">Consignee Air</label><select className="qt-input"><option>--Select Air --</option></select></div>

                                <div className="col-md-6"><label className="qt-label">Consignee Sea</label><select className="qt-input"><option>--Select Sea --</option></select></div>
                                <div className="col-md-6"><label className="qt-label">Consignee Land</label><select className="qt-input"><option>--Select Land --</option></select></div>
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
                <button className="btn-secondary-custom" onClick={() => setView("table")}>
                    <i className="bx bx-arrow-back me-1"></i> Back
                </button>
                <button className="btn-primary-custom">Create</button>
            </div>
            
            </div>
        </div>
    );
};

export default Organization;