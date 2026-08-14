from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models import Status, Track


class ApplicationBase(BaseModel):
    company: str
    role: str
    track: Track
    tier: int
    source: str | None = None
    contact: str | None = None
    status: Status = Status.APPLIED
    date_applied: date | None = None
    follow_up_date: date | None = None
    notes: str | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    track: Track | None = None
    tier: int | None = None
    source: str | None = None
    contact: str | None = None
    status: Status | None = None
    date_applied: date | None = None
    follow_up_date: date | None = None
    notes: str | None = None


class ApplicationRead(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
