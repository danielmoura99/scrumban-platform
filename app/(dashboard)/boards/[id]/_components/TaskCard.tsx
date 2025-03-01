"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Column, Task } from "./types";
import { TaskDetailDialog } from "./TaskDetailDialog";

type TaskCardProps = {
  task: Task;
  columns: Column[];
  users: { id: string; name: string }[];
};

// Mapeamento de prioridades para cores
const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function TaskCard({ task, columns, users }: TaskCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Configuração do sortable com dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  // Estilos para o elemento arrastável
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // Calcular progresso das subtarefas
  const subtaskProgress =
    task.subtasks.length > 0
      ? Math.round(
          (task.subtasks.filter((st) => st.completed).length /
            task.subtasks.length) *
            100
        )
      : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Não abrir o modal se estiver arrastando
    if (isDragging) return;

    // Evitar abrir o modal durante início de arrasto
    if (e.target instanceof HTMLElement && e.target.dataset.handle) return;

    setDetailsOpen(true);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3">
          <div className="mb-2 flex justify-between">
            <Badge
              className={`${
                priorityColors[task.priority] || "bg-gray-100"
              } text-xs font-normal`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            {task.subtasks.length > 0 && (
              <span className="text-xs text-gray-500">
                {task.subtasks.filter((st) => st.completed).length}/
                {task.subtasks.length}
              </span>
            )}
          </div>

          <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>

          {task.subtasks.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${subtaskProgress}%` }}
              ></div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {task.assignee?.name || "Não atribuído"}
            </div>
            {task.dueDate && (
              <div className="text-xs text-gray-500">
                {new Date(task.dueDate).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskDetailDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        task={task}
        columns={columns}
        users={users}
      />
    </>
  );
}
