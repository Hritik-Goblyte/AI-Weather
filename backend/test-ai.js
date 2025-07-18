// Create test script: backend/test-ai.js
const { getAISuggestions } = require('./utils/aiHelper');

async function test() {
  const suggestions = await getAISuggestions({
    city: "Paris",
    temp: 15,
    condition: "rainy",
    humidity: 80,
    wind: 5
  });
  
  console.log("AI Suggestions:", suggestions);
}

test();