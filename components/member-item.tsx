"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteMember } from "@/lib/actions/members";
import { Pencil, Trash2, Loader2, Mail, Briefcase, ListTodo, User } from "lucide-react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    tasks: number;
  };
}

interface MemberItemProps {
  member: Member;
  onEdit: (member: Member) => void;
}

export function MemberItem({ member, onEdit }: MemberItemProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMember(member.id);
    } catch (error) {
      console.error("Error deleting member:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-5 hover:border-primary/30 hover:shadow-sm transition-all group">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium text-sm">
              {getInitials(member.name)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{member.name}</h3>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{member.email}</span>
          </div>

          {member.role && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="truncate">{member.role}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline">
              <ListTodo className="h-3 w-3 mr-1" />
              {member._count.tasks} tâche{member._count.tasks !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(member)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        itemName={member.name}
        isLoading={isDeleting}
      />
    </Card>
  );
}

