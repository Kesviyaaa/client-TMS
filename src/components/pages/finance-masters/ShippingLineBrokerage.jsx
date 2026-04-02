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
import "../../css/finance.css";

const ShippingLineBrokerage = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        shippingLine: "",
        brokerageRate: "",
    });

    /* ───── No Dummy Data ───── */
    const [data] = useState([]);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            shippingLine: "",
            brokerageRate: "",
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /* ───── DataTable Init ───── */
    useEffect(() => {
        if (!tableRef.current) return;
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
            data: data,

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
                    buttons: ["print", "copy", "excel", "pdf"],
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                    columns: ":not(.no-export)",
                },
            ],

            columns: [
                { data: "shippingLine", title: "Shipping Line Name" },
                { data: "brokerageRate", title: "Brokerage Rate" },
                {
                    data: null,
                    title: "Edit",
                    className: "text-center no-export",
                    orderable: false,
                    render: () =>
                        `<div class="d-flex justify-content-center">
                            <i class="bx bx-edit edit-icon text-primary cursor-pointer" style="font-size:18px;"></i>
                        </div>`,
                },
                {
                    data: null,
                    title: "Remove",
                    className: "text-center no-export",
                    orderable: false,
                    render: () =>
                        `<div class="d-flex justify-content-center">
                            <i class="bx bx-trash delete-icon text-danger cursor-pointer" style="font-size:18px;"></i>
                        </div>`,
                }
            ],

            order: [[0, "asc"]],
        });

        setTimeout(() => {
            $(".dt-button").removeClass("btn btn-secondary");
        }, 0);

        /* Edit Handler */
        $(tableRef.current).on("click", ".edit-icon", function () {
            const rowData = dtRef.current.row($(this).parents("tr")).data();
            setFormData({
                shippingLine: rowData.shippingLine,
                brokerageRate: rowData.brokerageRate,
            });
            setEditingId(true);
            setShowModal(true);
        });

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy();
                dtRef.current = null;
            }
        };
    }, [data]);

    return (
        <div className="container-xxl container-p-y pb-5">
            
            <h4 className="table-title mb-4">Shipping Line Brokerage Details</h4>

            <div className="ocean-card">
                <div className="ocean-title">
                    <span className="bk-section-title">
                        <div className="bk-icon-circle"><i className="bx bxs-ship"></i></div> Brokerage List
                    </span>
                    <button className="btn-primary-custom" onClick={() => { setEditingId(null); setShowModal(true); }}>
                        <i className="bx bx-plus"></i> Create Brokerage
                    </button>
                </div>
                <div className="card-datatable p-3">
                    <div className="table-responsive">
                        <table ref={tableRef} className="table dataTable dtr-inline w-100 shadow-none"></table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="custom-modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
                    <div className="custom-modal-card" style={{ maxWidth: "500px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 style={{ color: "#50a9e9", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                                {editingId ? "Edit Shipping Line Brokerage" : "Create Shipping Line Brokerage"}
                            </h5>
                            <button type="button" onClick={handleClose} style={{ background: "none", border: "none", color: "#566a7f", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer", padding: 0 }}>&times;</button>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="qt-label">
                                    Shipping Line Name <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    name="shippingLine"
                                    value={formData.shippingLine}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Shipping Line --</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="qt-label">Brokerage Rate</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="number"
                                        name="brokerageRate"
                                        className="form-control"
                                        value={formData.brokerageRate}
                                        onChange={handleChange}
                                    />
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#697a8d" }}>%</span>
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px dashed #d9dee3", margin: "1.25rem -24px" }} />

                        <div className="d-flex justify-content-end gap-3">
                            <button className="btn-secondary-custom" onClick={handleClose}>
                                Cancel
                            </button>
                            <button className="btn-primary-custom" onClick={() => { handleClose(); }}>
                                {editingId ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingLineBrokerage;