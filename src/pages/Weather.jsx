import { useState } from "react";
import { getWeatherForLocation } from "../services/weatherService";


function Weather() {
  const [locationInput, setLocationInput] = useState("");
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
async function handleSearch(event) {
  event.preventDefault();

  const query = locationInput.trim();

  if (!query) {
    setError("Enter a location first.");
    return;
  }

  setLoading(true);
  setError("");
  setWeather(null);
  setLocation(null);

  try {
    const result = await getWeatherForLocation(query);

    setLocation(result.location);
    setWeather(result.weather);
  } catch (err) {
    console.error("Weather error:", err);

    setError(
      err.message || "Unable to load weather information."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="dashboard-page">

      {/* ---------------------------------------
          PAGE HEADER
      --------------------------------------- */}
      <section className="welcome-section">
        <div>
          <span className="section-label">
            WEATHER INTELLIGENCE
          </span>

          <h1>Farm Weather</h1>

          <p>
            Search for your farm area to retrieve current
            weather conditions and a short forecast. This
            information will later become an input for
            CropGuard's early disease and pest-risk engine.
          </p>
        </div>

        <div className="welcome-status">
          <span className="status-dot"></span>
          Live weather
        </div>
      </section>

      {/* ---------------------------------------
          LOCATION SEARCH
      --------------------------------------- */}
      <section className="overview-card">
        <div className="card-header">
          <div>
            <span className="section-label">
              LOCATION
            </span>

            <h3>Check weather for your area</h3>
          </div>

          <div className="card-icon">☼</div>
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            value={locationInput}
            onChange={(event) =>
              setLocationInput(event.target.value)
            }
            placeholder="Example: Shivamogga"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Loading..." : "Get Weather →"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {error}
          </div>
        )}
      </section>

      {/* ---------------------------------------
          CURRENT WEATHER
      --------------------------------------- */}
      {location && weather && (
        <>
          <section className="overview-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  CURRENT CONDITIONS
                </span>

                <h3>
                  {location.name}
                  {location.admin1
                    ? `, ${location.admin1}`
                    : ""}
                </h3>

                <p
                  style={{
                    marginTop: "5px",
                    color: "#64748b",
                  }}
                >
                  {location.country || ""}
                </p>
              </div>

              <div className="card-icon">☼</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              <WeatherMetric
                label="Temperature"
                value={`${weather.current.temperature_2m} °C`}
              />

              <WeatherMetric
                label="Humidity"
                value={`${weather.current.relative_humidity_2m} %`}
              />

              <WeatherMetric
                label="Precipitation"
                value={`${weather.current.precipitation} mm`}
              />

              <WeatherMetric
                label="Wind Speed"
                value={`${weather.current.wind_speed_10m} km/h`}
              />
            </div>
          </section>

          {/* ---------------------------------------
              5 DAY FORECAST
          --------------------------------------- */}
          <section className="overview-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  FORECAST
                </span>

                <h3>Next 5 Days</h3>
              </div>

              <div className="card-icon">◷</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              {weather.daily.time.map((date, index) => (
                <ForecastCard
                  key={date}
                  date={date}
                  min={weather.daily.temperature_2m_min[index]}
                  max={weather.daily.temperature_2m_max[index]}
                  rainProbability={
                    weather.daily
                      .precipitation_probability_max[index]
                  }
                  rainAmount={
                    weather.daily.precipitation_sum[index]
                  }
                />
              ))}
            </div>
          </section>

          {/* ---------------------------------------
              CROPGUARD CONTEXT
          --------------------------------------- */}
          <section className="alerts-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  CROPGUARD INTELLIGENCE
                </span>

                <h3>Weather as a Risk Input</h3>
              </div>

              <div className="card-icon">✦</div>
            </div>

            <p
              style={{
                marginTop: "16px",
                color: "#475569",
                lineHeight: "1.7",
              }}
            >
              CropGuard will use weather conditions such as
              rainfall, humidity and temperature together
              with crop stage, disease history and local
              reports to calculate crop-health risk.
            </p>

            <div
              style={{
                marginTop: "14px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              Current status: Real weather data is connected.
              Disease and pest-risk scoring will be connected
              to this weather information in the next stage.
            </div>
          </section>
        </>
      )}
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
        padding: "18px",
        borderRadius: "14px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <strong
        style={{
          fontSize: "22px",
          color: "#0f172a",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/* ---------------------------------------
   FORECAST CARD
--------------------------------------- */

function ForecastCard({
  date,
  min,
  max,
  rainProbability,
  rainAmount,
}) {
  const formattedDate = new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "14px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <strong
        style={{
          display: "block",
          marginBottom: "14px",
          color: "#0f172a",
        }}
      >
        {formattedDate}
      </strong>

      <div
        style={{
          fontSize: "14px",
          color: "#475569",
          lineHeight: "1.8",
        }}
      >
        <div>
          🌡️ {min}°C – {max}°C
        </div>

        <div>
          🌧️ {rainProbability ?? 0}% rain chance
        </div>

        <div>
          💧 {rainAmount ?? 0} mm
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------
   INPUT STYLE
--------------------------------------- */

const inputStyle = {
  flex: 1,
  minWidth: 0,
  padding: "13px 15px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
};

/* ---------------------------------------
   BUTTON STYLE
--------------------------------------- */

const buttonStyle = {
  padding: "13px 20px",
  border: "none",
  borderRadius: "10px",
  background: "#24502e",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default Weather;