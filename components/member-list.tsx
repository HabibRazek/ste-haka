"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberItem } from "@/components/member-item";
import { MemberForm } from "@/components/member-form";
import { Plus, Search, Users } from "lucide-react";

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

interface MemberListProps {
  members: Member[];
}

export function MemberList({ members }: MemberListProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.role?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [members, searchQuery]);

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Équipe</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les membres de votre équipe.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un membre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Member Count */}
      <div className="text-sm text-muted-foreground">
        {filteredMembers.length} membre{filteredMembers.length !== 1 ? "s" : ""} sur {members.length}
      </div>

      {/* Member Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 border border-border/50 rounded-xl bg-white">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Aucun membre trouvé</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {members.length === 0
              ? "Ajoutez votre premier membre d'équipe!"
              : "Essayez d'ajuster votre recherche."}
          </p>
          {members.length === 0 && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un membre
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <MemberItem key={member.id} member={member} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Member Form Dialog */}
      <MemberForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        member={editingMember}
      />
    </div>
  );
}

