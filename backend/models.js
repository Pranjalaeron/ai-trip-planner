// Lightweight request validation is handled in server.js.
// This module documents the request shapes used by the frontend.
export const tripRequestFields = ['destination', 'days', 'interests', 'budget'];
export const saveTripRequestFields = [...tripRequestFields, 'itinerary'];
