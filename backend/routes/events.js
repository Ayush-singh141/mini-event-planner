const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate("organizer", "username");
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Event
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    // Imgbb Upload
    const formData = new FormData();
    formData.append("image", req.file.buffer.toString("base64"));

    const imgbbResponse = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const imageUrl = imgbbResponse.data.data.url;

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      capacity,
      image: imageUrl,
      organizer: req.user.id,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Edit Event (Owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Event (Owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RSVP Endpoint - Critical Concurrency Logic
router.post("/:id/rsvp", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { action } = req.body; // 'join' or 'leave'

    if (action === "join") {
      // Check if already joined to avoid duplicate increment although $addToSet prevents dups, we need specific error or logic
      // But strict requirement: "No Duplicates" and "Capacity Enforcement"

      // Using findOneAndUpdate with condition for ATOMICITY
      const event = await Event.findOneAndUpdate(
        {
          _id: eventId,
          $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] }, // Condition: Attendees < Capacity
          attendees: { $ne: userId }, // Condition: User not already in attendees
        },
        { $push: { attendees: userId } },
        { new: true }
      );

      if (!event) {
        // Check why it failed
        const currentEvent = await Event.findById(eventId);
        if (!currentEvent)
          return res.status(404).json({ message: "Event not found" });
        if (currentEvent.attendees.includes(userId))
          return res.status(400).json({ message: "Already RSVPed" });
        if (currentEvent.attendees.length >= currentEvent.capacity)
          return res.status(400).json({ message: "Event is full" });
        return res.status(400).json({ message: "RSVP Failed" });
      }

      return res.json({
        message: "RSVP Successful",
        attendees: event.attendees,
      });
    } else if (action === "leave") {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { $pull: { attendees: userId } },
        { new: true }
      );
      res.json({ message: "RSVP Cancelled", attendees: event.attendees });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
