import { useState } from 'react'
import { Project } from '../types'
import './ProjectForm.css'

interface ProjectFormProps {
  onAddProject: (
    name: string,
    description?: string,
    reward?: string,
    deadline?: string
  ) => void
}

/**
 * Form to create a new project
 */
export function ProjectForm({ onAddProject }: ProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [reward, setReward] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAddProject(
        name,
        description || undefined,
        reward || undefined,
        deadline || undefined
      )
      setName('')
      setDescription('')
      setReward('')
      setDeadline('')
      setIsOpen(false)
    }
  }

  return (
    <div className="project-form">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="new-project-btn">
          + New Project
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="project-form-fields">
          <h2>Create New Project</h2>
          <input
            type="text"
            placeholder="Project name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            autoFocus
            required
          />
          <textarea
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            rows={2}
          />
          <input
            type="text"
            placeholder="Reward when complete (e.g., 'coffee break')..."
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className="form-input"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="form-input"
            min={new Date().getFullYear() + '-01-01'}
          />
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Create Project
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
