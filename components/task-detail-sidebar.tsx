"use client"

import { useState } from "react"
import { X, Calendar, Trash2, Plus, CheckSquare, Square, Edit, Copy, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Task, Column, SubTask } from "@/types/kanban"
import { formatDate, generateId } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ColumnWithTasks extends Column {
  tasks: Task[]
}

interface TaskDetailSidebarProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onDuplicate: (task: Task) => void
  columns: ColumnWithTasks[]
}

export default function TaskDetailSidebar({
  task,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  columns,
}: TaskDetailSidebarProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [isAddingLabel, setIsAddingLabel] = useState(false)

  const handleTitleSave = () => {
    if (editedTask.title.trim()) {
      onUpdate(editedTask)
      setIsEditingTitle(false)
    }
  }

  const handleDescriptionSave = () => {
    onUpdate(editedTask)
    setIsEditingDescription(false)
  }

  const handleColumnChange = (columnId: string) => {
    const updatedTask = { ...editedTask, columnId }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const handlePriorityChange = (priority: Task["priority"]) => {
    const updatedTask = { ...editedTask, priority }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const handleDueDateChange = (date: Date | undefined) => {
    const updatedTask = {
      ...editedTask,
      dueDate: date ? date.toISOString() : undefined,
    }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
    )

    const updatedTask = { ...editedTask, subtasks: updatedSubtasks }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: SubTask = {
      id: `subtask-${generateId()}`,
      title: newSubtaskTitle,
      completed: false,
    }

    const updatedTask = {
      ...editedTask,
      subtasks: [...editedTask.subtasks, newSubtask],
    }

    setEditedTask(updatedTask)
    onUpdate(updatedTask)
    setNewSubtaskTitle("")
    setIsAddingSubtask(false)
  }

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.filter((subtask) => subtask.id !== subtaskId)

    const updatedTask = { ...editedTask, subtasks: updatedSubtasks }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const addLabel = () => {
    if (!newLabel.trim() || editedTask.labels.includes(newLabel.trim())) return

    const updatedTask = {
      ...editedTask,
      labels: [...editedTask.labels, newLabel.trim()],
    }

    setEditedTask(updatedTask)
    onUpdate(updatedTask)
    setNewLabel("")
    setIsAddingLabel(false)
  }

  const removeLabel = (label: string) => {
    const updatedTask = {
      ...editedTask,
      labels: editedTask.labels.filter((l) => l !== label),
    }

    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const handleDeleteTask = () => {
    onDelete(task.id)
  }

  const handleDuplicateTask = () => {
    onDuplicate(task)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#fdf4ed] dark:bg-[#5c280d] shadow-lg border-l border-[#f0c49a] dark:border-[#7e3914] z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#f0c49a] dark:border-[#7e3914]">
        <h2 className="text-lg font-semibold text-[#5c280d] dark:text-[#fdf4ed]">Task Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-[#a04d1e] hover:bg-[#f9e3ce] dark:text-[#e8a06a] dark:hover:bg-[#7e3914]"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle ? (
              <div className="space-y-2">
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-medium bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus-visible:ring-[#c06228]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave()
                    if (e.key === "Escape") setIsEditingTitle(false)
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#c06228] hover:bg-[#a04d1e] text-[#fdf4ed] border-0"
                    onClick={handleTitleSave}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingTitle(false)}
                    className="border-[#e8a06a] text-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-[#3a1808] dark:text-[#fdf4ed]">{editedTask.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTitle(true)}
                  className="text-[#a04d1e] hover:bg-[#f9e3ce] dark:text-[#e8a06a] dark:hover:bg-[#7e3914]"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Column (Status) */}
          <div>
            <label className="text-sm font-medium text-[#7e3914] dark:text-[#e8a06a] block mb-1">Column</label>
            <Select value={editedTask.columnId} onValueChange={handleColumnChange}>
              <SelectTrigger className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus:ring-[#c06228]">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent className="bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]">
                {columns.map((column) => (
                  <SelectItem
                    key={column.id}
                    value={column.id}
                    className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]"
                  >
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-[#7e3914] dark:text-[#e8a06a] block mb-1">Priority</label>
            <Select value={editedTask.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus:ring-[#c06228]">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]">
                <SelectItem value="low" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Low</SelectItem>
                <SelectItem value="medium" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Medium</SelectItem>
                <SelectItem value="high" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">High</SelectItem>
                <SelectItem value="urgent" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-[#7e3914] dark:text-[#e8a06a] block mb-1">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] hover:bg-[#f9e3ce] dark:hover:bg-[#5c280d]"
                >
                  <Calendar className="mr-2 h-4 w-4 text-[#a04d1e] dark:text-[#e8a06a]" />
                  {editedTask.dueDate ? formatDate(editedTask.dueDate) : <span className="text-[#a04d1e] dark:text-[#e8a06a]">Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]" align="start">
                <CalendarComponent
                  mode="single"
                  selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                  onSelect={handleDueDateChange}
                  initialFocus
                  className="dark:bg-[#5c280d]"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Labels */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[#7e3914] dark:text-[#e8a06a]">Labels</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingLabel(true)}
                className="text-[#a04d1e] hover:bg-[#f9e3ce] dark:text-[#e8a06a] dark:hover:bg-[#7e3914]"
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>

            {isAddingLabel && (
              <div className="mb-3 space-y-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label name"
                  className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus-visible:ring-[#c06228]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLabel()
                    if (e.key === "Escape") setIsAddingLabel(false)
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#c06228] hover:bg-[#a04d1e] text-[#fdf4ed] border-0"
                    onClick={addLabel}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingLabel(false)}
                    className="border-[#e8a06a] text-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {editedTask.labels.length === 0 ? (
                <p className="text-sm text-[#a04d1e] dark:text-[#e8a06a]">No labels yet.</p>
              ) : (
                editedTask.labels.map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="cursor-pointer bg-[#f9e3ce] text-[#7e3914] hover:bg-red-100 dark:bg-[#7e3914] dark:text-[#f0c49a] dark:hover:bg-red-900/30 border border-[#e8a06a] dark:border-[#a04d1e]"
                    onClick={() => removeLabel(label)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-[#7e3914] dark:text-[#e8a06a]">Description</label>
              {!isEditingDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                  className="text-[#a04d1e] hover:bg-[#f9e3ce] dark:text-[#e8a06a] dark:hover:bg-[#7e3914]"
                >
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={4}
                  className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus-visible:ring-[#c06228]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#c06228] hover:bg-[#a04d1e] text-[#fdf4ed] border-0"
                    onClick={handleDescriptionSave}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingDescription(false)}
                    className="border-[#e8a06a] text-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#5c280d] dark:text-[#f0c49a] bg-[#f9e3ce] dark:bg-[#7e3914] p-3 rounded-md min-h-[60px]">
                {editedTask.description || <span className="text-[#a04d1e] dark:text-[#e8a06a]">No description provided.</span>}
              </div>
            )}
          </div>

          <Separator className="bg-[#f0c49a] dark:bg-[#7e3914]" />

          {/* Subtasks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-[#7e3914] dark:text-[#e8a06a]">Subtasks</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingSubtask(true)}
                className="text-[#a04d1e] hover:bg-[#f9e3ce] dark:text-[#e8a06a] dark:hover:bg-[#7e3914]"
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>

            {isAddingSubtask && (
              <div className="mb-3 space-y-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Subtask title"
                  className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus-visible:ring-[#c06228]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addSubtask()
                    if (e.key === "Escape") setIsAddingSubtask(false)
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#c06228] hover:bg-[#a04d1e] text-[#fdf4ed] border-0"
                    onClick={addSubtask}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingSubtask(false)}
                    className="border-[#e8a06a] text-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedTask.subtasks.length === 0 ? (
                <p className="text-sm text-[#a04d1e] dark:text-[#e8a06a]">No subtasks yet.</p>
              ) : (
                editedTask.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center justify-between bg-[#f9e3ce] dark:bg-[#7e3914] p-2 rounded-md border border-[#f0c49a] dark:border-[#a04d1e]"
                  >
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-2 text-[#a04d1e] hover:bg-[#f0c49a] dark:text-[#e8a06a] dark:hover:bg-[#5c280d]"
                        onClick={() => toggleSubtask(subtask.id)}
                      >
                        {subtask.completed ? (
                          <CheckSquare className="h-4 w-4 text-[#c06228]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                      <span
                        className={`text-sm ${subtask.completed ? "line-through text-[#a04d1e] dark:text-[#e8a06a]" : "text-[#3a1808] dark:text-[#fdf4ed]"}`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-[#a04d1e] dark:text-[#e8a06a] hover:text-red-600 dark:hover:text-red-400 hover:bg-[#f0c49a] dark:hover:bg-[#5c280d]"
                      onClick={() => deleteSubtask(subtask.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#f0c49a] dark:border-[#7e3914] flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-[#e8a06a] text-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
          onClick={handleDuplicateTask}
        >
          <Copy className="h-4 w-4 mr-2" /> Duplicate
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex-1 bg-red-700 hover:bg-red-800 text-white">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Task
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#3a1808] dark:text-[#fdf4ed]">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-[#7e3914] dark:text-[#e8a06a]">
                This action cannot be undone. This will permanently delete the task and all its subtasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#f9e3ce] border-[#e8a06a] text-[#7e3914] hover:bg-[#f0c49a] dark:bg-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}