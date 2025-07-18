import React, { useState, useEffect } from 'react';
import { getSuggestions } from '../services/api';

const SuggestionBox = ({ location }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
    useEffect(() => {
      if (location) {
        setLoading(true);
        setError('');
        getSuggestions(location)
          .then(data => {
            // Handle fallback if needed
            if (data.fallback) {
              setSuggestions(data.fallback);
              setError('Using fallback suggestions');
            } else {
              setSuggestions(data);
            }
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      }
    }, [location]);
  
    // ... rest of component ...

  if (!location) return null;

  return (
    <div className="suggestion-box">
      <h3>AI Recommendations</h3>
      
      {loading && <p>Generating suggestions...</p>}
      {error && <p className="error">{error}</p>}
      
      {suggestions && !loading && !error && (
        <div className="suggestion-cards">
          <div className="card">
            <h4>👕 Clothing</h4>
            <p>{suggestions.clothing}</p>
          </div>
          <div className="card">
            <h4>🎯 Activities</h4>
            <p>{suggestions.activities}</p>
          </div>
          <div className="card">
            <h4>❤️ Health</h4>
            <p>{suggestions.health}</p>
          </div>
          <div className="card">
            <h4>💡 Tips</h4>
            <p>{suggestions.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionBox;