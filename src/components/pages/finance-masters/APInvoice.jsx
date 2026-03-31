import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import { useNavigate } from "react-router-dom";

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

const APInvoice = ({ initialView = "table" }) => {
    const tableRef = useRef(null);
    const dtRef = useRef(null);
    const navigate = useNavigate();

    const [view, setView] = useState(initialView);
    const [data, setData] = useState([]);

    const [openSections, setOpenSections] = useState({
        basic: true, bank: true, charges: true
    });

    const [chargeRows, setChargeRows] = useState([
        { id: Date.now(), type: "", vatType: "", vatPct: "", currency: "", amount: "", notes: "" }
    ]);

    const [formData, setFormData] = useState({
        payToType: "",
        vendor: "",
        vendorAddress: "",
        registerDate: "",
        paymentMethod: "",
        isUrgent: false,
        paymentAmount: "0.00",
        rate: "",
        exchangeRate: "",
        branch: "",
        againstSelect: "",
        againstType: "Job Expenses",
        referenceNo: "",
        refDate: "",
        notes: "",
        jobType: "",
        shipmentType: "",
        shipmentNo: "",
        bankAmount: "",
        paymentRef: "",
        bankCode: "",
        bankCurrency: "",
        valueDate: "",
        account: ""
    });

    useEffect(() => {
        if (view !== "table" || !tableRef.current) return;

        if (dtRef.current) {
            dtRef.current.destroy(true);
            dtRef.current = null;
        }

        $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

        dtRef.current = $(tableRef.current).DataTable({
            dom:
                "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
                "t" +
                "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

            data: data,
            responsive: true,
            pageLength: 10,
            buttons: [
                {
                    extend: "collection",
                    text: '<i class="bx bx-export"></i> Export',
                    className: "export-btn",
                    autoClose: true,
                    dropIcon: false,
                    buttons: ["print", "copy", "excel", "pdf"]
                },
                {
                    extend: "colvis",
                    text: '<i class="bx bx-columns"></i> Customise Columns',
                    className: "custom-colvis",
                    dropIcon: false,
                    columns: ":not(.no-export)"
                }
            ],
            columns: [
                { data: "invoiceNo", title: "Invoice #" },
                { data: "vendor", title: "Vendor" },
                { data: "branch", title: "Branch" },
                { data: "registerDate", title: "Date" },
                { data: "amount", title: "Amount" },
                { data: "paymentMethod", title: "Method" },
                { data: "shipment", title: "Shipment" },
                {
                    data: null,
                    title: "Edit",
                    className: "text-center no-export",
                    orderable: false,
                    render: () => `<i class="bx bx-edit text-primary cursor-pointer edit-icon" style="font-size: 18px;"></i>`
                },
                {
                    data: null,
                    title: "Remove",
                    className: "text-center no-export",
                    orderable: false,
                    render: () => `<i class="bx bx-trash text-danger cursor-pointer delete-icon" style="font-size: 18px;"></i>`
                }
            ]
        });

        setTimeout(() => $(".dt-button").removeClass("btn btn-secondary"), 0);

        return () => {
            if (dtRef.current) {
                dtRef.current.destroy(true);
                dtRef.current = null;
            }
        };
    }, [view, data]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const switchToForm = () => {
        setView("form");
        navigate("/finance-masters/accounts/ap-invoice/create");
    };

    const switchToTable = () => {
        setView("table");
        navigate("/finance-masters/accounts/ap-invoice");
    };

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
                `}</style>
                <h4 className="table-title mb-4">AP Invoice</h4>
                <div className="ocean-card">
                    <div className="ocean-title">
                        <span className="bk-section-title">
                            <div className="bk-icon-circle"><i className="bx bx-receipt"></i></div> Accounts Payable Invoices
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
                .charge-head {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 2fr 50px;
                    gap: 10px;
                    padding: 10px;
                    background: #eef1f4;
                    font-weight: 700;
                    font-size: 11px;
                    color: #566a7f;
                    border-radius: 4px;
                }
                .charge-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 2fr 50px;
                    gap: 10px;
                    padding: 8px 10px;
                    border-bottom: 1px solid #f0f2f4;
                    align-items: center;
                }
                .total-card {
                    width: 300px;
                    margin-left: auto;
                    margin-top: 15px;
                    border: 1px solid #d9dee3;
                }
                .total-line {
                    display: flex;
                    border-bottom: 1px solid #d9dee3;
                    font-size: 12px;
                    font-weight: 600;
                }
                .total-line:last-child {
                    border-bottom: none;
                }
                .total-label {
                    flex: 1;
                    padding: 8px 12px;
                    color: #566a7f;
                    border-right: 1px solid #d9dee3;
                }
                .total-value {
                    width: 120px;
                    padding: 8px 12px;
                    text-align: right;
                    color: #50a9e9;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="bk-form-heading mb-0">Accounts Payable Invoice</h5>
                <button className="btn-secondary-custom" onClick={switchToTable}>
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                </button>
            </div>

            <div className="bk-form-wrapper">

                {/* BASIC DETAILS */}
                <div className="bk-section-card">
                    <div className="bk-section-header" onClick={() => toggleSection("basic")} style={{ cursor: "pointer" }}>
                        <span className="bk-section-title">
                            <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-info-circle"></i></div> Basic Details
                        </span>
                        <i className={`bx ${openSections.basic ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                    </div>
                    {openSections.basic && (
                        <div className="bk-section-body">
                            <div className="row g-3">
                                <div className="col-md-3"><label className="qt-label">Pay To</label><select className="qt-input" name="payToType" value={formData.payToType} onChange={handleFormChange}><option value="">-- Select Type --</option></select></div>
                                <div className="col-md-3"><label className="qt-label">Vendor</label><select className="qt-input" name="vendor" value={formData.vendor} onChange={handleFormChange}><option value="">-- Select Vendor --</option></select></div>
                                <div className="col-md-3"><label className="qt-label">Vendor Address</label><textarea className="qt-input" name="vendorAddress" value={formData.vendorAddress} onChange={handleFormChange} rows="1" style={{ height: "35px" }}></textarea></div>
                                <div className="col-md-3"><label className="qt-label">Register Date</label><input type="date" className="qt-input" name="registerDate" value={formData.registerDate} onChange={handleFormChange} /></div>

                                <div className="col-md-3">
                                    <label className="qt-label">Payment Method</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <select className="qt-input" name="paymentMethod" value={formData.paymentMethod} onChange={handleFormChange}><option value="">-- Select Method --</option></select>
                                        <div className="form-check m-0 d-flex align-items-center gap-1">
                                            <input className="form-check-input" type="checkbox" name="isUrgent" checked={formData.isUrgent} onChange={handleFormChange} style={{ transform: "scale(0.8)" }} />
                                            <span style={{ fontSize: "11px", whiteSpace: "nowrap", fontWeight: 600 }}>Urgent</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3"><label className="qt-label">Amount</label><input className="qt-input" name="paymentAmount" value={formData.paymentAmount} onChange={handleFormChange} /></div>
                                <div className="col-md-3"><label className="qt-label">Rate</label><select className="qt-input"><option value="">-- Select Rate --</option></select></div>
                                <div className="col-md-3"><label className="qt-label">Ex Rate</label><input className="qt-input" placeholder="1.00" /></div>

                                <div className="col-md-3"><label className="qt-label">Branch</label><select className="qt-input"><option value="">-- Select Branch --</option></select></div>
                                <div className="col-md-6">
                                    <label className="qt-label">Against</label>
                                    <div className="d-flex gap-3 align-items-center">
                                        <select className="qt-input" style={{ width: "200px" }}><option value="">-- Select --</option></select>
                                        <div className="d-flex gap-3 pt-1">
                                            <div className="form-check"><input className="form-check-input" type="radio" name="againstType" checked={formData.againstType === "Job Expenses"} onChange={() => setFormData({ ...formData, againstType: "Job Expenses" })} /><label className="form-check-label" style={{ fontSize: "12px" }}>Job</label></div>
                                            <div className="form-check"><input className="form-check-input" type="radio" name="againstType" checked={formData.againstType === "Non Job Expenses"} onChange={() => setFormData({ ...formData, againstType: "Non Job Expenses" })} /><label className="form-check-label" style={{ fontSize: "12px" }}>Non-Job</label></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="row g-2">
                                        <div className="col-6"><label className="qt-label">Ref No</label><input className="qt-input" /></div>
                                        <div className="col-6"><label className="qt-label">Date</label><input type="date" className="qt-input" /></div>
                                    </div>
                                </div>

                                {/* COMPACT JOB NO & NOTES ROW */}
                                <div className="col-12 mt-2">
                                    <div className="row g-2 align-items-end">
                                        <div className="col-md-2">
                                            <label className="qt-label">Job No</label>
                                            <select className="qt-input"><option>Select Type</option></select>
                                        </div>
                                        <div className="col-md-2">
                                            <select className="qt-input"><option>Select Shipment</option></select>
                                        </div>
                                        <div className="col-md-3">
                                            <select className="qt-input"><option>Select No</option></select>
                                        </div>
                                        <div className="col-md-5">
                                            <label className="qt-label">Notes</label>
                                            <input className="qt-input" placeholder="Notes" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* BANK TRANSFER DETAILS */}
                <div className="bk-section-card">
                    <div className="bk-section-header" onClick={() => toggleSection("bank")} style={{ cursor: "pointer" }}>
                        <span className="bk-section-title">
                            <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-building-house"></i></div> Bank Transfer Details
                        </span>
                        <i className={`bx ${openSections.bank ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                    </div>
                    {openSections.bank && (
                        <div className="bk-section-body">
                            <div className="row g-3">
                                <div className="col-md-2"><label className="qt-label">Bank Amount</label><input className="qt-input" name="bankAmount" /></div>
                                <div className="col-md-3"><label className="qt-label">Payment Ref</label><input className="qt-input" name="paymentRef" /></div>
                                <div className="col-md-2"><label className="qt-label">Bank Code</label><input className="qt-input" name="bankCode" /></div>
                                <div className="col-md-2"><label className="qt-label">Bank Currency Code</label><input className="qt-input" name="bankCurrency" /></div>
                                <div className="col-md-3"><label className="qt-label">Value Date (dd/mm/yyyy)</label><input className="qt-input" placeholder="dd/mm/yyyy" name="valueDate" /></div>
                                <div className="col-md-12"><label className="qt-label">Account</label><input className="qt-input" name="account" /></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CHARGE DETAILS */}
                <div className="bk-section-card">
                    <div className="bk-section-header" onClick={() => toggleSection("charges")} style={{ cursor: "pointer" }}>
                        <div className="d-flex align-items-center gap-3">
                            <span className="bk-section-title" style={{ marginBottom: 0 }}>
                                <div className="bk-icon-circle" style={{ color: "#50a9e9" }}><i className="bx bx-dollar-circle"></i></div> Charge Details
                            </span>
                            <button className="btn-primary-custom" style={{ height: "32px", padding: "0 15px", fontSize: "12px" }} onClick={(e) => { e.stopPropagation(); setChargeRows([...chargeRows, { id: Date.now() }]); }}>+ Add Row</button>
                        </div>
                        <i className={`bx ${openSections.charges ? "bx-chevron-up" : "bx-chevron-down"}`} style={{ fontSize: "1.2rem", color: "#a1acb8" }}></i>
                    </div>
                    {openSections.charges && (
                        <div className="bk-section-body">
                            <div className="charge-head">
                                <div>Type</div><div>VAT Type</div><div>VAT %</div><div>Curr</div><div>Amount</div><div>Notes</div><div>X</div>
                            </div>
                            {chargeRows.map((row) => (
                                <div className="charge-row" key={row.id}>
                                    <select className="qt-input"><option value="">--Select--</option></select>
                                    <input className="qt-input" />
                                    <input className="qt-input" />
                                    <select className="qt-input"><option value="">--Select--</option></select>
                                    <input className="qt-input" />
                                    <input className="qt-input" />
                                    <button className="btn btn-danger btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px", borderRadius: "4px" }} onClick={() => setChargeRows(chargeRows.filter(r => r.id !== row.id))}>×</button>
                                </div>
                            ))}

                            <div className="total-card">
                                <div className="total-line"><div className="total-label">Subtotal</div><div className="total-value">0.00</div></div>
                                <div className="total-line"><div className="total-label">VAT Total</div><div className="total-value">0.00</div></div>
                                <div className="total-line" style={{ background: "#fdfdfd" }}><div className="total-label">Net Total</div><div className="total-value" style={{ color: "#28a745" }}>0.00</div></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER BUTTONS */}
                <div className="d-flex justify-content-end gap-3 mt-4 mb-5">
                    <button className="btn-secondary-custom" onClick={switchToTable}>Cancel</button>
                    <button className="btn-primary-custom">Save</button>
                </div>
            </div>
        </div>
    );
};

export default APInvoice;