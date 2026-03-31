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

const AirlineCommission = () => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        airlineName: "",
        airlineCode: "",
        commission: "",
    });

    /* ───── Static Data ───── */
    const [data] = useState([
        { airlineName: "Emirates", airlineCode: "EK", commission: "5%" },
        { airlineName: "Qatar Airways", airlineCode: "QR", commission: "6%" },
    ]);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            airlineName: "",
            airlineCode: "",
            commission: "",
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
                { data: "airlineName", title: "Airline Name" },
                { data: "airlineCode", title: "Airline Code" },
                { data: "commission", title: "Airline Commission" },
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
                airlineName: rowData.airlineName,
                airlineCode: rowData.airlineCode,
                commission: rowData.commission,
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
        <div className="container-xxl flex-grow-1 container-p-y pb-5">
            <style>{`
                /* Custom Modal Standardization */
                .custom-modal-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(2px);
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
            `}</style>
            <div className="card">
                <div className="datatable-toolbar d-flex justify-content-between align-items-start p-3">
                    <div className="title-section">
                        <h5 className="table-title">Airline Commission Details</h5>
                    </div>
                    <button
                        className="btn-add-record btn-primary-custom"
                        onClick={() => {
                            setEditingId(null);
                            setShowModal(true);
                        }}
                    >
                        <i className="bx bx-plus"></i> Create
                    </button>
                </div>

                <div className="card-datatable p-3">
                    <table ref={tableRef} className="table dataTable dtr-inline w-100"></table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="custom-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
                    <div className="custom-modal-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="modal-title-custom">
                                {editingId ? "Edit Airline Commission" : "Create Airline Commission"}
                            </h5>
                            <button type="button" className="modal-close-btn" onClick={handleClose}>&times;</button>
                        </div>

                        <hr className="modal-divider" />

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="qt-label">Airline Name</label>
                                <select
                                    className="form-select"
                                    name="airlineName"
                                    value={formData.airlineName}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Airline --</option>
                                    <option>Emirates</option>
                                    <option>Qatar Airways</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="qt-label">Airline Code</label>
                                <input
                                    type="text"
                                    name="airlineCode"
                                    className="form-control"
                                    value={formData.airlineCode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12">
                                <label className="qt-label">Airline Commission</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="number"
                                        name="commission"
                                        className="form-control"
                                        value={formData.commission}
                                        onChange={handleChange}
                                    />
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#697a8d" }}>%</span>
                                </div>
                            </div>
                        </div>

                        <hr className="modal-divider" />

                        <div className="d-flex justify-content-end gap-3">
                            <button className="btn-secondary-custom" onClick={handleClose}>
                                Cancel
                            </button>
                            <button className="btn-primary-custom" onClick={() => { /* save logic */ handleClose(); }}>
                                {editingId ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AirlineCommission;