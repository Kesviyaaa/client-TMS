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

// ───── SubTable Component ─────
const SubTable = ({ title }) => {
  const tableRef = useRef(null);
  const dtRef = useRef(null);
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    if (!tableRef.current) return;
    if (dtRef.current) return;

    $.fn.dataTable.ext.errMode = "none";
    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    dtRef.current = $(tableRef.current).DataTable({
      dom:
        "<'d-flex align-items-center justify-content-between px-3 pt-3 mb-2 flex-nowrap gap-2' B l f>" +
        "<'row px-3'<'col-sm-12'tr>>" +
        "<'row align-items-center px-3 pb-3 mt-2'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
      responsive: false,
      scrollY: "200px",
      scrollCollapse: true,
      language: {
        lengthMenu: "_MENU_",
        emptyTable: "No data available in table",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        infoEmpty: "Showing 0 to 0 of 0 entries",
        search: "",
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
            { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
          ],
        },
        {
          extend: "colvis",
          text: '<i class="bx bx-columns"></i> Columns',
          className: "custom-colvis",
          columns: ":not(.no-export)",
          dropIcon: false,
        },
      ],
      data: [],
      columns: [
        { data: "title", title: title, defaultContent: "" },
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
  }, [title, viewMode]);

  return (
    <BracketCard className="h-100 p-0">
      <div className="d-flex justify-content-between align-items-center mb-0 px-3 pt-3">
        <h6 className="fw-bold m-0 text-heading">{title}</h6>
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
      
      <div style={{ display: viewMode === "table" ? "block" : "none" }} className="card-datatable pb-1">
        <table ref={tableRef} className="table dataTable dtr-inline w-100">
          <thead></thead>
        </table>
      </div>
      <div style={{ display: viewMode === "chart" ? "flex" : "none", height: "150px", alignItems: "center", justifyContent: "center" }}>
        <p className="text-muted small">No chart data available</p>
      </div>
    </BracketCard>
  );
};

// ───── Main Dashboard Component ─────
const AirImportDashboard = () => {
  const mainTableRef = useRef(null);
  const mainDtRef = useRef(null);
  const [mainViewMode, setMainViewMode] = useState("table");
  const [activeTab, setActiveTab] = useState("Agent Nomination");

  useEffect(() => {
    if (!mainTableRef.current) return;
    if (mainDtRef.current) return;

    $.fn.dataTable.ext.errMode = "none";
    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    mainDtRef.current = $(mainTableRef.current).DataTable({
      dom:
        "<'row align-items-center px-3 mb-2 pt-3'<'col-md-6 d-flex gap-2'B><'col-md-6 d-flex align-items-center justify-content-lg-end justify-content-start gap-3 flex-wrap'lf>>" +
        "<'row px-3'<'col-sm-12'tr>>" +
        "<'row align-items-center px-3 pb-3 mt-3'<'col-md-5'i><'col-md-7 d-flex justify-content-end'p>>",
      responsive: false,
      scrollX: true,
      scrollY: "250px",
      scrollCollapse: true,
      language: {
        lengthMenu: "Show _MENU_ entries",
        emptyTable: "No data available in table",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        infoEmpty: "Showing 0 to 0 of 0 entries",
        search: "Search:",
      },
      buttons: [
        {
          extend: "collection",
          text: '<i class="bx bx-export"></i> Export',
          className: "export-btn",
          autoClose: true,
          dropIcon: false,
          buttons: [
            { extend: "print", text: '<i class="bx bx-printer"></i> Print', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "copy", text: '<i class="bx bx-copy"></i> Copy', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "excel", text: '<i class="bx bx-spreadsheet"></i> Excel', exportOptions: { columns: ":visible:not(.no-export)" } },
            { extend: "pdf", text: '<i class="bx bx-file"></i> PDF', exportOptions: { columns: ":visible:not(.no-export)" } },
          ],
        },
        {
          extend: "colvis",
          text: '<i class="bx bx-columns"></i> Columns',
          className: "custom-colvis",
          columns: ":not(.no-export)",
          dropIcon: false,
        },
      ],
      data: [],
      columns: [
        { data: "customerName", title: "Customer Name", defaultContent: "" },
        { data: "noOfShipments", title: "No.Of.Shipments", defaultContent: "" },
        { data: "chargeableWeight", title: "Chargeable Weight(in Kgs)", defaultContent: "" },
      ],
      pagingType: "simple",
    });

    setTimeout(() => {
      $(".dt-button").removeClass("btn btn-secondary");
    }, 0);

    return () => {
      if (mainDtRef.current) {
        mainDtRef.current.destroy();
        mainDtRef.current = null;
      }
    };
  }, [mainViewMode, activeTab]);

  return (
    <div className="container-xxl flex-grow-1 container-p-y pb-5">
      {/* ───── HEADER ───── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="perf-header-title text-uppercase">
          <span className="text-muted pe-1">DASHBOARD</span> <span className="perf-air-import">AIR IMPORT</span>
        </h5>
        
        <div className="d-flex align-items-center gap-3">
           <select className="header-filter-input" style={{ width: "150px" }}>
              <option value=""></option>
           </select>
           <div className="d-flex align-items-center gap-2">
              <input type="date" className="header-filter-input" />
              <span className="text-muted small">To</span>
              <input type="date" className="header-filter-input" />
           </div>
        </div>
      </div>

      {/* ───── KPI ROW ───── */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
           <BracketCard className="p-3 h-100">
              <div className="kpi-title">NO OF SHIPMENTS</div>
              <div className="kpi-text">
                 <i className="bx bx-user text-secondary"></i>
                 <span>Total Chargeable Weight(in Kgs)</span>
              </div>
           </BracketCard>
        </div>
        <div className="col-md-3">
           <BracketCard className="p-3 h-100">
              <div className="kpi-title">NO OF JOB OWNERS</div>
              <div className="kpi-text"><i className="bx bx-user text-secondary"></i> Last month performer</div>
              <div className="kpi-text"><i className="bx bx-box text-secondary"></i> Total Chargeable Weight(in Kgs)</div>
           </BracketCard>
        </div>
        <div className="col-md-3">
           <BracketCard className="p-3 h-100">
              <div className="kpi-title">NO OF CLIENTS</div>
              <div className="kpi-text"><i className="bx bx-ship text-secondary"></i> Last month performer</div>
              <div className="kpi-text"><i className="bx bx-menu text-secondary"></i> Total Chargeable Weight(in Kgs)</div>
           </BracketCard>
        </div>
        <div className="col-md-3">
           <BracketCard className="p-3 h-100">
              <div className="kpi-title">TYPE OF BUSINESS</div>
              <div className="kpi-text"><i className="bx bx-chevron-up text-secondary"></i> Total Agent Nomination :</div>
              <div className="kpi-text"><i className="bx bx-columns text-secondary"></i> Total Free Hand :</div>
              <div className="kpi-text"><i className="bx bx-buildings text-secondary"></i> Total SubAgent :</div>
           </BracketCard>
        </div>
      </div>

      {/* ───── MAIN TABLE ───── */}
      <BracketCard className="mb-4">
         {/* Tabs Row */}
         <div className="d-flex justify-content-around align-items-center pt-3 mb-2 border-bottom mx-3">
            {["Agent Nomination", "Free Hand", "Sub Agent"].map((tab) => (
              <div 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`perf-tab width-33 ${activeTab === tab ? "active" : "inactive"}`}>
                 {tab}
              </div>
            ))}
         </div>
         
         <div className="d-flex justify-content-end px-4 mt-3 pb-2 gap-2">
            <div 
               onClick={() => setMainViewMode("table")}
               className={`view-toggle-btn ${mainViewMode === "table" ? "active" : "inactive"}`}>
               <i className="bx bx-table fs-5"></i>
            </div>
            <div 
               onClick={() => setMainViewMode("chart")}
               className={`view-toggle-btn ${mainViewMode === "chart" ? "active" : "inactive"}`}>
               <i className="bx bx-bar-chart-alt-2 fs-5"></i>
            </div>
         </div>

         <div style={{ display: mainViewMode === "table" ? "block" : "none" }} className="card-datatable pb-1">
            <table ref={mainTableRef} className="table dataTable dtr-inline w-100">
               <thead></thead>
            </table>
         </div>
         <div style={{ display: mainViewMode === "chart" ? "flex" : "none", height: "250px", alignItems: "center", justifyContent: "center" }}>
             <p className="text-muted">No chart data available</p>
         </div>
      </BracketCard>

      {/* ───── SUB TABLES (Grid of 6) ───── */}
      <div className="row g-4 mt-2">
         <div className="col-md-6"><SubTable title="Origin" /></div>
         <div className="col-md-6"><SubTable title="Destination" /></div>
         <div className="col-md-6"><SubTable title="Customer" /></div>
         <div className="col-md-6"><SubTable title="Branch" /></div>
         <div className="col-md-6"><SubTable title="JobOwner" /></div>
         <div className="col-md-6"><SubTable title="DocumentExecutive" /></div>
      </div>

    </div>
  );
};

export default AirImportDashboard;
