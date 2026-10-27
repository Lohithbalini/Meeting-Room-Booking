# Meeting Room Booking

A web app for employees to register, log in, view five office meeting rooms, book available slots, and cancel their own bookings. All times use India Standard Time (IST). The backend is the source of truth for overlap prevention.

## Problem

Teams need a simple way to reserve meeting rooms without double-booking. This app stores users, rooms, and bookings in MongoDB Atlas and rejects overlapping active bookings for the same room and date.

## Features

- Email and password registration and login with JWT
- Session restored after browser refresh (`localStorage` token)
- Five seeded rooms with name, capacity, and floor
- Daily room schedules
- Create a booking with client and server validation
- Personal upcoming bookings and self-service cancellation
- Backend overlap checks, office hours, and past-time rejection
- Concurrent booking protection with a per-room-and-date lock

## Technology stack

- Frontend: React, Vite, React Router, plain CSS, Fetch API
- Backend: Node.js, Express, JWT (`jsonwebtoken`), bcryptjs
- Database: MongoDB Atlas with Mongoose

## Architecture

The React client talks to a REST API. Express authenticates JWT requests, validates booking rules, then writes to MongoDB Atlas. Room seeding is idempotent and runs when the server starts.

```
client/   React UI
server/   Express API, Mongoose models, tests
```

## Folder structure

```
meeting-room-booking/
  client/
    src/api, components, context, pages, styles
  server/
    src/config, models, middleware, routes, controllers, services, validators, seed
    tests/
  README.md
```

## Prerequisites

- Node.js 18 or later
- npm
- A MongoDB Atlas cluster
- Git

## MongoDB Atlas setup

1. Create a project and cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with a password.
3. Allow network access from your IP, or `0.0.0.0/0` for local development.
4. Click **Connect** → **Drivers** and copy the `mongodb+srv://` URI.
5. Put the database name in the URI, for example `meeting_room_booking`.
6. Atlas clusters are replica sets, so they support transactions if you extend the locking strategy later.

Example:

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/meeting_room_booking?retryWrites=true&w=majority
```

## Environment variables

Place all the secrets in the .env files

Backend `server/.env`:

- `PORT` default `5000`
- `MONGODB_URI` Atlas connection string
- `JWT_SECRET` long random string
- `CLIENT_URL` `http://localhost:5173`
- `NODE_ENV` `development`

Frontend `client/.env`:

- `VITE_API_BASE_URL` `http://localhost:5000/api`

## Install

```
cd server
npm install

cd ../client
npm install
```

## Database initialization

The API seeds rooms A–E on startup. Running it again updates the same five rooms and does not create duplicates. You can also run:

```
cd server
npm run seed
```

## Run locally

Terminal 1:

```
cd server
npm run dev
```

Terminal 2:

```
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Create a test user

Open http://localhost:5173/register, enter a name, email, and password of at least six characters, then submit. You are signed in and sent to `/rooms`.

## Authentication

JWTs are signed with `JWT_SECRET` and include the user id as `sub`. Protected APIs require `Authorization: Bearer <token>`. For this assignment the token is stored in `localStorage` so refresh keeps the session. Logout only clears the browser token; it does not revoke an already issued JWT.

## API endpoints

Public:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

Protected:

- `GET /api/auth/me`
- `GET /api/rooms`
- `GET /api/rooms/:roomId`
- `GET /api/rooms/:roomId/bookings?date=YYYY-MM-DD`
- `POST /api/bookings`
- `GET /api/bookings/my`
- `DELETE /api/bookings/:bookingId`

Error shape:

```
{ "error": "Room A is already booked from 10:00 to 11:00", "code": "BOOKING_CONFLICT" }
```

## MongoDB schemas

- User: name, unique normalized email, passwordHash, createdAt
- Room: slug, name, capacity, floor
- Booking: roomId, userId, title, bookingDate (`YYYY-MM-DD`), startTime, endTime, status (`active` | `cancelled`)
- RoomDateLock: one lock document per room and date used to serialize writes

## Overlap detection and concurrency

Two active bookings on the same room and date overlap when:

`newStart < existingEnd && newEnd > existingStart`

Adjacent bookings such as 10:00–11:00 and 11:00–12:00 are allowed.

MongoDB cannot uniquely index arbitrary time ranges, so the API takes a short-lived lock for `(roomId, bookingDate)`, checks active bookings, inserts the new booking, then releases the lock. Duplicate-key races on the lock document are retried. Cancelled bookings do not block a slot.

## Cancellation

A user can cancel only their own booking. Another user’s booking returns HTTP `403`. Already cancelled bookings return `409`. Cancelled slots become available again.

## Automated tests

Tests use `mongodb-memory-server`, not your Atlas cluster.

```
cd server
npm test
```

This covers the eight overlap cases, validation, auth, 403 cancellation, persistence after reconnect, connection failure, invalid ObjectIds, and concurrent overlapping requests.

## Assumptions

- Times are IST only.
- Seed rooms: Room A (4, floor 1), Room B (6, floor 1), Room C (8, floor 2), Room D (10, floor 2), Room E (12, floor 3).
- Office hours are 09:00–19:00 IST.
- JWT in `localStorage` is acceptable for this local assignment.

## Known limitations

- Logout does not blacklist JWTs.
- There is no password reset, email verification, or recurring bookings.
- Production hosting is out of scope.

## Manual verification checklist

- [ ] Register and log in
- [ ] Duplicate email is rejected
- [ ] Refresh keeps the session
- [ ] Five rooms appear
- [ ] Schedule shows bookings or `No bookings for this day`
- [ ] Overlapping booking shows a room and time error
- [ ] My Bookings lists only my upcoming meetings
- [ ] Cancel asks `Are you sure?` and frees the slot
- [ ] Data remains in Atlas after restarting the API

## GitHub

Repository: https://github.com/Lohithbalini/Meeting-Room-Booking

Work is committed in small steps (setup, models, auth, bookings, tests, UI, docs) and pushed to `main`. Secrets stay in `.env` and are gitignored.
