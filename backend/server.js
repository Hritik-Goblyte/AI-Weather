require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai'); // ✅ FIXED

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenRouter AI client using OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://your-site.com",  // Optional
    "X-Title": "Weather AI",                 // Optional
  },
});

// Weather Endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ error: 'Location is required' });

    const isZip = /^\d{3,10}(,\w{2})?$/.test(location.trim());
    let url;

    if (isZip) {
      const zipParam = location.includes(',') ? location : `${location},IN`;
      url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipParam}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    }

    const response = await axios.get(url);
    const data = response.data;

    const { lat, lon } = data.coord;

    // Fetch AQI
    const aqiRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    const aqi = aqiRes.data.list[0].main.aqi;
    console.log('AQI Data:', aqiRes.data);


    // AQI scale (1–5) mapping
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

    res.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      icon: data.weather[0].icon,
      aqi: {
        index: aqi,
        level: aqiLevels[aqi - 1]
      }
    });
  } catch (error) {
    if (error.response?.status === 404) return res.status(404).json({ error: 'Location not found' });
    console.error('Weather Error:', error.message);
    res.status(500).json({ error: 'Weather service unavailable' });
  }
});


// AI Suggestions Endpoint using OpenRouter
app.get('/api/suggestions', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ error: 'Location is required' });

    const isZip = /^\d{3,10}(,\w{2})?$/.test(location.trim());
    let weatherUrl;

    if (isZip) {
      const zipParam = location.includes(',') ? location : `${location},IN`;
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipParam}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    }

    const weatherRes = await axios.get(weatherUrl);
    const weather = weatherRes.data;

    // Get AQI
    const { lat, lon } = weather.coord;
    const aqiRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const aqi = aqiRes.data.list[0].main.aqi;
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

    // 🧠 Updated AI prompt including AQI
    const prompt = `As a weather assistant, provide JSON-formatted recommendations for:
Location: ${weather.name}
Temperature: ${weather.main.temp}°C
Conditions: ${weather.weather[0].description}
Humidity: ${weather.main.humidity}%
Wind: ${weather.wind.speed} m/s
AQI: ${aqi} (${aqiLevels[aqi - 1]})

Respond ONLY with a JSON object like:
{
  "clothing": "...",
  "activities": "...",
  "health": "...",
  "tips": "..."
}`;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0].message.content;
    let suggestions;

    try {
      suggestions = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) suggestions = JSON.parse(match[0]);
      else throw new Error("AI response not valid JSON");
    }

    const keys = ['clothing', 'activities', 'health', 'tips'];
    if (!keys.every(k => k in suggestions)) throw new Error("Missing keys in AI response");

    res.json({ ...suggestions, aqi: { index: aqi, level: aqiLevels[aqi - 1] } });
  } catch (error) {
    console.error('Suggestion Error:', error.message);
    res.status(500).json({
      error: error.message,
      fallback: {
        clothing: "Dress in layers appropriate for the temperature",
        activities: "Check weather conditions before outdoor plans",
        health: "Stay hydrated and protect from extreme conditions",
        tips: "Always carry weather protection like an umbrella"
      }
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI model: OpenRouter (deepseek-r1:free)`);
});
