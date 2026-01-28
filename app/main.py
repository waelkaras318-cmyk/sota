"""
Main FastAPI application entrypoint.
Provides mounting of routes and middleware.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, videos, uploads, comments, recommend, subs, webhooks
from app.db.session import engine, Base

# Create DB tables (simple approach for dev). In production use Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

# CORS
origins = [o.strip() for o in settings.ALLOWED_HOSTS.split(",")] if settings.ALLOWED_HOSTS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(videos.router, prefix="/videos", tags=["videos"])
app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
app.include_router(comments.router, prefix="/comments", tags=["comments"])
app.include_router(recommend.router, prefix="/recommend", tags=["recommend"])
app.include_router(subs.router, prefix="/subscriptions", tags=["subscriptions"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

@app.get("/")
def root():
    return {"message": "Streamly Backend (FastAPI) is running"}
