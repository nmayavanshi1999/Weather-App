import { useState } from "react";
import axios from "axios";

const THEMES = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #0099f7 100%)",
  "linear-gradient(135deg, #f7971e 0%, #ffd200 50%, #ff6b6b 100%)",
  "linear-gradient(135deg, #fc466b 0%, #3f5efb 50%, #834d9b 100%)",
  "linear-gradient(135deg, #0575e6 0%, #021b79 50%, #667eea 100%)",
  "linear-gradient(135deg, #1d976c 0%, #93f9b9 50%, #00b4d8 100%)",
];

function getCondition(temp) {
  if (temp <= 5) return { text: "Freezing cold ❄️", icon: "🌨️" };
  if (temp <= 15) return { text: "Cool & breezy", icon: "🌤️" };
  if (temp <= 22) return { text: "Comfortable weather", icon: "⛅" };
  if (temp <= 30) return { text: "Warm & pleasant", icon: "☀️" };
  return { text: "Hot & sunny 🔥", icon: "🌞" };
}

function randomTheme() {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(THEMES[0]);
  const [lastCity, setLastCity] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

 
  const fetchSuggestions = async (value) => {
    setCity(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          value
        )}&count=5`
      );

      setSuggestions(res.data.results || []);
      setShowSuggestions(true);
    } catch (err) {
      console.log(err);
    }
  };

 
  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const geo = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1`
      );

      if (!geo.data.results) throw new Error("Not found");

      const { latitude, longitude, name, country } =
        geo.data.results[0];

      const wx = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m`
      );

      const c = wx.data.current;
      const temp = Math.round(c.temperature_2m);

      setTheme(randomTheme());

      setWeather({
        name,
        country: country || "",
        temp,
        feels: Math.round(c.apparent_temperature),
        humidity: Math.round(c.relative_humidity_2m),
        wind: Math.round(c.wind_speed_10m),
        condition: getCondition(temp),
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      setLastCity(cityName);
      setCity("");
      setSuggestions([]);
      setShowSuggestions(false);
    } catch {
      setError("City not found. Try a different spelling.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchWeather(city);

  const handleRefresh = () => {
    if (lastCity) {
      fetchWeather(lastCity);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div style={{ ...s.page, background: theme }}>
      <div style={s.inner}>
        
        <div style={s.appTitle}>
          <h1 style={s.h1}>⛅ Weather</h1>
          <p style={s.titleSub}>
            Real-time conditions anywhere in the world
          </p>
        </div>

      
        <div style={s.searchBox}>
          <div style={s.searchRow}>
            <input
              style={s.input}
              type="text"
              placeholder="Search for a city…"
              value={city}
              onChange={(e) => fetchSuggestions(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="City name"
            />

            <button
              style={{
                ...s.searchBtn,
                opacity: loading ? 0.6 : 1,
              }}
              onClick={handleSearch}
              disabled={loading}
            >
              🔍 Search
            </button>
          </div>

         
          {showSuggestions && suggestions.length > 0 && (
            <div style={s.suggestionBox}>
              {suggestions.map((item, index) => (
                <div
                  key={index}
                  style={s.suggestionItem}
                  onClick={() => {
                    fetchWeather(item.name);
                  }}
                >
                  📍 {item.name}, {item.country}
                </div>
              ))}
            </div>
          )}
        </div>

     
        {error && (
          <div style={s.errorBox} role="alert">
            ⚠ {error}
          </div>
        )}

        
        {loading && (
          <div style={s.loadingBox}>
            <LoadingDots />
            Fetching weather…
          </div>
        )}

        {weather && (
          <div style={s.card} aria-live="polite">
            <div style={s.cardHero}>
              <div style={s.heroTop}>
                <div>
                  <div style={s.cityName}>
                    📍 {weather.name}
                  </div>

                  <div style={s.cityCountry}>
                    {weather.country}
                  </div>
                </div>

                <div style={s.weatherIcon}>
                  {weather.condition.icon}
                </div>
              </div>

              <div style={s.tempRow}>
                <span style={s.bigTemp}>
                  {weather.temp}
                </span>

                <span style={s.tempUnit}>°C</span>
              </div>

              <div style={s.conditionText}>
                {weather.condition.text}
              </div>
            </div>

            <div style={s.divider} />

            
            <div style={s.statsGrid}>
              <StatItem
                icon="💧"
                label="Humidity"
                value={weather.humidity}
                unit="%"
              />

              <StatItem
                icon="💨"
                label="Wind"
                value={weather.wind}
                unit="km/h"
                border
              />

              <StatItem
                icon="🌡️"
                label="Feels like"
                value={weather.feels}
                unit="°C"
                border
              />
            </div>

            
            <div style={s.cardFooter}>
              <span style={s.footerText}>
                Updated {weather.updatedAt}
              </span>

              <button
                style={s.refreshBtn}
                onClick={handleRefresh}
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  unit,
  border,
}) {
  return (
    <div
      style={{
        ...s.stat,
        borderLeft: border
          ? "1px solid rgba(255,255,255,0.2)"
          : "none",
      }}
    >
      <div style={s.statIcon}>{icon}</div>

      <div style={s.statLabel}>{label}</div>

      <div style={s.statVal}>
        {value}
        <span style={s.statUnit}> {unit}</span>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 4,
      }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.8)",
            display: "inline-block",
            animation:
              "dp 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes dp {
          0%,80%,100% {
            opacity:.2
          }

          40% {
            opacity:1
          }
        }
      `}</style>
    </span>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    padding: "1.5rem 1rem",
    fontFamily: "system-ui, sans-serif",
    transition: "background 0.6s ease",
  },

  inner: {
    maxWidth: 440,
    margin: "0 auto",
  },

  appTitle: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },

  h1: {
    fontSize: 28,
    fontWeight: 500,
    color: "#fff",
    margin: 0,
  },

  titleSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },

  searchBox: {
    position: "relative",
    background: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: "1rem",
    marginBottom: "1rem",
  },

  searchRow: {
    display: "flex",
    gap: 8,
  },

  input: {
    flex: 1,
    background: "rgba(255,255,255,0.25)",
    border: "1.5px solid rgba(255,255,255,0.4)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    color: "#fff",
    outline: "none",
  },

  searchBtn: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 500,
    background: "#fff",
    color: "#764ba2",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  suggestionBox: {
    marginTop: 10,
    background: "rgba(255,255,255,0.95)",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
  },

  suggestionItem: {
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
    color: "#333",
    borderBottom: "1px solid #eee",
  },

  errorBox: {
    background: "rgba(252,235,235,0.95)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#791F1F",
    marginBottom: "1rem",
  },

  loadingBox: {
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: "1rem",
  },

  card: {
    background: "rgba(255,255,255,0.15)",
    border: "1.5px solid rgba(255,255,255,0.3)",
    borderRadius: 20,
    overflow: "hidden",
  },

  cardHero: {
    padding: "1.75rem 1.5rem 1.25rem",
  },

  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cityName: {
    fontSize: 20,
    fontWeight: 500,
    color: "#fff",
  },

  cityCountry: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
  },

  weatherIcon: {
    fontSize: 52,
    lineHeight: 1,
  },

  tempRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 6,
    marginTop: "1rem",
  },

  bigTemp: {
    fontSize: 72,
    fontWeight: 500,
    color: "#fff",
    lineHeight: 1,
  },

  tempUnit: {
    fontSize: 28,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
  },

  conditionText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
  },

  divider: {
    height: 1.5,
    background: "rgba(255,255,255,0.2)",
    margin: "0 1.5rem",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
  },

  stat: {
    padding: "14px 10px",
    textAlign: "center",
  },

  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },

  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 4,
  },

  statVal: {
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
  },

  statUnit: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
  },

  cardFooter: {
    padding: "0.75rem 1.5rem",
    background: "rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  refreshBtn: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    background: "rgba(255,255,255,0.18)",
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    cursor: "pointer",
  },
};