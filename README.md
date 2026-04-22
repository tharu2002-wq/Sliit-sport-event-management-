# Society Management System

A full-stack society management platform with a modern React + Tailwind dashboard and an Express + MongoDB backend.

## Project Structure

- backend: Express API, MongoDB models, controllers, routes, middleware
- frontend: React app with Tailwind UI, pages, services, and reusable components

## Backend Setup

1. Go to backend folder:
   - `cd backend`
2. Install dependencies:
   - `npm install`
3. Configure environment in `.env`:
   - `PORT=5000`
   - `MONGO_URI=mongodb://127.0.0.1:27017/society_management`
   - Optional old DB mode:
     - `USE_OLD_DB=true`
     - `OLD_MONGO_URI=<your-old-mongodb-uri>`
   - To avoid silent fallback during troubleshooting:
     - `ALLOW_MEMORY_DB=false`
4. Start server:
   - `npm run dev`

## Frontend Setup

1. Go to frontend folder:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Optional API URL override:
   - create `.env` and set `VITE_API_URL=http://localhost:5000/api`
4. Run app:
   - `npm run dev`

## API Endpoints

- Societies
  - `GET /api/societies`
  - `GET /api/societies/:id`
  - `POST /api/societies`
  - `PUT /api/societies/:id`
  - `DELETE /api/societies/:id`
- Members
  - `GET /api/members`
  - `POST /api/members`
  - `PUT /api/members/:id`
  - `DELETE /api/members/:id`
- Teams
  - `GET /api/teams`
  - `POST /api/teams`
  - `PUT /api/teams/:id`
  - `DELETE /api/teams/:id`

## Notes

- The UI includes a custom design direction with expressive typography, gradient atmosphere, and animated dashboard cards.
- Member and team counts are automatically synced per society whenever records are created, updated, or deleted.
