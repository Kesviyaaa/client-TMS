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

const DocumentTypes = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [view, setView] = useState(initialView);

    /* ───── Static Data ───── */
    const [documentTypes] = useState([
        { name: "Trip", applicable: false, default: false },
        { name: "Revenue Debit Note", applicable: false, default: false },
        { name: "Revenue Credit Note", applicable: false, default: false },
        { name: "Purchase", applicable: false, default: false },
        { name: "Invoice", applicable: false, default: false },
        { name: "Freight - Sea Import Shipment", applicable: false, default: false },
        { name: "Freight - Sea Import Consol", applicable: false, default: false },
        { name: "Freight - Sea Export Shipment", applicable: false, default: false },
        { name: "Freight - Sea Export Consol", applicable: false, default: false },
        { name: "Freight - Sea Domestic Shipment", applicable: false, default: false },
    ]);

    /* ───── Switch View ───── */
    const switchToForm = () => {
        if (dtRef.current) {
            dtRef.current.destroy();
            dtRef.current = null;
        }
        setView("form");
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;
        if (dtRef.current) return;

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3 mb-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "<'row px-3'<'col-sm-12'tr>>" +
                "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",

            responsive: true,
            scrollY: "400px",
            scrollCollapse: true,
            paging: true,
            data: documentTypes,

            language: {
                lengthMenu: "Show _MENU_ entries",
                search: "Search:",
                emptyTable: "No data available in table",
            },

            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: [
                        { extend: "print", text: "Print", exportOptions: { columns: ":visible" } },
                        { extend: "copy", text: "Copy", exportOptions: { columns: ":visible" } },
                        { extend: "excel", text: "Excel", exportOptions: { columns: ":visible" } },
                        { extend: "pdf", text: "PDF", exportOptions: { columns: ":visible" } },
                    ],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                },
            ],

            columns: [
                {
                    data: "name",
                    title: "Document Type",
                    responsivePriority: 1,
                },
                {
                    data: "applicable",
                    title: "Is Applicable",
                    className: "text-center",
                    render: (data) =>
                        `<input type="checkbox" ${data ? "checked" : ""} disabled />`,
                },
                {
                    data: "default",
                    title: "Is Default",
                    className: "text-center",
                    render: (data) =>
                        `<input type="checkbox" ${data ? "checked" : ""} disabled />`,
                },
            ],

            order: [[0, "asc"]],
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
    }, [view, documentTypes]);

    /* ═══════════════════════════════════════
       TABLE VIEW
    ═══════════════════════════════════════ */
    if (view === "table") {
        return (
            <div className="container-xxl flex-grow-1 container-p-y pb-5">

                <div className="card">
                    <div className="datatable-toolbar d-flex justify-content-between align-items-start p-3">
                        <div className="title-section">
                            <h5 className="table-title">Document Types</h5>
                        </div>

                        {/* ✅ CREATE BUTTON TOP RIGHT */}
                        <button
                            className="btn-add-record btn-primary-custom"
                            onClick={switchToForm}
                        >
                            <i className="bx bx-plus"></i> Create
                        </button>
                    </div>

                    <div className="card-datatable p-3">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100">
                            <thead>
                                <tr>
                                    <th>Document Type</th>
                                    <th>Is Applicable</th>
                                    <th>Is Default</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════
       FORM VIEW (CREATE)
    ═══════════════════════════════════════ */
    return (
        <></>
    );
};

export default DocumentTypes;