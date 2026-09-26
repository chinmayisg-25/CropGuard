import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function LocalHealth() {
  const { communityReports, t } = useLanguage();

  return (
    <div>
      <h1>{t("localHealthTitle")}</h1>

      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "20px",
        }}
      >
        {t("localHealthDescription")}
      </p>

      <div className="clean-card" style={{ padding: "12px" }}>
        {communityReports.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--text-muted)" }}>
              {t("localHealthNoReports")}
            </p>

            <Link
              to="/report"
              className="btn-primary"
              style={{
                marginTop: "12px",
                textDecoration: "none",
              }}
            >
              {t("localHealthReportFirst")}
            </Link>
          </div>
        ) : (
          <div
            style={{
              height: "450px",
              width: "100%",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={[
                communityReports[0].lat,
                communityReports[0].lng,
              ]}
              zoom={10}
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {communityReports.map((report) => (
                <Marker
                  key={report.id}
                  position={[
                    report.lat,
                    report.lng,
                  ]}
                >
                  <Popup>
                    <div>
                      <strong
                        style={{
                          color: "var(--primary-green)",
                        }}
                      >
                        {report.disease}
                      </strong>

                      <p
                        style={{
                          fontSize: "12px",
                          margin: "4px 0",
                        }}
                      >
                        <strong>
                          {t("localHealthCropLabel")}:
                        </strong>{" "}
                        {report.crop}
                      </p>

                      <p
                        style={{
                          fontSize: "12px",
                          margin: "4px 0",
                        }}
                      >
                        <strong>
                          {t("localHealthReporterLabel")}:
                        </strong>{" "}
                        {report.farmerName}
                      </p>

                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {report.date}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocalHealth;