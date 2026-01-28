# Streamly Backend (FastAPI)

This is a starter backend for the Streamly frontend. It provides:
- User auth (register / login) with JWT
- Video metadata CRUD
- Pre-signed S3 upload URLs for direct-to-S3 uploads
- Comments
- Subscription endpoints (Stripe webhook placeholder)
- Simple recommendations endpoint
- SQLite by default for easy local dev; swap to Postgres via DATABASE_URL
- Optional local file storage using MinIO (docker-compose provided)

Quick start (local, SQLite)
1. Create a Python venv and install:
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

2. Copy environment template:
   cp .env.example .env
   # Edit .env if desired (defaults work for sqlite)

3. Run the app:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

4. Open docs: http://localhost:8000/docs

Using Postgres + MinIO with docker-compose
1. Install Docker and Docker Compose.
2. Start services:
   docker-compose up -d
3. Edit .env to point DATABASE_URL to the postgres service and set S3 endpoint to MinIO credentials (provided in docker-compose).
4. Run backend as above (it will connect to Postgres and MinIO).

Deployment notes
- Use a managed Postgres (e.g., Render, Heroku Postgres, AWS RDS) for production.
- Use AWS S3 for storage (set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET).
- For subscriptions, integrate Stripe checkout and handle webhooks (/webhooks/stripe).
- Securely store JWT_SECRET, Stripe secrets, and AWS keys.

Security notes
- Use HTTPS in production.
- Validate and sanitize uploads; use signed URLs with expiration.
- Implement rate limiting, request logging, and monitoring as needed.

Read the code comments for where to extend and integrate third-party services.
