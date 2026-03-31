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
                dtRef.current.destroy();
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
                
                /* Custom Modal Standardization */
                .custom-modal-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .custom-modal-card {
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0.25rem 1rem rgba(161, 172, 184, 0.45);
                    width: 100%;
                    max-width: 500px;
                    padding: 24px;
                    font-family: 'Public Sans', sans-serif;
                }
                .modal-title-custom {
                    color: #50a9e9;
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin: 0;
                }
                .modal-divider {
                    border: 0;
                    border-top: 1px dashed #d9dee3;
                    margin: 1.25rem -24px;
                }
                .modal-close-btn {
                    background: none;
                    border: none;
                    color: #566a7f;
                    font-size: 1.5rem;
                    line-height: 1;
                    cursor: pointer;
                    padding: 0;
                }
                .qt-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #566a7f;
                    margin-bottom: 6px;
                    display: block;
                }
                .qt-input {
                    font-size: 13px;
                    border: 1px solid #d9dee3;
                    border-radius: 5px;
                    padding: 8px 12px;
                    width: 100%;
                    outline: none;
                    background: #fff;
                    color: #3b4d61;
                }
                .required-mark {
                    color: #ff3e1d;
                }
                .required-mark {
                    color: #ff3e1d;
                }
            `}</style>
            
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
