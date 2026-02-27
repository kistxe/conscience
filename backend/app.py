from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, joinedload
from contextlib import contextmanager
from datetime import datetime
from typing import Optional
import uuid

from models import Base, ProjectModel, TaskModel, UserModel
from schemas import (
    ProjectCreate, ProjectResponse, TaskCreate, TaskResponse,
    UserCreate, UserLogin, UserResponse, TokenResponse
)
from auth import hash_password, verify_password, create_access_token, decode_token

# Database setup
DATABASE_URL = "sqlite:///./guilt_tracker.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Guilt Tracker API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@contextmanager
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Extract and validate JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"user_id": user_id, "email": payload.get("email")}

# ===== AUTH ENDPOINTS =====

@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(user: UserCreate):
    with get_db_session() as db:
        # Check if email already exists
        existing = db.query(UserModel).filter(
            UserModel.email == user.email
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_id = str(uuid.uuid4())
        db_user = UserModel(
            id=user_id,
            email=user.email,
            name=user.name,
            hashed_password=hash_password(user.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create token
        access_token = create_access_token(data={"sub": user_id, "email": user.email})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(db_user)
        )

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    with get_db_session() as db:
        db_user = db.query(UserModel).filter(UserModel.email == credentials.email).first()
        
        if not db_user or not verify_password(credentials.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = create_access_token(data={"sub": db_user.id, "email": db_user.email})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(db_user)
        )

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        user = db.query(UserModel).filter(UserModel.id == current_user["user_id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse.model_validate(user)

# ===== PROJECT ENDPOINTS =====

@app.post("/api/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        db_project = ProjectModel(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            name=project.name,
            description=project.description,
            reward=project.reward,
            deadline=project.deadline,
            created_at=datetime.utcnow()
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        _ = db_project.tasks
        return ProjectResponse.model_validate(db_project)

@app.get("/api/projects", response_model=list[ProjectResponse])
def list_projects(current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        projects = db.query(ProjectModel).options(joinedload(ProjectModel.tasks)).filter(
            ProjectModel.user_id == current_user["user_id"]
        ).all()
        result = [ProjectResponse.model_validate(p) for p in projects]
        return result

@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        project = db.query(ProjectModel).options(joinedload(ProjectModel.tasks)).filter(
            ProjectModel.id == project_id,
            ProjectModel.user_id == current_user["user_id"]
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectResponse.model_validate(project)

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        project = db.query(ProjectModel).filter(
            ProjectModel.id == project_id,
            ProjectModel.user_id == current_user["user_id"]
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        db.delete(project)
        db.commit()
        return {"message": "Project deleted"}

# ===== TASK ENDPOINTS =====

@app.post("/api/projects/{project_id}/tasks", response_model=TaskResponse)
def create_task(project_id: str, task: TaskCreate, current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        project = db.query(ProjectModel).filter(
            ProjectModel.id == project_id,
            ProjectModel.user_id == current_user["user_id"]
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        db_task = TaskModel(
            id=str(uuid.uuid4()),
            project_id=project_id,
            title=task.title,
            description=task.description,
            completed=False,
            weight=task.weight or 1
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return TaskResponse.model_validate(db_task)

@app.patch("/api/tasks/{task_id}/toggle")
def toggle_task(task_id: str, current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        task = db.query(TaskModel).join(ProjectModel).filter(
            TaskModel.id == task_id,
            ProjectModel.user_id == current_user["user_id"]
        ).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task.completed = not task.completed
        db.commit()
        db.refresh(task)
        return TaskResponse.model_validate(task)

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    with get_db_session() as db:
        task = db.query(TaskModel).join(ProjectModel).filter(
            TaskModel.id == task_id,
            ProjectModel.user_id == current_user["user_id"]
        ).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        db.delete(task)
        db.commit()
        return {"message": "Task deleted"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
