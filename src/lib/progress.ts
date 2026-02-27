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

/**
 * Add a new task to the task list
 */
export function addTask(
  tasks: Task[],
  title: string,
  weight = 1,
  description = ''
): Task[] {
  const newTask: Task = {
    id: Date.now().toString(),
    title,
    description: description || undefined,
    completed: false,
    weight,
  }
  return [...tasks, newTask]
}

/**
 * Toggle task completion status
 */
export function toggleTask(tasks: Task[], taskId: string): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  )
}

/**
 * Remove a task
 */
export function removeTask(tasks: Task[], taskId: string): Task[] {
  return tasks.filter((task) => task.id !== taskId)
}

/**
 * Update task properties
 */
export function updateTask(
  tasks: Task[],
  taskId: string,
  updates: Partial<Task>
): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, ...updates } : task
  )
}
