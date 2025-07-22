from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class DisciplineType(str, Enum):
    TRAP = "trap"
    SKEET = "skeet"
    SPORTING_CLAYS = "sporting_clays"
    DOWN_THE_LINE = "down_the_line"
    OLYMPIC_TRAP = "olympic_trap"
    AMERICAN_TRAP = "american_trap"

class WeatherCondition(str, Enum):
    SUNNY = "sunny"
    CLOUDY = "cloudy"
    WINDY = "windy"
    RAINY = "rainy"
    OVERCAST = "overcast"

# Models
class Fixture(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    date: date
    time: str
    location: str
    discipline: DisciplineType
    max_participants: Optional[int] = None
    entry_fee: Optional[float] = None
    organizer: Optional[str] = None
    contact_info: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FixtureCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: date
    time: str
    location: str
    discipline: DisciplineType
    max_participants: Optional[int] = None
    entry_fee: Optional[float] = None
    organizer: Optional[str] = None
    contact_info: Optional[str] = None
    notes: Optional[str] = None

class FixtureUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[str] = None
    location: Optional[str] = None
    discipline: Optional[DisciplineType] = None
    max_participants: Optional[int] = None
    entry_fee: Optional[float] = None
    organizer: Optional[str] = None
    contact_info: Optional[str] = None
    notes: Optional[str] = None

class ShootingSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: date
    time: str
    location: str
    discipline: DisciplineType
    total_clays: int
    clays_hit: int
    weather: Optional[WeatherCondition] = None
    temperature: Optional[int] = None
    wind_speed: Optional[str] = None
    gun_used: Optional[str] = None
    cartridge_type: Optional[str] = None
    choke_used: Optional[str] = None
    notes: Optional[str] = None
    fixture_id: Optional[str] = None  # Link to fixture if session is part of a fixture
    fixture_name: Optional[str] = None  # Denormalized fixture name for easy display
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ShootingSessionCreate(BaseModel):
    date: date
    time: str
    location: str
    discipline: DisciplineType
    total_clays: int
    clays_hit: int
    weather: Optional[WeatherCondition] = None
    temperature: Optional[int] = None
    wind_speed: Optional[str] = None
    gun_used: Optional[str] = None
    cartridge_type: Optional[str] = None
    choke_used: Optional[str] = None
    notes: Optional[str] = None
    fixture_id: Optional[str] = None
    fixture_name: Optional[str] = None

class ShootingSessionUpdate(BaseModel):
    date: Optional[date] = None
    time: Optional[str] = None
    location: Optional[str] = None
    discipline: Optional[DisciplineType] = None
    total_clays: Optional[int] = None
    clays_hit: Optional[int] = None
    weather: Optional[WeatherCondition] = None
    temperature: Optional[int] = None
    wind_speed: Optional[str] = None
    gun_used: Optional[str] = None
    cartridge_type: Optional[str] = None
    choke_used: Optional[str] = None
    notes: Optional[str] = None
    fixture_id: Optional[str] = None
    fixture_name: Optional[str] = None

class SessionStats(BaseModel):
    total_sessions: int
    total_clays: int
    total_hits: int
    overall_accuracy: float
    best_session_accuracy: float
    current_streak: int
    favorite_discipline: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Clay Tracker Australia - Shooting Performance API"}

@api_router.post("/sessions", response_model=ShootingSession)
async def create_session(session_data: ShootingSessionCreate):
    session_dict = session_data.dict()
    # Convert date to string for MongoDB storage
    session_dict['date'] = session_dict['date'].isoformat()
    
    # If fixture_id is provided, fetch fixture details
    if session_dict.get('fixture_id'):
        fixture = await db.fixtures.find_one({"id": session_dict['fixture_id']})
        if fixture:
            session_dict['fixture_name'] = fixture['name']
        else:
            # If fixture not found, clear the fixture_id
            session_dict['fixture_id'] = None
            session_dict['fixture_name'] = None
    
    session_obj = ShootingSession(**session_dict)
    
    # Store the dict with string date for MongoDB
    storage_dict = session_dict.copy()
    storage_dict['id'] = session_obj.id
    storage_dict['created_at'] = session_obj.created_at
    
    result = await db.shooting_sessions.insert_one(storage_dict)
    if result.inserted_id:
        return session_obj
    raise HTTPException(status_code=500, detail="Failed to create session")

@api_router.get("/sessions", response_model=List[ShootingSession])
async def get_sessions(limit: int = 50, skip: int = 0):
    sessions = await db.shooting_sessions.find().skip(skip).limit(limit).sort("date", -1).to_list(limit)
    result = []
    for session in sessions:
        # Convert date string back to date object
        if isinstance(session['date'], str):
            session['date'] = datetime.fromisoformat(session['date']).date()
        result.append(ShootingSession(**session))
    return result

@api_router.get("/sessions/{session_id}", response_model=ShootingSession)
async def get_session(session_id: str):
    session = await db.shooting_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Convert date string back to date object
    if isinstance(session['date'], str):
        session['date'] = datetime.fromisoformat(session['date']).date()
    return ShootingSession(**session)

@api_router.put("/sessions/{session_id}", response_model=ShootingSession)
async def update_session(session_id: str, session_data: ShootingSessionUpdate):
    update_dict = {k: v for k, v in session_data.dict().items() if v is not None}
    
    # Convert date to string if present
    if 'date' in update_dict:
        update_dict['date'] = update_dict['date'].isoformat()
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.shooting_sessions.update_one(
        {"id": session_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Fetch and return updated session
    updated_session = await db.shooting_sessions.find_one({"id": session_id})
    if isinstance(updated_session['date'], str):
        updated_session['date'] = datetime.fromisoformat(updated_session['date']).date()
    return ShootingSession(**updated_session)

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    result = await db.shooting_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}

@api_router.get("/stats", response_model=SessionStats)
async def get_stats():
    sessions = await db.shooting_sessions.find().to_list(1000)
    
    if not sessions:
        return SessionStats(
            total_sessions=0,
            total_clays=0,
            total_hits=0,
            overall_accuracy=0.0,
            best_session_accuracy=0.0,
            current_streak=0,
            favorite_discipline=""
        )
    
    total_sessions = len(sessions)
    total_clays = sum(session['total_clays'] for session in sessions)
    total_hits = sum(session['clays_hit'] for session in sessions)
    overall_accuracy = (total_hits / total_clays * 100) if total_clays > 0 else 0
    
    # Calculate best session accuracy
    best_accuracy = 0
    for session in sessions:
        if session['total_clays'] > 0:
            accuracy = (session['clays_hit'] / session['total_clays'] * 100)
            best_accuracy = max(best_accuracy, accuracy)
    
    # Find favorite discipline
    discipline_counts = {}
    for session in sessions:
        discipline = session['discipline']
        discipline_counts[discipline] = discipline_counts.get(discipline, 0) + 1
    
    favorite_discipline = max(discipline_counts, key=discipline_counts.get) if discipline_counts else ""
    
    # Calculate current streak (consecutive sessions with >80% accuracy)
    current_streak = 0
    sorted_sessions = sorted(sessions, key=lambda x: x['date'], reverse=True)
    for session in sorted_sessions:
        if session['total_clays'] > 0:
            accuracy = (session['clays_hit'] / session['total_clays'] * 100)
            if accuracy >= 80:
                current_streak += 1
            else:
                break
    
    return SessionStats(
        total_sessions=total_sessions,
        total_clays=total_clays,
        total_hits=total_hits,
        overall_accuracy=round(overall_accuracy, 1),
        best_session_accuracy=round(best_accuracy, 1),
        current_streak=current_streak,
        favorite_discipline=favorite_discipline
    )

@api_router.get("/sessions/recent/{limit}")
async def get_recent_sessions(limit: int = 5):
    sessions = await db.shooting_sessions.find().sort("date", -1).limit(limit).to_list(limit)
    result = []
    for session in sessions:
        if isinstance(session['date'], str):
            session['date'] = datetime.fromisoformat(session['date']).date()
        result.append(ShootingSession(**session))
    return result

# Fixture endpoints
@api_router.post("/fixtures", response_model=Fixture)
async def create_fixture(fixture_data: FixtureCreate):
    fixture_dict = fixture_data.dict()
    # Convert date to string for MongoDB storage
    fixture_dict['date'] = fixture_dict['date'].isoformat()
    fixture_obj = Fixture(**fixture_dict)
    
    # Store the dict with string date for MongoDB
    storage_dict = fixture_dict.copy()
    storage_dict['id'] = fixture_obj.id
    storage_dict['created_at'] = fixture_obj.created_at
    
    result = await db.fixtures.insert_one(storage_dict)
    if result.inserted_id:
        return fixture_obj
    raise HTTPException(status_code=500, detail="Failed to create fixture")

@api_router.get("/fixtures", response_model=List[Fixture])
async def get_fixtures(limit: int = 50, skip: int = 0):
    fixtures = await db.fixtures.find().skip(skip).limit(limit).sort("date", -1).to_list(limit)
    result = []
    for fixture in fixtures:
        # Convert date string back to date object
        if isinstance(fixture['date'], str):
            fixture['date'] = datetime.fromisoformat(fixture['date']).date()
        result.append(Fixture(**fixture))
    return result

@api_router.get("/fixtures/{fixture_id}", response_model=Fixture)
async def get_fixture(fixture_id: str):
    fixture = await db.fixtures.find_one({"id": fixture_id})
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    # Convert date string back to date object
    if isinstance(fixture['date'], str):
        fixture['date'] = datetime.fromisoformat(fixture['date']).date()
    return Fixture(**fixture)

@api_router.put("/fixtures/{fixture_id}", response_model=Fixture)
async def update_fixture(fixture_id: str, fixture_data: FixtureUpdate):
    update_dict = {k: v for k, v in fixture_data.dict().items() if v is not None}
    
    # Convert date to string if present
    if 'date' in update_dict:
        update_dict['date'] = update_dict['date'].isoformat()
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.fixtures.update_one(
        {"id": fixture_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    # Fetch and return updated fixture
    updated_fixture = await db.fixtures.find_one({"id": fixture_id})
    if isinstance(updated_fixture['date'], str):
        updated_fixture['date'] = datetime.fromisoformat(updated_fixture['date']).date()
    return Fixture(**updated_fixture)

@api_router.delete("/fixtures/{fixture_id}")
async def delete_fixture(fixture_id: str):
    result = await db.fixtures.delete_one({"id": fixture_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fixture not found")
    return {"message": "Fixture deleted successfully"}

# Calendar endpoints
@api_router.get("/calendar/events")
async def get_calendar_events(start_date: str, end_date: str):
    """Get all fixtures and sessions within a date range for calendar display"""
    try:
        start = datetime.fromisoformat(start_date).date()
        end = datetime.fromisoformat(end_date).date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get fixtures in date range
    fixtures = await db.fixtures.find({
        "date": {
            "$gte": start.isoformat(),
            "$lte": end.isoformat()
        }
    }).to_list(1000)
    
    # Get sessions in date range
    sessions = await db.shooting_sessions.find({
        "date": {
            "$gte": start.isoformat(),
            "$lte": end.isoformat()
        }
    }).to_list(1000)
    
    # Format fixtures for calendar
    events = []
    for fixture in fixtures:
        if isinstance(fixture['date'], str):
            fixture['date'] = datetime.fromisoformat(fixture['date']).date()
        events.append({
            "id": fixture['id'],
            "title": fixture['name'],
            "date": fixture['date'].isoformat(),
            "time": fixture['time'],
            "type": "fixture",
            "discipline": fixture['discipline'],
            "location": fixture['location'],
            "description": fixture.get('description', ''),
            "organizer": fixture.get('organizer', ''),
            "entry_fee": fixture.get('entry_fee'),
        })
    
    # Format sessions for calendar
    for session in sessions:
        if isinstance(session['date'], str):
            session['date'] = datetime.fromisoformat(session['date']).date()
        
        accuracy = (session['clays_hit'] / session['total_clays'] * 100) if session['total_clays'] > 0 else 0
        
        events.append({
            "id": session['id'],
            "title": f"Session - {session['discipline'].replace('_', ' ').title()}",
            "date": session['date'].isoformat(),
            "time": session['time'],
            "type": "session",
            "discipline": session['discipline'],
            "location": session['location'],
            "accuracy": round(accuracy, 1),
            "clays_hit": session['clays_hit'],
            "total_clays": session['total_clays'],
            "fixture_name": session.get('fixture_name', ''),
        })
    
    # Sort by date and time
    events.sort(key=lambda x: (x['date'], x['time']))
    
    return events

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()