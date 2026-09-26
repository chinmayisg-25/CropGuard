import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function ReportOutbreak() {
  const { addReport, t } = useLanguage();
  const navigate = useNavigate();

  const [crop, setCrop] = useState("");
  const [disease, setDisease] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(4));
          setLng(position.coords.longitude.toFixed(4));
        },
        () => alert(t("reportLocationError"))
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!crop || !disease || !lat || !lng) {
      alert(t("reportRequiredError"));
      return;
    }

    const newReport = {
      id: Date.now(),
      crop,
      disease,
      farmerName: farmerName || t("reportAnonymous"),
      locationName: locationName || t("reportLocalRegion"),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      date: new Date().toLocaleDateString(),
    };

    addReport(newReport);
    navigate("/local-health");
  };

  return (
    <div>
      <h1>{t("reportTitle")}</h1>

      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "20px",
        }}
      >
        {t("reportDescription")}
      </p>

      <div
        className="clean-card"
        style={{ maxWidth: "600px" }}
      >
        <form onSubmit={handleSubmit}>
          <label>
            <strong>{t("reportCropLabel")} *</strong>
          </label>

          <input
            type="text"
            className="input-field"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            required
            placeholder={t("reportCropPlaceholder")}
          />

          <label>
            <strong>{t("reportDiseaseLabel")} *</strong>
          </label>

          <input
            type="text"
            className="input-field"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            required
            placeholder={t("reportDiseasePlaceholder")}
          />

          <label>
            <strong>{t("reportFarmerLabel")}</strong>
          </label>

          <input
            type="text"
            className="input-field"
            value={farmerName}
            onChange={(e) => setFarmerName(e.target.value)}
            placeholder={t("reportFarmerPlaceholder")}
          />

          <label>
            <strong>{t("reportLocationLabel")}</strong>
          </label>

          <input
            type="text"
            className="input-field"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder={t("reportLocationPlaceholder")}
          />

          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1 }}>
              <label>
                <strong>{t("reportLatitudeLabel")} *</strong>
              </label>

              <input
                type="number"
                step="any"
                className="input-field"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
                placeholder="12.9716"
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>
                <strong>{t("reportLongitudeLabel")} *</strong>
              </label>

              <input
                type="number"
                step="any"
                className="input-field"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
                placeholder="77.5946"
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={getLocation}
            style={{
              marginBottom: "16px",
              background: "var(--accent-green)",
              color: "var(--primary-green)",
            }}
          >
            📍 {t("reportDetectLocation")}
          </button>

          <div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {t("reportPublishButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportOutbreak;