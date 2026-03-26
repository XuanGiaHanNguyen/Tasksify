"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus, Loader2 } from "lucide-react";
import Column from "./column";
import TaskDetailSidebar from "./task-detail-sidebar";
import AutomationRules from "./automation-rules";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useColumns,
  useTasks,
  useAutomationRules,
  api,
} from "@/hooks/use-kanban";
import type {
  Task,
  Column as ColumnType,
  AutomationRule,
} from "@/types/kanban";
import { generateId } from "@/lib/utils";


// Default column colors
const DEFAULT_COLORS = [
  "bg-blue-50 dark:bg-blue-900/30",
  "bg-yellow-50 dark:bg-yellow-900/30",
  "bg-red-50 dark:bg-red-900/30",
  "bg-green-50 dark:bg-green-900/30",
  "bg-purple-50 dark:bg-purple-900/30",
  "bg-pink-50 dark:bg-pink-900/30",
];

export default function KanbanBoard() {
  const { toast } = useToast();
  const { columns: dbColumns, isLoading: columnsLoading } = useColumns();
  const { tasks: dbTasks, isLoading: tasksLoading } = useTasks();
  const { automationRules, isLoading: rulesLoading } = useAutomationRules();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [activeTab, setActiveTab] = useState("board");
  const [initialized, setInitialized] = useState(false);

  // Initialize default columns if none exist
  useEffect(() => {
    if (!columnsLoading && !initialized) {
      setInitialized(true);
      if (dbColumns.length === 0) {
        // Create default columns
        const defaultColumns = [
          {
            id: generateId(),
            title: "To Do",
            color: DEFAULT_COLORS[0],
            position: 0,
          },
          {
            id: generateId(),
            title: "In Progress",
            color: DEFAULT_COLORS[1],
            position: 1,
          },
          {
            id: generateId(),
            title: "Blocked",
            color: DEFAULT_COLORS[2],
            position: 2,
          },
          {
            id: generateId(),
            title: "Completed",
            color: DEFAULT_COLORS[3],
            position: 3,
          },
        ];

        Promise.all(defaultColumns.map((col) => api.createColumn(col))).then(
          () => {
            toast({
              title: "Board initialized",
              description: "Default columns have been created",
            });
          },
        );
      }
    }
  }, [columnsLoading, dbColumns.length, initialized, toast]);

  // Group tasks by column
  const getTasksForColumn = useCallback(
    (columnId: string) => {
      return dbTasks
        .filter((task) => task.columnId === columnId)
        .sort((a, b) => {
          // Sort by position if available, otherwise by creation date
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
    },
    [dbTasks],
  );

  // Convert to column format expected by Column component
  const columnsWithTasks = dbColumns.map((col) => ({
    ...col,
    tasks: getTasksForColumn(col.id),
  }));

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const sourceColumn = dbColumns.find((col) => col.id === source.droppableId);
    const destColumn = dbColumns.find(
      (col) => col.id === destination.droppableId,
    );

    if (!sourceColumn || !destColumn) return;

    const task = dbTasks.find((t) => t.id === draggableId);
    if (!task) return;

    // Get all tasks in the destination column
    const destTasks = getTasksForColumn(destination.droppableId);

    // Calculate new positions
    const updates: { id: string; column_id: string; position: number }[] = [];

    // Update the moved task
    updates.push({
      id: draggableId,
      column_id: destination.droppableId,
      position: destination.index,
    });

    // Update positions of other tasks in destination column
    destTasks.forEach((t, idx) => {
      if (t.id !== draggableId) {
        const newPos = idx >= destination.index ? idx + 1 : idx;
        updates.push({
          id: t.id,
          column_id: destination.droppableId,
          position: newPos,
        });
      }
    });

    // If moving between columns, update source column positions
    if (source.droppableId !== destination.droppableId) {
      const sourceTasks = getTasksForColumn(source.droppableId);
      sourceTasks.forEach((t, idx) => {
        if (t.id !== draggableId) {
          updates.push({
            id: t.id,
            column_id: source.droppableId,
            position: idx,
          });
        }
      });
    }

    await api.batchUpdateTasks(updates);

    // Update selected task if it's the one being moved
    if (selectedTask && selectedTask.id === draggableId) {
      setSelectedTask({ ...task, columnId: destination.droppableId });
    }

    toast({
      title: "Task moved",
      description: `"${task.title}" moved to ${destColumn.title}`,
    });
  };

  const addTask = async (columnId: string, taskData: Partial<Task>) => {
    const column = dbColumns.find((col) => col.id === columnId);
    const tasksInColumn = getTasksForColumn(columnId);

    const newTask = {
      id: generateId(),
      column_id: columnId,
      title: taskData.title || "New Task",
      description: taskData.description || null,
      priority: taskData.priority || "medium",
      labels: taskData.labels || [],
      due_date: taskData.dueDate || null,
      assignee: taskData.assignee || null,
      position: tasksInColumn.length,
      custom_field_values: taskData.customFieldValues || {},
    };

    await api.createTask(newTask);

    toast({
      title: "Task created",
      description: `"${newTask.title}" added to ${column?.title}`,
    });
  };

  const updateTask = async (updatedTask: Task) => {
    await api.updateTask(updatedTask.id, {
      column_id: updatedTask.columnId,
      title: updatedTask.title,
      description: updatedTask.description || null,
      priority: updatedTask.priority,
      labels: updatedTask.labels,
      due_date: updatedTask.dueDate || null,
      assignee: updatedTask.assignee || null,
      custom_field_values: updatedTask.customFieldValues,
    });

    // Handle subtasks updates
    const existingSubtasks =
      dbTasks.find((t) => t.id === updatedTask.id)?.subtasks || [];

    // Update or create subtasks
    for (const subtask of updatedTask.subtasks) {
      const existing = existingSubtasks.find((st) => st.id === subtask.id);
      if (existing) {
        if (
          existing.title !== subtask.title ||
          existing.completed !== subtask.completed
        ) {
          await api.updateSubtask(subtask.id, {
            title: subtask.title,
            completed: subtask.completed,
          });
        }
      } else {
        await api.createSubtask({
          id: subtask.id,
          task_id: updatedTask.id,
          title: subtask.title,
          completed: subtask.completed,
        });
      }
    }

    // Delete removed subtasks
    for (const existing of existingSubtasks) {
      if (!updatedTask.subtasks.find((st) => st.id === existing.id)) {
        await api.deleteSubtask(existing.id);
      }
    }

    setSelectedTask(updatedTask);
    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated`,
    });
  };

  const deleteTask = async (taskId: string) => {
    await api.deleteTask(taskId);
    setSelectedTask(null);
    toast({
      title: "Task deleted",
      description: "The task has been deleted",
    });
  };

  const duplicateTask = async (task: Task, columnId?: string) => {
    const targetColumnId = columnId || task.columnId;
    const tasksInColumn = getTasksForColumn(targetColumnId);

    const newTask = {
      column_id: targetColumnId,
      title: `${task.title} (Copy)`,
      description: task.description || null,
      priority: task.priority,
      labels: task.labels,
      due_date: task.dueDate || null,
      assignee: task.assignee || null,
      position: tasksInColumn.length,
      custom_field_values: task.customFieldValues,
    };

    const created = await api.createTask(newTask);

    // Duplicate subtasks
    for (const subtask of task.subtasks) {
      await api.createSubtask({
        task_id: created.id,
        title: subtask.title,
        completed: false,
      });
    }

    toast({
      title: "Task duplicated",
      description: `"${newTask.title}" created`,
    });
  };

  const addColumn = async () => {
    if (!newColumnTitle.trim()) {
      toast({
        title: "Error",
        description: "Column title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const colorIndex = dbColumns.length % DEFAULT_COLORS.length;

    await api.createColumn({
      id: generateId(),
      title: newColumnTitle,
      color: DEFAULT_COLORS[colorIndex],
      position: dbColumns.length,
    });

    setNewColumnTitle("");
    setIsAddingColumn(false);
    toast({
      title: "Column added",
      description: `"${newColumnTitle}" column has been added`,
    });
  };

  const updateColumn = async (
    columnId: string,
    updates: Partial<ColumnType>,
  ) => {
    await api.updateColumn(columnId, {
      title: updates.title,
      color: updates.color,
      wip_limit: updates.wipLimit ?? null,
    });
  };

  const deleteColumn = async (columnId: string) => {
    const column = columnsWithTasks.find((col) => col.id === columnId);
    if (column && column.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "Please move or delete all tasks in this column first",
        variant: "destructive",
      });
      return;
    }

    await api.deleteColumn(columnId);
    toast({
      title: "Column deleted",
      description: `"${column?.title}" column has been deleted`,
    });
  };

  const addRule = async (rule: AutomationRule) => {
    await api.createAutomationRule({
      name: rule.name,
      trigger_type: rule.trigger.type,
      trigger_value: rule.trigger.value || null,
      action_type: rule.action.type,
      action_value: rule.action.value,
      enabled: rule.enabled,
    });
    toast({
      title: "Rule created",
      description: `"${rule.name}" has been added`,
    });
  };

  const updateRule = async (
    ruleId: string,
    updates: Partial<AutomationRule>,
  ) => {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
    if (updates.trigger) {
      updateData.trigger_type = updates.trigger.type;
      updateData.trigger_value = updates.trigger.value || null;
    }
    if (updates.action) {
      updateData.action_type = updates.action.type;
      updateData.action_value = updates.action.value;
    }

    await api.updateAutomationRule(ruleId, updateData);
  };

  const deleteRule = async (ruleId: string) => {
    await api.deleteAutomationRule(ruleId);
    toast({
      title: "Rule deleted",
      description: "The automation rule has been deleted",
    });
  };

  // Loading state
  if (columnsLoading || tasksLoading || rulesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fdf4ed] dark:bg-[#3a1808]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#c06228]" />
          <p className="text-[#7e3914] dark:text-[#f0c49a]">
            Loading your board...
          </p>
        </div>
      </div>
    );
  }

  // Board content for the "board" tab
  const renderBoardContent = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columnsWithTasks.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={addTask}
            onTaskClick={setSelectedTask}
            onDeleteColumn={() => deleteColumn(column.id)}
            onUpdateColumn={updateColumn}
            onDuplicateTask={duplicateTask}
          />
        ))}

        <div className="shrink-0 w-72">
          {isAddingColumn ? (
            <div className="bg-[#fdf4ed] dark:bg-[#5c280d] p-3 rounded-md shadow-sm border border-[#f0c49a] dark:border-[#7e3914]">
              <Label
                htmlFor="column-title"
                className="text-[#7e3914] dark:text-[#f0c49a]"
              >
                Column Title
              </Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
                className="mb-2 bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#5c280d] dark:text-[#fdf4ed] focus-visible:ring-[#c06228]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addColumn();
                  if (e.key === "Escape") setIsAddingColumn(false);
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#c06228] hover:bg-[#a04d1e] text-[#fdf4ed] border-0"
                  onClick={addColumn}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingColumn(false)}
                  className="border-[#e8a06a] text-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-dashed border-2 border-[#e8a06a] w-full h-12 text-[#a04d1e] dark:border-[#7e3914] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#5c280d]"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
          )}
        </div>
      </div>
    </DragDropContext>
  );

  // Automation content for the "automation" tab
  const renderAutomationContent = () => (
    <div className="max-w-4xl mx-auto">
      <AutomationRules
        rules={automationRules}
        columns={dbColumns}
        onAddRule={addRule}
        onUpdateRule={updateRule}
        onDeleteRule={deleteRule}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#fdf4ed] dark:bg-[#3a1808]">
      <header className="bg-[#7e3914] dark:bg-[#5c280d] border-b border-[#a04d1e] dark:border-[#3a1808] p-5 px-4 xl:px-12 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex flex-row gap-4 items-center">
            <img src='/logo.png' alt="Logo" style={{ width: "40px", height: "auto" }}/>
            <h1 className="text-2xl font-bold text-[#fdf4ed]">Dashboard</h1>
          </div>
          
          <div className="flex flex-row gap-6 items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#5c280d] dark:bg-[#3a1808]">
                <TabsTrigger
                  value="board"
                  className="text-[#f0c49a] data-[state=active]:bg-[#c06228] data-[state=active]:text-[#fdf4ed] data-[state=inactive]:hover:bg-[#7e3914] data-[state=inactive]:hover:text-[#fdf4ed]"
                >
                  Board
                </TabsTrigger>
                <TabsTrigger
                  value="automation"
                  className="text-[#f0c49a] data-[state=active]:bg-[#c06228] data-[state=active]:text-[#fdf4ed] data-[state=inactive]:hover:bg-[#7e3914] data-[state=inactive]:hover:text-[#fdf4ed]"
                >
                  Automation
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ThemeToggle />
            
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="py-3 flex items-center justify-center">
        <TabsContent value="board" className="mt-4">
          {renderBoardContent()}
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          {renderAutomationContent()}
        </TabsContent>
      </Tabs>
      {selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onDuplicate={duplicateTask}
          columns={columnsWithTasks}
        />
      )}
    </div>
  );
}
