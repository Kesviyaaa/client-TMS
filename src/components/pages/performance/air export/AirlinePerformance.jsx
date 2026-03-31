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
import "../../../css/performance.css";

// ───── Bracket Wrapper Component ─────
const BracketCard = ({ children, className = "", style = {} }) => (
  <div className={`bracket-card ${className}`} style={style}>
    <div className="br-tl"></div>
    <div className="br-tr"></div>
    <div className="br-bl"></div>
    <div className="br-br"></div>
    {children}
  </div>
);

// ───── AirlineTable Component ─────
const AirlineTable = ({ title }) => {
  const tableRef = useRef(null);
  const dtRef = useRef(null);
  const [viewMode, setViewMode] = useState("table"); // 'table', 'chart'

  useEffect(() => {
    if (viewMode === "chart" || !tableRef.current) return;
    if (dtRef.current) {
        dtRef.current.destroy();
        dtRef.current = null;
    }

    $.fn.dataTable.ext.errMode = "none";
    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    dtRef.current = $(tableRef.current).DataTable({
      dom:
        "<'row align-items-center px-4 pt-3 mb-2'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "<'row px-3'<'col-sm-12'tr>>" +
        "<'row align-items-center px-4 pb-4 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
      responsive: false,
      scrollX: true,
      scrollCollapse: true,
      language: {
        lengthMenu: "Show _MENU_ Entries",
        emptyTable: "No data available in table",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        infoEmpty: "Showing 0 to 0 of 0 entries",
        search: "Search:",
        searchPlaceholder: "Search...",
      },
      buttons: [
        {
          extend: "collection",
          text: '<i class="bx bx-export"></i> Export',
          className: "export-btn",
          autoClose: true,
          dropIcon: false,
          buttons: [
            { extend: "print", text: '<i class="bx bx-printer"></i> Print', className: "dropdown-item", exportOptions: { columns: ":visible" } },
            { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', className: "dropdown-item", exportOptions: { columns: ":visible" } },
            { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', className: "dropdown-item", exportOptions: { columns: ":visible" } },
            { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', className: "dropdown-item", exportOptions: { columns: ":visible" } },
          ],
        },
        {
          extend: "colvis",
          text: '<i class="bx bx-columns"></i> Customise Columns',
          className: "custom-colvis ms-2",
          dropIcon: false,
          columns: ":visible",
        },
      ],
      data: [],
      columns: [
        { data: "airline", title: "Airline", defaultContent: "" },
        { data: "noOfShipments", title: "NO.Of.Shipments", defaultContent: "" },
        { data: "chargeableWeight", title: "Chargeable Weight(in Kgs)", defaultContent: "" },
      ],
      pagingType: "simple",
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
  }, [viewMode]);

  return (
    <BracketCard className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-0 pe-3">
        <h6 className="fw-bold m-0 text-heading text-uppercase">{title}</h6>
        <div className="d-flex gap-2">
            <div 
              onClick={() => setViewMode("table")}
              className={`view-toggle-btn ${viewMode === "table" ? "active" : "inactive"}`}>
              <i className="bx bx-table fs-5"></i>
            </div>
            <div 
              onClick={() => setViewMode("chart")}
              className={`view-toggle-btn ${viewMode === "chart" ? "active" : "inactive"}`}>
              <i className="bx bx-bar-chart-alt-2 fs-5"></i>
            </div>
        </div>
      </div>

      {/* Table View */}
      <div style={{ display: viewMode === "table" ? "block" : "none" }} className="card-datatable pb-1">
        <table ref={tableRef} className="table dataTable dtr-inline w-100">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>

      {/* Chart View */}
      <div style={{ display: viewMode === "chart" ? "flex" : "none", height: "300px", alignItems: "center", justifyContent: "center" }} className="mt-2 pt-3">
        <p className="text-muted">No visualization available</p>
      </div>

    </BracketCard>
  );
};

// ───── Main Component ─────
const AirlinePerformance = () => {
  return (
    <div className="container-xxl flex-grow-1 container-p-y pb-5">
      {/* ───── HEADER ───── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="perf-header-title text-uppercase">
          <span className="text-muted pe-1">DASHBOARD</span> <span className="perf-air-export">AIRLINE</span>
        </h5>
        
        <div className="d-flex align-items-center gap-3">
           <select className="header-filter-input" style={{ width: "240px", height: "38px" }}>
              <option value=""></option>
           </select>
           <div className="d-flex align-items-center border rounded overflow-hidden shadow-sm bg-white">
              <input type="text" className="border-0 px-2 py-2 text-center text-muted small" style={{ width: "110px", outline: 'none' }} defaultValue="dd/mm/yyyy" />
              <div className="bg-light border-start border-end px-3 py-2 text-muted fw-bold small">To</div>
              <input type="text" className="border-0 px-2 py-2 text-center text-muted small" style={{ width: "110px", outline: 'none' }} defaultValue="dd/mm/yyyy" />
           </div>
        </div>
      </div>

      <div className="mt-2">
         <AirlineTable title="Airline Register" />
      </div>

    </div>
  );
};

export default AirlinePerformance;
