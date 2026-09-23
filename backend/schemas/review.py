from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    pattern_id: str
    decision: Optional[str] = None  # CONFIRMED_THREAT, FALSE_POSITIVE, PATROL_DISPATCHED, MONITORING
    action: Optional[str] = None
    notes: Optional[str] = None
    action_taken: Optional[str] = None
    reviewed_by: Optional[str] = None

class ReviewOut(BaseModel):
    id: str
    pattern_id: str
    reviewer_id: Optional[str] = None
    decision: str
    notes: Optional[str] = None
    action_taken: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
