import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../css/Dashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (d) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const [dateFilter] = useState("Last 7 Days");
  const [dateFrom] = useState(formatDate(sevenDaysAgo));
  const [dateTo] = useState(formatDate(today));

  // Bar chart data
  const barChartData = {
    labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    datasets: [
      {
        label: "Air",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#4285f4",
        borderRadius: 3,
        barPercentage: 0.6,
      },
      {
        label: "Sea",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#4ecdc4",
        borderRadius: 3,
        barPercentage: 0.6,
      },
      {
        label: "Road",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#ffd93d",
        borderRadius: 3,
        barPercentage: 0.6,
      },
      {
        label: "Rail",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#9b59b6",
        borderRadius: 3,
        barPercentage: 0.6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#566a7f",
        bodyColor: "#697a8d",
        borderColor: "#d9dee3",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "#eceef1",
        },
        ticks: {
          font: {
            family: "'Public Sans', sans-serif",
            size: 12,
          },
          color: "#697a8d",
        },
      },
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          font: {
            family: "'Public Sans', sans-serif",
            size: 12,
          },
          color: "#697a8d",
        },
        grid: {
          display: true,
          color: "#eceef1",
        },
      },
    },
  };

  // Pie chart data
  const pieChartData = {
    labels: ["Air", "Sea", "Road", "Rail"],
    datasets: [
      {
        data: [1, 1, 1, 1],
        backgroundColor: ["#4285f4", "#ef5350", "#ffa726", "#ffd93d"],
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Transport modes config
  const transportModes = [
    {
      key: "air",
      label: "AIR",
      emoji: "✈",
      icon: "✈️",
    },
    {
      key: "sea",
      label: "SEA",
      emoji: "🚢",
      icon: "🚢",
    },
    {
      key: "road",
      label: "ROAD",
      emoji: "🚛",
      icon: "🚛",
    },
    {
      key: "rail",
      label: "RAIL",
      emoji: "🚂",
      icon: "🚂",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Page Title */}
      <h4 className="dashboard-title">Dashboard</h4>

      {/* Date Filter Row */}
      <div className="dashboard-filter-row">
        <div className="filter-group">
          <label>Date Filter :</label>
          <select className="filter-select" value={dateFilter} readOnly>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>Last 1 Year</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range :</label>
          <div className="date-range-group">
            <input
              type="text"
              className="date-input"
              value={dateFrom}
              readOnly
            />
            <span className="date-separator">To</span>
            <input
              type="text"
              className="date-input"
              value={dateTo}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="stat-cards-row">
        {/* Quotes */}
        <div className="stat-card quotes">
          <div className="stat-card-content">
            <span className="stat-card-label">Quotes</span>
            <span className="stat-card-value">0</span>
          </div>
          <div className="icon-circle quotes-icon">📋</div>
        </div>

        {/* Bookings */}
        <div className="stat-card bookings">
          <div className="stat-card-content">
            <span className="stat-card-label">Bookings</span>
            <span className="stat-card-value">0</span>
          </div>
          <div className="icon-circle bookings-icon">📦</div>
        </div>

        {/* Shipments */}
        <div className="stat-card shipments">
          <div className="stat-card-content">
            <span className="stat-card-label">Shipments</span>
            <span className="stat-card-value">0</span>
          </div>
          <div className="shipment-sub-stats">
            <div className="shipment-sub-stat">
              <span className="sub-icon">✈</span>
              <span className="sub-value">0</span>
            </div>
            <div className="shipment-sub-stat">
              <span className="sub-icon">🚢</span>
              <span className="sub-value">0</span>
            </div>
            <div className="shipment-sub-stat">
              <span className="sub-icon">🚛</span>
              <span className="sub-value">0</span>
            </div>
            <div className="shipment-sub-stat">
              <span className="sub-icon">🚂</span>
              <span className="sub-value">0</span>
            </div>
          </div>
          <div className="icon-circle shipments-icon">🚢</div>
        </div>
      </div>

      {/* Transport Mode Section */}
      <div className="transport-section">
        {transportModes.map((mode) => (
          <div className="transport-row" key={mode.key}>
            <div className="transport-mode-label">
              <span className="mode-emoji">{mode.emoji}</span>
              {mode.label}
            </div>

            {/* Total Shipment */}
            <div className={`transport-stat-card ${mode.key}`}>
              <div className="transport-stat-content">
                <span className="transport-stat-label">Total Shipment</span>
                <span className="transport-stat-value">0</span>
              </div>
              <div className={`icon-circle ${mode.key}-icon`}>{mode.icon}</div>
            </div>

            {/* Tracking */}
            <div className={`transport-stat-card ${mode.key}`}>
              <div className="transport-stat-content">
                <span className="transport-stat-label">Tracking</span>
                <span className="transport-stat-value">0</span>
              </div>
              <div className={`icon-circle ${mode.key}-icon`}>{mode.icon}</div>
            </div>

            {/* Non-Tracking */}
            <div className={`transport-stat-card ${mode.key}`}>
              <div className="transport-stat-content">
                <span className="transport-stat-label">Non-Tracking</span>
                <span className="transport-stat-value">0</span>
              </div>
              <div className={`icon-circle ${mode.key}-icon`}>{mode.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">Last 6 Months – Mode Wise (Bar)</div>
          {/* Custom legend matching screenshot */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginBottom: "12px",
              fontFamily: "'Public Sans', sans-serif",
              fontSize: "0.8rem",
              color: "#697a8d",
            }}
          >
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#4285f4",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Air
            </span>
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#4ecdc4",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Sea
            </span>
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#ffd93d",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Road
            </span>
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#9b59b6",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Rail
            </span>
          </div>
          <div className="chart-container">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <div className="chart-title">Shipment Share (Pie)</div>
          <div
            className="chart-container"
            style={{ maxWidth: 250, margin: "0 auto" }}
          >
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
          {/* Pie legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginTop: "16px",
              fontFamily: "'Public Sans', sans-serif",
              fontSize: "0.8rem",
              color: "#697a8d",
              flexWrap: "wrap",
            }}
          >
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#4285f4",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Air
            </span>
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#ef5350",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Sea
            </span>
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#ffa726",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Road
            </span>
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 10,
                  backgroundColor: "#ffd93d",
                  marginRight: 6,
                  borderRadius: 2,
                  verticalAlign: "middle",
                }}
              ></span>
              Rail
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
