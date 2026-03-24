"use client";

import useSWR, { mutate } from "swr";
import type {
  Column,
  Task,
  SubTask,
  CustomField,
  AutomationRule,
} from "@/types/kanban";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message = payload?.error || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return payload;
};

// Database types (snake_case)
interface DbColumn {
  id: string;
  title: string;
  color: string;
  position: number;
  wip_limit: number | null;
  created_at: string;
}

interface DbTask {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: string;
  labels: string[];
  due_date: string | null;
  assignee: string | null;
  position: number;
  custom_field_values: Record<string, string | number | boolean>;
  created_at: string;
}

interface DbSubTask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface DbCustomField {
  id: string;
  name: string;
  field_type: string;
  options: string[] | null;
  created_at: string;
}

interface DbAutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_value: string | null;
  action_type: string;
  action_value: string;
  enabled: boolean;
  created_at: string;
}

// Convert database format to app format
function dbColumnToColumn(db: DbColumn): Column {
  return {
    id: db.id,
    title: db.title,
    color: db.color,
    wipLimit: db.wip_limit ?? undefined,
  };
}

function dbTaskToTask(db: DbTask, subtasks: SubTask[]): Task {
  return {
    id: db.id,
    columnId: db.column_id,
    title: db.title,
    description: db.description ?? undefined,
    priority: db.priority as Task["priority"],
    labels: db.labels || [],
    dueDate: db.due_date ?? undefined,
    assignee: db.assignee ?? undefined,
    subtasks: subtasks,
    customFieldValues: db.custom_field_values || {},
    createdAt: db.created_at,
  };
}

function dbSubTaskToSubTask(db: DbSubTask): SubTask {
  return {
    id: db.id,
    title: db.title,
    completed: db.completed,
  };
}

function dbCustomFieldToCustomField(db: DbCustomField): CustomField {
  return {
    id: db.id,
    name: db.name,
    type: db.field_type as CustomField["type"],
    options: db.options ?? undefined,
  };
}

function dbAutomationRuleToAutomationRule(
  db: DbAutomationRule,
): AutomationRule {
  return {
    id: db.id,
    name: db.name,
    trigger: {
      type: db.trigger_type as AutomationRule["trigger"]["type"],
      value: db.trigger_value ?? undefined,
    },
    action: {
      type: db.action_type as AutomationRule["action"]["type"],
      value: db.action_value,
    },
    enabled: db.enabled,
  };
}

export function useColumns() {
  const { data, error, isLoading } = useSWR<DbColumn[]>(
    "/api/columns",
    fetcher,
  );

  const columns = data?.map(dbColumnToColumn) || [];

  return { columns, error, isLoading };
}

export function useTasks() {
  const {
    data: tasksData,
    error: tasksError,
    isLoading: tasksLoading,
  } = useSWR<DbTask[]>("/api/tasks", fetcher);
  const {
    data: subtasksData,
    error: subtasksError,
    isLoading: subtasksLoading,
  } = useSWR<DbSubTask[]>("/api/subtasks", fetcher);

  const subtasksList = Array.isArray(subtasksData) ? subtasksData : [];

  const subtasksByTaskId = subtasksList.reduce(
    (acc, st) => {
      if (!acc[st.task_id]) acc[st.task_id] = [];
      acc[st.task_id].push(dbSubTaskToSubTask(st));
      return acc;
    },
    {} as Record<string, SubTask[]>,
  );

  const tasks = Array.isArray(tasksData)
    ? tasksData.map((t) => dbTaskToTask(t, subtasksByTaskId[t.id] || []))
    : [];

  return {
    tasks,
    error: tasksError || subtasksError,
    isLoading: tasksLoading || subtasksLoading,
  };
}

export function useCustomFields() {
  const { data, error, isLoading } = useSWR<DbCustomField[]>(
    "/api/custom-fields",
    fetcher,
  );

  const customFields = data?.map(dbCustomFieldToCustomField) || [];

  return { customFields, error, isLoading };
}

export function useAutomationRules() {
  const { data, error, isLoading } = useSWR<DbAutomationRule[]>(
    "/api/automation-rules",
    fetcher,
  );

  const automationRules = data?.map(dbAutomationRuleToAutomationRule) || [];

  return { automationRules, error, isLoading };
}

// API functions for mutations
export const api = {
  // Columns
  async createColumn(column: {
    id: string;
    title: string;
    color: string;
    position: number;
    wip_limit?: number;
  }) {
    const res = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(column),
    });
    const data = await res.json();
    mutate("/api/columns");
    return data;
  },

  async updateColumn(
    id: string,
    updates: Partial<{
      title: string;
      color: string;
      position: number;
      wip_limit: number | null;
    }>,
  ) {
    const res = await fetch("/api/columns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    mutate("/api/columns");
    return data;
  },

  async deleteColumn(id: string) {
    await fetch(`/api/columns?id=${id}`, { method: "DELETE" });
    mutate("/api/columns");
    mutate("/api/tasks");
  },

  // Tasks
  async createTask(task: {
    column_id: string;
    title: string;
    description?: string;
    priority: string;
    labels?: string[];
    due_date?: string;
    assignee?: string;
    position: number;
    custom_field_values?: Record<string, string | number | boolean>;
  }) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    const data = await res.json();
    mutate("/api/tasks");
    return data;
  },

  async updateTask(
    id: string,
    updates: Partial<{
      column_id: string;
      title: string;
      description: string | null;
      priority: string;
      labels: string[];
      due_date: string | null;
      assignee: string | null;
      position: number;
      custom_field_values: Record<string, string | number | boolean>;
    }>,
  ) {
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    mutate("/api/tasks");
    return data;
  },

  async deleteTask(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    mutate("/api/tasks");
    mutate("/api/subtasks");
  },

  async batchUpdateTasks(
    tasks: { id: string; column_id: string; position: number }[],
  ) {
    await fetch("/api/tasks/batch", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    });
    mutate("/api/tasks");
  },

  // Subtasks
  async createSubtask(subtask: {
    id: string;
    task_id: string;
    title: string;
    completed?: boolean;
  }) {
    const res = await fetch("/api/subtasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subtask),
    });
    const data = await res.json();
    mutate("/api/subtasks");
    return data;
  },

  async updateSubtask(
    id: string,
    updates: Partial<{ title: string; completed: boolean }>,
  ) {
    const res = await fetch("/api/subtasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    mutate("/api/subtasks");
    return data;
  },

  async deleteSubtask(id: string) {
    await fetch(`/api/subtasks?id=${id}`, { method: "DELETE" });
    mutate("/api/subtasks");
  },

  // Custom Fields
  async createCustomField(field: {
    name: string;
    field_type: string;
    options?: string[];
  }) {
    const res = await fetch("/api/custom-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field),
    });
    const data = await res.json();
    mutate("/api/custom-fields");
    return data;
  },

  async updateCustomField(
    id: string,
    updates: Partial<{
      name: string;
      field_type: string;
      options: string[] | null;
    }>,
  ) {
    const res = await fetch("/api/custom-fields", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    mutate("/api/custom-fields");
    return data;
  },

  async deleteCustomField(id: string) {
    await fetch(`/api/custom-fields?id=${id}`, { method: "DELETE" });
    mutate("/api/custom-fields");
  },

  // Automation Rules
  async createAutomationRule(rule: {
    name: string;
    trigger_type: string;
    trigger_value?: string;
    action_type: string;
    action_value: string;
    enabled?: boolean;
  }) {
    const res = await fetch("/api/automation-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    const data = await res.json();
    mutate("/api/automation-rules");
    return data;
  },

  async updateAutomationRule(
    id: string,
    updates: Partial<{
      name: string;
      trigger_type: string;
      trigger_value: string | null;
      action_type: string;
      action_value: string;
      enabled: boolean;
    }>,
  ) {
    const res = await fetch("/api/automation-rules", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    mutate("/api/automation-rules");
    return data;
  },

  async deleteAutomationRule(id: string) {
    await fetch(`/api/automation-rules?id=${id}`, { method: "DELETE" });
    mutate("/api/automation-rules");
  },
};
