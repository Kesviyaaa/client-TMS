import React, { useState } from "react";

const Dashboard = () => {
  const [filters, setFilters] = useState({
    cargoType: "BOTH",
    department: "Ocean Export",
    dateFilter: "Last 7 Days",
    dateFrom: "2026-03-14",
    dateTo: "2026-03-20"
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const kpiData = [
    { title: "Total Shipments", value: "1", icon: "bx-package", color: "#50a9e9", bg: "#e8f4fc" },
    { title: "Active Shipments", value: "1", icon: "bx-loader-circle", color: "#ffab00", bg: "#fff2d6" },
    { title: "Completed Shipments", value: "0", icon: "bx-check-shield", color: "#71dd37", bg: "#e8fadf" },
    { title: "Pending Shipments", value: "0", icon: "bx-time-five", color: "#ff3e1d", bg: "#ffe0db" }
  ];

  return (
    <div className="container-xxl flex-grow-1 container-p-y pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h5 className="fw-bold mb-0" style={{ color: "#566a7f", fontSize: "1.25rem" }}>Dashboard</h5>
      </div>

      {/* FILTERS SECTION */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <label className="form-label text-muted fw-bold mb-2" style={{ fontSize: "13px" }}>CargoType :</label>
          <select name="cargoType" className="form-select" value={filters.cargoType} onChange={handleFilterChange} style={{ height: "42px", cursor: "pointer", fontSize: "14px", color: "#697a8d", boxShadow: "none" }}>
            <option value="BOTH">BOTH</option>
            <option value="HCL">HCL</option>
            <option value="LCL">LCL</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label text-muted fw-bold mb-2" style={{ fontSize: "13px" }}>Department :</label>
          <select name="department" className="form-select" value={filters.department} onChange={handleFilterChange} style={{ height: "42px", cursor: "pointer", fontSize: "14px", color: "#697a8d", boxShadow: "none" }}>
            <option value="Ocean Export">Ocean Export</option>
            <option value="Ocean Import">Ocean Import</option>
            <option value="Air Export">Air Export</option>
            <option value="Air Import">Air Import</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label text-muted fw-bold mb-2" style={{ fontSize: "13px" }}>Date Filter :</label>
          <select name="dateFilter" className="form-select" value={filters.dateFilter} onChange={handleFilterChange} style={{ height: "42px", cursor: "pointer", fontSize: "14px", color: "#697a8d", boxShadow: "none" }}>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label text-muted fw-bold mb-2" style={{ fontSize: "13px" }}>Date Range :</label>
          <div className="d-flex align-items-center gap-2">
            <input type="date" name="dateFrom" className="form-control px-2" value={filters.dateFrom} onChange={handleFilterChange} style={{ height: "42px", fontSize: "13px", color: "#697a8d", boxShadow: "none" }} />
            <span style={{ fontSize: "14px", color: "#a1acb8", fontWeight: "500" }}>To</span>
            <input type="date" name="dateTo" className="form-control px-2" value={filters.dateTo} onChange={handleFilterChange} style={{ height: "42px", fontSize: "13px", color: "#697a8d", boxShadow: "none" }} />
          </div>
        </div>
      </div>

      {/* KPI CARDS SECTION */}
      <div className="row g-4 mb-4">
        {kpiData.map((kpi, index) => (
          <div className="col-md-3 col-sm-6" key={index}>
            <div
              className="card h-100 shadow-sm"
              style={{ border: "1px solid #eef0f2", transition: "all 0.2s ease-in-out", cursor: "default" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.02)";
              }}
            >
              <div className="card-body p-3 p-xl-4 d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded me-3" style={{ width: "48px", height: "48px", backgroundColor: kpi.bg, color: kpi.color }}>
                  <i className={`bx ${kpi.icon} fs-3`}></i>
                </div>
                <div className="d-flex flex-column w-100 min-w-0">
                  <span className="text-muted text-truncate mb-1" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.title}</span>
                  <h3 className="mb-0 text-truncate" style={{ fontWeight: 800, color: "#566a7f", fontSize: "22px" }}>{kpi.value}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAP / VISUALIZATION SECTION */}
      <div className="card shadow-sm border-0" style={{ borderRadius: "8px", overflow: "hidden" }}>
        <div className="card-body p-0 position-relative" style={{ height: "500px", background: "#334c48" }}>
          {/* Simulated Google Maps placeholder as seen in screenshot */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d41000000!2d0!3d20!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{
              border: 0,
              filter: "brightness(0.7) sepia(0.25) hue-rotate(90deg) saturate(1)",
              opacity: 0.9
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Tracking Map"
          ></iframe>

          {/* "For development purposes only" Overlay Watermark */}


          {/* Map Controls */}
          <div className="position-absolute bottom-0 end-0 m-3 d-flex flex-column gap-2">
            <button className="btn btn-light shadow-sm bg-white rounded-1 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", border: "1px solid #ddd" }}>
              <i className="bx bx-fullscreen fs-5 text-secondary"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
