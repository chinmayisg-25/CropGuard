// src/pages/Weather.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function Weather() {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('weatherTitle')}</h1>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>Shivamogga, Karnataka | Weather Intelligence</p>

      <div className="clean-card" style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", color: "white" }}>
        <h2>28°C — Partly Cloudy</h2>
        <p style={{ marginTop: "4px", opacity: 0.9 }}>Humidity: 78% | Wind: 12 km/h NW | Rainfall Chance: 40%</p>
        <div style={{ marginTop: "16px", padding: "10px", background: "rgba(255,255,255,0.15)", borderRadius: "6px", fontSize: "13px" }}>
          ⚠️ Spray Warning: Spraying pesticides is optimal before 2:00 PM before light evening showers begin.
        </div>
      </div>

      <div className="clean-card">
        <h3>5-Day Rain & Temperature Forecast</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", marginTop: "16px", textAlign: "center" }}>
          {["Today", "Fri", "Sat", "Sun", "Mon"].map((day, i) => (
            <div key={day} style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
              <strong>{day}</strong>
              <div style={{ fontSize: "20px", margin: "6px 0" }}>{i % 2 === 0 ? "🌧️" : "⛅"}</div>
              <span style={{ fontSize: "13px" }}>27°C / 21°C</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Weather;