//app/(dashboard)/sprints/[id]/_components/TaskList.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CheckCircle2,
  XCircle,
  User2,
  ArrowUpRight,
  Search,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ListFilter,
  AlertCircle,
} from "lucide-react";

// Definir os tipos
type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  description?: string | null;
  assignee?: {
    id: string;
    name: string;
  } | null;
  column: {
    id: string;
    name: string;
  };
  subtasks: Subtask[];
};

interface TaskListProps {
  tasks: Task[];
  onRemoveTask: (taskId: string) => void;
  isReadOnly?: boolean;
}

export default function TaskList({
  tasks,
  onRemoveTask,
  isReadOnly = false,
}: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Função para filtrar as tarefas
  const filteredTasks = tasks.filter((task) => {
    // Filtro por texto
    const textMatch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por status
    const statusMatch =
      !statusFilter ||
      task.column.name.toLowerCase().includes(statusFilter.toLowerCase());

    // Filtro por prioridade
    const priorityMatch = !priorityFilter || task.priority === priorityFilter;

    return textMatch && statusMatch && priorityMatch;
  });

  // Extrair status únicos para o filtro
  const uniqueStatuses = Array.from(
    new Set(tasks.map((task) => task.column.name))
  );

  // Função para limpar os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setPriorityFilter(null);
  };

  // Mapeamento de prioridades para cores
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

  // Calcular progresso das subtarefas
  const calculateSubtaskProgress = (subtasks: Subtask[]) => {
    if (subtasks.length === 0) return 0;
    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.completed
    ).length;
    return Math.round((completedSubtasks / subtasks.length) * 100);
  };

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="">Todos os Status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            value={priorityFilter || ""}
            onChange={(e) => setPriorityFilter(e.target.value || null)}
          >
            <option value="">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>

          {(searchTerm || statusFilter || priorityFilter) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XCircle className="h-4 w-4 mr-1" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de tarefas */}
      {filteredTasks.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/boards/${task.column.id.split(":")[0]}`}
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {task.title}
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.column.name}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center">
                          <User2 className="h-4 w-4 mr-1 text-gray-400" />
                          {task.assignee.name}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Não atribuído
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.subtasks.length > 0 ? (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {task.subtasks.filter((st) => st.completed).length}/
                            {task.subtasks.length} subtarefas
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${calculateSubtaskProgress(
                                  task.subtasks
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Sem subtarefas
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {tasks.length === 0
                ? "Este sprint não possui tarefas ainda."
                : "Nenhuma tarefa corresponde aos filtros aplicados."}
            </p>
            {tasks.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
