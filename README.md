# FestiLog 🎧

A full-stack web app to log raves and concerts you've attended, rate DJ sets, track artists, and visualize your music history over time.

Built as a portfolio project to learn REST API design, backend development with Node.js + Express, relational database modeling, and full-stack integration with React.

---

## Features

- **Event logging** — log concerts and raves with venue, city, date, and genre
- **Set ratings** — rate individual DJ/artist sets (1–10) with personal notes
- **Artist tracker** — see every artist you've seen, ranked by rating and frequency
- **Spotify integration** — search and pull artist metadata (name, image, genre) from the Spotify API
- **Stats dashboard** — total events, artists seen, average rating, and events-over-time chart
- **Auth** — JWT-based register/login, all data scoped to your account

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| External API | Spotify Web API |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## API routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Events
| Method | Route | Description |
|---|---|---|
| GET | `/api/events` | List all your logged events |
| POST | `/api/events` | Log a new event |
| GET | `/api/events/:id` | Get event details + sets |
| PUT | `/api/events/:id` | Edit an event |
| DELETE | `/api/events/:id` | Delete an event |

### Sets
| Method | Route | Description |
|---|---|---|
| POST | `/api/events/:id/sets` | Add a set to an event |
| PUT | `/api/sets/:id` | Rate or edit a set |
| DELETE | `/api/sets/:id` | Remove a set |

### Artists
| Method | Route | Description |
|---|---|---|
| GET | `/api/artists` | All artists you've seen, ranked |
| GET | `/api/artists/:id` | Artist detail + full set history |
| GET | `/api/artists/search?q=` | Search artists via Spotify API |

### Stats
| Method | Route | Description |
|---|---|---|
| GET | `/api/stats` | Totals: events, artists, sets, avg rating |
| GET | `/api/stats/timeline` | Events grouped by month (for chart) |

---

## Data model

```
User
  id, email, username, password (hashed), createdAt

Event
  id, userId (FK), name, venue, city, date, genre, notes, createdAt

Artist
  id, name, spotifyId, genre, imageUrl

Set
  id, eventId (FK), artistId (FK), startTime, rating (1–10), notes, createdAt
```

**Key relationships:**
- A `User` has many `Events`
- An `Event` has many `Sets`
- A `Set` belongs to one `Event` and one `Artist`
- `Artist` data is pulled from Spotify once and cached locally

---

## Project structure

```
setlog-api/               # Backend
├── src/
│   ├── index.js          # Express entry point
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── sets.js
│   │   ├── artists.js
│   │   └── stats.js
│   ├── middleware/
│   │   └── auth.js       # JWT verification middleware
│   └── lib/
│       └── prisma.js     # Prisma client singleton
├── prisma/
│   └── schema.prisma
└── .env                  # Never commit this

setlog-web/               # Frontend (separate repo or monorepo)
├── src/
│   ├── App.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── EventDetail.jsx
│   │   └── Artists.jsx
│   ├── components/
│   └── api/              # Fetch wrappers for each route
└── .env
```

---

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- A Spotify Developer account (for API keys)

### Backend setup

```bash
git clone https://github.com/amawong/festiLog
cd festiLog
npm install

# Set up your .env (see .env.example)
cp .env.example .env

# Push the database schema
npx prisma db push

# Start the dev server
npm run dev
```

### Frontend setup

```bash
git clone https://github.com/YOUR_USERNAME/festiLog-web
cd festiLog-web
npm install
cp .env.example .env
npm run dev
```

### Environment variables

**Backend `.env`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/setlog"
JWT_SECRET="your-long-random-secret"
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
PORT=3001
```

**Frontend `.env`:**
```
VITE_API_URL="http://localhost:3001"
```

---

## Roadmap

- [x] Project setup + Express server
- [x] PostgreSQL schema + Prisma
- [x] JWT auth (register, login)
- [ ] Events CRUD routes
- [ ] Sets CRUD routes
- [ ] Artists routes + Spotify integration
- [ ] Stats endpoints
- [ ] React frontend — auth + event log
- [ ] React frontend — artist tracker + stats dashboard
- [ ] Deploy to Railway + Vercel

---

## What I learned

- Designing a RESTful API from scratch — resource naming, HTTP methods, status codes, error handling
- Relational database modeling with foreign keys and join tables
- JWT authentication flow — hashing passwords, signing tokens, protecting routes with middleware
- Integrating a third-party API (Spotify) and caching results locally
- Full-stack integration — connecting a React frontend to a custom backend API
- Deployment with Railway (Node.js + PostgreSQL) and Vercel (React)

---

## Author

Amanda Wong · [LinkedIn](https://linkedin.com/in/amandawong10) · [GitHub](https://github.com/amawong)
