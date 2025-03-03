//app/(dashboard)/sprints/[id]/_components/AddTaskDialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, User2 } from "lucide-react";
import {
  getAvailableTasksForSprint,
  toggleTaskInSprint,
} from "../../_actions/sprint-actions";

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

type Task = {
  id: string;
  title: string;
  priority: string;
  column: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
  } | null;
  subtasks: Subtask[];
};

type AddTasksDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sprintId: string;
};

export default function AddTasksDialog({
  isOpen,
  onOpenChange,
  sprintId,
}: AddTasksDialogProps) {
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const router = useRouter();

  // Carregar tarefas disponíveis
  useEffect(() => {
    const loadTasks = async () => {
      if (!isOpen) return;

      try {
        setIsLoadingTasks(true);
        const tasks = await getAvailableTasksForSprint(sprintId);
        setAvailableTasks(tasks);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    loadTasks();
  }, [isOpen, sprintId]);

  // Resetar seleção quando o diálogo fecha
  useEffect(() => {
    if (!isOpen) {
      setSelectedTasks(new Set());
      setSearchTerm("");
    }
  }, [isOpen]);

  // Filtrar tarefas com base na busca
  const filteredTasks = availableTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.column.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manipular seleção de tarefa
  const handleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Adicionar tarefas selecionadas ao sprint
  const handleAddTasks = async () => {
    if (selectedTasks.size === 0) return;

    try {
      setIsLoading(true);

      // Adicionar cada tarefa selecionada ao sprint
      const promises = Array.from(selectedTasks).map((taskId) =>
        toggleTaskInSprint(taskId, sprintId)
      );

      await Promise.all(promises);

      // Fechar diálogo e atualizar página
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao adicionar tarefas ao sprint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mapear prioridade para cor do badge
  const getPriorityBadge = (priority: string) => {
    const style =
      {
        low: "bg-gray-100 text-gray-800",
        medium: "bg-blue-100 text-blue-800",
        high: "bg-orange-100 text-orange-800",
        urgent: "bg-red-100 text-red-800",
      }[priority] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={style}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar tarefas ao sprint</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Campo de busca */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {isLoadingTasks ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando tarefas disponíveis...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Nenhuma tarefa disponível para adicionar ao sprint.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Todas as tarefas deste quadro já estão em sprints ou não existem
                tarefas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 ${
                    selectedTasks.has(task.id)
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                >
                  <Checkbox
                    id={task.id}
                    checked={selectedTasks.has(task.id)}
                    onCheckedChange={() => handleTaskSelection(task.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={task.id}
                      className="font-medium cursor-pointer"
                    >
                      {task.title}
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{task.column.name}</Badge>
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                  {task.assignee && (
                    <div className="flex items-center text-sm text-gray-500">
                      <User2 className="h-4 w-4 mr-1" />
                      {task.assignee.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-500">
              {selectedTasks.size} tarefas selecionadas
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAddTasks}
                disabled={isLoading || selectedTasks.size === 0}
              >
                {isLoading ? "Adicionando..." : "Adicionar ao Sprint"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
