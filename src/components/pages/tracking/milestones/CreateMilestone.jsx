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

import "../../../../App.css";
import "../../../css/tracking.css";

/* ───── Dummy Data ───── */
const dummyMilestones = [
    { _id: "1", department: "Air Export", milestoneName: "Booking Confirmation", departmentType: "Air" },
    { _id: "2", department: "Ocean Import", milestoneName: "Vessel Arrival", departmentType: "Ocean" },
    { _id: "3", department: "Air Import", milestoneName: "Customs Clearance", departmentType: "Air" },
    { _id: "4", department: "Ocean Export", milestoneName: "Gate In", departmentType: "Ocean" }
];

const CreateMilestone = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState("table"); // "table" | "form"
    const [milestones, setMilestones] = useState(dummyMilestones);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;

        // Clean up existing instance if any
        if (dtRef.current) {
            dtRef.current.destroy(true);
            dtRef.current = null;
        }

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
            paging: true,
            responsive: true,
            data: milestones,
            language: {
                lengthMenu: "Show _MENU_ Entries",
                search: "Search:",
                emptyTable: "No data available in table",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
            },
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn rounded-3",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
                        { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
                        { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
                        { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
                    ]
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis rounded-3",
                    dropIcon: false,
                    columns: ":not(.no-export)"
                }
            ],
            columns: [
                { data: "department", title: "DEPARTMENT" },
                { data: "milestoneName", title: "MILESTONES NAME" },
                { data: "departmentType", title: "DEPARTMENT TYPE" },
                {
                    data: null,
                    title: "EDIT",
                    className: "no-export text-center",
                    orderable: false,
                    render: (data) => `
                        <div class="d-flex align-items-center justify-content-center gap-3">
                            <i class="bx bx-edit edit-icon text-primary cursor-pointer" data-id="${data._id}" title="Edit" style="font-size: 18px; color: #50A9E9 !important;"></i>
                            <i class="bx bx-trash delete-icon text-danger cursor-pointer" data-id="${data._id}" title="Delete" style="font-size: 18px;"></i>
                        </div>`
                }
            ]
        });

        // Event listeners (DataTable way)
        $(tableRef.current).on("click", ".delete-icon", function () {
            const id = $(this).data("id");
            setDeleteId(id);
            setShowDeleteModal(true);
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
            $(".dt-buttons").removeClass("btn-group");
        }, 0);

        return () => {
            if (dtRef.current) dtRef.current.destroy();
        };
    }, [view, milestones]);

    const handleDeleteConfirm = () => {
        setMilestones(prev => prev.filter(m => m._id !== deleteId));
        setShowDeleteModal(false);
    };

    if (view === "form") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Create Milestone</h5>
                        <button className="btn btn-secondary-custom" onClick={() => setView("table")}>Back to List</button>
                    </div>
                    <div className="card-body p-4">
                        <p className="text-muted">Form content for creating a milestone would go here...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-xxl container-p-y pb-5">
            
            <h4 className="table-title mb-4">Milestones Details</h4>

            <div className="ocean-card">
                <div className="ocean-title">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-flag"></i></div> Milestone List
                    </span>
                    <button className="btn-primary-custom" onClick={(e) => e.preventDefault()}>
                        <i className="bx bx-plus"></i> Create Milestone
                    </button>
                </div>

                <div className="card-datatable p-3">
                    <div className="table-responsive">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100 shadow-none">
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="custom-modal-backdrop">
                    <div className="custom-modal-card">
                        <div className="text-center p-4">
                            <i className="bx bx-error-circle text-warning border-0 mb-3" style={{ fontSize: "5rem" }}></i>
                            <h4 className="mb-2">Are you sure?</h4>
                            <p className="text-muted mb-4">You want to delete this milestone? This action cannot be undone.</p>
                            <div className="d-flex justify-content-center gap-3">
                                <button
                                    className="btn btn-secondary-custom"
                                    style={{ background: "#e1e3e5", border: "none", color: "#566a7f", padding: "8px 20px", borderRadius: "6px" }}
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ padding: "8px 20px", borderRadius: "6px" }}
                                    onClick={handleDeleteConfirm}
                                >
                                    Yes, Delete it!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateMilestone;
