# Guilt Tracker - Full Stack Setup

This project uses a **monorepo structure** with a React frontend and Python/FastAPI backend.

## Project Structure

```
guilt-tracker/
├── src/                    # React frontend
│   ├── components/
│   ├── config/
│   ├── lib/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── backend/                # Python FastAPI backend
│   ├── app.py             # FastAPI server
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic validation schemas
│   └── requirements.txt    # Python dependencies
├── package.json            # Frontend dependencies
└── vite.config.ts         # Vite configuration with API proxy
```

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

This will also install `concurrently` for running both servers simultaneously.

### 2. Set Up Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the Application

#### Option A: Run Both Servers Together
```bash
npm run dev:full
```
This will start:
- FastAPI backend on `http://localhost:8000`
- Vite dev server on `http://localhost:5173`

#### Option B: Run Separately (in different terminals)
**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/{id}` - Get a specific project
- `DELETE /api/projects/{id}` - Delete a project

### Tasks
- `POST /api/projects/{id}/tasks` - Add a task to a project
- `PATCH /api/tasks/{id}/toggle` - Toggle task completion status
- `DELETE /api/tasks/{id}` - Delete a task

### Health
- `GET /health` - Check backend status

## Database

The app uses **SQLite** with SQLAlchemy ORM. The database file (`guilt_tracker.db`) is created automatically on first run in the `backend/` directory.

## Vite Proxy Configuration

The Vite dev server is configured to proxy all `/api` requests to the FastAPI backend (http://localhost:8000), so you don't need to worry about CORS during development.

## Frontend Changes

The React components now make API calls instead of managing state locally. Key changes:
- Projects and tasks are fetched from the backend API
- All CRUD operations go through HTTP requests
- Changes are persisted to SQLite

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder. You'll still need to run the FastAPI backend to serve API requests in production.
