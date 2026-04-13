import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import { useNavigate } from "react-router-dom";

import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";

import "../../css/system.css";

const User = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState(initialView);
    const navigate = useNavigate();

    useEffect(() => {
        setView(initialView);
    }, [initialView]);

    const [users, setUsers] = useState([]);
    const [rolesList, setRolesList] = useState([]);
    const [documentRows, setDocumentRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

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

    const API_BASE = "http://localhost:5005/api/users";
    const ROLES_API = "http://localhost:5005/api/user-roles";

    // ✅ Fetch Users & Roles
    const fetchData = async () => {
        try {
            const [uRes, rRes] = await Promise.all([
                fetch(API_BASE),
                fetch(ROLES_API)
            ]);
            if (uRes.ok) setUsers(await uRes.json());
            if (rRes.ok) setRolesList(await rRes.json());
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ───── Switch View ───── */
    const switchToForm = () => {
        setFormData({
            userName: "", password: "", isActive: true, canLogin: false, jobTitle: "", role: "",
            staffName: "", emailId: "", dob: "", gender: "", officeNumber: "", address1: "",
            address2: "", country: "", state: "", city: "", timezone: "", postalCode: "",
            joiningDate: "", relievingDate: "", language: "", status: "Active",
            bankName: "", accountNumber: "", ifscCode: ""
        });
        setErrors({});
        setIsEditing(false);
        navigate("/system-master/user/create");
    };

    const switchToTable = () => {
        navigate("/system-master/user");
    };

    const handleEdit = (id) => {
        const found = users.find(u => String(u._id) === String(id));
        if (found) {
            setFormData(found);
            setIsEditing(true);
            setErrors({});
            navigate("/system-master/user/create");
        }
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
        
        if (dtRef.current) {
            dtRef.current.destroy();
            $(tableRef.current).empty();
            dtRef.current = null;
        }

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            responsive: true,
            paging: true,
            pageLength: 10,
            data: users,
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
                { data: "staffName", title: "Staff Name" },
                { data: "emailId", title: "Email ID" },
                { data: "role", title: "Role" },
                { data: "city", title: "City" },
                { 
                    data: "status", 
                    title: "Status",
                    render: d => `<span class="badge ${d === "Active" ? "bg-label-success" : "bg-label-secondary"}">${d || "Active"}</span>`
                },
                {
                    data: null,
                    title: "Edit",
                    orderable: false,
                    className: "text-center",
                    render: (row) => `<i class="bx bx-edit text-primary cursor-pointer edit-btn" data-id="${row._id}" style="font-size:18px;"></i>`
                },
                {
                    data: null,
                    title: "Remove",
                    orderable: false,
                    className: "text-center",
                    render: (row) => `<i class="bx bx-trash text-danger cursor-pointer remove-btn" data-id="${row._id}" style="font-size:18px;"></i>`
                }
            ]
        });

        const table = $(tableRef.current);
        table.off("click").on("click", ".edit-btn", function() {
            handleEdit($(this).data("id"));
        });
        table.on("click", ".remove-btn", function() {
            setDeleteId($(this).data("id"));
            setShowDeleteModal(true);
        });

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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSave = async () => {
        const newErrors = {};
        const required = ["userName", "password", "staffName", "emailId", "role", "jobTitle"];
        required.forEach(field => {
            if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const url = isEditing ? `${API_BASE}/${formData._id}` : API_BASE;
            const method = isEditing ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                await fetchData();
                switchToTable();
            }
        } catch (err) {
            console.error("Error saving user:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
            if (response.ok) {
                await fetchData();
                setShowDeleteModal(false);
            }
        } catch (err) {
            console.error("Error deleting user:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ═══════════════════════════════
        TABLE VIEW
    ═══════════════════════════════ */
    if (view === "table") {
        return (
            <div className="container-xxl container-p-y pb-5">
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

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="custom-modal-backdrop" style={{ zIndex: 99999 }}>
                        <div className="custom-modal-card" style={{ maxWidth: "400px" }}>
                            <div className="text-center p-4">
                                <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                                <h4 className="mb-2">Are you sure?</h4>
                                <p className="text-muted mb-4">Delete this user permanently?</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                    <button className="btn-danger-custom" style={{ background: "#ff3e1d", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px" }} onClick={handleDelete} disabled={loading}>
                                        {loading ? "Deleting..." : "Yes, Delete!"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* ═══════════════════════════════
        FORM VIEW
    ═══════════════════════════════ */
    return (
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0">{isEditing ? "Edit User" : "Create User"}</h5>
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
                                <input name="userName" className="qt-input" placeholder="example@gmail.com" value={formData.userName} onChange={handleChange} />
                                {errors.userName && <small className="text-danger d-block mt-1">{errors.userName}</small>}
                            </div>
                            <div className="col-md-5">
                                <label className="qt-label">Password <span className="required-mark">*</span></label>
                                <input name="password" type="password" className="qt-input" value={formData.password} onChange={handleChange} />
                                {errors.password && <small className="text-danger d-block mt-1">{errors.password}</small>}
                            </div>
                            <div className="col-md-2">
                                <label className="qt-label">Access</label>
                                <div className="d-flex gap-3 mt-2">
                                    <div className="form-check m-0">
                                        <input type="checkbox" className="form-check-input mt-0" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} />
                                        <label className="form-check-label" style={{ fontSize: "11px", fontWeight: "600" }} htmlFor="isActive">Active</label>
                                    </div>
                                    <div className="form-check m-0">
                                        <input type="checkbox" className="form-check-input mt-0" name="canLogin" id="canLogin" checked={formData.canLogin} onChange={handleChange} />
                                        <label className="form-check-label" style={{ fontSize: "11px", fontWeight: "600" }} htmlFor="canLogin">Login</label>
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
                                <input name="jobTitle" className="qt-input" placeholder="Enter Job Title" value={formData.jobTitle} onChange={handleChange} />
                                {errors.jobTitle && <small className="text-danger d-block mt-1">{errors.jobTitle}</small>}
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Role <span className="required-mark">*</span></label>
                                <select name="role" className="qt-input" value={formData.role} onChange={handleChange}>
                                    <option value="">Select Role</option>
                                    {rolesList.map(r => <option key={r._id} value={r.roleName}>{r.roleName}</option>)}
                                </select>
                                {errors.role && <small className="text-danger d-block mt-1">{errors.role}</small>}
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Staff Name <span className="required-mark">*</span></label>
                                <input name="staffName" className="qt-input" placeholder="Enter Staff Name" value={formData.staffName} onChange={handleChange} />
                                {errors.staffName && <small className="text-danger d-block mt-1">{errors.staffName}</small>}
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Email ID <span className="required-mark">*</span></label>
                                <input name="emailId" className="qt-input" placeholder="Enter Email" value={formData.emailId} onChange={handleChange} />
                                {errors.emailId && <small className="text-danger d-block mt-1">{errors.emailId}</small>}
                            </div>
                            
                            <div className="col-md-3">
                                <label className="qt-label">Date of Birth</label>
                                <input name="dob" type="date" className="qt-input" value={formData.dob} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Gender</label>
                                <select name="gender" className="qt-input" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">Office Number</label>
                                <input name="officeNumber" className="qt-input" placeholder="Enter Phone" value={formData.officeNumber} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="qt-label">City</label>
                                <input name="city" className="qt-input" placeholder="Enter City" value={formData.city} onChange={handleChange} />
                            </div>

                            <div className="col-md-12">
                                <label className="qt-label">Address Line 1</label>
                                <input name="address1" className="qt-input" placeholder="Enter Address" value={formData.address1} onChange={handleChange} />
                            </div>
                            
                            <div className="col-md-4">
                                <label className="qt-label">Status</label>
                                <div className="d-flex gap-4 mt-2">
                                    <div className="form-check m-0 d-flex align-items-center gap-2">
                                        <input type="radio" className="form-check-input" name="status" id="as" value="Active" checked={formData.status === "Active"} onChange={handleChange} />
                                        <label className="form-check-label" htmlFor="as">Active</label>
                                    </div>
                                    <div className="form-check m-0 d-flex align-items-center gap-2">
                                        <input type="radio" className="form-check-input" name="status" id="is" value="Inactive" checked={formData.status === "Inactive"} onChange={handleChange} />
                                        <label className="form-check-label" htmlFor="is">Inactive</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4 gap-3 mb-5">
                    <button className="btn-secondary-custom" onClick={switchToTable}>Cancel</button>
                    <button className="btn-primary-custom" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : (isEditing ? "Update User" : "Create User")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default User;
