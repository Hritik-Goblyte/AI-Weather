import React from 'react';

const WeatherDisplay = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="weather-display">
      <div className="weather-header">
        <h2>{weather.city}</h2>
        <img 
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
          alt={weather.condition}
        />
      </div>
      <div className="weather-details">
        <p><strong>Temperature:</strong> {weather.temp}°C</p>
        <p><strong>Conditions:</strong> {weather.condition}</p>
        <p><strong>Humidity:</strong> {weather.humidity}%</p>
        <p><strong>Wind:</strong> {weather.wind} m/s</p>

        {weather.aqi && (
          <p>
            <strong>Air Quality:</strong> {weather.aqi.level} (AQI {weather.aqi.index})
          </p>
        )}
      </div>
    </div>
  );
};

export default WeatherDisplay;
