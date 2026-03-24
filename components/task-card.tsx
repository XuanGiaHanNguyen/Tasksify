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
  low: "bg-[#eaf3de] text-[#3B6D11]",
  medium: "bg-[#f9e3ce] text-[#7e3914]",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
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
      className="mb-2 p-3 bg-white dark:bg-[#5c280d] rounded-md shadow-sm border border-[#f0c49a] dark:border-[#7e3914] hover:shadow-md hover:border-[#d4793a] dark:hover:border-[#e8a06a] transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-[#3a1808] dark:text-[#fdf4ed] mb-1">{task.title}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#a04d1e] hover:bg-[#f9e3ce] dark:text-[#e8a06a] dark:hover:bg-[#7e3914]"
          onClick={handleDuplicate}
          title="Duplicate task"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      {task.description && (
        <p className="text-xs text-[#7e3914] dark:text-[#e8a06a] mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {/* Priority badge */}
        <div className={`flex items-center text-xs px-2 py-1 rounded-md ${priorityColors[task.priority]}`}>
          <AlertCircle className="h-3 w-3 mr-1" />
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center text-xs px-2 py-1 rounded-md ${
              isOverdue
                ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
                : "text-[#7e3914] dark:text-[#e8a06a] bg-[#f9e3ce] dark:bg-[#7e3914]"
            }`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(task.dueDate)}
          </div>
        )}

        {totalSubtasks > 0 && (
          <div className="flex items-center text-xs text-[#7e3914] dark:text-[#e8a06a] bg-[#f9e3ce] dark:bg-[#7e3914] px-2 py-1 rounded-md">
            <CheckSquare className="h-3 w-3 mr-1" />
            {completedSubtasks}/{totalSubtasks}
          </div>
        )}

        {/* Labels */}
        {task.labels.slice(0, 2).map((label) => (
          <div
            key={label}
            className="flex items-center text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-md"
          >
            <Tag className="h-3 w-3 mr-1" />
            {label}
          </div>
        ))}
        {task.labels.length > 2 && (
          <div className="text-xs text-[#7e3914] dark:text-[#e8a06a] bg-[#f9e3ce] dark:bg-[#7e3914] px-2 py-1 rounded-md">
            +{task.labels.length - 2}
          </div>
        )}
      </div>
    </div>
  )
}