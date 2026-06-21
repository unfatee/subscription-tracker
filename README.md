# Subscription Tracker

Subscription Tracker is a fullstack web application for managing recurring subscriptions, tracking monthly and yearly expenses, monitoring upcoming payments, and analyzing spending by category.

It solves a common personal-finance problem: recurring charges are spread across services and renewal dates, making it hard to understand the true monthly commitment. Subtrack puts those charges, forecasts, payments and a monthly budget in one focused workspace.

## Features

- User registration and JWT login
- User-scoped data access on every protected endpoint
- Create, edit, delete, filter and search subscriptions
- Track active and paused subscriptions
- Mark subscriptions as paid and automatically calculate the next payment date
- Correct end-of-month billing calculation (for example, January 31 → February 28)
- Monthly and yearly normalized spending analytics
- Category breakdown and 12-month charge forecast
- Upcoming payments and payment history
- Monthly budget tracking with status indicators
- CSV subscription export
- Idempotent demo-data generator for ten popular services
- Responsive React dashboard with loading, error and empty states
- PostgreSQL migration, Docker Compose and backend tests

## Screenshots

Add portfolio screenshots here after starting the app:

| Dashboard | Subscriptions |
| --- | --- |
| `docs/screenshots/dashboard.png` | `docs/screenshots/subscriptions.png` |

## Technology stack

**Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, Pydantic 2, PyJWT, bcrypt, Uvicorn, Pytest and httpx.

**Frontend:** React 19, Vite, JavaScript, React Router, Axios, Recharts and responsive plain CSS.

**DevOps:** Dockerfiles, Docker Compose, environment configuration and PostgreSQL health checks.

## Project structure

```text
subscription-tracker/
├── backend/
│   ├── app/
│   │   ├── models/       # SQLAlchemy entities
│   │   ├── routers/      # HTTP endpoints
│   │   ├── schemas/      # Pydantic contracts
│   │   ├── services/     # Business rules and analytics
│   │   ├── utils/        # JWT, password and date helpers
│   │   └── main.py
│   ├── alembic/          # Database migration
│   └── tests/            # Isolated SQLite API tests
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
├── docker-compose.yml
└── .env.example
```

## Run with Docker (recommended)

Prerequisite: Docker Desktop or Docker Engine with Compose.

```bash
git clone <your-repository-url>
cd subscription-tracker
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

The backend container waits for PostgreSQL, applies the Alembic migration and then starts Uvicorn. Stop the stack with `docker compose down`. Use `docker compose down -v` only when you also want to delete the database volume.

## Run without Docker

### 1. PostgreSQL

Create a database named `subscription_tracker`. Copy the environment template and adjust credentials if needed:

```powershell
Copy-Item .env.example .env
```

### 2. Backend (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

If script execution is disabled, skip activation and run `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`, then `.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload`.

### 3. Frontend (a second terminal)

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

On macOS/Linux, use `npm install` and `npm run dev`.

## Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy PostgreSQL connection | `postgresql+psycopg://postgres:postgres@localhost:5432/subscription_tracker` |
| `JWT_SECRET_KEY` | JWT signing secret; replace outside local development | `a-long-random-secret` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `60` |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed browser origins | `http://localhost:5173` |
| `VITE_API_URL` | Browser-facing backend URL | `http://localhost:8000` |

## API endpoints

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET/PATCH /auth/me` |
| Subscriptions | `GET/POST /subscriptions`, `GET/PUT/DELETE /subscriptions/{id}` |
| Actions | `PATCH /subscriptions/{id}/toggle-active`, `PATCH /subscriptions/{id}/mark-paid` |
| Data tools | `POST /subscriptions/demo-data`, `GET /subscriptions/export/csv` |
| Analytics | `GET /analytics/summary`, `/by-category`, `/monthly-spending`, `/upcoming-payments` |
| Budget | `GET/POST/PUT/DELETE /budget` |
| Payments | `GET /payments`, `DELETE /payments/{id}` |

Complete interactive request and response documentation is available in Swagger UI.

## Tests

Backend tests use an isolated in-memory SQLite database, so PostgreSQL is not required for the test run:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

The suite covers registration, duplicate email rejection, login, current user, authorization, CRUD, filters, ownership isolation, end-of-month payments, CSV export, analytics, budget status and payment history.

Validate the frontend production bundle with:

```powershell
cd frontend
npm.cmd run build
```
