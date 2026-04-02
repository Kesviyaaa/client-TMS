import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";

import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";

import "../../css/system.css";

const Branch = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState(initialView);
    const [branches, setBranches] = useState([
        {
            _id: "1",
            organization: "Main Corp",
            branchName: "Dubai Main",
            phone: "+971501234567",
            email: "dubai@example.com",
            city: "Dubai",
            state: "Dubai",
            status: "Active"
        }
    ]);

    const [formData, setFormData] = useState({
        organization: "",
        branchName: "",
        phone: "",
        email: "",
        address1: "",
        address2: "",
        country: "",
        unlocode: "",
        state: "",
        city: "",
        postcode: "",
        fax: "",
        website: "",
        salesPerson: "",
        status: "Active",
        notes: ""
    });

    /* ───── Switch View ───── */
    const switchToForm = () => {
        setView("form");
    };

    const switchToTable = () => {
        setView("table");
    }

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

            data: branches,

            language: {
                lengthMenu: "Show _MENU_ Entries",
                search: "Search:",
                emptyTable: "No Branches Available"
            },

            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    dropIcon: false,
                    autoClose: true,
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
                { data: "organization", title: "Main Organization" },
                { data: "branchName", title: "Branch Name" },
                { data: "phone", title: "Phone" },
                { data: "email", title: "Email" },
                { data: "city", title: "City" },
                { data: "state", title: "State" },
                { data: "status", title: "Status" },
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
    }, [view, branches]);

    /* ───── Form Handler ───── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /* ═══════════════════════════════
        TABLE VIEW
    ═══════════════════════════════ */
    if (view === "table") {
        return (
            <div className="container-xxl container-p-y pb-5" key="branch-table-view">
                <h4 className="table-title mb-4">Branch Master</h4>

                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-git-branch"></i></div> Branch Details
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
        <div className="container-xxl flex-grow-1 container-p-y pb-5" key="branch-form-view">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0">Create Branch</h5>
                <button className="btn-secondary-custom" onClick={switchToTable}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            <div className="bk-form-wrapper">
                <div className="bk-section-card">
                    <div className="bk-section-header">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-info-circle"></i></div> Branch Details
                        </span>
                    </div>

                    <div className="bk-section-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="qt-label">Main Organization <span className="required-mark">*</span></label>
                                <select name="organization" className="qt-input" onChange={handleChange}>
                                    <option>Select Organization</option>
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Branch Name <span className="required-mark">*</span></label>
                                <input name="branchName" className="qt-input" placeholder="Enter Branch Name" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Phone <span className="required-mark">*</span></label>
                                <input name="phone" className="qt-input" placeholder="Enter Phone Number" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Email <span className="required-mark">*</span></label>
                                <input name="email" className="qt-input" placeholder="Enter Email Address" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Address 1 <span className="required-mark">*</span></label>
                                <input name="address1" className="qt-input" placeholder="Enter Address1" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Address 2</label>
                                <input name="address2" className="qt-input" placeholder="Enter Address2" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Country <span className="required-mark">*</span></label>
                                <select name="country" className="qt-input" onChange={handleChange}>
                                    <option>Select Country Name</option>
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">UNLOCO</label>
                                <input name="unlocode" className="qt-input" placeholder="Enter UNLOCO" onChange={handleChange} />
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
                                <label className="qt-label">Post Code <span className="required-mark">*</span></label>
                                <input name="postcode" className="qt-input" placeholder="Enter Post Code" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Fax</label>
                                <input name="fax" className="qt-input" placeholder="Enter Fax" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Website URL</label>
                                <input name="website" className="qt-input" placeholder="Enter Website URL" onChange={handleChange} />
                            </div>

                            <div className="col-md-3">
                                <label className="qt-label">Sales Person <span className="required-mark">*</span></label>
                                <select name="salesPerson" className="qt-input" onChange={handleChange}>
                                    <option>Select Sales Person</option>
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

                            <div className="col-md-12">
                                <label className="qt-label">Notes</label>
                                <textarea name="notes" className="qt-input" rows="2" placeholder="Enter Notes..." onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4 gap-3 mb-5">
                    <button className="btn-secondary-custom" onClick={switchToTable}>
                        Cancel
                    </button>
                    <button className="btn-primary-custom" onClick={switchToTable}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Branch;