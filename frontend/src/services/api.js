const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export const getWeather = async (location) => {
  const response = await fetch(`${API_BASE}/weather?location=${location}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Weather data unavailable');
  }
  return response.json();
};

export const getSuggestions = async (location) => {
  const response = await fetch(`${API_BASE}/suggestions?location=${location}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Suggestions unavailable');
  }
  return response.json();
};