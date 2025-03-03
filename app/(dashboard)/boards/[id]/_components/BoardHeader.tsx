//app/(dashboard)/boards/[id]/_components/BoardHeader.tsx

"use client"; // Marcado como componente cliente

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { createTask } from "../_actions/task-actions";
import { useRouter } from "next/navigation";
import { Column } from "./types";
import DeleteBoardDialog from "../../_components/DeleteBoardDialog";

type Sprint = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string | null;
};

type BoardHeaderProps = {
  boardId: string;
  boardName: string;
  activeSprint: Sprint | null;
  columns: Column[];
};

export default function BoardHeader({
  boardName,
  activeSprint,
  boardId,
}: BoardHeaderProps) {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  // Função gerenciada pelo componente cliente
  const handleNewTask = () => {
    setCreateTaskOpen(true);
  };

  const handleCreateTask = async (data: {
    title: string;
    priority: string;
    columnId: string;
  }) => {
    try {
      await createTask({
        title: data.title,
        columnId: data.columnId,
        priority: data.priority,
        sprintId: activeSprint?.id,
      });

      router.refresh();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    } finally {
      setCreateTaskOpen(false);
    }
  };

  return (
    <>
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quadro: {boardName}
            </h1>
            {activeSprint && (
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2 font-medium">
                  {activeSprint.name}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {new Date(activeSprint.startDate).toLocaleDateString(
                    "pt-BR"
                  )}{" "}
                  a {new Date(activeSprint.endDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              Relatórios
            </Button>
            <Button size="sm" onClick={handleNewTask}>
              Nova Tarefa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {activeSprint?.goal && (
          <p className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-500">
            <span className="font-medium">Meta do Sprint:</span>{" "}
            {activeSprint.goal}
          </p>
        )}
      </div>

      {/* O Dialog é gerenciado aqui agora */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onSubmit={handleCreateTask}
      />

      <DeleteBoardDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        boardId={boardId}
        boardName={boardName}
      />
    </>
  );
}
