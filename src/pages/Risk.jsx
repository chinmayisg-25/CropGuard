import { useState } from "react";
import { getWeatherForLocation } from "../services/weatherService";

const cropOptions = [
  "Rice",
  "Wheat",
  "Cotton",
  "Soybean",
  "Tomato",
  "Potato",
  "Maize",
  "Sugarcane",
];

const growthStages = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Maturity",
];

function Risk() {
  const [crop, setCrop] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [location, setLocation] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [weatherResult, setWeatherResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!crop || !growthStage || !location.trim()) {
      return;
    }

    setSubmitted(false);
    setLoadingWeather(true);
    setWeatherError("");
    setWeatherResult(null);

    try {
      const result = await getWeatherForLocation(location);

      setWeatherResult(result);
      setSubmitted(true);
    } catch (error) {
      console.error("Risk weather error:", error);

      setWeatherError(
        error.message ||
          "Unable to retrieve weather for this location."
      );
    } finally {
      setLoadingWeather(false);
    }
  }

  const hasBasicContext =
    crop && growthStage && location.trim();

  return (
    <div className="dashboard-page">
      {/* ---------------------------------------
          PAGE HEADER
      --------------------------------------- */}
      <section className="welcome-section">
        <div>
          <span className="section-label">EARLY WARNING</span>

          <h1>Check My Risk</h1>

          <p>
            Provide your crop and field context so CropGuard can
            combine it with real weather intelligence for early
            disease and pest-risk assessment.
          </p>
        </div>

        <div className="welcome-status">
          <span className="status-dot"></span>
          Risk engine ready
        </div>
      </section>

      {/* ---------------------------------------
          CROP CONTEXT
      --------------------------------------- */}
      <section className="overview-card">
        <div className="card-header">
          <div>
            <span className="section-label">CROP CONTEXT</span>

            <h3>Tell CropGuard about your field</h3>
          </div>

          <div className="card-icon">⚠</div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: "22px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {/* CROP */}
            <label>
              <span style={labelStyle}>
                Crop
              </span>

              <select
                value={crop}
                onChange={(event) => {
                  setCrop(event.target.value);
                  setSubmitted(false);
                  setWeatherError("");
                }}
                style={inputStyle}
              >
                <option value="">Select crop</option>

                {cropOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {/* GROWTH STAGE */}
            <label>
              <span style={labelStyle}>
                Growth Stage
              </span>

              <select
                value={growthStage}
                onChange={(event) => {
                  setGrowthStage(event.target.value);
                  setSubmitted(false);
                  setWeatherError("");
                }}
                style={inputStyle}
              >
                <option value="">
                  Select growth stage
                </option>

                {growthStages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {/* LOCATION */}
            <label style={{ gridColumn: "1 / -1" }}>
              <span style={labelStyle}>
                Farm / Village / Location
              </span>

              <input
                type="text"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setSubmitted(false);
                  setWeatherError("");
                }}
                placeholder="Example: Shivamogga"
                style={inputStyle}
              />
            </label>

            {/* SYMPTOMS */}
            <label style={{ gridColumn: "1 / -1" }}>
              <span style={labelStyle}>
                Recent Symptoms / Field Observations
              </span>

              <textarea
                value={symptoms}
                onChange={(event) => {
                  setSymptoms(event.target.value);
                  setSubmitted(false);
                }}
                placeholder="Example: yellowing leaves, spots, wilting, insects, or no visible symptoms"
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "95px",
                }}
              />
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={!hasBasicContext || loadingWeather}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px 18px",
              border: "0",
              borderRadius: "11px",
              background:
                hasBasicContext && !loadingWeather
                  ? "#24502e"
                  : "#cbd8ce",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              cursor:
                hasBasicContext && !loadingWeather
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {loadingWeather
              ? "Retrieving Weather..."
              : "Prepare Risk Assessment →"}
          </button>

          {/* WEATHER ERROR */}
          {weatherError && (
            <div
              style={{
                marginTop: "16px",
                padding: "13px 15px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "11px",
                lineHeight: 1.5,
              }}
            >
              {weatherError}
            </div>
          )}
        </form>
      </section>

      {/* ---------------------------------------
          RESULTS
      --------------------------------------- */}
      {submitted && weatherResult && (
        <section
          className="overview-grid"
          style={{ marginTop: "20px" }}
        >
          {/* FIELD CONTEXT */}
          <div className="overview-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  CONTEXT CAPTURED
                </span>

                <h3>Field information received</h3>
              </div>

              <div className="card-icon">✓</div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <InfoRow label="Crop" value={crop} />

              <InfoRow
                label="Growth stage"
                value={growthStage}
              />

              <InfoRow
                label="Location"
                value={location}
              />

              <InfoRow
                label="Field observations"
                value={
                  symptoms.trim()
                    ? symptoms
                    : "No observations provided"
                }
              />
            </div>
          </div>

          {/* REAL WEATHER */}
          <div className="overview-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  LIVE WEATHER
                </span>

                <h3>
                  {weatherResult.location.name}
                </h3>
              </div>

              <div className="card-icon">☼</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <WeatherMetric
                label="Temperature"
                value={`${weatherResult.weather.current.temperature_2m} °C`}
              />

              <WeatherMetric
                label="Humidity"
                value={`${weatherResult.weather.current.relative_humidity_2m} %`}
              />

              <WeatherMetric
                label="Precipitation"
                value={`${weatherResult.weather.current.precipitation} mm`}
              />

              <WeatherMetric
                label="Wind"
                value={`${weatherResult.weather.current.wind_speed_10m} km/h`}
              />
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------
          RISK ENGINE STATUS
      --------------------------------------- */}
      {submitted && weatherResult && (
        <section
          className="overview-card"
          style={{ marginTop: "20px" }}
        >
          <div className="card-header">
            <div>
              <span className="section-label">
                RISK ENGINE
              </span>

              <h3>Weather intelligence received</h3>
            </div>

            <div className="card-icon">◈</div>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              borderRadius: "13px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#166534",
                fontSize: "13px",
              }}
            >
              Real weather data successfully connected
            </strong>

            <p
              style={{
                margin: "8px 0 0",
                color: "#476052",
                fontSize: "11px",
                lineHeight: 1.6,
              }}
            >
              CropGuard now has crop, growth-stage, field
              observation and live weather context for this
              assessment.
            </p>
          </div>

          <div
            style={{
              marginTop: "14px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "#fffaf0",
              border: "1px solid #f3dfb2",
              color: "#795b18",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            <strong>
              Risk score not generated yet.
            </strong>{" "}
            CropGuard will combine weather with crop-specific
            disease conditions, historical information and
            local crop-health reports before producing an
            actual early-warning assessment.
          </div>
        </section>
      )}

      {/* ---------------------------------------
          HOW IT WORKS
      --------------------------------------- */}
      {!submitted && !loadingWeather && (
        <section className="alerts-card">
          <div className="card-header">
            <div>
              <span className="section-label">
                HOW IT WORKS
              </span>

              <h3>CropGuard Early Warning</h3>
            </div>

            <div className="card-icon">⌁</div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "14px",
              marginTop: "22px",
            }}
          >
            <InfoCard
              number="01"
              title="Understand"
              text="Combine crop, growth stage and field observations."
            />

            <InfoCard
              number="02"
              title="Predict"
              text="Use real weather together with historical and local-health intelligence."
            />

            <InfoCard
              number="03"
              title="Warn"
              text="Generate actionable early warnings when the required intelligence is available."
            />
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------------------------------
   INFORMATION ROW
--------------------------------------- */

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        padding: "10px 0",
        borderBottom: "1px solid #edf1ee",
        fontSize: "11px",
      }}
    >
      <span style={{ color: "#718078" }}>
        {label}
      </span>

      <strong
        style={{
          textAlign: "right",
          maxWidth: "65%",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* ---------------------------------------
   WEATHER METRIC
--------------------------------------- */

function WeatherMetric({ label, value }) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "11px",
        background: "#f8fbf8",
        border: "1px solid #e0e8e1",
      }}
    >
      <span
        style={{
          display: "block",
          color: "#718078",
          fontSize: "9px",
          fontWeight: 700,
          marginBottom: "7px",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: "16px",
          color: "#17231a",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* ---------------------------------------
   INFO CARD
--------------------------------------- */

function InfoCard({ number, title, text }) {
  return (
    <div
      style={{
        padding: "17px",
        border: "1px solid #e0e8e1",
        borderRadius: "13px",
        background: "#f8fbf8",
      }}
    >
      <span
        style={{
          color: "#4b9a5a",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "1px",
        }}
      >
        {number}
      </span>

      <strong
        style={{
          display: "block",
          marginTop: "8px",
          fontSize: "12px",
        }}
      >
        {title}
      </strong>

      <p
        style={{
          margin: "6px 0 0",
          color: "#66736a",
          fontSize: "10px",
          lineHeight: 1.55,
        }}
      >
        {text}
      </p>
    </div>
  );
}

/* ---------------------------------------
   FORM STYLES
--------------------------------------- */

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "11px",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #d8e2da",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#17231a",
  fontSize: "11px",
  outline: "none",
};

export default Risk;