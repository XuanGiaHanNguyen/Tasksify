export interface Task {
  id: string
  columnId: string
  title: string
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  labels: string[]
  dueDate?: string
  assignee?: string
  subtasks: SubTask[]
  customFieldValues: Record<string, string | number | boolean>
  createdAt: string
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface CustomField {
  id: string
  name: string
  type: "text" | "number" | "date" | "select" | "checkbox"
  options?: string[]
}

export interface Column {
  id: string
  title: string
  color: string
  wipLimit?: number
}

export interface AutomationRule {
  id: string
  name: string
  trigger: {
    type: "task_moved" | "task_created" | "due_date_passed" | "all_subtasks_completed"
    value?: string
  }
  action: {
    type: "move_to_column" | "set_priority" | "add_label"
    value: string
  }
  enabled: boolean
}

// Legacy types for backwards compatibility
export interface Rule {
  id: string
  name: string
  condition: RuleCondition
  action: RuleAction
  enabled: boolean
}

export interface RuleCondition {
  type: "due-date" | "subtasks-completed" | "custom-field"
  field?: string
  operator:
    | "equals"
    | "not-equals"
    | "contains"
    | "greater-than"
    | "less-than"
    | "is-empty"
    | "is-not-empty"
    | "is-overdue"
    | "all-completed"
  value?: string
}

export interface RuleAction {
  type: "move-to-column"
  targetColumnId: string
}
