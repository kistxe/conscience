from sqlalchemy import Column, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    projects = relationship("ProjectModel", back_populates="owner", cascade="all, delete-orphan")

class ProjectModel(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    reward = Column(String, nullable=True)
    deadline = Column(String, nullable=True)  # ISO date string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("UserModel", back_populates="projects")
    tasks = relationship("TaskModel", back_populates="project", cascade="all, delete-orphan")

class TaskModel(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    weight = Column(Float, default=1.0)
    
    project = relationship("ProjectModel", back_populates="tasks")
