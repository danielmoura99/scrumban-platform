//app/(dashboard)/boards/_components/DeleteBoardDialog.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { deleteBoard } from "../_actions/board-list-actions";

type DeleteBoardDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
};

export default function DeleteBoardDialog({
  isOpen,
  onOpenChange,
  boardId,
  boardName,
}: DeleteBoardDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError("");
      await deleteBoard(boardId);
      onOpenChange(false);
      router.push("/boards");
    } catch (error) {
      console.error("Erro ao excluir quadro:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao excluir o quadro"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <DialogTitle>Excluir Quadro</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Tem certeza que deseja excluir o quadro <strong>{boardName}</strong>?
          Esta ação não pode ser desfeita e excluirá todas as colunas, tarefas e
          sprints associados a este quadro.
        </DialogDescription>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Excluindo..." : "Excluir Quadro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
