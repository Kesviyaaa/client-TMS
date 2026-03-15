import React, { useEffect, useRef } from "react";
import $ from "jquery";

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-responsive";
import "datatables.net-responsive-bs5";
import "datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css";

import "datatables.net-buttons";
import "datatables.net-buttons-dt/css/buttons.dataTables.min.css";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.colVis";

import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs;

import "../../App.css";

const Document = () => {
  const responsiveTableRef = useRef(null);
  const responsiveDt = useRef(null);

  useEffect(() => {
    if (!responsiveTableRef.current) return;
    if (responsiveDt.current) return;

    $(".dt-button-collection").remove();
    $.fn.dataTable.Buttons.defaults.dom.button.className = "export-btn";

    responsiveDt.current = $(responsiveTableRef.current).DataTable({
      dom:
        "<'row align-items-center px-3'<'col-md-6'B><'col-md-6 d-flex align-items-center justify-content-end gap-3'lf>>" +
        "t" +
        "<'d-flex justify-content-between align-items-center px-3 pb-3'ip>",

      scrollY: "350px",
      scrollCollapse: true,
      scrollX: false,
      paging: true,

      language: {
        lengthMenu: "Show _MENU_ Entries",
      },

      buttons: {
        dom: {
          container: {
            className: "dt-buttons d-flex gap-2",
          },
        },

        buttons: [
          {
            extend: "collection",
            text: '<i class="bx bx-export"></i> Export',
            className: "export-btn",
            autoClose: true,
            dropIcon: false,

            buttons: [
              {
                extend: "print",
                text: '<i class="bx bx-printer"></i> Print',
                exportOptions: {
                  columns: ":visible",
                },
              },
              {
                extend: "copy",
                text: '<i class="bx bx-copy"></i> Copy',
                exportOptions: {
                  columns: ":visible",
                },
              },
              {
                extend: "excel",
                text: '<i class="bx bx-spreadsheet"></i> Excel',
                exportOptions: {
                  columns: ":visible",
                },
              },
              {
                extend: "pdf",
                text: '<i class="bx bx-file"></i> PDF',
                exportOptions: {
                  columns: ":visible",
                },
              },
            ],
          },

          {
            extend: "colvis",
            text: '<i class="bx bx-columns"></i> Customise Columns',
            columns: ":not(.control)",
            className: "custom-colvis",
            dropIcon: false,
            autoClose: false,
          },
        ],
      },

      responsive: {
        details: {
          type: "column",
          target: 0,
        },
      },

      columnDefs: [{ className: "control", orderable: false, targets: 0 }],

      ajax: {
        url: "http://localhost:5000/documents",
        dataSrc: "data",
      },

      columns: [
        {
          className: "control",
          orderable: false,
          searchable: false,
          data: null,
          defaultContent: "",
        },

        { data: "documentType" },

        {
          data: "isApplicable",
          className: "text-center",
          render: function (data, type, row) {
            return `
              <input type="checkbox"
              class="applicable-check"
              data-id="${row._id}"
              ${data ? "checked" : ""}/>
            `;
          },
        },

        {
          data: "isDefault",
          className: "text-center",
          render: function (data, type, row) {
            return `
              <input type="checkbox"
              class="default-check"
              data-id="${row._id}"
              ${data ? "checked" : ""}/>
            `;
          },
        },
      ],

      order: [[1, "asc"]],

      initComplete: function () {
        $(".dataTables_info").css({
          marginLeft: "20px",
        });

        $(".dataTables_paginate").css({
          marginRight: "20px",
          textAlign: "right",
        });

        $(".dataTables_wrapper .row:last").css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        });
      },
    });

    /* Applicable checkbox */

    $(responsiveTableRef.current).on(
      "change",
      ".applicable-check",
      function () {
        const id = $(this).data("id");
        const value = $(this).is(":checked");

        fetch(`http://localhost:5000/documents/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isApplicable: value }),
        });
      }
    );

    /* Default checkbox */

    $(responsiveTableRef.current).on("change", ".default-check", function () {
      const id = $(this).data("id");
      const value = $(this).is(":checked");

      fetch(`http://localhost:5000/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: value }),
      });
    });

    return () => {
      if (responsiveDt.current) {
        responsiveDt.current.destroy(true);
        responsiveDt.current = null;
      }

      $(responsiveTableRef.current).off("change", ".applicable-check");
      $(responsiveTableRef.current).off("change", ".default-check");
    };
  }, []);

  return (
    <div className="container-xxl flex-grow-1 container-p-y">

      <div className="card">

        <div className="datatable-toolbar d-flex justify-content-between align-items-start">

          <div className="title-section">
            <h5 className="table-title">Document Settings</h5>
            <div className="breadcrumb-text">
              Global Masters &gt; Documents
            </div>
          </div>

        </div>

        <div className="card-datatable table-responsive p-3">

          <table
            ref={responsiveTableRef}
            className="table table-hover dataTable dtr-inline"
            style={{ width: "100%" }}
          >

            <thead>
              <tr>
                <th></th>
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
};

export default Document;