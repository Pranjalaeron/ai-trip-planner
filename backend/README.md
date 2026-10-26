# TravelIQ JavaScript Backend

This is a Node.js + Express conversion of the supplied Python/FastAPI backend. It preserves the API routes and SQLite schema.

## Requirements
- Node.js 20 or newer recommended
- A Groq API key for itinerary generation

## Setup
Run these commands from this folder (`backend-js` after extracting):

```bash
npm install
cp .env.example .env
```

Open `.env` and replace `put_your_groq_api_key_here` with your Groq API key. Do not commit `.env` or share it publicly.

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:8000`.

## Routes
- `GET /` — health check
- `GET /destinations` — available destinations
- `POST /generate-trip` — generate itinerary through Groq
- `POST /save-trip` — save a trip to SQLite
- `GET /saved-trips` — list saved trips
- `DELETE /saved-trips/:trip_id` — delete a saved trip

CORS permits `http://localhost:5173` and `http://localhost:5174`.

## Database note
The server creates `trips.db` in this backend folder. If your previous Python backend created `backend/trips.db`, copy that database file into this folder if you want to keep saved trips. Do not overwrite an existing database without backing it up.

## Frontend
Keep the React frontend running separately. If your frontend uses a different backend URL or port, update its API base URL to `http://localhost:8000`.
