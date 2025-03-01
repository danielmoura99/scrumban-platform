/* eslint-disable @typescript-eslint/no-explicit-any */
//app/(dashboard)/boards/_components/BoardsClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import BoardGrid from "./BoardGrid";
import CreateBoardDialog from "./CreateBoardDialog";

export default function BoardsClient({
  boards,
  teams,
}: {
  boards: any[];
  teams: any[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreateBoard = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quadros</h1>
        <Button onClick={handleCreateBoard}>Novo Quadro</Button>
      </div>

      <BoardGrid boards={boards} onCreateBoard={handleCreateBoard} />

      <CreateBoardDialog
        teams={teams}
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Revalidar a página quando o diálogo fechar
            router.refresh();
          }
        }}
      />
    </>
  );
}
