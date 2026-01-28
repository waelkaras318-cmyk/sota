"""
Simple comments endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.db.models import Comment, Video
from app.schemas import CommentCreate, CommentOut
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=CommentOut)
def add_comment(payload: CommentCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    video = db.query(Video).filter(Video.id == payload.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    comment = Comment(video_id=payload.video_id, author_id=user.id, content=payload.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/video/{video_id}", response_model=List[CommentOut])
def list_comments(video_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.video_id == video_id).order_by(Comment.created_at.desc()).all()
    return comments
