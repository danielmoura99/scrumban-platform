//app/(dashboard)/teams/[id]/_components/EditTeamDialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTeam } from "../../_actions/team-actions";

type Team = {
  id: string;
  name: string;
  description: string | null;
};

type EditTeamDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
};

export default function EditTeamDialog({
  isOpen,
  onOpenChange,
  team,
}: EditTeamDialogProps) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Atualizar campos quando a equipe mudar
  useEffect(() => {
    if (isOpen && team) {
      setName(team.name);
      setDescription(team.description || "");
      setError("");
    }
  }, [isOpen, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("O nome da equipe é obrigatório");
      return;
    }

    try {
      setIsLoading(true);
      await updateTeam(team.id, {
        name,
        description: description || null,
      });

      // Fechar diálogo e atualizar página
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar equipe:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao atualizar a equipe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar equipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            {/* Nome da equipe */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Equipe *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da equipe"
                required
              />
            </div>

            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito desta equipe"
                rows={3}
              />
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
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
