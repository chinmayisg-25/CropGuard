const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Find a location using Open-Meteo's geocoding service.
 */
export async function findLocation(locationName) {
  const query = locationName.trim();

  if (!query) {
    throw new Error("Enter a location first.");
  }

  const response = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(
      query
    )}&count=1&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error(
      `Location search failed (${response.status}).`
    );
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(
      "Location not found. Try a city, town or village name."
    );
  }

  return data.results[0];
}

/**
 * Retrieve current weather and a 5-day forecast
 * for a previously resolved location.
 */
export async function getWeather(latitude, longitude) {
  const response = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&forecast_days=5&timezone=auto`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Weather API failed (${response.status}): ${errorText}`
    );
  }

  return response.json();
}

/**
 * Search for a location and retrieve its weather
 * in one operation.
 */
export async function getWeatherForLocation(locationName) {
  const location = await findLocation(locationName);

  const weather = await getWeather(
    location.latitude,
    location.longitude
  );

  return {
    location,
    weather,
  };
}