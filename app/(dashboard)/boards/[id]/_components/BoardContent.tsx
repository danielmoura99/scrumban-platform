// Arquivo: /app/(dashboard)/boards/[id]/_components/BoardContent.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
//import { restrictToParentElement } from "@dnd-kit/modifiers";

// Componentes
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import { createColumn } from "../_actions/board-actions";
import { createTask, moveTask } from "../_actions/task-actions";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { Board, Task } from "./types"; // Importando dos tipos compartilhados

type BoardContentProps = {
  board: Board;
};

export default function BoardContent({ board }: BoardContentProps) {
  const [columns, setColumns] = useState(board.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const router = useRouter();

  // Sensores para o drag & drop com configuração ajustada
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Diminuir a distância de ativação para facilitar o início do arrasto
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Manipular início do arrasto
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;

    // Encontrar tarefa sendo arrastada
    let foundTask = null;
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        foundTask = task;
        break;
      }
    }

    setActiveTask(foundTask);
  };

  // Manipular arrasto sobre elementos - PRINCIPAL CORREÇÃO AQUI
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar coluna e índice da tarefa ativa
    let activeColumnId = "";
    let activeTaskIndex = -1;
    let foundActiveTask: Task | null = null;

    // Encontrar a tarefa ativa e sua coluna
    for (const column of columns) {
      const taskIndex = column.tasks.findIndex((task) => task.id === activeId);
      if (taskIndex !== -1) {
        activeColumnId = column.id;
        activeTaskIndex = taskIndex;
        foundActiveTask = column.tasks[taskIndex];
        break;
      }
    }

    if (!foundActiveTask) return;

    // CORREÇÃO: Melhor detecção da coluna sobre a qual estamos arrastando

    // 1. Verificar se estamos sobre uma coluna diretamente
    const overColumn = columns.find((col) => col.id === overId);

    if (overColumn) {
      // Se já estamos na mesma coluna, não fazer nada
      if (activeColumnId === overColumn.id) return;

      // Verificar limite WIP
      if (
        overColumn.wipLimit &&
        overColumn.wipLimit <= overColumn.tasks.length
      ) {
        return; // Respeitar limite WIP
      }

      // Mover a tarefa para o final da coluna
      setColumns((prev) => {
        return prev.map((col) => {
          // Remover da coluna atual
          if (col.id === activeColumnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== activeId),
            };
          }

          // Adicionar à nova coluna
          if (col.id === overId) {
            return {
              ...col,
              tasks: [...col.tasks, foundActiveTask!],
            };
          }

          return col;
        });
      });

      return;
    }

    // 2. Verificar se estamos sobre uma tarefa em outra coluna
    let overColumnId = "";
    let overTaskIndex = -1;

    // Encontrar a coluna e o índice da tarefa sobre a qual estamos
    for (const column of columns) {
      const taskIndex = column.tasks.findIndex((task) => task.id === overId);
      if (taskIndex !== -1) {
        overColumnId = column.id;
        overTaskIndex = taskIndex;
        break;
      }
    }

    if (overTaskIndex === -1) return;

    // Se estamos na mesma coluna, reordenar
    if (activeColumnId === overColumnId) {
      setColumns((prev) => {
        return prev.map((col) => {
          if (col.id !== overColumnId) return col;

          const updatedTasks = [...col.tasks];
          // Remover a tarefa da posição atual
          updatedTasks.splice(activeTaskIndex, 1);
          // Inserir na nova posição
          updatedTasks.splice(overTaskIndex, 0, foundActiveTask!);

          return {
            ...col,
            tasks: updatedTasks,
          };
        });
      });
    } else {
      // Mover para outra coluna em uma posição específica

      // Verificar limite WIP da coluna de destino
      const targetColumn = columns.find((col) => col.id === overColumnId);
      if (
        targetColumn?.wipLimit &&
        targetColumn.wipLimit <= targetColumn.tasks.length
      ) {
        return; // Respeitar limite WIP
      }

      setColumns((prev) => {
        return prev.map((col) => {
          // Remover da coluna atual
          if (col.id === activeColumnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== activeId),
            };
          }

          // Adicionar na posição específica da nova coluna
          if (col.id === overColumnId) {
            const updatedTasks = [...col.tasks];
            updatedTasks.splice(overTaskIndex, 0, foundActiveTask!);

            return {
              ...col,
              tasks: updatedTasks,
            };
          }

          return col;
        });
      });
    }
  };

  // Finalizar arrasto e salvar no servidor
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar a nova posição e coluna
    let newColumnId = "";
    let newPosition = 0;

    // Verificar se terminou sobre uma coluna
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      newColumnId = overColumn.id;
      newPosition = overColumn.tasks.length;
    } else {
      // Encontrar a coluna e posição de destino (se terminou sobre uma tarefa)
      for (const column of columns) {
        const taskIndex = column.tasks.findIndex((task) => task.id === overId);
        if (taskIndex !== -1) {
          newColumnId = column.id;
          newPosition = taskIndex;
          break;
        }
      }

      // Se não encontrou, tentar encontrar a coluna atual
      if (!newColumnId) {
        for (const column of columns) {
          const taskIndex = column.tasks.findIndex(
            (task) => task.id === activeId
          );
          if (taskIndex !== -1) {
            newColumnId = column.id;
            newPosition = taskIndex;
            break;
          }
        }
      }
    }

    if (!newColumnId) return;

    // Atualizar no banco de dados
    try {
      setIsLoading(true);
      await moveTask(activeId, {
        columnId: newColumnId,
        position: newPosition,
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao mover tarefa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar nova coluna
  const handleAddColumn = async () => {
    try {
      setIsLoading(true);
      await createColumn(board.id, { name: "Nova Coluna" });
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar coluna:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir diálogo para criar tarefa
  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setCreateTaskOpen(true);
  };

  // Criar nova tarefa
  const handleCreateTask = async (data: {
    title: string;
    priority: string;
    columnId?: string;
  }) => {
    const targetColumnId = data.columnId || selectedColumnId;

    if (!targetColumnId) return;

    try {
      setIsLoading(true);
      await createTask({
        title: data.title,
        columnId: targetColumnId,
        priority: data.priority,
        sprintId: board.sprints[0]?.id,
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    } finally {
      setIsLoading(false);
      setCreateTaskOpen(false);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              onAddTask={() => handleAddTask(column.id)}
              disabled={isLoading}
            />
          ))}

          {/* Coluna para adicionar nova coluna */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center h-min">
            <Button
              variant="ghost"
              className="text-gray-500"
              onClick={handleAddColumn}
              disabled={isLoading}
            >
              <PlusCircle size={16} className="mr-2" /> Adicionar coluna
            </Button>
          </div>
        </div>

        {/* Overlay para exibir a tarefa sendo arrastada */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 pointer-events-none">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onSubmit={handleCreateTask}
        columns={columns}
        defaultColumnId={
          selectedColumnId || (columns.length > 0 ? columns[0].id : undefined)
        }
      />
    </>
  );
}
