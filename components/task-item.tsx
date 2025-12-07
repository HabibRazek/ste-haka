"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, Loader2, User, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { toggleTaskComplete, deleteTask } from "@/lib/actions/tasks";
import { Priority } from "@prisma/client";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface SubTask {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberId?: string | null;
  member?: Member | null;
  parentId?: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberId?: string | null;
  member?: Member | null;
  parentId?: string | null;
  subTasks?: SubTask[];
}

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task | SubTask) => void;
  onAddSubTask?: (parentId: string) => void;
  isSubTask?: boolean;
}

export function TaskItem({ task, onEdit, onAddSubTask, isSubTask = false }: TaskItemProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showSubTasks, setShowSubTasks] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await toggleTaskComplete(task.id, !task.completed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case "HIGH": return "Haute";
      case "MEDIUM": return "Moyenne";
      case "LOW": return "Basse";
      default: return priority;
    }
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div className={cn("space-y-2", isSubTask && "ml-8")}>
      <div
        className={cn(
          "group flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-white hover:border-primary/30 hover:shadow-sm transition-all",
          task.completed && "opacity-60",
          isOverdue && "border-foreground/20",
          isSubTask && "p-3 bg-gray-50/50"
        )}
      >
        {/* Expand/Collapse button for tasks with subtasks */}
        {!isSubTask && hasSubTasks && (
          <button
            onClick={() => setShowSubTasks(!showSubTasks)}
            className="pt-0.5 text-muted-foreground hover:text-foreground"
          >
            {showSubTasks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}

        <div className="pt-0.5">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  "font-medium text-foreground",
                  task.completed && "line-through text-muted-foreground",
                  isSubTask && "text-sm"
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isSubTask && onAddSubTask && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAddSubTask(task.id)}
                  disabled={isDeleting}
                  className="h-8 w-8 hover:bg-accent"
                  title="Ajouter une sous-tâche"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                disabled={isDeleting}
                className="h-8 w-8 hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-3">
            <Badge
              variant={
                task.priority === "HIGH"
                  ? "default"
                  : "outline"
              }
            >
              {getPriorityLabel(task.priority)}
            </Badge>
            {task.member && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{task.member.name}</span>
              </div>
            )}
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  isOverdue ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
                {isOverdue && <span>(En retard)</span>}
              </div>
            )}
            {!isSubTask && hasSubTasks && (
              <div className="text-xs text-muted-foreground">
                {task.subTasks?.filter(st => st.completed).length}/{task.subTasks?.length} sous-tâches
              </div>
            )}
            {task.completed && (
              <Badge variant="success" className="ml-auto">
                Terminée
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Subtasks */}
      {!isSubTask && hasSubTasks && showSubTasks && (
        <div className="space-y-2">
          {task.subTasks?.map((subTask) => (
            <TaskItem
              key={subTask.id}
              task={subTask as Task}
              onEdit={onEdit}
              isSubTask={true}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Supprimer la tâche"
        itemName={task.title}
        isLoading={isDeleting}
      />
    </div>
  );
}

