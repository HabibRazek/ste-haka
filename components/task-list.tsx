"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TaskItem } from "@/components/task-item";
import { TaskForm } from "@/components/task-form";
import { Plus, Search, Filter, ListTodo } from "lucide-react";
import { Priority } from "@prisma/client";

interface Member {
  id: string;
  name: string;
  email: string;
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
}

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterPriority, setFilterPriority] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);

      // Priority filter
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      // Status filter
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "completed" && task.completed) ||
        (filterStatus === "pending" && !task.completed);

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, filterPriority, filterStatus]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos tâches et restez organisé.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une tâche
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une tâche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filterPriority}
              onValueChange={setFilterPriority}
              className="w-36"
            >
              <option value="all">Toute priorité</option>
              <option value="HIGH">Haute</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="LOW">Basse</option>
            </Select>
          </div>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
            className="w-36"
          >
            <option value="all">Tout statut</option>
            <option value="pending">En cours</option>
            <option value="completed">Terminée</option>
          </Select>
        </div>
      </div>

      {/* Task Count */}
      <div className="text-sm text-muted-foreground">
        {filteredTasks.length} sur {tasks.length} tâches
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 border border-border/50 rounded-xl bg-white">
          <ListTodo className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Aucune tâche trouvée</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {tasks.length === 0
              ? "Créez votre première tâche pour commencer!"
              : "Essayez d'ajuster vos filtres pour trouver des tâches."}
          </p>
          {tasks.length === 0 && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une tâche
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Task Form Dialog */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        task={editingTask}
      />
    </div>
  );
}

