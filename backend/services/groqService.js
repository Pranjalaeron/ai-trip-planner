import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const client = apiKey ? new Groq({ apiKey }) : null;

export async function generateItinerary({
  destination,
  days,
  interests,
  budget,
}) {
  if (!client) {
    throw new Error("GROQ_API_KEY is not configured. Add it to backend/.env.");
  }

  const prompt = `
Create a detailed ${days}-day travel itinerary for ${destination}.
Traveler interests: ${interests}.
Budget level: ${budget}.

Respond with ONLY valid JSON in exactly this structure, no extra text:
{
  "trip_title": "short catchy title for the trip",
  "days": [
    {
      "day": 1,
      "title": "short theme for the day",
      "activities": [
        {
          "period": "Morning",
          "time": "09:00 - 11:00",
          "title": "activity name",
          "description": "1-2 sentence description"
        }
      ]
    }
  ]
}
Include 3-4 activities per day, spanning morning, afternoon, and evening.
`;

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content:
          "You are an expert travel planner. Always respond with valid JSON only — no markdown, no explanation.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");
  return JSON.parse(content);
}
