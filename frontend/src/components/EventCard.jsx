import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const EventCard = ({ event, onRSVP, onDelete }) => {
  const { user } = useContext(AuthContext);

  const isOwner =
    user &&
    event.organizer &&
    (event.organizer._id === user.id || event.organizer.id === user.id);
  const isJoined = user && event.attendees.includes(user.id);
  const isFull = event.attendees.length >= event.capacity;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const capacityPercentage = Math.min(
    (event.attendees.length / event.capacity) * 100,
    100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group card-premium rounded-2xl overflow-hidden hover:card-shadow-hover transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {isFull && (
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold z-20 glow">
            Sold Out
          </div>
        )}

        {/* Floating Date Badge */}
        <div className="absolute top-4 left-4 glass-strong rounded-xl p-3 z-20">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {new Date(event.date).getDate()}
            </div>
            <div className="text-xs text-slate-300 uppercase">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:gradient-text transition-all duration-300">
          {event.title}
        </h3>

        {/* Meta Info */}
        <div className="space-y-2.5 text-sm text-slate-300">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-4 h-4 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Capacity Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Attendees
            </span>
            <span className="font-semibold text-white">
              {event.attendees.length} / {event.capacity}
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isFull
                  ? "bg-gradient-to-r from-red-500 to-pink-500"
                  : "bg-gradient-to-r from-purple-500 to-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {user && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRSVP(event._id, isJoined ? "leave" : "join")}
              disabled={!isJoined && isFull}
              className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isJoined
                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  : isFull
                  ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "gradient-bg text-white glow-hover"
              }`}
            >
              {isJoined ? "Leave Event" : isFull ? "Event Full" : "Join Event"}
            </motion.button>
          )}

          {isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(event._id)}
              className="px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
