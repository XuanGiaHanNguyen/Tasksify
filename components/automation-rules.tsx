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
          <Settings className="h-5 w-5 mr-2 text-[#a04d1e] dark:text-[#e8a06a]" />
          <h3 className="text-lg font-medium text-[#5c280d] dark:text-[#fdf4ed]">Automation Rules</h3>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-[#c06228] hover:bg-[#a04d1e] text-[#fdf4ed] border-0"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]">
            <DialogHeader>
              <DialogTitle className="text-[#3a1808] dark:text-[#fdf4ed]">Create Automation Rule</DialogTitle>
              <DialogDescription className="text-[#7e3914] dark:text-[#e8a06a]">
                Create a rule to automatically perform actions based on triggers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name" className="text-[#7e3914] dark:text-[#e8a06a]">
                  Rule Name
                </Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Move overdue tasks to Blocked"
                  className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus-visible:ring-[#c06228]"
                />
              </div>

              <Separator className="bg-[#f0c49a] dark:bg-[#7e3914]" />

              <div className="space-y-2">
                <Label className="text-[#7e3914] dark:text-[#e8a06a]">When (Trigger)</Label>
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
                  <SelectTrigger className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus:ring-[#c06228]">
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]">
                    <SelectItem value="due_date_passed" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Due Date Passed</SelectItem>
                    <SelectItem value="all_subtasks_completed" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">All Subtasks Completed</SelectItem>
                    <SelectItem value="task_created" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Task Created</SelectItem>
                    <SelectItem value="task_moved" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Task Moved To Column</SelectItem>
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
                )}
              </div>

              <Separator className="bg-[#f0c49a] dark:bg-[#7e3914]" />

              <div className="space-y-2">
                <Label className="text-[#7e3914] dark:text-[#e8a06a]">Then (Action)</Label>
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
                  <SelectTrigger className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus:ring-[#c06228]">
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]">
                    <SelectItem value="move_to_column" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Move to Column</SelectItem>
                    <SelectItem value="set_priority" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Set Priority</SelectItem>
                    <SelectItem value="add_label" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Add Label</SelectItem>
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
                    <SelectTrigger className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus:ring-[#c06228]">
                      <SelectValue placeholder="Select target column" />
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
                    <SelectTrigger className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus:ring-[#c06228]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fdf4ed] border-[#f0c49a] dark:bg-[#5c280d] dark:border-[#7e3914]">
                      <SelectItem value="low" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Low</SelectItem>
                      <SelectItem value="medium" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Medium</SelectItem>
                      <SelectItem value="high" className="text-[#3a1808] dark:text-[#fdf4d] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">High</SelectItem>
                      <SelectItem value="urgent" className="text-[#3a1808] dark:text-[#fdf4ed] focus:bg-[#f9e3ce] dark:focus:bg-[#7e3914]">Urgent</SelectItem>
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
                    className="bg-white dark:bg-[#7e3914] border-[#e8a06a] dark:border-[#a04d1e] text-[#3a1808] dark:text-[#fdf4ed] focus-visible:ring-[#c06228]"
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-[#e8a06a] text-[#7e3914] dark:border-[#a04d1e] dark:text-[#f0c49a] hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRule}
                className="bg-[#c06228] hover:bg-[#a04d1e] text-[#fdf4ed] border-0"
              >
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-[#a04d1e] dark:text-[#e8a06a]">
          <p>No automation rules yet. Create one to automate your workflow.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-[#5c280d] rounded-md border border-[#f0c49a] dark:border-[#7e3914]"
            >
              <div className="flex-1">
                <div className="font-medium text-[#3a1808] dark:text-[#fdf4ed]">{rule.name}</div>
                <div className="text-sm text-[#7e3914] dark:text-[#e8a06a]">
                  {getTriggerDescription(rule.trigger)} → {getActionDescription(rule.action)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRuleEnabled(rule.id, checked)}
                  aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
                  className="data-[state=checked]:bg-[#c06228]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#a04d1e] dark:text-[#e8a06a] hover:text-red-600 dark:hover:text-red-400 hover:bg-[#f9e3ce] dark:hover:bg-[#7e3914]"
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