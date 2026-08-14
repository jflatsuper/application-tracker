from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.database import Base, engine, get_db
from app.models import Status, Track
from app.schemas import ApplicationCreate, ApplicationRead, ApplicationUpdate


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Job Application Tracker", lifespan=lifespan)


@app.post("/applications", response_model=ApplicationRead, status_code=201,)
async def create_application(data: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_application(db, data)


@app.get("/applications", response_model=list[ApplicationRead])
async def list_applications(
    track: Track | None = None,
    tier: int | None = None,
    status: Status | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await crud.list_applications(db, track=track, tier=tier, status=status)


@app.get("/applications/{application_id}", response_model=ApplicationRead)
async def get_application(application_id: int, db: AsyncSession = Depends(get_db)):
    application = await crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@app.patch("/applications/{application_id}", response_model=ApplicationRead)
async def update_application(
    application_id: int, data: ApplicationUpdate, db: AsyncSession = Depends(get_db)
):
    application = await crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return await crud.update_application(db, application, data)


@app.delete("/applications/{application_id}", status_code=204)
async def delete_application(application_id: int, db: AsyncSession = Depends(get_db)):
    application = await crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    await crud.delete_application(db, application)


# Day 2 exercise: wire this up once you've implemented crud.get_stats
#
# @app.get("/applications/stats")
# async def stats(db: AsyncSession = Depends(get_db)):
#     return await crud.get_stats(db)
