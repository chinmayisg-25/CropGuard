import React, { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function CropHealth() {
  const { diagnosisHistory, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("All");

  const filteredHistory = useMemo(() => {
    return diagnosisHistory.filter((item) =>
      selectedCrop === "All" ? true : item.crop === selectedCrop
    );
  }, [diagnosisHistory, selectedCrop]);

  const totalScans = diagnosisHistory.length;

  const issuesDetected = diagnosisHistory.filter((item) => {
    const diagnosis = String(
      item.diagnosis || item.disease || ""
    ).toLowerCase();

    return (
      diagnosis &&
      !diagnosis.includes("healthy") &&
      !diagnosis.includes("no disease")
    );
  }).length;

  const resolved = diagnosisHistory.filter(
    (item) => String(item.status || "").toLowerCase() === "resolved"
  ).length;

  const confidenceValues = diagnosisHistory
    .map((item) => {
      const value = parseFloat(
        String(item.confidence || "").replace("%", "")
      );
      return Number.isFinite(value) ? value : null;
    })
    .filter((value) => value !== null);

  const averageConfidence =
    confidenceValues.length > 0
      ? (
          confidenceValues.reduce((sum, value) => sum + value, 0) /
          confidenceValues.length
        ).toFixed(1) + "%"
      : "—";

  const crops = [
    "All",
    ...Array.from(
      new Set(diagnosisHistory.map((item) => item.crop).filter(Boolean))
    ),
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Healthy":
        return {
          bg: "#e8f5e9",
          color: "#2e7d32",
          border: "#a5d6a7",
        };

      case "In Recovery":
        return {
          bg: "#fff8e1",
          color: "#f57f17",
          border: "#ffe082",
        };

      case "Resolved":
        return {
          bg: "#e3f2fd",
          color: "#0288d1",
          border: "#90caf9",
        };

      default:
        return {
          bg: "#ffebee",
          color: "#c62828",
          border: "#ef9a9a",
        };
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case "Healthy":
        return t("cropHealthStatusHealthy");
      case "In Recovery":
        return t("cropHealthStatusRecovery");
      case "Resolved":
        return t("cropHealthStatusResolved");
      default:
        return t("cropHealthStatusDetected");
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
              color: "#2e7d32",
              textTransform: "uppercase",
            }}
          >
            {t("cropHealthIntelligence")}
          </span>

          <h1
            style={{
              fontSize: "28px",
              margin: "4px 0 0 0",
              fontWeight: "700",
            }}
          >
            {t("cropHealthAnalytics")}
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "4px",
              fontSize: "14px",
            }}
          >
            {t("cropHealthDescription")}
          </p>
        </div>

        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {crops.map((crop) => (
            <option key={crop} value={crop}>
              {crop === "All" ? t("cropHealthAllCrops") : crop}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#666" }}>
            {t("cropHealthTotalScans")}
          </span>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginTop: "4px",
            }}
          >
            {totalScans}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#666" }}>
            {t("cropHealthIssuesDetected")}
          </span>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginTop: "4px",
            }}
          >
            {issuesDetected}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#666" }}>
            {t("cropHealthResolved")}
          </span>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginTop: "4px",
            }}
          >
            {resolved}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
          }}
        >
          <span style={{ fontSize: "12px", color: "#666" }}>
            {t("cropHealthAverageConfidence")}
          </span>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginTop: "4px",
            }}
          >
            {averageConfidence}
          </div>
        </div>
      </div>

      {diagnosisHistory.length === 0 ? (
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            padding: "50px 20px",
            backgroundColor: "#fff",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "12px" }}>🌱</div>

          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "18px",
            }}
          >
            {t("cropHealthNoScans")}
          </h3>

          <p
            style={{
              color: "#666",
              fontSize: "13px",
              margin: 0,
            }}
          >
            {t("cropHealthFirstScan")}
          </p>
        </div>
      ) : (
        <>
          {diagnosisHistory.some(
            (item) => item.followUpNeeded === true
          ) && (
            <div
              style={{
                backgroundColor: "#fff8e1",
                borderLeft: "4px solid #f57f17",
                padding: "16px",
                borderRadius: "6px",
                marginBottom: "24px",
              }}
            >
              <strong
                style={{
                  color: "#e65100",
                  fontSize: "15px",
                }}
              >
                🔔 {t("cropHealthPendingFollowUp")}
              </strong>

              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "13px",
                  color: "#5d4037",
                }}
              >
                {t("cropHealthFollowUpDescription")}
              </p>
            </div>
          )}

          <div
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#fff",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              📅 {t("cropHealthTimeline")}
            </h3>

            {filteredHistory.length === 0 ? (
              <p
                style={{
                  color: "#666",
                  textAlign: "center",
                  padding: "30px",
                }}
              >
                {t("cropHealthNoCropScans")}
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  position: "relative",
                  paddingLeft: "20px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "7px",
                    top: "10px",
                    bottom: "10px",
                    width: "2px",
                    backgroundColor: "#e0e0e0",
                  }}
                />

                {filteredHistory.map((item, index) => {
                  const badge = getStatusBadge(
                    item.status || "Detected"
                  );

                  const diagnosis =
                    item.diagnosis ||
                    item.disease ||
                    t("cropHealthConditionDetected");

                  return (
                    <div
                      key={item.id || index}
                      style={{
                        position: "relative",
                        paddingLeft: "15px",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "-20px",
                          top: "4px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: badge.color,
                          border: "2px solid #fff",
                        }}
                      />

                      <div
                        style={{
                          border: "1px solid #f0f0f0",
                          borderRadius: "8px",
                          padding: "16px",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "8px",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#888",
                                fontWeight: "500",
                              }}
                            >
                              {item.date || t("cropHealthRecentScan")}{" "}
                              •{" "}
                              {item.id || "SCAN"}
                            </span>

                            <h4
                              style={{
                                margin: "2px 0 0 0",
                                fontSize: "16px",
                                fontWeight: "700",
                              }}
                            >
                              {item.crop || t("cropHealthUnknownCrop")} —{" "}
                              {diagnosis}
                            </h4>
                          </div>

                          <span
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {statusLabel(item.status || "Detected")}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            fontSize: "13px",
                            color: "#555",
                            margin: "8px 0 12px 0",
                            flexWrap: "wrap",
                          }}
                        >
                          {item.location && (
                            <span>
                              📍 <strong>{t("cropHealthLocation")}:</strong>{" "}
                              {item.location}
                            </span>
                          )}

                          {item.growthStage && (
                            <span>
                              🌱 <strong>{t("cropHealthStage")}:</strong>{" "}
                              {item.growthStage}
                            </span>
                          )}

                          {item.confidence && (
                            <span>
                              🎯{" "}
                              <strong>
                                {t("cropHealthAIConfidence")}:
                              </strong>{" "}
                              {item.confidence}
                            </span>
                          )}
                        </div>

                        {item.treatment && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#333",
                              marginBottom: "6px",
                            }}
                          >
                            <strong>
                              {t("cropHealthTreatment")}:
                            </strong>{" "}
                            {item.treatment}
                          </div>
                        )}

                        {item.notes && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              fontStyle: "italic",
                            }}
                          >
                            "{item.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}