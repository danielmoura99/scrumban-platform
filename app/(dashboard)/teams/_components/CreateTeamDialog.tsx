//app/(dashboard)/teams/_components/CreateTeamDialog.tsx

"use client";

import { useState } from "react";
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
import { createTeam } from "../_actions/team-actions";

type CreateTeamDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateTeamDialog({
  isOpen,
  onOpenChange,
}: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) return;

    try {
      setIsLoading(true);
      setError("");

      // TODO: Obter o ID do usuário autenticado
      // Por enquanto, usaremos um ID de usuário fictício
      const creatorId = "user1"; // Substituir pelo ID do usuário atual quando tivermos autenticação

      const team = await createTeam({
        name,
        description: description || undefined,
        creatorId,
      });

      // Resetar form
      setName("");
      setDescription("");

      // Fechar diálogo
      onOpenChange(false);

      // Redirecionar para a nova equipe
      router.push(`/teams/${team.id}`);
    } catch (error) {
      console.error("Erro ao criar equipe:", error);
      setError("Ocorreu um erro ao criar a equipe. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar nova equipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da equipe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito desta equipe"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar equipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
