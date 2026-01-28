"""
Upload helpers: request presigned URLs for direct uploads, and a callback endpoint to mark upload complete.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from pydantic import BaseModel
from app.utils.s3 import generate_presigned_put, public_url
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.db.models import Video
from app.api.deps import get_current_user

router = APIRouter()

class PresignRequest(BaseModel):
    filename: str
    content_type: str

@router.post("/presign")
def get_presigned(req: PresignRequest, current_user = Depends(get_current_user)):
    # Generate a unique key (you can add UUID prefixes)
    import time, hashlib
    key = f"videos/{current_user.id}/{int(time.time())}_{hashlib.md5(req.filename.encode()).hexdigest()}"
    url = generate_presigned_put(key)
    return {"upload_url": url, "s3_key": key}

@router.post("/complete")
def upload_complete(s3_key: str, title: str, description: str = "", category: str = "Other", db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Called after client uploaded to S3, to create metadata
    video = Video(title=title, description=description, category=category, s3_key=s3_key, owner_id=current_user.id)
    db.add(video)
    db.commit()
    db.refresh(video)
    return {"video_id": video.id, "public_url": public_url(s3_key)}
