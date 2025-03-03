//app/(dashboard)/sprints/[id]/_components/EditSprintDialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
import { updateSprint } from "../../_actions/sprint-actions";

type Sprint = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string | null;
  status: string;
  board: {
    id: string;
    name: string;
  };
};

type EditSprintDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint;
};

export default function EditSprintDialog({
  isOpen,
  onOpenChange,
  sprint,
}: EditSprintDialogProps) {
  // Estados para campos do formulário
  const [name, setName] = useState(sprint.name);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goal, setGoal] = useState(sprint.goal || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Atualizar campos quando o sprint mudar
  useEffect(() => {
    if (isOpen && sprint) {
      setName(sprint.name);
      setStartDate(format(new Date(sprint.startDate), "yyyy-MM-dd"));
      setEndDate(format(new Date(sprint.endDate), "yyyy-MM-dd"));
      setGoal(sprint.goal || "");
      setError("");
    }
  }, [isOpen, sprint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (!name || !startDate || !endDate) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (endDateObj <= startDateObj) {
      setError("A data de término deve ser posterior à data de início");
      return;
    }

    try {
      setIsLoading(true);
      await updateSprint(sprint.id, {
        name,
        startDate: startDateObj,
        endDate: endDateObj,
        goal: goal || undefined,
      });

      // Fechar diálogo e recarregar a página
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar sprint:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao atualizar o sprint"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar sprint</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            {/* Nome do sprint */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Sprint *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sprint 1"
                required
              />
            </div>

            {/* Quadro (somente leitura) */}
            <div className="grid gap-2">
              <Label htmlFor="board">Quadro</Label>
              <Input
                id="board"
                value={sprint.board.name}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                O quadro não pode ser alterado após a criação do sprint.
              </p>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={sprint.status !== "planning"}
                  className={sprint.status !== "planning" ? "bg-gray-50" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Data de Término *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            {sprint.status !== "planning" && (
              <p className="text-xs text-gray-500 -mt-2">
                A data de início não pode ser alterada para sprints ativos ou
                concluídos.
              </p>
            )}

            {/* Meta do sprint */}
            <div className="grid gap-2">
              <Label htmlFor="goal">Meta do Sprint</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Descreva o objetivo deste sprint..."
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
