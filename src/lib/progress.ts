/**
 * Progress calculation logic
 * Separated from UI for testability and reusability
 */

import { Task, ProgressState } from '../types'

/**
 * Calculate progress based on task completion and weights
 * Progress is based on weighted completion: (completed weight / total weight) * 100
 */
export function calculateProgress(tasks: Task[]): ProgressState {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length

  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0) || 1
  const completedWeight = tasks
    .filter((t) => t.completed)
    .reduce((sum, task) => sum + task.weight, 0)

  const progressPercentage =
    totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
  const guiltPercentage = 100 - progressPercentage

  return {
    totalTasks,
    completedTasks,
    totalWeight,
    completedWeight,
    progressPercentage,
    guiltPercentage,
  }
}
