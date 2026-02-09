import { useEffect, useState } from "react";

import API_BASE_URL from "./config";

function App() {
  const [health, setHealth] = useState("Loading...");
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Health check
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth("Backend not reachable"));

    // Vehicle list
    fetch(`${API_BASE_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(() => setError("Failed to load vehicles"));
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🚗 Vehicle Dashboard</h1>

      <h2>Health Status</h2>
      <pre>{JSON.stringify(health, null, 2)}</pre>

      <h2>Vehicle Details</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {vehicles.length === 0 ? (
        <p>No vehicles found</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Number</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.number}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

