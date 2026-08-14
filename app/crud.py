from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application, Status, Track
from app.schemas import ApplicationCreate, ApplicationUpdate


async def create_application(db: AsyncSession, data: ApplicationCreate) -> Application:
    application = Application(
        **data.model_dump(exclude={"date_applied"}),
        date_applied=data.date_applied or date.today(),
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


async def get_application(db: AsyncSession, application_id: int) -> Application | None:
    return await db.get(Application, application_id)


async def list_applications(
    db: AsyncSession,
    track: Track | None = None,
    tier: int | None = None,
    status: Status | None = None,
) -> list[Application]:
    query = select(Application)
    if track is not None:
        query = query.where(Application.track == track)
    if tier is not None:
        query = query.where(Application.tier == tier)
    if status is not None:
        query = query.where(Application.status == status)
    query = query.order_by(Application.date_applied.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_application(
    db: AsyncSession, application: Application, data: ApplicationUpdate
) -> Application:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    await db.commit()
    await db.refresh(application)
    return application


async def delete_application(db: AsyncSession, application: Application) -> None:
    await db.delete(application)
    await db.commit()


# --- Day 2 exercise -----------------------------------------------------
#
# Implement stats: for each Track, return total applications and a
# response rate (anything past Status.APPLIED counts as a response —
# screen, interview, offer, or rejected all mean a human looked at it).
#
# This is the number that should feed your Friday review ritual from
# the strategy doc — which track is actually converting?
#
# Hints:
#   - group_by(Application.track) with func.count()
#   - a CASE expression (or a second query) to count non-APPLIED rows
#   - return something like: {"frontend": {"total": 12, "responses": 3, "rate": 0.25}, ...}
#
# async def get_stats(db: AsyncSession) -> dict:
#     ...
