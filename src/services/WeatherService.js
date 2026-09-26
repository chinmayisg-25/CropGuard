const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Offline fallback location.
 * Used only when internet/geocoding is unavailable.
 */
const OFFLINE_LOCATION = {
  name: "Shivamogga",
  latitude: 13.9299,
  longitude: 75.5681,
  country: "India",
  admin1: "Karnataka",
};

/**
 * Offline demo weather.
 * These values are DEMO FALLBACK DATA, not live weather.
 */
const OFFLINE_WEATHER = {
  current: {
    temperature_2m: 26,
    relative_humidity_2m: 82,
    precipitation: 0,
    weather_code: 2,
    wind_speed_10m: 8,
  },

  daily: {
    temperature_2m_max: [29, 30, 30, 29, 28],
    temperature_2m_min: [22, 22, 23, 22, 22],
    precipitation_probability_max: [40, 50, 45, 35, 30],
    precipitation_sum: [1.2, 3.5, 2.0, 0.8, 0.5],
  },

  offline: true,
};

/**
 * Find a location using Open-Meteo's geocoding service.
 */
export async function findLocation(locationName) {
  const query = locationName.trim();

  if (!query) {
    throw new Error("Enter a location first.");
  }

  try {
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
  } catch (error) {
    console.warn(
      "Online location search unavailable. Using offline demo location.",
      error
    );

    return {
      ...OFFLINE_LOCATION,
      requestedLocation: query,
      offline: true,
    };
  }
}

/**
 * Retrieve current weather and a 5-day forecast
 * for a previously resolved location.
 */
export async function getWeather(latitude, longitude) {
  try {
    const response = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&forecast_days=5&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(
        `Weather API failed (${response.status}).`
      );
    }

    const weather = await response.json();

    return {
      ...weather,
      offline: false,
    };
  } catch (error) {
    console.warn(
      "Online weather unavailable. Using offline demo weather.",
      error
    );

    return {
      ...OFFLINE_WEATHER,
    };
  }
}

/**
 * Search for a location and retrieve its weather
 * in one operation.
 *
 * Online:
 *   Real location + real Open-Meteo weather
 *
 * Offline:
 *   Local demo location + demo weather
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
    offline: Boolean(location.offline || weather.offline),
  };
}