// src/pages/Alerts.jsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";

function Alerts() {
  const { communityReports } = useLanguage();

  const sendNotification = (alertTitle) => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("CropGuard Alert", { body: alertTitle });
        } else {
          alert(`Alert Enabled: ${alertTitle}`);
        }
      });
    } else {
      alert(`Alert Enabled: ${alertTitle}`);
    }
  };

  return (
    <div>
      <h1>Nearby Disease Alerts</h1>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>Real-time outbreak notifications near your farm</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {communityReports.map((alert) => (
          <div key={alert.id} className="clean-card" style={{ borderLeft: "6px solid #ef4444" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "bold" }}>OUTBREAK DETECTED NEARBY</span>
                <h3 style={{ margin: "4px 0" }}>{alert.disease} in {alert.crop}</h3>
                <p style={{ fontSize: "13px", color: "#64748b" }}>Location: {alert.locationName} | Date: {alert.date}</p>
              </div>
              <button
                className="btn-primary"
                style={{ width: "auto", fontSize: "12px" }}
                onClick={() => sendNotification(`${alert.disease} reported in ${alert.locationName}`)}
              >
                🔔 Notify Me
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;