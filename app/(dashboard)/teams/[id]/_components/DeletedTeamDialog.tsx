//app/(dashboard)/teams/[id]/_components/DeleteTeamDialog.tsx

"use client";

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

type DeleteTeamDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
  onConfirm: () => void;
  isLoading: boolean;
};

export default function DeleteTeamDialog({
  isOpen,
  onOpenChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  teamId,
  teamName,
  onConfirm,
  isLoading,
}: DeleteTeamDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <DialogTitle>Excluir Equipe</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Tem certeza que deseja excluir a equipe <strong>{teamName}</strong>?
          Esta ação não pode ser desfeita e excluirá todos os membros associados
          a esta equipe.
        </DialogDescription>

        <DialogDescription className="text-red-500 font-semibold mt-2">
          Importante: Os quadros associados a esta equipe NÃO serão excluídos
          automaticamente. Você deve excluí-los manualmente se necessário.
        </DialogDescription>

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
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Excluindo..." : "Excluir Equipe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
