# File: api.py

import base64
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr, validator

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    TIMESTAMP,
    or_,
    text
)
from sqlalchemy.dialects.postgresql import BYTEA, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func

from passlib.context import CryptContext

# ------------------------
# Database Setup & Models
# ------------------------

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/gestureaidb"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    phone_number = Column(String(20))
    profile_picture = Column(BYTEA)  # Stored as raw bytes
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(TIMESTAMP(timezone=True))
    preferences = Column(JSONB, server_default=text("'{}'::jsonb"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=func.current_timestamp()
    )

def initialize_database():
    """Initialize (create) all tables if they don't already exist."""
    Base.metadata.create_all(bind=engine)

# ------------------------
# Pydantic Models
# ------------------------

class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    # In the API, profile_picture is sent/received as a base64 string.
    profile_picture: Optional[str] = None
    role: Optional[str] = "user"
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False
    preferences: Optional[dict] = {}

class UserCreate(UserBase):
    password: str  # Plain text password; will be hashed.

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None  # base64 string expected.
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    preferences: Optional[dict] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @validator("profile_picture", pre=True, always=True)
    def encode_picture(cls, value):
        """Convert raw bytes (BYTEA) to base64 string for the response."""
        if isinstance(value, bytes):
            return base64.b64encode(value).decode("utf-8")
        return value

class UserLogin(BaseModel):
    identifier: str  # Can be username, email, or phone number.
    password: str

# ------------------------
# Utility Classes
# ------------------------

class HashUtil:
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    @classmethod
    def hash_password(cls, password: str) -> str:
        return cls._pwd_context.hash(password)
    
    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        return cls._pwd_context.verify(plain_password, hashed_password)

# ------------------------
# Database Abstraction
# ------------------------

class Database:
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        initialize_database()
    
    def get_session(self) -> Session:
        return self.SessionLocal()

# ------------------------
# Repository (Data Access)
# ------------------------

class UserRepository:
    def __init__(self, db: Database):
        self.db = db
    
    def get_all(self, session: Session) -> List[User]:
        return session.query(User).all()
    
    def get_by_id(self, session: Session, user_id: int) -> Optional[User]:
        return session.query(User).filter(User.id == user_id).first()
    
    def get_by_identifier(self, session: Session, identifier: str) -> Optional[User]:
        return session.query(User).filter(
            or_(
                User.username == identifier,
                User.email == identifier,
                User.phone_number == identifier
            )
        ).first()
    
    def create(self, session: Session, user_data: UserCreate) -> User:
        hashed_pw = HashUtil.hash_password(user_data.password)
        picture_bytes = None
        if user_data.profile_picture:
            try:
                picture_bytes = base64.b64decode(user_data.profile_picture)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid base64 for profile picture")
        
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_pw,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=user_data.phone_number,
            profile_picture=picture_bytes,
            role=user_data.role,
            is_active=user_data.is_active,
            is_verified=user_data.is_verified,
            preferences=user_data.preferences,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user
    
    def update(self, session: Session, user_id: int, user_data: UserUpdate) -> User:
        user = self.get_by_id(session, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        update_data = user_data.dict(exclude_unset=True)
        if "profile_picture" in update_data and update_data["profile_picture"]:
            try:
                update_data["profile_picture"] = base64.b64decode(update_data["profile_picture"])
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid base64 for profile picture")
        for key, value in update_data.items():
            setattr(user, key, value)
        session.commit()
        session.refresh(user)
        return user
    
    def delete(self, session: Session, user_id: int):
        user = self.get_by_id(session, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        session.delete(user)
        session.commit()

# ------------------------
# Service Layer
# ------------------------

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository
    
    def list_users(self, session: Session) -> List[User]:
        return self.repository.get_all(session)
    
    def get_user(self, session: Session, user_id: int) -> User:
        user = self.repository.get_by_id(session, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    def create_user(self, session: Session, user_data: UserCreate) -> User:
        return self.repository.create(session, user_data)
    
    def update_user(self, session: Session, user_id: int, user_data: UserUpdate) -> User:
        return self.repository.update(session, user_id, user_data)
    
    def delete_user(self, session: Session, user_id: int):
        self.repository.delete(session, user_id)
    
    def login(self, session: Session, login_data: UserLogin) -> User:
        user = self.repository.get_by_identifier(session, login_data.identifier)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not HashUtil.verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect password")
        return user

# ------------------------
# Global Instances & FastAPI App
# ------------------------

db_instance = Database(DATABASE_URL)
user_repository = UserRepository(db_instance)
user_service = UserService(user_repository)

def get_db_session():
    session = db_instance.get_session()
    try:
        yield session
    finally:
        session.close()

app = FastAPI()

@app.on_event("startup")
def startup_event():
    initialize_database()

@app.get("/", summary="List available API routes")
def root():
    routes = [
        {"path": route.path, "name": route.name, "methods": list(route.methods)}
        for route in app.routes if hasattr(route, "methods")
    ]
    return {"available_routes": routes}

@app.get("/users", response_model=List[UserOut], summary="Retrieve all users")
def get_users(db: Session = Depends(get_db_session)):
    return user_service.list_users(db)

@app.get("/usersbyid/{user_id}", response_model=UserOut, summary="Retrieve a user by ID")
def get_user(user_id: int, db: Session = Depends(get_db_session)):
    return user_service.get_user(db, user_id)

@app.post("/usersnew", response_model=UserOut, summary="Create a new user")
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db_session)):
    return user_service.create_user(db, user)

@app.put("/usersupdate/{user_id}", response_model=UserOut, summary="Update a user")
def update_user_endpoint(user_id: int, user: UserUpdate, db: Session = Depends(get_db_session)):
    return user_service.update_user(db, user_id, user)

@app.delete("/usersdelete/{user_id}", summary="Delete a user")
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db_session)):
    user_service.delete_user(db, user_id)
    return {"detail": "User deleted successfully"}

@app.post("/login", response_model=UserOut, summary="Verify user credentials")
def login_endpoint(user_login: UserLogin, db: Session = Depends(get_db_session)):
    return user_service.login(db, user_login)
