"""
Video endpoints: list, create metadata, get by id.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import Video
from app.schemas import VideoCreate, VideoOut
from app.api.deps import get_current_user, get_db_dep

router = APIRouter()

@router.get("/", response_model=List[VideoOut])
def list_videos(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    videos = db.query(Video).order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    return videos

@router.post("/", response_model=VideoOut)
def create_video(video_in: VideoCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    video = Video(**video_in.dict(), owner_id=current_user.id)
    db.add(video)
    db.commit()
    db.refresh(video)
    return video

@router.get("/{video_id}", response_model=VideoOut)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video
