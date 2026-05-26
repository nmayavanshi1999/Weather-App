import { useState } from "react";
import axios from "axios";

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    const trimmed = city.trim();
    if (!trimmed) {
      setError("Please enter a city name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1`
      );

      if (!geoRes.data.results) throw new Error("City not found");

      const { latitude, longitude, name, country } = geoRes.data.results[0];

      const wxRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m`
      );

      const c = wxRes.data.current;

      setWeather({
        city: country ? `${name}, ${country}` : name,
        temperature: Math.round(c.temperature_2m),
        humidity: Math.round(c.relative_humidity_2m),
        wind: Math.round(c.wind_speed_10m),
      });

      setCity("");
    } catch {
      setError("City not found. Try a different spelling.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") getWeather();
  };

  return (
    <div style={styles.app}>
    
      <div style={styles.header}>
        <h1 style={styles.h1}>🌤 Weather</h1>
        <p style={styles.subtitle}>Current conditions for any city</p>
      </div>

      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Enter city name…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="City name"
          style={styles.input}
        />
        <button
          onClick={getWeather}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "…" : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox} role="alert">
          ⚠ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingBox}>
          <LoadingDots />
          <span>Fetching weather data…</span>
        </div>
      )}

      {/* Weather Card */}
      {weather && (
        <div style={styles.card} aria-live="polite">
          {/* City */}
          <div style={styles.cityRow}>
            <span style={styles.pinIcon}>📍</span>
            <span style={styles.cityName}>{weather.city}</span>
          </div>

          {/* Temperature */}
          <div style={styles.tempRow}>
            <span style={styles.tempValue}>{weather.temperature}</span>
            <span style={styles.tempUnit}>°C</span>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <StatCard icon="💧" label="Humidity" value={weather.humidity} unit="%" />
            <StatCard icon="💨" label="Wind speed" value={weather.wind} unit="km/h" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>
        <span>{icon}</span> {label}
      </div>
      <div style={styles.statValue}>
        {value}
        <span style={styles.statUnit}> {unit}</span>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={styles.dotsWrapper} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            ...styles.dot,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}


const styles = {
  app: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    marginBottom: "1.75rem",
  },
  h1: {
    fontSize: 22,
    fontWeight: 500,
    margin: 0,
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  searchRow: {
    display: "flex",
    gap: 8,
    marginBottom: "1.25rem",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    fontSize: 15,
    border: "1px solid #ddd",
    borderRadius: 8,
    outline: "none",
    backgroundColor: "#fff",
    color: "#111",
  },
  button: {
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 500,
    border: "1px solid #ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#111",
    whiteSpace: "nowrap",
    transition: "background 0.15s",
  },
  errorBox: {
    fontSize: 14,
    color: "#991b1b",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: "1rem",
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "#666",
    marginBottom: "1rem",
  },
  dotsWrapper: {
    display: "inline-flex",
    gap: 4,
  },
  dot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#aaa",
    animation: "pulse 1.2s ease-in-out infinite",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "1.5rem",
  },
  cityRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: "1rem",
  },
  pinIcon: {
    fontSize: 16,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 500,
    color: "#111",
  },
  tempRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 4,
    marginBottom: "1.5rem",
  },
  tempValue: {
    fontSize: 56,
    fontWeight: 500,
    lineHeight: 1,
    color: "#111",
  },
  tempUnit: {
    fontSize: 24,
    color: "#666",
    marginTop: 8,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  statCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: "12px 14px",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 500,
    color: "#111",
  },
  statUnit: {
    fontSize: 13,
    color: "#888",
    fontWeight: 400,
  },
};