import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Map of URL segments to readable labels
  const breadcrumbMap = {
    dashboard: "Dashboard",
    quotations: "Quotations",
    bookings: "Bookings",
    "sea-exports": "Sea Exports",
    "sea-imports": "Sea Imports",
    "air-exports": "Air Exports",
    "air-imports": "Air Imports",
    shipment: "Shipment",
    consol: "Consol",
    create: "Create",
    "carrier-tariff": "Carrier Tariff",
    "carrier-contract": "Carrier Contract",
    "airline-charges": "Airline Charges",
    "company-tariff-freight": "Company Tariff",
  };

  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return null; // Don't show on dashboard
  }

  return (
    <nav aria-label="breadcrumb" className="ms-1 mb-2">
      <ol className="breadcrumb mb-0" style={{ background: "transparent", padding: 0 }}>
        <li className="breadcrumb-item">
          <Link to="/dashboard" style={{ textDecoration: "none", color: "#50a9e9", fontWeight: "500" }}>
            <i className="bx bx-home-alt me-1" style={{ fontSize: "14px" }}></i> Dashboard
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = breadcrumbMap[name] || name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

          return isLast ? (
            <li key={name} className="breadcrumb-item active" aria-current="page" style={{ color: "#566a7f", fontWeight: "600" }}>
              {label}
            </li>
          ) : (
            <li key={name} className="breadcrumb-item">
              <Link to={routeTo} style={{ textDecoration: "none", color: "#50a9e9", fontWeight: "500" }}>
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
