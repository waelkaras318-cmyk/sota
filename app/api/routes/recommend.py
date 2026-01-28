"""
Simple recommendation endpoint. Uses popularity and category similarity.
This is intentionally simple; replace with your AI recommender (call a model or service).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.models import Video
from app.db.session import get_db
from app.schemas import VideoOut

router = APIRouter()

@router.get("/for_video/{video_id}", response_model=List[VideoOut])
def recommend_for_video(video_id: int, limit: int = 6, db: Session = Depends(get_db)):
    videos = db.query(Video).all()
    current = next((v for v in videos if v.id == video_id), None)
    if not current:
        # fallback: latest videos
        return db.query(Video).order_by(Video.created_at.desc()).limit(limit).all()
    # same category first
    same = [v for v in videos if v.id != video_id and v.category == current.category]
    # then newest other videos
    others = [v for v in videos if v.id != video_id and v.category != current.category]
    result = same + others
    return result[:limit]
