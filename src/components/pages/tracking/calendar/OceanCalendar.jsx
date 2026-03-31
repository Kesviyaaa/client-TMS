import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/calendar.css";

// ───── DUMMY DATA ─────
const dummyShipments = [
    { id: "S-1001", no: "BT-99201", customer: "Apple Inc", type: "Arrival", port: "CNSHA -> USBOS", date: "2026-03-23", status: "In Transit" },
    { id: "S-1002", no: "BT-99202", customer: "Samsung Electronics", type: "Departure", port: "KRINC -> DEHAM", date: "2026-03-24", status: "Completed" },
    { id: "S-1003", no: "BT-99203", customer: "Tesla Motors", type: "Arrival", port: "USLAX -> SGSIN", date: "2026-03-25", status: "In Transit" },
    { id: "S-1004", no: "BT-99204", customer: "BMW Group", type: "Delayed", port: "DEBRV -> AEAUH", date: "2026-03-23", status: "Pending" },
    { id: "S-1005", no: "BT-99205", customer: "Amazon Logistics", type: "Departure", port: "INBOM -> GBLHR", date: "2026-03-26", status: "In Transit" },
    { id: "S-1006", no: "BT-99206", customer: "Nike Global", type: "Arrival", port: "VNSGN -> USNYC", date: "2026-03-28", status: "Completed" },
    { id: "S-1007", no: "BT-99207", customer: "Sony Corp", type: "Departure", port: "JPTYO -> NLRTM", date: "2026-03-22", status: "In Transit" },
];

const OceanCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 23));
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState("Month");
    const [filters, setFilters] = useState({
        mode: "Ocean Export",
        eventType: "Both",
        search: "",
        location: "All",
        customer: "All",
        status: "All"
    });

    // Calculate days for the month grid
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysCount = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const days = [];

        const prevMonthDays = daysInMonth(year, month - 1);
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, month: "prev", dateStr: `${year}-${month}-${prevMonthDays - i}` });
        }

        for (let d = 1; d <= daysCount; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            days.push({ day: d, month: "current", dateStr });
        }

        const totalCells = rowsNeeded(days.length) * 7;
        const nextMonthPadding = totalCells - days.length;
        for (let i = 1; i <= nextMonthPadding; i++) {
            days.push({ day: i, month: "next", dateStr: `${year}-${month + 2}-${i}` });
        }

        return days;
    };

    const rowsNeeded = (count) => Math.ceil(count / 7);

    const filterShipments = (dateStr) => {
        return dummyShipments.filter(s => s.date === dateStr);
    };

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="container-fluid p-0">

            {/* ─── Top Header (Breadcrumbs) ─── */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="table-title">Ocean Calendar</h4>

                </div>
            </div>

            {/* ─── Filter Bar (Top) ─── */}
            <div className="filter-section mb-4">
                <div className="row g-2 align-items-end flex-nowrap">
                    <div style={{ width: '180px' }}>
                        <label className="form-label small text-muted fw-bold mb-1">Mode Selection</label>
                        <select className="form-select form-select-sm" value={filters.mode} onChange={(e) => setFilters({ ...filters, mode: e.target.value })}>
                            <option>Ocean Export</option>
                            <option>Ocean Import</option>
                            <option>Air Import</option>
                            <option>Air Export</option>
                        </select>
                    </div>
                    <div style={{ width: '150px' }}>
                        <label className="form-label small text-muted fw-bold mb-1">Event Type</label>
                        <select className="form-select form-select-sm" value={filters.eventType} onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}>
                            <option>Both</option>
                            <option>Arrival</option>
                            <option>Departure</option>
                        </select>
                    </div>
                    <div style={{ width: '180px' }}>
                        <label className="form-label small text-muted fw-bold mb-1">Location / Port</label>
                        <select className="form-select form-select-sm" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
                            <option>All Ports</option>
                            <option>Shanghai (CNSHA)</option>
                            <option>Singapore (SGSIN)</option>
                        </select>
                    </div>
                    <div style={{ width: '150px' }}>
                        <label className="form-label small text-muted fw-bold mb-1">Status</label>
                        <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                            <option>All Status</option>
                            <option>In Transit</option>
                            <option>Completed</option>
                            <option>Pending</option>
                        </select>
                    </div>
                    <div style={{ width: '250px' }}>
                        <label className="form-label small text-muted fw-bold mb-1 d-block" style={{ visibility: 'hidden' }}>Search</label>
                        <div className="position-relative">
                            <input type="text" className="form-control form-control-sm ps-5" placeholder="Search Tracking No" />
                            <i className="bx bx-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        </div>
                    </div>
                    <div style={{ width: '100px' }}>
                        <button className="btn-primary-custom w-100" style={{ height: '32px', fontSize: '13px' }}>Search</button>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default OceanCalendar;
