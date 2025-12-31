import './ProjectList.css'
import { Project } from '../types'
import { calculateProgress } from '../lib/progress'

interface ProjectListProps {
  projects: Project[]
  currentProjectId: string | null
  onSelectProject: (projectId: string) => void
}

/**
 * Sidebar list of all projects
 */
export function ProjectList({
  projects,
  currentProjectId,
  onSelectProject,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="project-list-empty">
        <p>No projects yet</p>
      </div>
    )
  }

  return (
    <div className="project-list">
      {projects.map((project) => {
        const progress = calculateProgress(project.tasks)
        const isComplete = progress.progressPercentage === 100 && project.tasks.length > 0
        
        return (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`project-list-item ${
              currentProjectId === project.id ? 'active' : ''
            } ${isComplete ? 'completed' : ''}`}
          >
            <div className="project-list-name">
              {isComplete && (
                <span className="completion-indicator">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="project-checkbox"
                    aria-label="Project completed"
                  />
                </span>
              )}
              {project.name}
            </div>
            <div className="project-list-tasks">
              {project.tasks.length} tasks · {progress.progressPercentage}%
            </div>
          </button>
        )
      })}
    </div>
  )
}
