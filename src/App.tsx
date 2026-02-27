import { useState, useMemo, useEffect } from 'react'
import { Project, Task } from './types'
import { calculateProgress } from './lib/progress'
import {
  getMotivationalMessage,
  getGuiltMeterColor,
} from './config/messages'
import { ProjectForm } from './components/ProjectForm'
import { ProjectList } from './components/ProjectList'
import { ProjectHeader } from './components/ProjectHeader'
import { GuiltMeter } from './components/GuiltMeter'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { MotivationalMessage } from './components/MotivationalMessage'
import './App.css'

export function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to load projects')
      const data = await response.json()
      setProjects(data)
      if (data.length > 0) {
        setCurrentProjectId(data[0].id)
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId),
    [projects, currentProjectId]
  )

  const progressState = useMemo(
    () => (currentProject ? calculateProgress(currentProject.tasks) : null),
    [currentProject]
  )

  const motivationalMessage = useMemo(
    () =>
      progressState
        ? getMotivationalMessage(progressState.guiltPercentage)
        : '',
    [progressState]
  )

  const guiltMeterColor = useMemo(
    () =>
      progressState
        ? getGuiltMeterColor(progressState.guiltPercentage)
        : '#e5e7eb',
    [progressState]
  )

  // Project management
  const handleAddProject = async (
    name: string,
    description?: string,
    reward?: string,
    deadline?: string
  ) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, reward, deadline }),
      })
      if (!response.ok) throw new Error('Failed to create project')
      const newProject = await response.json()
      setProjects([...projects, newProject])
      setCurrentProjectId(newProject.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    }
  }

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete project')
      const updatedProjects = projects.filter((p) => p.id !== projectId)
      setProjects(updatedProjects)
      if (currentProjectId === projectId) {
        setCurrentProjectId(updatedProjects.length > 0 ? updatedProjects[0]!.id : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  // Task management
  const handleAddTask = async (
    title: string,
    weight: number,
    description?: string
  ) => {
    if (!currentProject) return

    try {
      const response = await fetch(`/api/projects/${currentProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, weight }),
      })
      if (!response.ok) throw new Error('Failed to create task')
      const newTask = await response.json()
      setProjects(
        projects.map((p) =>
          p.id === currentProject.id
            ? { ...p, tasks: [...p.tasks, newTask] }
            : p
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleToggleTask = async (taskId: string) => {
    if (!currentProject) return

    try {
      const response = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      })
      if (!response.ok) throw new Error('Failed to toggle task')
      const updatedTask = await response.json()
      setProjects(
        projects.map((p) =>
          p.id === currentProject.id
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId ? updatedTask : t
                ),
              }
            : p
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task')
    }
  }

  const handleRemoveTask = async (taskId: string) => {
    if (!currentProject) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete task')
      setProjects(
        projects.map((p) =>
          p.id === currentProject.id
            ? {
                ...p,
                tasks: p.tasks.filter((t) => t.id !== taskId),
              }
            : p
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Guilt Meter</h1>
          <p>Track your projects and lift the mental load</p>
        </header>
        <div className="app-container">
          <main className="app-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Loading projects...</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Guilt Meter</h1>
        <p>Track your projects and lift the mental load</p>
        {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>Error: {error}</p>}
      </header>

      <div className="app-container">
        <aside className="app-sidebar">
          <ProjectForm onAddProject={handleAddProject} />
          <ProjectList
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={handleSelectProject}
          />
        </aside>

        <main className="app-main">
          {currentProject ? (
            <div className="project-view">
              <ProjectHeader
                project={currentProject}
                onDeleteProject={handleDeleteProject}
              />

              {progressState && (
                <div className="content-grid">
                  <div className="progress-section">
                    <GuiltMeter
                      guiltPercentage={progressState.guiltPercentage}
                      color={guiltMeterColor}
                    />
                    <MotivationalMessage message={motivationalMessage} />

                    <div className="progress-stats">
                      <div className="stat">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">
                          {progressState.completedTasks}/
                          {progressState.totalTasks}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Progress</span>
                        <span className="stat-value">
                          {progressState.progressPercentage}%
                        </span>
                      </div>
                      {currentProject.reward && (
                        <div className="stat">
                          <span className="stat-label">Reward</span>
                          <span className="stat-value">{currentProject.reward}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tasks-section">
                    <h2>Tasks</h2>
                    <TaskForm onAddTask={handleAddTask} />
                    <TaskList
                      tasks={currentProject.tasks}
                      onToggleTask={handleToggleTask}
                      onRemoveTask={handleRemoveTask}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-main">
              <div className="empty-illustration">
                <div className="emoji">📝</div>
              </div>
              <h2>No project selected</h2>
              <p>Create a new project or select one from the sidebar to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
