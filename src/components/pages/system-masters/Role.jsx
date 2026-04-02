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

import "../../css/system.css";

const Role = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [roles, setRoles] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        roleName: "",
        moduleName: "",
        description: ""
    });

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (!tableRef.current) return;
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

            data: roles,

            language: {
                lengthMenu: "Show _MENU_ Entries",
                search: "Search:",
                emptyTable: "No Roles Available"
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
                { data: "roleName", title: "Role Name" },
                { data: "description", title: "Description" },
                { data: "createdOn", title: "Created On" },
                {
                    data: null,
                    title: "Edit",
                    orderable: false,
                    searchable: false,
                    render: () =>
                        `<div class="text-center"><button class="btn btn-primary btn-sm" style="font-size:12px; height: 28px; padding: 0 10px;">Edit</button></div>`
                },
                {
                    data: null,
                    title: "Remove",
                    orderable: false,
                    searchable: false,
                    render: () =>
                        `<div class="text-center"><button class="btn btn-danger btn-sm" style="font-size:12px; height: 28px; padding: 0 10px; background-color: #ff4d4f; border-color: #ff4d4f;">Remove</button></div>`
                }
            ]
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy(true);
                dtRef.current = null;
            }
        };
    }, [roles]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Validation logic or save logic here
        setShowModal(false);
        setFormData({ roleName: "", moduleName: "", description: "" });
    };

    return (
        <div className="container-xxl container-p-y pb-5">
            <h4 className="table-title mb-4">Roles</h4>

            <div className="ocean-card">
                <div className="ocean-title">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-id-card"></i></div> Role Details
                    </span>

                    <button className="btn-add-record btn-primary-custom" onClick={() => setShowModal(true)}>
                        <i className="bx bx-plus"></i> Create
                    </button>
                </div>

                <div className="card-datatable p-3">
                    <table ref={tableRef} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* Custom Modal */}
            {showModal && (
                <div className="custom-modal-backdrop" onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="custom-modal-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="modal-title-custom">Create Role</h5>
                            <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        <hr className="modal-divider" />
                        
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="qt-label">Role Name <span className="required-mark">*</span></label>
                                <input 
                                    name="roleName" 
                                    className="qt-input" 
                                    placeholder="Enter Role Name" 
                                    value={formData.roleName} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="col-12">
                                <label className="qt-label">Module Name</label>
                                <textarea 
                                    name="moduleName" 
                                    className="qt-input" 
                                    rows="2" 
                                    placeholder="Enter Module Name"
                                    value={formData.moduleName} 
                                    onChange={handleChange} 
                                ></textarea>
                            </div>
                            <div className="col-12">
                                <label className="qt-label">Description</label>
                                <textarea 
                                    name="description" 
                                    className="qt-input" 
                                    rows="2" 
                                    placeholder="Enter Description"
                                    value={formData.description} 
                                    onChange={handleChange} 
                                ></textarea>
                            </div>
                        </div>
                        
                        <hr className="modal-divider" style={{ marginBottom: "1.25rem", marginTop: "1.25rem" }} />
                        
                        <div className="d-flex justify-content-end gap-3">
                            <button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary-custom" onClick={handleSave}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Role;
