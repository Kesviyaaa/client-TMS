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

import "../../../App.css";
import "../../css/tracking.css";

const dummyClients = [
    { id: "1", clientName: "Global Trade Co", email: "contact@globaltrade.com", status: "Active", enableTracking: "Yes" },
    { id: "2", clientName: "Pacific Logistics", email: "info@pacificlog.com", status: "Inactive", enableTracking: "No" },
    { id: "3", clientName: "Euro Trans Inc", email: "support@eurotrans.com", status: "Active", enableTracking: "Yes" },
    { id: "4", clientName: "Asiatic Cargo", email: "ops@asiaticargo.com", status: "Active", enableTracking: "No" },
];

const ClientDetails = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    useEffect(() => {
        if (!tableRef.current) return;

        // Clean up existing instance if any
        if (dtRef.current) {
            dtRef.current.destroy(true);
            dtRef.current = null;
        }

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn rounded";

        dtRef.current = $(tableRef.current).DataTable({
            dom: "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                 "t" +
                 "<'d-flex justify-content-between align-items-center px-3 pb-3 mt-3'ip>",
            paging: true,
            responsive: false,
            scrollX: true,
            data: dummyClients,
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn rounded",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible" } },
                        { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible" } },
                        { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible" } },
                        { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible" } },
                    ]
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis rounded",
                    dropIcon: false,
                    columns: ":not(.no-export)"
                }
            ],
            columns: [
                { data: "clientName", title: "Client Name" },
                { data: "email", title: "Email" },
                { 
                    data: "status", 
                    title: "Status",
                    render: (data) => {
                        let badgeClass = "bg-label-success";
                        if (data === "Inactive") badgeClass = "bg-label-secondary";
                        return `<span class="badge ${badgeClass}">${data}</span>`;
                    }
                },
                { 
                    data: "enableTracking", 
                    title: "Enable Tracking",
                    render: (data) => {
                        let badgeClass = data === "Yes" ? "bg-label-info" : "bg-label-warning";
                        return `<span class="badge ${badgeClass}">${data}</span>`;
                    }
                },
                {
                    data: null, 
                    title: "Update",
                    className: "no-export text-center", 
                    orderable: false,
                    render: () => `
                        <div class="d-flex align-items-center justify-content-center">
                            <i class="bx bx-edit text-primary cursor-pointer" title="Update" style="font-size: 18px;"></i>
                        </div>`
                }
            ],
            language: { 
                lengthMenu: "Show _MENU_ Entries",
                search: "Search:"
            }
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
    }, []);

    return (
        <div className="container-xxl container-p-y pb-5">
            
            <h4 className="table-title mb-4">Client Details</h4>

            <div className="ocean-card">
                <div className="ocean-title">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bx-user-circle"></i></div> Client List
                    </span>
                    <button className="btn-primary-custom">
                        <i className="bx bx-plus"></i> Create Client
                    </button>
                </div>
                <div className="card-datatable p-3">
                    <div className="table-responsive">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100 shadow-none">
                            {/* Headers are generated by DataTables title property */}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetails;
