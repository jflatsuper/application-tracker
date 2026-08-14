import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Track(str, enum.Enum):
    FRONTEND = "frontend"
    FULLSTACK = "fullstack"
    PYTHON = "python"
    AI_ML = "ai_ml"


class Status(str, enum.Enum):
    APPLIED = "applied"
    SCREEN = "screen"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(200))
    track: Mapped[Track] = mapped_column(Enum(Track, native_enum=False))
    tier: Mapped[int] = mapped_column(Integer)  # 1 = target, 2 = good fit, 3 = volume
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)  # linkedin / indeed / referral / cold-email
    contact: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[Status] = mapped_column(Enum(Status, native_enum=False), default=Status.APPLIED)
    date_applied: Mapped[date] = mapped_column(Date, default=date.today)
    follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
