const OpenAI = require('openai');

const getAISuggestions = async (weatherData) => {
  const { city, temp, condition, humidity, wind } = weatherData;
  
  const prompt = `Provide 3-5 practical suggestions for someone experiencing this weather:
  - Location: ${city}
  - Temperature: ${temp}°C
  - Conditions: ${condition}
  - Humidity: ${humidity}%
  - Wind: ${wind} m/s

  Format your response as a JSON object with these keys:
  - "clothing": string (suggested clothing)
  - "activities": string (recommended activities)
  - "health": string (health precautions)
  - "tips": string (special considerations)`;

  try {
    // Initialize OpenAI client with DeepSeek configuration
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    // Make API request
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a helpful weather assistant. Respond ONLY with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    // Parse and return JSON response
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("DeepSeek API Error:", {
      message: error.message,
      status: error.status,
      code: error.code
    });
    
    // Fallback suggestions
    return {
      clothing: "Wear layers appropriate for the temperature",
      activities: "Check weather conditions before outdoor activities",
      health: "Stay hydrated and protect yourself from extreme conditions",
      tips: "Always carry an umbrella just in case"
    };
  }
};

module.exports = { getAISuggestions };