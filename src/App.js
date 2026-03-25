import { useEffect, useState } from "react";
import "./App.css";

const statusConfig = {
  active: { label: "Active", tone: "success" },
  available: { label: "Available", tone: "success" },
  inservice: { label: "In Service", tone: "success" },
  maintenance: { label: "Maintenance", tone: "warning" },
  inactive: { label: "Inactive", tone: "muted" },
  offline: { label: "Offline", tone: "muted" },
  default: { label: "Unknown", tone: "muted" },
};

const normalizeStatus = (value) => {
  if (!value) {
    return "default";
  }

  const compact = String(value).toLowerCase().replace(/[\s_-]+/g, "");

  if (statusConfig[compact]) {
    return compact;
  }

  if (compact.includes("maint")) {
    return "maintenance";
  }

  if (compact.includes("active")) {
    return "active";
  }

  if (compact.includes("avail")) {
    return "available";
  }

  if (compact.includes("service")) {
    return "inservice";
  }

  if (compact.includes("off") || compact.includes("inactive")) {
    return "inactive";
  }

  return "default";
};

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatHealth = (health) => {
  if (!health) {
    return "Checking services";
  }

  if (typeof health === "string") {
    return health;
  }

  if (health.status) {
    return toTitleCase(health.status);
  }

  return "Service reachable";
};

function App() {
  const [health, setHealth] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const [healthResult, vehiclesResult] = await Promise.allSettled([
        fetch("/health").then((response) => response.json()),
        fetch("/api/vehicles").then((response) => response.json()),
      ]);

      if (!isMounted) {
        return;
      }

      if (healthResult.status === "fulfilled") {
        setHealth(healthResult.value);
      } else {
        setHealth("Backend not reachable");
      }

      if (vehiclesResult.status === "fulfilled") {
        setVehicles(Array.isArray(vehiclesResult.value) ? vehiclesResult.value : []);
        setError("");
      } else {
        setVehicles([]);
        setError("Failed to load vehicles");
      }

      setIsLoading(false);
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusCounts = vehicles.reduce((counts, vehicle) => {
    const key = normalizeStatus(vehicle.status);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const activeVehicles =
    (statusCounts.active || 0) +
    (statusCounts.available || 0) +
    (statusCounts.inservice || 0);

  const maintenanceVehicles = statusCounts.maintenance || 0;
  const inactiveVehicles = (statusCounts.inactive || 0) + (statusCounts.offline || 0);

  const stats = [
    {
      label: "Fleet Size",
      value: vehicles.length,
      helper: "Registered vehicles",
    },
    {
      label: "Road Ready",
      value: activeVehicles,
      helper: "Ready for dispatch",
    },
    {
      label: "Under Service",
      value: maintenanceVehicles,
      helper: "Needs attention",
    },
    {
      label: "Unavailable",
      value: inactiveVehicles,
      helper: "Offline or inactive",
    },
  ];

  const highlights = [
    "Live health status synced with backend availability.",
    "Fast visual scan of active, maintenance, and offline vehicles.",
    "Responsive card layout for mobile and desktop dashboards.",
  ];

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Fleet Operations</p>
          <h1>Vehicle Command Center</h1>
          <p className="hero-text">
            Monitor fleet health, inspect vehicle readiness, and keep operating
            teams aligned from one dashboard.
          </p>

          <div className="hero-highlights">
            {highlights.map((item) => (
              <span key={item} className="highlight-pill">
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-status-card">
          <div className="status-heading">
            <span className="status-dot" aria-hidden="true" />
            <span>Backend Health</span>
          </div>
          <strong>{formatHealth(health)}</strong>
          <p>
            {isLoading
              ? "Fetching service responses and fleet records."
              : error
                ? "Fleet feed is unavailable. Health check may still be reachable."
                : "Services responded and vehicle data is available."}
          </p>
        </aside>
      </section>

      <section className="stats-grid" aria-label="Fleet statistics">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.helper}</span>
          </article>
        ))}
      </section>

      <section className="fleet-layout">
        <div className="section-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Overview</p>
              <h2>Vehicle lineup</h2>
            </div>
            <span className="section-badge">{vehicles.length} vehicles</span>
          </div>

          {error ? <p className="message error-message">{error}</p> : null}
          {!error && isLoading ? <p className="message">Loading vehicles...</p> : null}
          {!error && !isLoading && vehicles.length === 0 ? (
            <p className="message">No vehicles found.</p>
          ) : null}

          {!error && vehicles.length > 0 ? (
            <div className="vehicle-grid">
              {vehicles.map((vehicle) => {
                const normalizedStatus = normalizeStatus(vehicle.status);
                const config = statusConfig[normalizedStatus] || statusConfig.default;

                return (
                  <article key={vehicle.id} className="vehicle-card">
                    <div className="vehicle-card-top">
                      <div>
                        <p className="vehicle-id">ID {vehicle.id}</p>
                        <h3>{vehicle.number || "Unassigned Number"}</h3>
                      </div>
                      <span className={`status-chip ${config.tone}`}>
                        {vehicle.status ? toTitleCase(vehicle.status) : config.label}
                      </span>
                    </div>

                    <dl className="vehicle-meta">
                      <div>
                        <dt>Type</dt>
                        <dd>{vehicle.type ? toTitleCase(vehicle.type) : "Not specified"}</dd>
                      </div>
                      <div>
                        <dt>Readiness</dt>
                        <dd>{config.label}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="section-card section-card-compact">
          <div className="section-heading">
            <div>
              <p className="section-label">Status Mix</p>
              <h2>Service snapshot</h2>
            </div>
          </div>

          <div className="status-list">
            {Object.entries(statusCounts).length === 0 ? (
              <p className="message">Status distribution will appear after vehicles load.</p>
            ) : (
              Object.entries(statusCounts).map(([statusKey, count]) => {
                const config = statusConfig[statusKey] || statusConfig.default;

                return (
                  <div key={statusKey} className="status-row">
                    <div className="status-row-label">
                      <span className={`status-bar ${config.tone}`} aria-hidden="true" />
                      <span>{config.label}</span>
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })
            )}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Number</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td>{vehicle.number}</td>
                    <td>{toTitleCase(vehicle.type || "n/a")}</td>
                    <td>{toTitleCase(vehicle.status || "unknown")}</td>
                  </tr>
                ))}
                {!isLoading && vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
