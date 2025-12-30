# Mini Event Planner

A full-stack event management application that allows users to create, browse, and RSVP to events with built-in capacity management and atomic transaction handling for concurrent RSVP operations.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Technical Explanation: RSVP Capacity & Concurrency](#technical-explanation-rsvp-capacity--concurrency)
- [Features Implemented](#features-implemented)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0 or higher)
- **npm** or **yarn**
- **MongoDB** account (for cloud database) or local MongoDB installation
- **Git** (for version control)

### Recommended Tools

- Visual Studio Code or any code editor
- Postman or similar tool for API testing
- Chrome DevTools for frontend debugging

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd mini\ event\ planner
```

### Step 2: Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secret_key_here
IMGBB_API_KEY=your_imgbb_api_key
```

**Where to get these:**

- `MONGO_URI`: Create a MongoDB Atlas account and cluster at https://www.mongodb.com/cloud/atlas
- `JWT_SECRET`: Generate any strong random string (e.g., using https://www.uuidgenerator.net/)
- `IMGBB_API_KEY`: Sign up at https://imgbb.com/ and get your API key

### Step 3: Set Up Frontend

```bash
cd ../frontend
npm install
```

---

## Running the Application

### Option 1: Run Backend and Frontend Separately (Development)

**Terminal 1 - Backend:**

```bash
cd backend
npm start
# or for development with auto-reload:
# npx nodemon server.js
```

The backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

Open your browser and navigate to `http://localhost:5173`

### Option 2: Run Everything from Root Folder

```bash
# Install dependencies for both
cd backend && npm install && cd ../frontend && npm install && cd ..

# Start both (in separate terminals)
cd backend && npm start  # Terminal 1
cd frontend && npm run dev  # Terminal 2
```

### Building for Production

**Backend:** Already production-ready with Express server

**Frontend:** Build the static files

```bash
cd frontend
npm run build
npm run preview
```

---

## Technical Explanation: RSVP Capacity & Concurrency

### Challenge

In a multi-user environment, multiple users might attempt to RSVP to the same event simultaneously. Without proper handling, this creates a **race condition** where:

1. User A checks if capacity is available (say, 1 spot left)
2. User B checks capacity at the same time (also sees 1 spot)
3. Both users proceed to join, exceeding the capacity limit
4. The database could also contain duplicate attendees if multiple join requests overlap

### Solution: Atomic MongoDB Operations with Conditions

The RSVP endpoint uses **MongoDB's atomic update with field conditions** to solve this problem:

```javascript
// RSVP Endpoint - Critical Concurrency Logic
router.post("/:id/rsvp", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { action } = req.body;

    if (action === "join") {
      // Atomic update with MULTIPLE conditions
      const event = await Event.findOneAndUpdate(
        {
          _id: eventId,
          // Condition 1: Check capacity in the query itself
          $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] },
          // Condition 2: Ensure user is not already an attendee
          attendees: { $ne: userId },
        },
        // Only execute the push if both conditions are met
        { $push: { attendees: userId } },
        { new: true }
      );

      if (!event) {
        // Determine which condition failed for specific error messaging
        const currentEvent = await Event.findById(eventId);
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
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Key Technical Details

#### 1. **Atomic Operations**

- `findOneAndUpdate()` is atomic at the MongoDB level
- The entire find-check-update happens in a single database operation
- No race condition window exists between checking and updating

#### 2. **Aggregation Expression ($expr)**

- `$expr: { $lt: [{ $size: "$attendees" }, "$capacity"] }`
- This condition checks if the attendee array size is less than capacity
- The condition is evaluated within the database, not in application code
- Prevents the race condition at the lowest level (database)

#### 3. **No Duplicates ($addToSet alternative)**

- `attendees: { $ne: userId }` prevents adding the same user twice
- Works in conjunction with `$push` to ensure uniqueness
- Alternative approach: Use `$addToSet` instead of `$push` (idempotent operation)

#### 4. **Error Handling**

- If `findOneAndUpdate()` returns null, we fetch the current state again
- We then provide specific error messages explaining why the join failed
- This gives clear feedback to the user (event full, already joined, etc.)

### Why This Approach Works

| Scenario                                               | Result                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| User A and B both join simultaneously when 1 spot left | MongoDB ensures only ONE succeeds; the other gets "Event is full"   |
| User tries to join twice quickly                       | `attendees: { $ne: userId }` catches this; returns "Already RSVPed" |
| 100 concurrent join requests with 5 spots              | Exactly 5 succeed, 95 fail with "Event is full"                     |
| User leaves event while 10 people are joining          | `$pull` removes safely; `$expr` ensures no overbooking              |

### Performance Considerations

- **O(n) array size check**: The `$size` operation is O(n) for very large attendee lists, but typical events have reasonable capacities
- **No table locks**: MongoDB doesn't lock entire tables; only the specific document being updated
- **Scalable**: Works efficiently even with thousands of concurrent requests to different events

---

## Features Implemented

### User Management

- ✅ **User Registration** - Create a new account with username and password
- ✅ **User Login** - Authenticate with JWT tokens
- ✅ **Protected Routes** - Only authenticated users can access certain pages
- ✅ **Password Hashing** - Bcrypt used for secure password storage
- ✅ **Session Persistence** - JWT token stored in localStorage for session management

### Event Management

- ✅ **Create Events** - Authenticated users can create new events
- ✅ **View All Events** - Browse all available events on the dashboard
- ✅ **Event Details** - See event title, description, date, location, capacity, and organizer
- ✅ **Edit Events** - Event organizers can update event details
- ✅ **Delete Events** - Event organizers can remove their events
- ✅ **Event Sorting** - Events are sorted by date (upcoming first)

### RSVP & Capacity Management

- ✅ **RSVP to Events** - Join events with one-click RSVP
- ✅ **RSVP Cancellation** - Withdraw from events and free up spots
- ✅ **Capacity Enforcement** - Events cannot exceed their capacity limit
- ✅ **Atomic RSVP Operations** - Concurrent requests handled safely without overbooking
- ✅ **Duplicate Prevention** - Users cannot RSVP to the same event twice
- ✅ **Real-time Capacity Display** - Shows current attendees vs. capacity
- ✅ **Attendee List** - View who's attending each event

### Media Management

- ✅ **Image Upload** - Upload event images via Imgbb API
- ✅ **Image Storage** - Images are hosted on Imgbb CDN for reliability
- ✅ **Event Thumbnails** - Display event images on event cards

### User Interface

- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Tailwind CSS Styling** - Modern, clean UI with utility-first CSS
- ✅ **Framer Motion Animations** - Smooth page transitions and animations
- ✅ **Navigation Bar** - Easy navigation between pages and logout functionality
- ✅ **Event Cards** - Display events in a card-based grid layout
- ✅ **Loading States** - Shows loading indicator while fetching events
- ✅ **Error Handling** - User-friendly error messages for failed operations
- ✅ **Footer** - Application footer with branding

### Backend Infrastructure

- ✅ **Express Server** - RESTful API with Express.js
- ✅ **MongoDB Integration** - Data persistence with Mongoose ODM
- ✅ **CORS Support** - Cross-origin requests enabled
- ✅ **Middleware Authentication** - JWT token validation on protected routes
- ✅ **Error Handling** - Comprehensive error responses

---

## Project Structure

```
mini event planner/
├── backend/
│   ├── .env                 # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── server.js            # Express server entry point
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── Event.js         # Event schema with capacity
│   │   └── User.js          # User schema
│   └── routes/
│       ├── auth.js          # Authentication routes (login, register)
│       └── events.js        # Event CRUD & RSVP routes
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js       # Vite configuration
│   ├── eslint.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main app component with routing
│   │   ├── App.css
│   │   ├── index.css        # Global styles
│   │   ├── assets/          # Static assets
│   │   ├── components/
│   │   │   ├── Navbar.jsx   # Navigation bar
│   │   │   ├── Footer.jsx   # Footer component
│   │   │   ├── EventCard.jsx # Event card component
│   │   │   └── ProtectedRoute.jsx # Route protection wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication context & state
│   │   └── pages/
│   │       ├── Login.jsx        # Login page
│   │       ├── Register.jsx     # Registration page
│   │       ├── Dashboard.jsx    # Main events page
│   │       └── CreateEvent.jsx  # Create event form
│   └── public/
│
└── README.md                # This file
```

---

## API Endpoints

### Authentication Routes

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Login and get JWT token |

### Event Routes

| Method | Endpoint               | Description                               |
| ------ | ---------------------- | ----------------------------------------- |
| GET    | `/api/events`          | Get all events (sorted by date)           |
| POST   | `/api/events`          | Create a new event (requires auth)        |
| PUT    | `/api/events/:id`      | Update event (owner only)                 |
| DELETE | `/api/events/:id`      | Delete event (owner only)                 |
| POST   | `/api/events/:id/rsvp` | RSVP to event (action: 'join' or 'leave') |

### Example API Calls

**Register:**

```bash
POST /api/auth/register
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Create Event:**

```bash
POST /api/events
Headers: x-auth-token: <your_jwt_token>
{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference",
  "date": "2025-06-15T10:00:00Z",
  "location": "San Francisco, CA",
  "capacity": 500,
  "image": <image_file>
}
```

**RSVP to Event:**

```bash
POST /api/events/65d1a4c2b8e2f5a3c9f2e1d7/rsvp
Headers: x-auth-token: <your_jwt_token>
{
  "action": "join"
}
```

---

## Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

# Authentication
JWT_SECRET=your_super_secret_key_here

# Image Upload
IMGBB_API_KEY=your_imgbb_api_key_here
```

### Frontend

Frontend uses environment variables through Vite:

- Update API base URLs in component files if backend is on a different server
- Default: `https://localhost:5000` (development) or deployed backend URL

---

## Troubleshooting

### MongoDB Connection Error

- Verify your `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist includes your current IP
- Ensure database user has proper permissions

### Image Upload Fails

- Verify `IMGBB_API_KEY` is valid
- Check Imgbb account is active
- Ensure image file is not too large (>32MB limit)

### RSVP Returns "Event is Full"

- This is expected behavior when capacity is reached
- Check the event's `capacity` field vs. current `attendees` count
- Error indicates capacity enforcement is working correctly

### JWT Token Invalid

- Token may have expired; user needs to login again
- Verify `JWT_SECRET` matches between sessions
- Clear browser localStorage if issues persist

### CORS Errors

- Frontend and backend must be running
- Verify backend CORS is enabled (it is in `server.js`)
- Check frontend API calls use correct backend URL

---

## Development

### Running with Auto-Reload

**Backend with Nodemon:**

```bash
cd backend
npm install -g nodemon
nodemon server.js
```

**Frontend (Vite already has HMR):**

```bash
cd frontend
npm run dev
```

### Linting

```bash
cd frontend
npm run lint
```

---

## Deployment

### Deploying Backend

**Recommended:** Render, Heroku, Railway, or DigitalOcean

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables on platform
4. Deploy (platform will run `npm install` and `npm start`)

### Deploying Frontend

**Recommended:** Vercel, Netlify, or GitHub Pages

1. Build: `npm run build`
2. Deploy `dist/` folder to hosting platform
3. Update API base URLs to point to deployed backend

---

## License

This project is open source and available under the MIT License.

---

## Support

For issues or questions:

1. Check the Troubleshooting section
2. Review your `.env` file configuration
3. Check browser console and network tabs for detailed errors
4. Ensure all dependencies are installed: `npm install`

---

**Happy Event Planning! 🎉**
