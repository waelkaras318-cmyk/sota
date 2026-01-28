"""
Subscription endpoints (simulated). Integrate Stripe for real billing.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/become_premium")
def become_premium(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_premium = True
    db.add(current_user)
    db.commit()
    return {"status": "ok", "is_premium": True}

@router.post("/revoke_premium")
def revoke_premium(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_premium = False
    db.add(current_user)
    db.commit()
    return {"status": "ok", "is_premium": False}
