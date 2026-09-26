// src/pages/Risk.jsx
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getWeatherForLocation } from "../services/WeatherService";

const API_BASE_URL = "http://127.0.0.1:8000";

const CROP_KEYS = {
  rice: "cropRice",
  wheat: "cropWheat",
  tomato: "cropTomato",
  potato: "cropPotato",
  maize: "cropMaize",
  sugarcane: "cropSugarcane",
  cotton: "cropCotton",
  soybean: "cropSoybean",
};

const STAGE_KEYS = {
  seedling: "stageSeedling",
  vegetative: "stageVegetative",
  flowering: "stageFlowering",
  fruiting: "stageFruiting",
  maturity: "stageMaturity",
};

function Risk() {
  const { t } = useLanguage();

  const [crop, setCrop] = useState("rice");
  const [growthStage, setGrowthStage] = useState("vegetative");
  const [location, setLocation] = useState("Shivamogga, Karnataka");
  const [symptoms, setSymptoms] = useState("");

  const [assessment, setAssessment] = useState(null);
  const [weather, setWeather] = useState(null);
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translate = (key, variables = {}) => {
    let value = t(key);

    Object.entries(variables).forEach(([name, replacement]) => {
      value = value.replace(`{${name}}`, String(replacement));
    });

    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setAssessment(null);
    setWeather(null);
    setResolvedLocation(null);

    try {
      // --------------------------------------------------
      // 1. Resolve location + retrieve live weather
      // --------------------------------------------------

      const weatherResult = await getWeatherForLocation(location);

      const currentWeather = weatherResult.weather.current;

      const temperature = Number(
        currentWeather.temperature_2m ?? 0
      );

      const humidity = Number(
        currentWeather.relative_humidity_2m ?? 0
      );

      const precipitation = Number(
        currentWeather.precipitation ?? 0
      );

      const windSpeed = Number(
        currentWeather.wind_speed_10m ?? 0
      );

      setWeather(weatherResult.weather);
      setResolvedLocation(weatherResult.location);

      // --------------------------------------------------
      // 2. Send actual weather + crop context to backend
      // --------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/api/risk/assess`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop,
            growth_stage: growthStage,
            temperature,
            humidity,
            precipitation,
            wind_speed: windSpeed,
            symptoms,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Risk assessment failed."
        );
      }

      setAssessment(data);
    } catch (err) {
      console.error(err);

      setError({
        key: "riskUnableToComplete",
        fallback:
          err.message ||
          "Unable to complete the risk assessment.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // Forward-looking prototype signal
  // ------------------------------------------------------

  const getEarlyWarning = () => {
    if (!assessment) return null;

    const forecastRainProbability =
      weather?.daily?.precipitation_probability_max?.[0] ?? 0;

    const forecastRain =
      weather?.daily?.precipitation_sum?.[0] ?? 0;

    const elevatedConditions =
      assessment.risk_score >= 40 ||
      forecastRainProbability >= 50 ||
      forecastRain >= 3;

    if (elevatedConditions) {
      return {
        levelKey: "riskEarlyWarning",
        textKey: "riskEarlyWarningText",
      };
    }

    return {
      levelKey: "riskRoutineMonitoring",
      textKey: "riskRoutineMonitoringText",
    };
  };

  const earlyWarning = getEarlyWarning();

  // ------------------------------------------------------
  // Action plan
  // ------------------------------------------------------

  const getActionPlan = () => {
    if (!assessment) return [];

    const actions = [
      "riskActionInspect",
      "riskActionRecord",
      "riskActionIrrigation",
    ];

    if (assessment.risk_score >= 40) {
      actions.push("riskActionCaptureImages");
    }

    if (assessment.risk_score >= 70) {
      actions.push("riskActionExpert");
    }

    return actions;
  };

  const actionPlan = getActionPlan();

  return (
    <div>
      <h1>{t("riskTitle")}</h1>

      <p
        style={{
          color: "#64748b",
          marginBottom: "20px",
        }}
      >
        {t("riskDescription")}
      </p>

      <div className="risk-grid">
        {/* =================================================
            INPUT SECTION
        ================================================== */}

        <div className="clean-card">
          <p
            style={{
              fontSize: "12px",
              color: "#15803d",
              fontWeight: "bold",
            }}
          >
            {t("riskContextTag")}
          </p>

          <h2 style={{ marginBottom: "16px" }}>
            {t("riskFieldAssessment")}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t("cropLabel")}</label>

              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                required
              >
                <option value="rice">
                  {t("cropRice")}
                </option>
                <option value="wheat">
                  {t("cropWheat")}
                </option>
                <option value="tomato">
                  {t("cropTomato")}
                </option>
                <option value="potato">
                  {t("cropPotato")}
                </option>
                <option value="maize">
                  {t("cropMaize")}
                </option>
                <option value="sugarcane">
                  {t("cropSugarcane")}
                </option>
                <option value="cotton">
                  {t("cropCotton")}
                </option>
                <option value="soybean">
                  {t("cropSoybean")}
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("stageLabel")}</label>

              <select
                value={growthStage}
                onChange={(e) =>
                  setGrowthStage(e.target.value)
                }
                required
              >
                <option value="seedling">
                  {t("stageSeedling")}
                </option>

                <option value="vegetative">
                  {t("stageVegetative")}
                </option>

                <option value="flowering">
                  {t("stageFlowering")}
                </option>

                <option value="fruiting">
                  {t("stageFruiting")}
                </option>

                <option value="maturity">
                  {t("stageMaturity")}
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("locationLabel")}</label>

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder={t("riskLocationPlaceholder")}
                required
              />

              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                {t("riskWeatherLocationNote")}
              </p>
            </div>

            <div className="form-group">
              <label>{t("symptomsLabel")}</label>

              <textarea
                value={symptoms}
                onChange={(e) =>
                  setSymptoms(e.target.value)
                }
                placeholder={t("riskSymptomsPlaceholder")}
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? t("riskAssessing")
                : t("riskAssessButton")}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#991b1b",
              }}
            >
              <strong>{t("riskAssessmentError")}</strong>

              <p style={{ marginTop: "5px" }}>
                {error.fallback ||
                  t(error.key)}
              </p>
            </div>
          )}
        </div>

        {/* =================================================
            EXPLANATION SECTION
        ================================================== */}

        <div>
          <div className="clean-card">
            <p
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "bold",
              }}
            >
              {t("riskIntelligenceTag")}
            </p>

            <h3 style={{ marginBottom: "12px" }}>
              {t("riskHowCalculated")}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <strong>
                  {t("riskStep1Title")}
                </strong>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  {t("riskStep1Description")}
                </p>
              </div>

              <div>
                <strong>
                  {t("riskStep2Title")}
                </strong>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  {t("riskStep2Description")}
                </p>
              </div>

              <div>
                <strong>
                  {t("riskStep3Title")}
                </strong>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  {t("riskStep3Description")}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              WEATHER CONTEXT
          ================================================== */}

          {weather && resolvedLocation && (
            <div
              className="clean-card"
              style={{ marginTop: "16px" }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#15803d",
                  fontWeight: "bold",
                }}
              >
                {t("riskLocationWeather")}
              </p>

              <h3>
                {resolvedLocation.name},{" "}
                {resolvedLocation.admin1 || ""}
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "10px",
                  marginTop: "14px",
                }}
              >
                <div>
                  <strong>
                    {weather.current.temperature_2m}°C
                  </strong>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {t("weatherTemperature")}
                  </p>
                </div>

                <div>
                  <strong>
                    {weather.current.relative_humidity_2m}%
                  </strong>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {t("weatherHumidity")}
                  </p>
                </div>

                <div>
                  <strong>
                    {weather.current.precipitation} mm
                  </strong>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {t("weatherPrecipitation")}
                  </p>
                </div>

                <div>
                  <strong>
                    {weather.current.wind_speed_10m} km/h
                  </strong>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {t("weatherWind")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ASSESSMENT RESULT
      ====================================================== */}

      {assessment && (
        <div style={{ marginTop: "20px" }}>
          <div
            className="clean-card"
            style={{
              borderLeft:
                assessment.risk_score >= 70
                  ? "6px solid #dc2626"
                  : assessment.risk_score >= 40
                  ? "6px solid #eab308"
                  : "6px solid #16a34a",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#64748b",
              }}
            >
              {t("riskAssessmentTag")}
            </p>

            <h2 style={{ marginBottom: "6px" }}>
              {translate(
                assessment.risk_level === "High"
                  ? "riskHigh"
                  : assessment.risk_level === "Moderate"
                  ? "riskModerate"
                  : "riskLow"
              )}
              {` ${t("riskWord")}`}
            </h2>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "800",
                marginBottom: "12px",
              }}
            >
              {assessment.risk_score}%
            </div>

            <p
              style={{
                color: "#475569",
                marginBottom: "16px",
              }}
            >
              {assessment.monitoring_message}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "#f1f5f9",
                  fontSize: "12px",
                }}
              >
                {t("riskCropBadge")}:{" "}
                {t(CROP_KEYS[assessment.crop] || "cropOther")}
              </span>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "#f1f5f9",
                  fontSize: "12px",
                }}
              >
                {t("riskStageBadge")}:{" "}
                {t(
                  STAGE_KEYS[assessment.growth_stage] ||
                    "stageVegetative"
                )}
              </span>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "#f1f5f9",
                  fontSize: "12px",
                }}
              >
                {t("riskLocationBadge")}:{" "}
                {resolvedLocation?.name || location}
              </span>
            </div>
          </div>

          {/* =================================================
              WHY THIS RISK?
          ================================================== */}

          <div
            className="clean-card"
            style={{ marginTop: "16px" }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#15803d",
                fontWeight: "bold",
              }}
            >
              {t("riskExplainableTag")}
            </p>

            <h3>{t("riskWhyTitle")}</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              {assessment.factors?.map(
                (factor, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <strong>
                      {factor.factor}: {factor.value}
                    </strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      {factor.reason}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* =================================================
              EARLY WARNING
          ================================================== */}

          {earlyWarning && (
            <div
              className="clean-card"
              style={{
                marginTop: "16px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#15803d",
                  fontWeight: "bold",
                }}
              >
                {t("riskEarlyWarningTag")}
              </p>

              <h3>
                {t(earlyWarning.levelKey)}
              </h3>

              <p
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  marginTop: "8px",
                }}
              >
                {t(earlyWarning.textKey)}
              </p>

              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginTop: "10px",
                }}
              >
                {t("riskPrototypeWarning")}
              </p>
            </div>
          )}

          {/* =================================================
              ACTION PLAN
          ================================================== */}

          <div
            className="clean-card"
            style={{ marginTop: "16px" }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#15803d",
                fontWeight: "bold",
              }}
            >
              {t("riskActionPlanTag")}
            </p>

            <h3>{t("riskWhatNext")}</h3>

            <div style={{ marginTop: "12px" }}>
              {actionPlan.map((actionKey, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <span>✓</span>

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#475569",
                    }}
                  >
                    {t(actionKey)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "14px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <strong>
                {t("riskSafeInputTitle")}:
              </strong>{" "}
              {t("riskSafeInputText")}
            </div>
          </div>

          {/* =================================================
              EXPERT VALIDATION
          ================================================== */}

          <div
            className="clean-card"
            style={{ marginTop: "16px" }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#7c3aed",
                fontWeight: "bold",
              }}
            >
              {t("riskHumanLoop")}
            </p>

            <h3>{t("riskExpertValidation")}</h3>

            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "8px",
              }}
            >
              {t("riskExpertDescription")}
            </p>

            <button
              type="button"
              className="btn-primary"
              style={{
                marginTop: "12px",
                width: "auto",
              }}
              onClick={() =>
                alert(t("riskExpertPrototypeAlert"))
              }
            >
              {t("riskRequestExpert")}
            </button>
          </div>

          {/* =================================================
              ENGINE TRANSPARENCY
          ================================================== */}

          <div
            style={{
              marginTop: "12px",
              padding: "10px",
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            <strong>
              {t("riskEngineStatus")}:
            </strong>{" "}
            {assessment.engine?.type ||
              t("riskTransparentEngine")}{" "}
            · {t("riskNotDiagnosis")}
          </div>
        </div>
      )}
    </div>
  );
}

export default Risk;