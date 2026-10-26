import "dotenv/config";
import express from "express";
import cors from "cors";
import { destinations } from "./data/destinations.js";
import { initDb, getDb } from "./database.js";
import { generateItinerary } from "./services/groqService.js";

const app = express();
const PORT = Number(process.env.PORT || 8000);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

initDb();

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Travel Companion API is running" });
});

app.get("/destinations", (_req, res) => {
  res.json(destinations);
});

app.get("/location-search", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (query.length < 3) {
    return res.status(400).json({
      error: "Enter at least 3 characters to search.",
    });
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "5",
      addressdetails: "1",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "TravelIQ/1.0 (travel planner app)",
        },
      },
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "Location search service is unavailable.",
      });
    }

    const results = await response.json();

    res.json(
      results.map((place) => ({
        name: place.display_name,
        latitude: Number(place.lat),
        longitude: Number(place.lon),
      })),
    );
  } catch (error) {
    console.error("Location search error:", error.message);
    res.status(500).json({
      error: "Unable to search locations.",
    });
  }
});

app.post("/generate-trip", async (req, res) => {
  const { destination, days, interests, budget } = req.body ?? {};
  if (
    !destination ||
    !Number.isInteger(Number(days)) ||
    Number(days) < 1 ||
    typeof interests !== "string" ||
    typeof budget !== "string"
  ) {
    return res.status(400).json({
      detail: "destination, positive days, interests, and budget are required.",
    });
  }

  try {
    const itinerary = await generateItinerary({
      destination: String(destination),
      days: Number(days),
      interests,
      budget,
    });
    return res.json({ itinerary });
  } catch (error) {
    console.error("Failed to generate itinerary:", error?.message || error);
    return res.status(500).json({
      detail: "Failed to generate itinerary. Please try again.",
    });
  }
});

app.post("/save-trip", (req, res) => {
  const { destination, days, interests, budget, itinerary } = req.body ?? {};
  if (
    !destination ||
    !Number.isInteger(Number(days)) ||
    Number(days) < 1 ||
    typeof interests !== "string" ||
    typeof budget !== "string" ||
    (typeof itinerary !== "string" && typeof itinerary !== "object")
  ) {
    return res.status(400).json({
      detail:
        "destination, positive days, interests, budget, and itinerary are required.",
    });
  }

  try {
    const db = getDb();
    const result = db
      .prepare(
        `
      INSERT INTO trips (destination, days, interests, budget, itinerary)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(
        String(destination),
        Number(days),
        interests,
        budget,
        typeof itinerary === "string" ? itinerary : JSON.stringify(itinerary),
      );
    return res.json({
      message: "Trip saved successfully",
      id: Number(result.lastInsertRowid),
    });
  } catch (error) {
    console.error("Failed to save trip:", error?.message || error);
    return res.status(500).json({ detail: "Failed to save trip." });
  }
});

app.get("/saved-trips", (_req, res) => {
  try {
    const rows = getDb()
      .prepare("SELECT * FROM trips ORDER BY created_at DESC")
      .all();
    return res.json(rows);
  } catch (error) {
    console.error("Failed to retrieve saved trips:", error?.message || error);
    return res.status(500).json({ detail: "Failed to retrieve saved trips." });
  }
});

app.delete("/saved-trips/:trip_id", (req, res) => {
  const tripId = Number(req.params.trip_id);
  if (!Number.isInteger(tripId) || tripId < 1) {
    return res.status(400).json({ detail: "Invalid trip ID." });
  }

  try {
    const result = getDb()
      .prepare("DELETE FROM trips WHERE id = ?")
      .run(tripId);
    if (result.changes === 0) {
      return res.status(404).json({ detail: "Trip not found" });
    }
    return res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Failed to delete trip:", error?.message || error);
    return res.status(500).json({ detail: "Failed to delete trip." });
  }
});

app.listen(PORT, () => {
  console.log(`Travel Companion API running at http://localhost:${PORT}`);
});
