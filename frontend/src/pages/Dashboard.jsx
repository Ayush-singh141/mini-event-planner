import { useState, useEffect, useContext } from "react";
import axios from "axios";
import EventCard from "../components/EventCard";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "https://backend-fhej.onrender.com/api/events"
      );
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRSVP = async (eventId, action) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return alert("Please login to RSVP");

      await axios.post(
        `https://backend-fhej.onrender.com/api/events/${eventId}/rsvp`,
        { action },
        { headers: { "x-auth-token": token } }
      );

      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "RSVP Failed");
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const token = localStorage.getItem("auth-token");
      await axios.delete(
        `https://backend-fhej.onrender.com/api/events/${eventId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete Failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-bg-radial opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 glass-strong rounded-full text-sm font-semibold text-purple-300 border border-purple-500/30">
                🎉 Discover Amazing Events
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 text-balance leading-tight">
              Your Next <span className="gradient-text">Unforgettable</span>
              <br />
              Experience Awaits
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 text-balance max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of people attending incredible events around the
              world. Create memories that last a lifetime.
            </p>

            {user && (
              <motion.a
                href="/create-event"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="px-8 py-4 gradient-bg text-white font-bold rounded-xl text-lg glow-hover transition-all duration-300 inline-flex items-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Your Event
                </button>
              </motion.a>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              { label: "Active Events", value: events.length, icon: "🎪" },
              {
                label: "Total Attendees",
                value: events.reduce((acc, e) => acc + e.attendees.length, 0),
                icon: "👥",
              },
              { label: "Communities", value: "50+", icon: "🌍" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-strong rounded-2xl p-6 text-center border border-white/10"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="glass-strong rounded-3xl p-16 max-w-lg mx-auto border border-white/10">
              <div className="text-7xl mb-6">🎉</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                No Events Yet
              </h3>
              <p className="text-slate-400 mb-8 text-lg">
                Be the first to create an amazing event!
              </p>
              {user && (
                <a href="/create-event">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 gradient-bg text-white font-semibold rounded-xl glow-hover transition-all duration-300"
                  >
                    Create Your First Event
                  </motion.button>
                </a>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                Upcoming Events
              </h2>
              <p className="text-slate-400">
                Discover and join exciting events happening soon
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onRSVP={handleRSVP}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
