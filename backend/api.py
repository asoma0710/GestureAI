from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, TIMESTAMP, JSON, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from passlib.context import CryptContext

# ------------------------
# Database Setup & Models
# ------------------------

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/gestureaidb"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    phone_number = Column(String(20))
    profile_picture = Column(Text)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(TIMESTAMP(timezone=True))
    preferences = Column(JSON, default={})
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

def initialize_database():
    """Initialize the database tables."""
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
    profile_picture: Optional[str] = None
    role: Optional[str] = "user"
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False
    preferences: Optional[dict] = {}

class UserCreate(UserBase):
    password: str  # Plain text for demo purposes; will be hashed in production

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    preferences: Optional[dict] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        # For Pydantic V2: use 'from_attributes'
        from_attributes = True

class UserLogin(BaseModel):
    identifier: str  # Can be username, email, or phone number
    password: str

# ------------------------
# OOP Classes for DB Operations
# ------------------------

# Password Utility Class
class HashUtil:
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    @classmethod
    def hash_password(cls, password: str) -> str:
        return cls._pwd_context.hash(password)
    
    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        return cls._pwd_context.verify(plain_password, hashed_password)

# Database Access Class
class Database:
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        initialize_database()  # Create tables if they don't exist
    
    def get_session(self) -> Session:
        return self.SessionLocal()

# Repository class for User
class UserRepository:
    def __init__(self, db: Database):
        self.db = db  # Association with Database
    
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
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_pw,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=user_data.phone_number,
            profile_picture=user_data.profile_picture,
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

# Service layer that aggregates the repository (composition)
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
# Global Instances
# ------------------------

db_instance = Database(DATABASE_URL)
user_repository = UserRepository(db_instance)
user_service = UserService(user_repository)

# Dependency to provide a DB session for endpoints
def get_db_session():
    session = db_instance.get_session()
    try:
        yield session
    finally:
        session.close()

# ------------------------
# FastAPI App and Endpoints
# ------------------------

app = FastAPI()

@app.on_event("startup")
def startup_event():
    initialize_database()

# Root endpoint listing available routes
@app.get("/", summary="List available API routes")
def root():
    routes = [
        {"path": route.path, "name": route.name, "methods": list(route.methods)}
        for route in app.routes if hasattr(route, "methods")
    ]
    return {"available_routes": routes}

@app.get("/users", response_model=List[UserOut], summary="Retrieve all users")
def get_users(db: Session = Depends(get_db_session)):
    users = user_service.list_users(db)
    return users

@app.get("/usersbyid/{user_id}", response_model=UserOut, summary="Retrieve a user by ID")
def get_user(user_id: int, db: Session = Depends(get_db_session)):
    return user_service.get_user(db, user_id)

@app.post("/usersnew", response_model=UserOut, summary="Create a new user")
def create_user(user: UserCreate, db: Session = Depends(get_db_session)):
    return user_service.create_user(db, user)

@app.put("/usersupdate/{user_id}", response_model=UserOut, summary="Update a user")
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db_session)):
    return user_service.update_user(db, user_id, user)

@app.delete("/usersdelete/{user_id}", summary="Delete a user")
def delete_user(user_id: int, db: Session = Depends(get_db_session)):
    user_service.delete_user(db, user_id)
    return {"detail": "User deleted successfully"}

@app.post("/login", response_model=UserOut, summary="Verify user credentials")
def login(user_login: UserLogin, db: Session = Depends(get_db_session)):
    return user_service.login(db, user_login)
