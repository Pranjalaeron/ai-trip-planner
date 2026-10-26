import { useState } from "react";
import {
  MapPin,
  CalendarDays,
  Heart,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { generateTrip, saveTrip } from "../api/trips";
import { TripMeta, ItineraryTimeline } from "../components/ItineraryDisplay";
import PlaneLoader from "../components/PlaneLoader";

const PERKS = [
  {
    icon: Sparkles,
    title: "AI-Powered Recommendations",
    text: "Every itinerary is tailored to your interests and budget, not a generic template.",
  },
  {
    icon: ShieldCheck,
    title: "Smart Route Optimization",
    text: "Activities are sequenced logically across your day, not scattered at random.",
  },
  {
    icon: Globe2,
    title: "Discover Hidden Gems",
    text: "Beyond the obvious landmarks — a mix of iconic and lesser-known spots.",
  },
];

function Planner() {
  const [formData, setFormData] = useState({
    destination: "",
    days: "",
    interests: "",
    budget: "medium",
  });
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const [locationResults, setLocationResults] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const searchLocations = async () => {
    const query = formData.destination.trim();

    if (query.length < 3) {
      setLocationError("Enter at least 3 characters.");
      setLocationResults([]);
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setLocationResults([]);

    try {
      const response = await fetch(
        `http://localhost:8000/location-search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Location search failed.");
      }

      setLocationResults(data);

      if (data.length === 0) {
        setLocationError("No locations found. Try another search.");
      }
    } catch (err) {
      setLocationError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure it is running."
          : err.message || "Unable to search locations.",
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const selectLocation = (place) => {
    setFormData((previous) => ({
      ...previous,
      destination: place.name,
    }));
    setLocationResults([]);
    setLocationError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setItinerary(null);
    setSaveStatus(null);

    try {
      const result = await generateTrip({
        ...formData,
        days: parseInt(formData.days, 10),
      });
      setItinerary(result.itinerary);
    } catch (err) {
      setError("Failed to generate itinerary. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await saveTrip({
        ...formData,
        days: parseInt(formData.days, 10),
        itinerary: JSON.stringify(itinerary),
      });
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* DECORATIVE BACKGROUND LAYER — all very low opacity, purely ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-16 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-aurora" />
        <div
          className="absolute top-40 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-aurora"
          style={{ animationDelay: "3s" }}
        />

        <svg
          className="absolute top-10 right-10 w-40 h-40 text-primary/10 animate-spin-slow"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="50"
            y1="4"
            x2="50"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="82"
            x2="50"
            y2="96"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <svg
          className="absolute top-1/3 left-0 w-full h-40 text-primary/10"
          viewBox="0 0 800 100"
          fill="none"
        >
          <path
            d="M0,60 C200,10 400,110 800,40"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
        </svg>

        {[MapPin, MapPin, MapPin].map((Icon, i) => (
          <Icon
            key={i}
            size={26}
            className={`absolute text-secondary/15 animate-float-slow`}
            style={{
              top: `${20 + i * 22}%`,
              left: i % 2 === 0 ? "8%" : "88%",
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}

        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute w-1.5 h-1.5 bg-secondary/40 rounded-full animate-particle"
            style={{
              left: `${15 + i * 14}%`,
              bottom: "10%",
              animationDelay: `${i * 1.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="text-center mb-10 animate-fade-up">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary bg-sage/50 px-4 py-2 rounded-full mb-5">
            <Sparkles size={14} /> AI Powered
          </span>
          <h1 className="text-4xl font-display font-semibold text-ink mb-3">
            AI Trip Planner
          </h1>
          <p className="text-ink/60 max-w-md mx-auto">
            Plan your perfect journey in seconds. Tell us your preferences and
            we'll build your itinerary.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="relative animate-fade-up">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] blur-2xl -z-10" />

          <form
            onSubmit={handleSubmit}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 space-y-5"
          >
            <div className="relative">
              <label className="block text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1.5 ml-1">
                Destination
              </label>

              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
                  />
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={(event) => {
                      handleChange(event);
                      setLocationResults([]);
                      setLocationError("");
                    }}
                    required
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full bg-white/80 border border-ink/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={searchLocations}
                  disabled={locationLoading}
                  className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locationLoading ? "Searching..." : "Search"}
                </button>
              </div>

              {locationError && (
                <p role="status" className="mt-2 text-sm text-red-600">
                  {locationError}
                </p>
              )}

              {locationResults.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lg">
                  {locationResults.map((place, index) => (
                    <button
                      type="button"
                      key={`${place.latitude}-${place.longitude}-${index}`}
                      onClick={() => selectLocation(place)}
                      className="block w-full border-b border-ink/5 px-4 py-3 text-left text-sm text-ink last:border-b-0 hover:bg-primary/5"
                    >
                      <span className="block break-words">{place.name}</span>
                      <span className="mt-1 block text-xs text-ink/50">
                        {place.latitude.toFixed(4)},{" "}
                        {place.longitude.toFixed(4)}
                      </span>
                    </button>
                  ))}

                  <p className="border-t border-ink/5 px-4 py-2 text-xs text-ink/50">
                    Location data © OpenStreetMap contributors
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
              />
              <label className="block text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1.5 ml-1">
                Number of Days
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                required
                min="1"
                max="14"
                placeholder="e.g. 3"
                className="w-full bg-white/80 border border-ink/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Heart
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
              />
              <label className="block text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1.5 ml-1">
                Interests
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                required
                placeholder="e.g. temples, food, hiking"
                className="w-full bg-white/80 border border-ink/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Wallet
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
              />
              <label className="block text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1.5 ml-1">
                Budget
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full bg-white/80 border border-ink/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-primary to-teal-900 text-white font-medium py-3.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? "Generating..." : "Generate Itinerary"}
                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </span>
            </button>
          </form>
        </div>

        {loading && <PlaneLoader />}

        {error && <p className="text-red-500 mt-6 text-center">{error}</p>}

        {itinerary && (
          <div className="relative mt-8 animate-fade-up">
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8">
              <TripMeta
                destination={formData.destination}
                days={formData.days}
                budget={formData.budget}
                interests={formData.interests}
              />
              <ItineraryTimeline data={itinerary} />

              <button
                onClick={handleSave}
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="mt-8 bg-gradient-to-r from-secondary to-amber-600 text-white font-medium px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "✓ Saved"}
                {(saveStatus === null || saveStatus === "error") &&
                  "Save This Trip"}
              </button>

              {saveStatus === "error" && (
                <p className="text-red-500 mt-2 text-sm">
                  Failed to save trip.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PERK CARDS */}
        {!itinerary && !loading && (
          <div className="grid sm:grid-cols-3 gap-5 mt-14">
            {PERKS.map((perk) => (
              <div
                key={perk.title}
                className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="bg-primary/10 text-primary rounded-full p-2.5 w-fit mb-4">
                  <perk.icon size={18} />
                </div>
                <h3 className="font-semibold text-ink text-sm mb-2">
                  {perk.title}
                </h3>
                <p className="text-ink/60 text-sm leading-relaxed">
                  {perk.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Planner;
