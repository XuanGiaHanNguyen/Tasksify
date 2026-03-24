"use client";

import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import TaskCard from "./task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, Column as ColumnType } from "@/types/kanban";

interface ColumnWithTasks extends ColumnType {
  tasks: Task[];
}

interface ColumnProps {
  column: ColumnWithTasks;
  onAddTask: (columnId: string, task: Partial<Task>) => void;
  onTaskClick: (task: Task) => void;
  onDeleteColumn: () => void;
  onUpdateColumn: (columnId: string, updates: Partial<ColumnType>) => void;
  onDuplicateTask: (task: Task, columnId: string) => void;
}

export default function Column({
  column,
  onAddTask,
  onTaskClick,
  onDeleteColumn,
  onUpdateColumn,
  onDuplicateTask,
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(column.id, {
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      priority: "medium",
      labels: [],
      subtasks: [],
      customFieldValues: {},
    });
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsAddingTask(false);
  };

  return (
    <div className="shrink-0 w-72 flex flex-col rounded-xl border border-[#e8c9a8] dark:border-[#7e3914]/50 bg-[#fdf4ed] dark:bg-[#2e1206] shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#e8c9a8] dark:border-[#7e3914]/50 bg-white/60 dark:bg-[#3b1a0a]/60 rounded-t-xl">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-[#5c280d] dark:text-[#f0c49a]">
            {column.title}
          </h3>
          <span className="text-xs font-semibold bg-[#e8c49a] dark:bg-[#7e3914] text-[#7e3914] dark:text-[#f9e3ce] px-2 py-0.5 rounded-full min-w-[22px] text-center tabular-nums">
            {column.tasks.length}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-lg text-[#a04d1e]/60 hover:text-[#7e3914] hover:bg-[#f0c49a]/40 dark:text-[#e8a06a]/50 dark:hover:text-[#e8a06a] dark:hover:bg-[#7e3914]/40"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#fdf4ed] border-[#e8c9a8] dark:bg-[#2e1206] dark:border-[#7e3914]/60 rounded-xl shadow-lg"
          >
            <DropdownMenuItem
              onClick={onDeleteColumn}
              className="text-red-600 dark:text-red-400 focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]/50 rounded-lg text-sm cursor-pointer"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[60px] rounded-b-xl transition-colors ${
              snapshot.isDraggingOver ? "bg-[#f0c49a]/20 dark:bg-[#7e3914]/20" : ""
            }`}
          >
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "rotate-1 scale-[1.02] opacity-90" : ""}
                    style={provided.draggableProps.style}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      onDuplicate={() => onDuplicateTask(task, column.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {isAddingTask ? (
              <div className="p-3 bg-white dark:bg-[#3b1a0a] rounded-xl border border-[#e8c9a8] dark:border-[#7e3914]/60 shadow-sm space-y-2">
                <div>
                  <Label
                    htmlFor="task-title"
                    className="text-xs font-medium text-[#7e3914] dark:text-[#e8a06a]"
                  >
                    Task title
                  </Label>
                  <Input
                    id="task-title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                    className="mt-1 text-sm bg-[#fdf4ed] dark:bg-[#2e1206] border-[#e8c9a8] dark:border-[#7e3914]/60 text-[#5c280d] dark:text-[#fdf4ed] placeholder:text-[#c09070] focus-visible:ring-1 focus-visible:ring-[#c06228] focus-visible:border-[#c06228] rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) handleAddTask();
                      if (e.key === "Escape") setIsAddingTask(false);
                    }}
                    autoFocus
                  />
                </div>
                <div>
                  <Label
                    htmlFor="task-description"
                    className="text-xs font-medium text-[#7e3914] dark:text-[#e8a06a]"
                  >
                    Description{" "}
                    <span className="text-[#c09070] font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="task-description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Enter task description"
                    className="mt-1 text-sm bg-[#fdf4ed] dark:bg-[#2e1206] border-[#e8c9a8] dark:border-[#7e3914]/60 text-[#5c280d] dark:text-[#fdf4ed] placeholder:text-[#c09070] focus-visible:ring-1 focus-visible:ring-[#c06228] focus-visible:border-[#c06228] rounded-lg resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-0.5">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#c06228] hover:bg-[#a04d1e] text-white text-sm font-medium rounded-lg border-0"
                    onClick={handleAddTask}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingTask(false)}
                    className="flex-1 text-sm border-[#e8c9a8] dark:border-[#7e3914]/60 text-[#7e3914] dark:text-[#e8a06a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]/40 rounded-lg bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                className="w-full py-2 px-3 flex items-center gap-2 text-sm text-[#a04d1e]/70 dark:text-[#e8a06a]/60 hover:text-[#7e3914] dark:hover:text-[#f0c49a] hover:bg-[#f0c49a]/20 dark:hover:bg-[#7e3914]/20 rounded-lg transition-colors"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}