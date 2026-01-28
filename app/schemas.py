"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_premium: bool

    class Config:
        orm_mode = True

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Other"
    duration: Optional[str] = "0:00"

class VideoCreate(VideoBase):
    pass

class VideoOut(VideoBase):
    id: int
    s3_key: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class CommentCreate(BaseModel):
    video_id: int
    content: str

class CommentOut(BaseModel):
    id: int
    video_id: int
    author_id: Optional[int]
    content: str
    created_at: datetime

    class Config:
        orm_mode = True
