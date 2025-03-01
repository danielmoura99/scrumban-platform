// Arquivo: /components/board/TaskCard.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Task = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  dueDate?: string;
  tags: string[];
};

type TaskCardProps = {
  task: Task;
};

// Mapeamento de prioridades para cores
const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function TaskCard({ task }: TaskCardProps) {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="mb-2">
          <Badge
            className={`${priorityColors[task.priority]} text-xs font-normal`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
        </div>
        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">{task.assignee}</div>
          <div className="text-xs text-gray-500">{task.dueDate}</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
