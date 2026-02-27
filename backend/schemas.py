from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Task schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    weight: Optional[float] = 1.0

class TaskResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    completed: bool
    weight: float
    
    class Config:
        from_attributes = True

# Project schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    reward: Optional[str] = None
    deadline: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    reward: Optional[str] = None
    deadline: Optional[str] = None
    created_at: datetime
    tasks: List[TaskResponse] = []
    
    class Config:
        from_attributes = True
