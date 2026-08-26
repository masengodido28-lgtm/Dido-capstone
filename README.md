# Airbnb Clone — Full Stack Capstone Project

A full-stack Airbnb clone built with **React**, **Node.js**, **Express**, and **MongoDB**.

## Project Structure

```
Dido Capstone/
├── backend/          # Node.js + Express REST API
├── admin-dashboard/  # React admin panel (manage listings)
└── airbnb-frontend/  # React public-facing Airbnb clone
```

---

## Backend (`/backend`)

### Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- Multer (image uploads)
- bcryptjs (password hashing)

### Setup
```bash
cd backend
npm install
# Create .env with MONGO_URI and JWT_SECRET
npm run dev        # development (nodemon)
npm start          # production
npm run seed       # seed sample data
```

### API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/users/login` | Login + get JWT | Public |
| POST | `/api/users/register` | Register new user | Public |
| GET | `/api/users/me` | Get current user | Protected |
| GET | `/api/accommodations` | List all (filter by ?location=) | Public |
| GET | `/api/accommodations/:id` | Get single listing | Public |
| POST | `/api/accommodations` | Create listing | Protected |
| PUT | `/api/accommodations/:id` | Update listing | Protected |
| DELETE | `/api/accommodations/:id` | Delete listing | Protected |
| POST | `/api/reservations` | Create reservation | Protected |
| GET | `/api/reservations/host` | Host's reservations | Protected |
| GET | `/api/reservations/user` | User's reservations | Protected |
| DELETE | `/api/reservations/:id` | Cancel reservation | Protected |

---

## Admin Dashboard (`/admin-dashboard`)

React app running on **port 3000**, proxying API calls to the backend on port 5000.

### Features
- Login page with JWT authentication and session persistence
- Create, view, update, delete property listings
- Image upload support
- View reservations in table format
- Protected routes — redirect to login if unauthenticated

```bash
cd admin-dashboard
npm install
npm start
```

Demo credentials: `admin@airbnb.com` / `password123`

---

## Airbnb Frontend (`/airbnb-frontend`)

React app running on **port 3000**, proxying API calls to backend.

### Features
- Home Page: Hero banner, Inspiration cards, Experiences, ShopAirbnb, Future Getaways tabs, Footer
- Location Page: Filter by type, location cards (image + details)
- Location Details: Image gallery, full details, sticky cost calculator with date pickers
- User Reservations: View and cancel bookings

```bash
cd airbnb-frontend
npm install
npm start
```

---

## Running the Full Stack

1. Start MongoDB locally (default port 27017)
2. Start backend: `cd backend && npm run dev`
3. Seed data: `cd backend && npm run seed`
4. Start admin: `cd admin-dashboard && npm start` (port 3000)
5. Start frontend: `cd airbnb-frontend && npm start` (port 3001 if 3000 is taken)
