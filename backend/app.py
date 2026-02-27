from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, joinedload
from contextlib import contextmanager
from datetime import datetime
from typing import Optional
import uuid

from models import Base, ProjectModel, TaskModel
from schemas import ProjectCreate, ProjectResponse, TaskCreate, TaskResponse

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
    allow_origins=["http://localhost:5173", "http://localhost:4173"],  # Vite dev/preview ports
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

# ===== PROJECT ENDPOINTS =====

@app.post("/api/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate):
    with get_db_session() as db:
        db_project = ProjectModel(
            id=str(uuid.uuid4()),
            name=project.name,
            description=project.description,
            reward=project.reward,
            deadline=project.deadline,
            created_at=datetime.utcnow()
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        # Eagerly load tasks before session closes
        _ = db_project.tasks
        return ProjectResponse.model_validate(db_project)

@app.get("/api/projects", response_model=list[ProjectResponse])
def list_projects():
    with get_db_session() as db:
        projects = db.query(ProjectModel).options(joinedload(ProjectModel.tasks)).all()
        # Convert to dict to detach from session
        result = [ProjectResponse.model_validate(p) for p in projects]
        return result

@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str):
    with get_db_session() as db:
        project = db.query(ProjectModel).options(joinedload(ProjectModel.tasks)).filter(ProjectModel.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectResponse.model_validate(project)

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    with get_db_session() as db:
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        db.delete(project)
        db.commit()
        return {"message": "Project deleted"}

# ===== TASK ENDPOINTS =====

@app.post("/api/projects/{project_id}/tasks", response_model=TaskResponse)
def create_task(project_id: str, task: TaskCreate):
    with get_db_session() as db:
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
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
def toggle_task(task_id: str):
    with get_db_session() as db:
        task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task.completed = not task.completed
        db.commit()
        db.refresh(task)
        return TaskResponse.model_validate(task)

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    with get_db_session() as db:
        task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
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
