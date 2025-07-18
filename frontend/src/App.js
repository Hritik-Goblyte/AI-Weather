import React, { useState } from 'react';
import LocationForm from './components/LocationForm';
import WeatherDisplay from './components/WeatherDisplay';
import SuggestionBox from './components/SuggestionBox';
import { getWeather } from './services/api';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchLocation) => {
    setLoading(true);
    setError('');
    try {
      const weatherData = await getWeather(searchLocation);
      setWeather(weatherData);
      setLocation(searchLocation);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Weather AI Assistant</h1>
        <p>Get weather conditions and AI-powered recommendations</p>
      </header>

      <main>
        <LocationForm onSearch={handleSearch} />
        
        {loading && <div className="loader">Loading...</div>}
        {error && <p className="error">{error}</p>}
        
        <div className="results-container">
          {weather && <WeatherDisplay weather={weather} />}
          {location && <SuggestionBox location={location} />}
        </div>
      </main>

      <footer>
        <p>Powered by OpenWeather and DeepSeek AI</p>
      </footer>
    </div>
  );
}

export default App;