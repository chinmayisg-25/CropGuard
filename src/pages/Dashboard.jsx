// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Dashboard() {
  const { t, user } = useLanguage();
  const navigate = useNavigate();

  return (
    <div>
      <h1>{t("nav_dashboard")}</h1>

      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        {t("dashOverview")}
      </p>

      {/* Profile Card */}
      <div
        className="clean-card"
        onClick={() => navigate("/profile")}
        style={{
          cursor: "pointer",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#dcfce7",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "F"}
          </div>

          <div>
            <h3 style={{ margin: 0 }}>
              {user?.name || t("profileName")}
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              {t("profileFarm")}
            </p>
          </div>
        </div>

        <span
          style={{
            color: "#15803d",
            fontSize: "22px",
            fontWeight: "600",
          }}
        >
          →
        </span>
      </div>

      {/* Crop Health Status */}
      <div
        className="clean-card"
        style={{
          borderLeft: "6px solid #15803d",
          marginBottom: "18px",
        }}
      >
        <h3>{t("healthStatus")}</h3>

        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            marginTop: "4px",
          }}
        >
          {t("dashboardClimateStatus")}
          <br />
          {t("dashboardNoHighRisk")}
        </p>
      </div>

      {/* AI Assistant */}
      <div
        className="clean-card"
        style={{
          cursor: "pointer",
          background:
            "linear-gradient(135deg, #15803d 0%, #047857 100%)",
          color: "white",
        }}
        onClick={() => navigate("/assistant")}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2>{t("dashboardAskAssistant")}</h2>

            <p
              style={{
                marginTop: "4px",
                opacity: 0.9,
              }}
            >
              {t("dashboardAssistantDescription")}
            </p>
          </div>

          <span style={{ fontSize: "32px" }}>
            ➔
          </span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;