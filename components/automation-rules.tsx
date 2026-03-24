"use client"

import { useState } from "react"
import { Plus, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AutomationRule, Column } from "@/types/kanban"
import { generateId } from "@/lib/utils"

interface AutomationRulesProps {
  rules: AutomationRule[]
  columns: Column[]
  onAddRule: (rule: AutomationRule) => void
  onUpdateRule: (ruleId: string, updates: Partial<AutomationRule>) => void
  onDeleteRule: (ruleId: string) => void
}

export default function AutomationRules({
  rules,
  columns,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}: AutomationRulesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newRule, setNewRule] = useState<AutomationRule>({
    id: `rule-${generateId()}`,
    name: "",
    trigger: {
      type: "due_date_passed",
    },
    action: {
      type: "move_to_column",
      value: columns[0]?.id || "",
    },
    enabled: true,
  })

  const handleAddRule = () => {
    if (!newRule.name.trim()) return

    onAddRule(newRule)
    setNewRule({
      id: `rule-${generateId()}`,
      name: "",
      trigger: {
        type: "due_date_passed",
      },
      action: {
        type: "move_to_column",
        value: columns[0]?.id || "",
      },
      enabled: true,
    })
    setIsOpen(false)
  }

  const toggleRuleEnabled = (ruleId: string, enabled: boolean) => {
    onUpdateRule(ruleId, { enabled })
  }

  const getTriggerDescription = (trigger: AutomationRule["trigger"]) => {
    switch (trigger.type) {
      case "task_moved":
        return `When task is moved to ${columns.find(c => c.id === trigger.value)?.title || "column"}`
      case "task_created":
        return "When a task is created"
      case "due_date_passed":
        return "When due date has passed"
      case "all_subtasks_completed":
        return "When all subtasks are completed"
      default:
        return "Unknown trigger"
    }
  }

  const getActionDescription = (action: AutomationRule["action"]) => {
    switch (action.type) {
      case "move_to_column":
        return `Move to ${columns.find(c => c.id === action.value)?.title || "column"}`
      case "set_priority":
        return `Set priority to ${action.value}`
      case "add_label":
        return `Add label "${action.value}"`
      default:
        return "Unknown action"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2 dark:text-gray-300" />
          <h3 className="text-lg font-medium dark:text-gray-200">Automation Rules</h3>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">Create Automation Rule</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Create a rule to automatically perform actions based on triggers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name" className="dark:text-gray-300">
                  Rule Name
                </Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Move overdue tasks to Blocked"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>

              <Separator className="dark:bg-gray-700" />

              <div className="space-y-2">
                <Label className="dark:text-gray-300">When (Trigger)</Label>
                <Select
                  value={newRule.trigger.type}
                  onValueChange={(value: AutomationRule["trigger"]["type"]) =>
                    setNewRule({
                      ...newRule,
                      trigger: {
                        type: value,
                        value: value === "task_moved" ? columns[0]?.id : undefined,
                      },
                    })
                  }
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="due_date_passed">Due Date Passed</SelectItem>
                    <SelectItem value="all_subtasks_completed">All Subtasks Completed</SelectItem>
                    <SelectItem value="task_created">Task Created</SelectItem>
                    <SelectItem value="task_moved">Task Moved To Column</SelectItem>
                  </SelectContent>
                </Select>

                {newRule.trigger.type === "task_moved" && (
                  <Select
                    value={newRule.trigger.value || ""}
                    onValueChange={(value) =>
                      setNewRule({
                        ...newRule,
                        trigger: { ...newRule.trigger, value },
                      })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator className="dark:bg-gray-700" />

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Then (Action)</Label>
                <Select
                  value={newRule.action.type}
                  onValueChange={(value: AutomationRule["action"]["type"]) =>
                    setNewRule({
                      ...newRule,
                      action: {
                        type: value,
                        value: value === "move_to_column" ? columns[0]?.id || "" : "",
                      },
                    })
                  }
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="move_to_column">Move to Column</SelectItem>
                    <SelectItem value="set_priority">Set Priority</SelectItem>
                    <SelectItem value="add_label">Add Label</SelectItem>
                  </SelectContent>
                </Select>

                {newRule.action.type === "move_to_column" && (
                  <Select
                    value={newRule.action.value}
                    onValueChange={(value) =>
                      setNewRule({
                        ...newRule,
                        action: { ...newRule.action, value },
                      })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select target column" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {newRule.action.type === "set_priority" && (
                  <Select
                    value={newRule.action.value}
                    onValueChange={(value) =>
                      setNewRule({
                        ...newRule,
                        action: { ...newRule.action, value },
                      })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {newRule.action.type === "add_label" && (
                  <Input
                    value={newRule.action.value}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        action: { ...newRule.action, value: e.target.value },
                      })
                    }
                    placeholder="Label name"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="dark:border-gray-600 dark:text-gray-200"
              >
                Cancel
              </Button>
              <Button onClick={handleAddRule}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No automation rules yet. Create one to automate your workflow.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700"
            >
              <div className="flex-1">
                <div className="font-medium dark:text-gray-200">{rule.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getTriggerDescription(rule.trigger)} → {getActionDescription(rule.action)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRuleEnabled(rule.id, checked)}
                  aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => onDeleteRule(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
