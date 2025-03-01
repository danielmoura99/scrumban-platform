//app/(dashboard)/boards/[id]/_components/TaskColumn.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, AlertTriangle } from "lucide-react";
import TaskCard from "./TaskCard";
import { Column } from "./types"; // Importe do arquivo de tipos compartilhado

type TaskColumnProps = {
  column: Column;
  onAddTask: () => void;
  disabled?: boolean;
  users: { id: string; name: string }[];
};

export default function TaskColumn({
  column,
  onAddTask,
  disabled,
  users,
}: TaskColumnProps) {
  const { id, name, tasks, wipLimit } = column;

  // Configuração do droppable com dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Para usar com SortableContext
  const taskIds = tasks.map((task) => task.id);

  // Verificar se o limite WIP foi atingido
  const isWipLimitReached =
    wipLimit !== undefined && wipLimit !== null && tasks.length >= wipLimit;

  return (
    <div ref={setNodeRef} className="flex flex-col bg-gray-50 rounded-lg p-3">
      {/* Cabeçalho da Coluna */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <h3 className="font-medium text-gray-700">{name}</h3>
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
            {wipLimit ? `/${wipLimit}` : ""}
          </Badge>
        </div>
        <div className="flex">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal size={15} />
          </Button>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div
        className={`space-y-3 flex-grow min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? "bg-gray-100" : ""
        }`}
      >
        {isWipLimitReached && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-2 rounded text-amber-800 text-xs flex items-center mb-3">
            <AlertTriangle size={14} className="mr-1" />
            Limite de trabalho atingido
          </div>
        )}

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={[column]}
              users={users}
            />
          ))}
        </SortableContext>

        {/* Espaço para arrastar quando vazio */}
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg h-24 flex items-center justify-center">
            <span className="text-sm text-gray-400">Arraste tarefas aqui</span>
          </div>
        )}
      </div>

      {/* Botão para adicionar tarefa no fim da coluna */}
      <Button
        variant="ghost"
        className="w-full mt-2 text-gray-500 justify-start"
        size="sm"
        onClick={onAddTask}
        disabled={isWipLimitReached || disabled}
      >
        <PlusCircle size={14} className="mr-1" /> Adicionar tarefa
      </Button>
    </div>
  );
}
