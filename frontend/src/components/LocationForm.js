import React, { useState } from 'react';

const LocationForm = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }
    onSearch(location);
    setError('');
  };

  return (
    <div className="location-form">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city or zip code"
          />
          <button type="submit">Get Weather</button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default LocationForm;