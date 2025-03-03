//app/(dashboard)/sprints/_components/CreateSprintDialog.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSprint, getBoardsForSprint } from "../_actions/sprint-actions";

type Board = {
  id: string;
  name: string;
  teamName: string;
};

type CreateSprintDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateSprintDialog({
  isOpen,
  onOpenChange,
}: CreateSprintDialogProps) {
  // Estados para campos do formulário
  const [name, setName] = useState("");
  const [boardId, setBoardId] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(
      new Date(new Date().setDate(new Date().getDate() + 14)),
      "yyyy-MM-dd"
    )
  ); // +14 dias por padrão
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Carregar lista de quadros disponíveis
  useEffect(() => {
    const loadBoards = async () => {
      try {
        setLoadingBoards(true);
        const boardsData = await getBoardsForSprint();
        setBoards(boardsData);
      } catch (error) {
        console.error("Erro ao carregar quadros:", error);
      } finally {
        setLoadingBoards(false);
      }
    };

    if (isOpen) {
      loadBoards();
    }
  }, [isOpen]);

  // Reset do formulário ao abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setName("");
      setBoardId("");
      setStartDate(format(new Date(), "yyyy-MM-dd"));
      setEndDate(
        format(
          new Date(new Date().setDate(new Date().getDate() + 14)),
          "yyyy-MM-dd"
        )
      );
      setGoal("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (!name || !boardId || !startDate || !endDate) {
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
      await createSprint({
        name,
        boardId,
        startDate: startDateObj,
        endDate: endDateObj,
        goal: goal || undefined,
      });

      // Fechar diálogo e recarregar a página
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar sprint:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao criar o sprint"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar novo sprint</DialogTitle>
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

            {/* Quadro */}
            <div className="grid gap-2">
              <Label htmlFor="board">Quadro *</Label>
              <Select value={boardId} onValueChange={setBoardId} required>
                <SelectTrigger
                  id="board"
                  disabled={loadingBoards}
                  className={loadingBoards ? "opacity-70" : ""}
                >
                  <SelectValue
                    placeholder={
                      loadingBoards
                        ? "Carregando quadros..."
                        : "Selecione um quadro"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name} ({board.teamName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isLoading || !boardId}>
              {isLoading ? "Criando..." : "Criar Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
