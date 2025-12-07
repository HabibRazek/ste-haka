"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createTask, updateTask, TaskFormData } from "@/lib/actions/tasks";
import { getMembers } from "@/lib/actions/members";
import { Priority } from "@prisma/client";
import { Loader2 } from "lucide-react";

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
  memberId?: string | null;
  parentId?: string | null;
}

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  parentId?: string | null;
  onSuccess?: () => void;
}

export function TaskForm({ open, onOpenChange, task, parentId, onSuccess }: TaskFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);

  const [formData, setFormData] = React.useState<TaskFormData>({
    title: "",
    description: "",
    priority: "MEDIUM" as Priority,
    dueDate: "",
    memberId: "",
    parentId: "",
  });

  // Fetch members when dialog opens
  React.useEffect(() => {
    if (open) {
      getMembers().then((result) => {
        if (result.success && result.data) {
          setMembers(result.data);
        }
      });
    }
  }, [open]);

  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        memberId: task.memberId || "",
        parentId: task.parentId || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM" as Priority,
        dueDate: "",
        memberId: "",
        parentId: parentId || "",
      });
    }
  }, [task, parentId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        setError("Le titre est requis");
        setIsLoading(false);
        return;
      }

      let result;
      if (task) {
        result = await updateTask(task.id, formData);
      } else {
        result = await createTask(formData);
      }

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(result.error || "Une erreur s'est produite");
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const isSubTask = !!parentId || !!task?.parentId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {task ? "Modifier la tâche" : isSubTask ? "Nouvelle sous-tâche" : "Nouvelle tâche"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-foreground bg-accent border border-border rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Titre *</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Entrez le titre de la tâche"
              disabled={isLoading}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Entrez la description"
              disabled={isLoading}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priorité</label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as Priority })
                }
                disabled={isLoading}
                className="h-11"
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date limite</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                disabled={isLoading}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Assigné à</label>
            <Select
              value={formData.memberId || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, memberId: value })
              }
              disabled={isLoading}
              className="h-11"
            >
              <option value="">Non assigné</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

