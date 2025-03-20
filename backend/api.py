# Standard library imports
import base64                     # For encoding/decoding binary data to/from base64 strings.
from datetime import datetime     # For handling dates and times.
from typing import List, Optional, Dict  # For type annotations.

# FastAPI and related imports
from fastapi import FastAPI, HTTPException, Depends, status  # FastAPI framework and utilities for exception handling and dependency injection.
from pydantic import BaseModel, EmailStr, validator  # Pydantic models for data validation and type enforcement.

# SQLAlchemy imports for ORM (Object-Relational Mapping)
from sqlalchemy import (
    create_engine,             # To create a connection to the database.
    Column,                    # To define table columns.
    Integer,                   # Integer type column.
    String,                    # String type column.
    Boolean,                   # Boolean type column.
    Float,                     # Float type column.
    TIMESTAMP,                 # Timestamp type column.
    or_,                       # Logical OR operator used in queries.
    text                       # To use raw SQL text expressions.
)
from sqlalchemy.dialects.postgresql import BYTEA, JSONB  # PostgreSQL-specific types for binary data and JSON.
from sqlalchemy.ext.declarative import declarative_base  # To create a base class for our ORM models.
from sqlalchemy.orm import sessionmaker, Session  # Session management for database operations.
from sqlalchemy.sql import func  # SQL functions (e.g., current_timestamp).

# Import for password hashing
from passlib.context import CryptContext  # Provides a standardized interface to hash and verify passwords.

# -------------------------------
# Database Setup & SQLAlchemy Models
# -------------------------------

# Define the database URL for connecting to a PostgreSQL database.
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/gestureaidb"

# Create an SQLAlchemy engine using the database URL.
engine = create_engine(DATABASE_URL)
# Create a session factory. Sessions will manage transactions with the database.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Create a base class for declarative ORM models.
Base = declarative_base()

# Define the AppUser model corresponding to the "appusers" table.
class AppUser(Base):
    __tablename__ = "appusers"  # Table name in the database.
    # Primary key column for user ID.
    userid = Column(Integer, primary_key=True, index=True)
    # Username column: unique and indexed for faster lookups.
    username = Column(String(255), unique=True, nullable=False, index=True)
    # Email column: also unique and indexed.
    email = Column(String(255), unique=True, nullable=False, index=True)
    # Column to store the hashed password.
    password_hash = Column(String(255), nullable=False)
    # Column to store the user's profile picture as raw binary data.
    profile_picture = Column(BYTEA)
    # Boolean flag to indicate if the account is active.
    is_active = Column(Boolean, default=True)
    # Timestamp column for when the record was created, using the current timestamp as default.
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    # Timestamp column for when the record was last updated; automatically updates on changes.
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=func.current_timestamp()
    )

# Define the Admin model corresponding to the "admins" table.
class Admin(Base):
    __tablename__ = "admins"  # Table name.
    # Primary key for the admin.
    adminid = Column(Integer, primary_key=True, index=True)
    # Foreign key reference (not explicitly defined as such) to the user ID.
    userid = Column(Integer, nullable=False)
    # Column storing admin privileges as a comma-separated string.
    privileges = Column(String(255))

# Define the Feedback model corresponding to the "feedback" table.
class Feedback(Base):
    __tablename__ = "feedback"  # Table name.
    # Primary key for feedback entries.
    feedback_id = Column(Integer, primary_key=True, index=True)
    # Foreign key reference to the user who submitted the feedback.
    user_id = Column(Integer, nullable=False)
    # The content of the feedback.
    content = Column(String, nullable=False)
    # Timestamp column with a default value using Python's datetime.utcnow.
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    # Boolean flag to indicate if the feedback has been resolved.
    resolved = Column(Boolean, default=False)

# Define the Merchandise model corresponding to the "merchandise" table.
class Merchandise(Base):
    __tablename__ = "merchandise"  # Table name.
    # Primary key for merchandise items.
    merchandise_id = Column(Integer, primary_key=True, index=True)
    # Name of the merchandise.
    name = Column(String(255), nullable=False)
    # Column to store a URL or path to the merchandise image.
    picture = Column(String(255))
    # Base price for the merchandise item.
    base_price = Column(Float, nullable=False)

# Define the Subscription model corresponding to the "subscriptions" table.
class Subscription(Base):
    __tablename__ = "subscriptions"  # Table name.
    # Primary key for subscriptions.
    subscription_id = Column(Integer, primary_key=True, index=True)
    # Subscription name.
    name = Column(String(255), nullable=False)
    # Discount percentage provided by the subscription.
    discount_percentage = Column(Integer, nullable=False)

# Define the Purchase model corresponding to the "purchases" table.
class Purchase(Base):
    __tablename__ = "purchases"  # Table name.
    # Primary key for purchase records.
    purchase_id = Column(Integer, primary_key=True, index=True)
    # User ID who made the purchase.
    user_id = Column(Integer, nullable=False)
    # ID of the merchandise purchased.
    merchandise_id = Column(Integer, nullable=False)
    # Subscription ID if a subscription discount was applied (nullable).
    subscription_id = Column(Integer, nullable=True)
    # Final price after applying any discounts.
    final_price = Column(Float, nullable=False)

# Define the GestureAIModel model corresponding to the "gestureaimodel" table.
class GestureAIModel(Base):
    __tablename__ = "gestureaimodel"  # Table name.
    # Primary key for the AI model.
    modelid = Column(Integer, primary_key=True, index=True)
    # Name of the AI model.
    modelname = Column(String(255), nullable=False)
    # Version of the AI model.
    version = Column(String(50), nullable=False)
    # Accuracy of the AI model.
    accuracy = Column(Float, nullable=False)

# Helper function to initialize the database by creating all defined tables.
def initialize_database():
    Base.metadata.create_all(bind=engine)

# -------------------------------
# Pydantic Models (Request/Response)
# -------------------------------

# Base Pydantic model for AppUser data (common fields for input and output).
class AppUserBase(BaseModel):
    username: str                # User's chosen username.
    email: EmailStr              # User's email; validated as an email address.
    first_name: Optional[str] = None   # Optional first name.
    last_name: Optional[str] = None    # Optional last name.
    phone_number: Optional[str] = None  # Optional phone number.
    profile_picture: Optional[str] = None  # Optional profile picture (base64 string expected).
    role: Optional[str] = "user"         # User role, defaults to "user".
    is_active: Optional[bool] = True     # Is the account active? Defaults to True.
    is_verified: Optional[bool] = False  # Has the user been verified? Defaults to False.
    preferences: Optional[dict] = {}     # Additional user preferences as a dictionary.

# Model for creating a new AppUser; includes a plain text password.
class AppUserCreate(AppUserBase):
    password: str  # Plain text password that will be hashed before storage.

# Model for updating an existing AppUser; all fields are optional.
class AppUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None  # Expected to be a base64 string.
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    preferences: Optional[dict] = None

# Model for outputting AppUser data; includes the user ID.
class AppUserOut(AppUserBase):
    userid: int  # Unique ID assigned by the database.

    class Config:
        from_attributes = True  # Allows Pydantic to populate fields from ORM objects.

    # Custom validator to ensure that if profile_picture is in bytes,
    # it is encoded to a base64 string before output.
    @validator("profile_picture", pre=True, always=True, check_fields=False)
    def encode_picture(cls, value):
        if isinstance(value, bytes):
            return base64.b64encode(value).decode("utf-8")
        return value

# Model for user login; accepts an identifier (username or email) and a password.
class UserLogin(BaseModel):
    identifier: str  # Username, email, or phone number.
    password: str    # Plain text password.

# Pydantic models for the GestureAIModel entity.
class GestureAIModelBase(BaseModel):
    modelName: str   # Name of the AI model.
    version: str     # Version identifier.
    accuracy: float  # Accuracy metric of the model.

class GestureAIModelOut(GestureAIModelBase):
    modelid: int     # Unique model ID assigned by the database.

    class Config:
        from_attributes = True

# Additional Pydantic models for other entities.
class AdminOut(BaseModel):
    adminid: int
    userid: int
    privileges: str
    class Config:
        orm_mode = True  # Enable ORM mode for automatic attribute mapping.

class FeedbackBase(BaseModel):
    user_id: int
    content: str

class FeedbackOut(FeedbackBase):
    feedback_id: int
    created_at: datetime
    resolved: bool
    class Config:
        orm_mode = True

class MerchandiseBase(BaseModel):
    name: str
    picture: Optional[str] = None
    base_price: float

class MerchandiseOut(MerchandiseBase):
    merchandise_id: int
    class Config:
        orm_mode = True

class SubscriptionBase(BaseModel):
    name: str
    discount_percentage: int

class SubscriptionOut(SubscriptionBase):
    subscription_id: int
    class Config:
        orm_mode = True

class PurchaseBase(BaseModel):
    user_id: int
    merchandise_id: int
    subscription_id: Optional[int] = None
    final_price: float

class PurchaseOut(PurchaseBase):
    purchase_id: int
    class Config:
        orm_mode = True

# -------------------------------
# Utility: Password Hashing
# -------------------------------
# A utility class to manage password hashing and verification using bcrypt.
class HashUtil:
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Hash a plain text password.
    @classmethod
    def hash_password(cls, password: str) -> str:
        return cls._pwd_context.hash(password)
    
    # Verify a plain text password against a hashed password.
    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        return cls._pwd_context.verify(plain_password, hashed_password)

# -------------------------------
# Repository & Service for AppUsers
# -------------------------------

# Repository class: encapsulates all direct database operations for AppUsers.
class AppUserRepository:
    def __init__(self, session: Session):
        self.session = session  # Database session.

    # Retrieve all AppUser records.
    def get_all(self) -> List[AppUser]:
        return self.session.query(AppUser).all()
    
    # Retrieve a single AppUser by their unique ID.
    def get_by_id(self, user_id: int) -> Optional[AppUser]:
        return self.session.query(AppUser).filter(AppUser.userid == user_id).first()
    
    # Retrieve a user by an identifier (could be username or email).
    def get_by_identifier(self, identifier: str) -> Optional[AppUser]:
        return self.session.query(AppUser).filter(
            or_(
                AppUser.username == identifier,
                AppUser.email == identifier,
            )
        ).first()
    
    # Create a new AppUser record.
    def create(self, user_data: AppUserCreate) -> AppUser:
        # Hash the password before saving.
        hashed_pw = HashUtil.hash_password(user_data.password)
        # Initialize picture_bytes as None.
        picture_bytes = None
        # If a profile picture is provided and is not the placeholder string "string",
        # attempt to decode it from base64.
        if user_data.profile_picture and user_data.profile_picture.strip().lower() != "string":
            try:
                picture_bytes = base64.b64decode(user_data.profile_picture)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid base64 for profile picture")
        else:
            # Otherwise, store an empty byte string.
            picture_bytes = b""
        # Create a new AppUser instance with the provided data.
        new_user = AppUser(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_pw,  # Store the hashed password.
            profile_picture=picture_bytes,
            is_active=user_data.is_active
        )
        # Add the new user to the session, commit changes, and refresh the instance.
        self.session.add(new_user)
        self.session.commit()
        self.session.refresh(new_user)
        return new_user
    
    # Update an existing AppUser record.
    def update(self, user_id: int, update_data: AppUserUpdate) -> AppUser:
        user = self.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # Convert update_data to a dictionary, excluding fields that were not set.
        update_fields = update_data.dict(exclude_unset=True)
        # If a profile picture is provided in the update, attempt to decode it.
        if "profile_picture" in update_fields and update_fields["profile_picture"]:
            try:
                update_fields["profile_picture"] = base64.b64decode(update_fields["profile_picture"])
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid base64 for profile picture")
        # Set each field on the user object.
        for key, value in update_fields.items():
            setattr(user, key, value)
        # Commit the changes and refresh the user instance.
        self.session.commit()
        self.session.refresh(user)
        return user
    
    # Delete an AppUser record.
    def delete(self, user_id: int):
        user = self.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        self.session.delete(user)
        self.session.commit()

# Service class: contains business logic and uses the repository to interact with AppUsers.
class AppUserService:
    def __init__(self, repository: AppUserRepository):
        self.repository = repository
    
    # Return a list of all users.
    def list_users(self, session: Session) -> List[AppUser]:
        return self.repository.get_all()
    
    # Retrieve a single user by ID; raises an error if not found.
    def get_user(self, session: Session, user_id: int) -> AppUser:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    # Create a new user using provided data.
    def create_user(self, session: Session, user_data: AppUserCreate) -> AppUser:
        return self.repository.create(user_data)
    
    # Update an existing user with new data.
    def update_user(self, session: Session, user_id: int, update_data: AppUserUpdate) -> AppUser:
        return self.repository.update(user_id, update_data)
    
    # Delete a user by ID.
    def delete_user(self, session: Session, user_id: int):
        self.repository.delete(user_id)
    
    # Validate user credentials and return the user if authentication is successful.
    def login(self, session: Session, login_data: UserLogin) -> AppUser:
        user = self.repository.get_by_identifier(login_data.identifier)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # Verify the provided password matches the stored hashed password.
        if not HashUtil.verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect password")
        return user

# -------------------------------
# Database Dependency
# -------------------------------
# Dependency function that provides a database session to endpoints.
def get_db_session():
    session = SessionLocal()  # Create a new session.
    try:
        yield session        # Yield the session to the request.
    finally:
        session.close()      # Ensure the session is closed after the request.

# -------------------------------
# FastAPI App and Routes
# -------------------------------

# Create the FastAPI application instance.
app = FastAPI(title="GestureAI Backend API")

# On startup, initialize the database (create tables if they do not exist).
@app.on_event("startup")
def startup_event():
    initialize_database()

# Root endpoint: provides a list of all available API routes.
@app.get("/", summary="List available API routes")
def root():
    # Iterate over all routes in the app and return their details.
    routes = [
        {"path": route.path, "name": route.name, "methods": list(route.methods)}
        for route in app.routes if hasattr(route, "methods")
    ]
    return {"available_routes": routes}

# Endpoint to retrieve all AppUsers from the database.
@app.get("/appusers", response_model=List[AppUserOut], summary="Retrieve all users")
def get_appusers(db: Session = Depends(get_db_session)):
    service = AppUserService(AppUserRepository(db))
    return service.list_users(db)

# Endpoint to retrieve a single AppUser by their unique ID.
@app.get("/appusers/{user_id}", response_model=AppUserOut, summary="Retrieve a user by ID")
def get_appuser(user_id: int, db: Session = Depends(get_db_session)):
    service = AppUserService(AppUserRepository(db))
    return service.get_user(db, user_id)

# Endpoint to create a new AppUser.
@app.post("/appusers", response_model=AppUserOut, summary="Create a new user")
def create_appuser(user: AppUserCreate, db: Session = Depends(get_db_session)):
    service = AppUserService(AppUserRepository(db))
    return service.create_user(db, user)

# Endpoint to update an existing AppUser.
@app.put("/appusersupdate/{user_id}", response_model=AppUserOut, summary="Update a user")
def update_appuser(user_id: int, user_update: AppUserUpdate, db: Session = Depends(get_db_session)):
    service = AppUserService(AppUserRepository(db))
    return service.update_user(db, user_id, user_update)

# Endpoint to delete an AppUser by ID.
@app.delete("/appusers/{user_id}", summary="Delete a user")
def delete_appuser(user_id: int, db: Session = Depends(get_db_session)):
    service = AppUserService(AppUserRepository(db))
    service.delete_user(db, user_id)
    return {"detail": "User deleted successfully"}

# Endpoint for user login: verifies credentials and returns the user data.
@app.post("/login", response_model=AppUserOut, summary="Verify user credentials")
def login_endpoint(user_login: UserLogin, db: Session = Depends(get_db_session)):
    service = AppUserService(AppUserRepository(db))
    return service.login(db, user_login)

# Endpoint for creating a new GestureAIModel entry in the database.
@app.post("/gestureaimodel", response_model=GestureAIModelOut, summary="Create a new AI Model")
def create_gestureai_model(model: GestureAIModelBase, db: Session = Depends(get_db_session)):
    new_model = GestureAIModel(
        modelname=model.modelName,
        version=model.version,
        accuracy=model.accuracy
    )
    db.add(new_model)  # Add the new model record.
    db.commit()        # Commit the transaction.
    db.refresh(new_model)  # Refresh to obtain the new model's ID.
    return new_model

# Stub endpoint for admin to manage merchandise; business logic can be added later.
@app.post("/admin/{admin_id}/merchandise/manage", summary="Admin manages merchandise")
def admin_manage_merchandise(admin_id: int, merchandise_id: int, action: str, db: Session = Depends(get_db_session)):
    # This is a stub; in a full implementation, additional logic would be applied.
    return {"detail": f"Admin {admin_id} performed '{action}' on Merchandise {merchandise_id}"}

# Stub endpoint for a user to use the GestureAIModel (e.g., for predictions).
@app.post("/appusers/{user_id}/use-model", summary="User uses the AI Model")
def user_use_model(user_id: int, input_data: str, db: Session = Depends(get_db_session)):
    # This is a stub; you would call your AI model's prediction method here.
    return {"detail": f"User {user_id} input processed by AI Model: Predicted output for '{input_data}'"}

# Main entry point: if the script is executed directly, run the application with uvicorn.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
