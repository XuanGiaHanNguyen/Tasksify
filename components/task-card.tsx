"use client"

import type React from "react"

import { Calendar, CheckSquare, Copy, AlertCircle, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/types/kanban"
import { formatDate } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onClick: () => void
  onDuplicate: () => void
}

const priorityColors = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300",
}

export default function TaskCard({ task, onClick, onDuplicate }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
  const totalSubtasks = task.subtasks.length

  // Determine if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate()
  }

  return (
    <div
      className="mb-2 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{task.title}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDuplicate}
          title="Duplicate task"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {/* Priority badge */}
        <div className={`flex items-center text-xs px-2 py-1 rounded-md ${priorityColors[task.priority]}`}>
          <AlertCircle className="h-3 w-3 mr-1" />
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center text-xs ${
              isOverdue ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30" : "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
            } px-2 py-1 rounded-md`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(task.dueDate)}
          </div>
        )}

        {totalSubtasks > 0 && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
            <CheckSquare className="h-3 w-3 mr-1" />
            {completedSubtasks}/{totalSubtasks}
          </div>
        )}

        {/* Labels */}
        {task.labels.slice(0, 2).map((label) => (
          <div
            key={label}
            className="flex items-center text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-md"
          >
            <Tag className="h-3 w-3 mr-1" />
            {label}
          </div>
        ))}
        {task.labels.length > 2 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
            +{task.labels.length - 2}
          </div>
        )}
      </div>
    </div>
  )
}
