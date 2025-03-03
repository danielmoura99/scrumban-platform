//app/(dashboard)/teams/[id]/_components/UpdateRoleDialog.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
};

type UpdateRoleDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onUpdateRole: (role: string) => void;
  isLoading: boolean;
};

export function UpdateRoleDialog({
  isOpen,
  onOpenChange,
  member,
  onUpdateRole,
  isLoading,
}: UpdateRoleDialogProps) {
  const [role, setRole] = useState(member?.role || "member");

  // Atualizar o papel selecionado quando o membro mudar
  if (member && member.role !== role) {
    setRole(member.role);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRole(role);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Função do Membro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <div className="font-medium mb-2">{member?.name}</div>
              <div className="text-sm text-gray-500 mb-4">{member?.email}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                <strong>Administrador:</strong> Pode gerenciar membros e quadros
                da equipe.
                <br />
                <strong>Membro:</strong> Pode visualizar e colaborar nos quadros
                da equipe.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
