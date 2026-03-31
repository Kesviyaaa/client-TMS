import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-responsive";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.colVis";

import "../../../App.css";

const User = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState(initialView);
    const [users, setUsers] = useState([]);
    
    const [documentRows, setDocumentRows] = useState([]);

    const [formData, setFormData] = useState({
        userName: "",
        password: "",
        isActive: true,
        canLogin: false,
        jobTitle: "",
        role: "",
        staffName: "",
        emailId: "",
        dob: "",
        gender: "",
        officeNumber: "",
        address1: "",
        address2: "",
        country: "",
        state: "",
        city: "",
        timezone: "",
        postalCode: "",
        joiningDate: "",
        relievingDate: "",
        language: "",
        status: "Active",
        bankName: "",
        accountNumber: "",
        ifscCode: ""
    });

    /* ───── Switch View ───── */
    const switchToForm = () => {
        if (dtRef.current) {
            dtRef.current.destroy();
            dtRef.current = null;
        }
        setView("form");
    };

    const switchToTable = () => {
        if (dtRef.current) {
            dtRef.current.destroy();
            dtRef.current = null;
        }
        setView("table");
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
        if (dtRef.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",

            responsive: true,
            scrollY: "400px",
            scrollCollapse: true,
            paging: true,
            pageLength: 10,

            data: users,

            language: {
                lengthMenu: "Show _MENU_ Entries",
                search: "Search:",
                emptyTable: "No Users Available"
            },

            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    dropIcon: false,
                    buttons: ["print", "copy", "excel", "pdf"]
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false
                }
            ],

            columns: [
                { data: "staffName", title: "Staff Name" },
                { data: "emailId", title: "Email ID" },
                { data: "city", title: "City" },
                { data: "state", title: "State" },
                {
                    data: null,
                    title: "Edit",
                    orderable: false,
                    searchable: false,
                    render: () =>
                        `<div class="text-center"><i class="bx bx-edit text-primary cursor-pointer"></i></div>`
                }
            ]
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [view, users]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    /* ═══════════════════════════════
        TABLE VIEW
    ═══════════════════════════════ */
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
                <h4 className="table-title mb-4">User Master</h4>

                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-user"></i></div> User Details
                        </span>

                        <button className="btn-add-record btn-primary-custom" onClick={switchToForm}>
                            <i className="bx bx-plus"></i> Create
                        </button>
                    </div>

                    <div className="card-datatable p-3">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100"></table>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════
        FORM VIEW
    ═══════════════════════════════ */
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <style>{`
                .bk-form-wrapper {
                    background: transparent;
                    display: flex;
                    flex-direction: column;
                }
                .bk-section-card {
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0.125rem 0.25rem rgba(161, 172, 184, 0.4);
                    margin-bottom: 20px;
                    overflow: hidden;
                    font-family: 'Public Sans', sans-serif;
                }
                .bk-form-heading {
                    color: #566a7f;
                    font-size: 1.125rem;
                    font-weight: 600;
                }
                .bk-section-header {
                    padding: 15px 25px;
                    border-bottom: 1px solid #f0f2f4;
                    background: #fdfdfd;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
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
                .bk-section-body {
                    padding: 25px;
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
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0">Create User</h5>
                <button className="btn-secondary-custom" onClick={switchToTable}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            <div className="bk-form-wrapper">
                {/* 1. User Details */}
                <div className="bk-section-card">
                    <div className="bk-section-header">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-user-circle"></i></div> User Details
                        </span>
                    </div>
                    <div className="bk-section-body">
                        <div className="row g-3">
                            <div className="col-md-5">
                                <label className="qt-label">User Name <span className="required-mark">*</span></label>
                                <input name="userName" className="qt-input" placeholder="example@gmail.com" onChange={handleChange} />
                            </div>
                            <div className="col-md-5">
                                <label className="qt-label">Password <span className="required-mark">*</span></label>
                                <input name="password" type="password" className="qt-input" onChange={handleChange} />
                            </div>
                            <div className="col-md-2">
                                <label className="qt-label">Status</label>
                                <div className="d-flex gap-3 mt-2">
                                    <div className="form-check m-0">
                                        <input type="checkbox" className="form-check-input mt-0" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} />
                                        <label className="form-check-label" style={{ fontSize: "12px", fontWeight: "600", color: "#566a7f" }} htmlFor="isActive">Is Active</label>
                                    </div>
                                    <div className="form-check m-0">
                                        <input type="checkbox" className="form-check-input mt-0" name="canLogin" id="canLogin" checked={formData.canLogin} onChange={handleChange} />
                                        <label className="form-check-label" style={{ fontSize: "12px", fontWeight: "600", color: "#566a7f" }} htmlFor="canLogin">Can Login</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Staff Details */}
                <div className="bk-section-card">
                    <div className="bk-section-header">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-id-card"></i></div> Staff Details
                        </span>
                    </div>
                    <div className="bk-section-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="qt-label">Job Title <span className="required-mark">*</span></label>
                                <input name="jobTitle" className="qt-input" placeholder="Enter Job Title" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Role <span className="required-mark">*</span></label>
                                <select name="role" className="qt-input" onChange={handleChange}>
                                    <option>Select Role</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Staff Name <span className="required-mark">*</span></label>
                                <input name="staffName" className="qt-input" placeholder="Enter Staff Name" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Email ID <span className="required-mark">*</span></label>
                                <input name="emailId" className="qt-input" placeholder="Enter Email" onChange={handleChange} />
                            </div>
                            
                            <div className="col-md-3">
                                <label className="qt-label">Date of Birth <span className="required-mark">*</span></label>
                                <input name="dob" type="date" className="qt-input" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Gender <span className="required-mark">*</span></label>
                                <select name="gender" className="qt-input" onChange={handleChange}>
                                    <option>--Select Gender--</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Office Number</label>
                                <input name="officeNumber" className="qt-input" placeholder="Enter Phone No" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Address Line1 <span className="required-mark">*</span></label>
                                <input name="address1" className="qt-input" placeholder="Enter Address Line1" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Address Line2</label>
                                <input name="address2" className="qt-input" placeholder="Enter Address Line2" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Country /Region <span className="required-mark">*</span></label>
                                <select name="country" className="qt-input" onChange={handleChange}>
                                    <option>-- Select Country / Region --</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">State <span className="required-mark">*</span></label>
                                <input name="state" className="qt-input" placeholder="Enter State" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">City <span className="required-mark">*</span></label>
                                <input name="city" className="qt-input" placeholder="Enter City" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">TimeZone <span className="required-mark">*</span></label>
                                <select name="timezone" className="qt-input" onChange={handleChange}>
                                    <option>-- Select TimeZone --</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Postal Code <span className="required-mark">*</span></label>
                                <input name="postalCode" className="qt-input" placeholder="Enter Postal Code" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Joining Date <span className="required-mark">*</span></label>
                                <input name="joiningDate" type="date" className="qt-input" onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Relieving Date</label>
                                <input name="relievingDate" type="date" className="qt-input" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Language <span className="required-mark">*</span></label>
                                <select name="language" className="qt-input" onChange={handleChange}>
                                    <option>--Select Language--</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="qt-label">Status</label>
                                <div className="d-flex gap-4 mt-2">
                                    <div className="form-check m-0 d-flex align-items-center gap-2">
                                        <input type="radio" className="form-check-input mt-0" name="status" id="activeStatus" value="Active" checked={formData.status === "Active"} onChange={handleChange} />
                                        <label className="form-check-label" htmlFor="activeStatus">Active</label>
                                    </div>
                                    <div className="form-check m-0 d-flex align-items-center gap-2">
                                        <input type="radio" className="form-check-input mt-0" name="status" id="inactiveStatus" value="Inactive" checked={formData.status === "Inactive"} onChange={handleChange} />
                                        <label className="form-check-label" htmlFor="inactiveStatus">Inactive</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Bank Details */}
                <div className="bk-section-card">
                    <div className="bk-section-header">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-building-house"></i></div> Bank Details
                        </span>
                    </div>
                    <div className="bk-section-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="qt-label">Bank Name</label>
                                <input name="bankName" className="qt-input" placeholder="Enter Name of the Bank" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">Account Number</label>
                                <input name="accountNumber" className="qt-input" placeholder="Enter Account Number" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="qt-label">IFSC/Swift Code</label>
                                <input name="ifscCode" className="qt-input" placeholder="Enter IFSC/Swift Code" onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Document Details */}
                <div className="bk-section-card">
                    <div className="bk-section-header">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-file"></i></div> Document Details
                        </span>
                    </div>
                    <div className="bk-section-body">
                        <div className="d-flex justify-content-start mb-3">
                            <button 
                                className="btn-primary-custom" 
                                style={{ height: "30px", padding: "0 15px", fontSize: "12px" }}
                                onClick={() => setDocumentRows([...documentRows, { id: Date.now() }])}
                            >
                                Add Document
                            </button>
                        </div>
                        <div className="grid-table-head" style={{ gridTemplateColumns: "1.5fr 1.5fr 1.5fr 80px" }}>
                            <div>Document Name</div><div>Document Type</div><div>Upload File</div><div className="text-center">Remove</div>
                        </div>
                        {documentRows.length === 0 ? (
                            <div className="p-4 text-center text-muted" style={{ fontSize: "13px", border: "1px solid #d9dee3", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                                No documents uploaded.
                            </div>
                        ) : (
                            documentRows.map((row) => (
                                <div key={row.id} className="grid-table-row" style={{ gridTemplateColumns: "1.5fr 1.5fr 1.5fr 80px" }}>
                                    <input className="qt-input m-0" placeholder="Document Name" />
                                    <select className="qt-input m-0">
                                        <option>-- Select Type --</option>
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
                    </div>
                </div>

                {/* 5. Menu Permissions */}
                <div className="bk-section-card">
                    <div className="bk-section-header">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-menu"></i></div> Menu Permissions
                        </span>
                    </div>
                    <div className="bk-section-body">
                        <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: "100px" }}>
                            Menu Permissions configuration will go here.
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4 gap-3 mb-5">
                    <button className="btn-secondary-custom" onClick={switchToTable}>
                        Cancel
                    </button>
                    <button className="btn-primary-custom">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default User;
