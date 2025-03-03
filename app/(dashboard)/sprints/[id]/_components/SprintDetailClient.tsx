//app/(dashboard)/sprints/[id]/_components/SprintDetailClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  PlayCircle,
  ClipboardList,
  BarChart2,
  Edit,
  Trash2,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  updateSprintStatus,
  deleteSprint,
} from "../../_actions/sprint-actions";
import { toggleTaskInSprint } from "../../_actions/sprint-actions";
import EditSprintDialog from "./EditSprintDialog";
import ConfirmDialog from "./ConfirmDialog";
import TaskList from "./TaskList";
import SprintProgress from "./SprintProgress";
import AddTasksDialog from "./AddTasksDialog";

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

type Sprint = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string | null;
  status: string;
  board: {
    id: string;
    name: string;
    team: {
      id: string;
      name: string;
    };
  };
  tasks: Task[];
  progress: number;
};

interface SprintDetailClientProps {
  sprint: Sprint;
}

export default function SprintDetailClient({
  sprint,
}: SprintDetailClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTasksDialogOpen, setIsAddTasksDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  // Função para formatar datas
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  // Lidar com ações de status
  const handleStatusChange = async (
    newStatus: "planning" | "active" | "completed"
  ) => {
    try {
      setIsLoading(true);
      await updateSprintStatus(sprint.id, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar status do sprint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir sprint
  const handleDeleteSprint = async () => {
    try {
      setIsLoading(true);
      await deleteSprint(sprint.id);
      router.push("/sprints");
    } catch (error) {
      console.error("Erro ao excluir sprint:", error);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Remover uma tarefa do sprint
  const handleRemoveTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      await toggleTaskInSprint(taskId, null);
      router.refresh();
    } catch (error) {
      console.error("Erro ao remover tarefa do sprint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular métricas
  const completedTasks = sprint.tasks.filter(
    (task) =>
      task.column.name.toLowerCase().includes("concluído") ||
      task.column.name.toLowerCase().includes("completed") ||
      task.column.name.toLowerCase().includes("done")
  ).length;

  const inProgressTasks = sprint.tasks.filter(
    (task) =>
      !task.column.name.toLowerCase().includes("concluído") &&
      !task.column.name.toLowerCase().includes("completed") &&
      !task.column.name.toLowerCase().includes("done") &&
      !task.column.name.toLowerCase().includes("backlog")
  ).length;

  const backlogTasks = sprint.tasks.filter((task) =>
    task.column.name.toLowerCase().includes("backlog")
  ).length;

  const completionPercentage =
    sprint.tasks.length > 0
      ? Math.round((completedTasks / sprint.tasks.length) * 100)
      : 0;

  // Função para renderizar o status do sprint com o estilo apropriado
  const renderSprintStatus = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "planning":
        return (
          <Badge className="bg-blue-100 text-blue-800">Planejamento</Badge>
        );
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Concluído</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Botões de ação baseados no status
  const renderActionButtons = () => {
    switch (sprint.status) {
      case "planning":
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStatusChange("active")}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlayCircle className="w-4 h-4 mr-2" /> Iniciar Sprint
          </Button>
        );
      case "active":
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStatusChange("completed")}
            disabled={isLoading}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Concluir Sprint
          </Button>
        );
      case "completed":
        // Sem botões de ação para sprints concluídos
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/sprints">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{sprint.name}</h1>
          {renderSprintStatus(sprint.status)}
        </div>
        <div className="flex items-center space-x-2">
          {renderActionButtons()}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            disabled={isLoading}
          >
            <Edit className="w-4 h-4 mr-1" /> Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-gray-500" />
            <span>
              {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
            </span>
          </div>
          <div className="flex items-center">
            <ClipboardList className="w-4 h-4 mr-1 text-gray-500" />
            <span>{sprint.tasks.length} tarefas</span>
          </div>
          <div className="flex items-center">
            <BarChart2 className="w-4 h-4 mr-1 text-gray-500" />
            <span>
              {completedTasks} concluídas ({completionPercentage}%)
            </span>
          </div>
        </div>

        {sprint.goal && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-blue-800">
            <h3 className="font-medium mb-1">Meta do Sprint</h3>
            <p>{sprint.goal}</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="burndown">Burndown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cartão com as estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progresso do sprint */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Progresso do Sprint
                    </span>
                    <span className="text-sm">{sprint.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        sprint.progress >= 90
                          ? "bg-green-600"
                          : sprint.progress >= 50
                          ? "bg-blue-600"
                          : sprint.progress >= 25
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${sprint.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tarefas por status */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Status das Tarefas
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-100 p-2 rounded">
                      <div className="font-bold">{backlogTasks}</div>
                      <div className="text-xs text-gray-500">Backlog</div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded">
                      <div className="font-bold">{inProgressTasks}</div>
                      <div className="text-xs text-gray-500">Em Progresso</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded">
                      <div className="font-bold">{completedTasks}</div>
                      <div className="text-xs text-gray-500">Concluídas</div>
                    </div>
                  </div>
                </div>

                {/* Completude do sprint */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Completude</span>
                    <span className="text-sm">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        completionPercentage >= 80
                          ? "bg-green-600"
                          : completionPercentage >= 50
                          ? "bg-blue-600"
                          : completionPercentage >= 25
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cartão com informações do quadro */}
            <Card>
              <CardHeader>
                <CardTitle>Quadro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Nome do Quadro</h4>
                  <p>
                    <Link
                      href={`/boards/${sprint.board.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {sprint.board.name}
                    </Link>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Equipe</h4>
                  <p>{sprint.board.team.name}</p>
                </div>
                {sprint.status === "active" &&
                  new Date(sprint.endDate) < new Date() && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded text-yellow-800 flex items-start">
                      <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Sprint expirado</h4>
                        <p className="text-sm">
                          Este sprint já passou da data de término mas ainda não
                          foi concluído.
                        </p>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="mb-4 flex justify-end">
            {sprint.status !== "completed" && (
              <Button
                onClick={() => setIsAddTasksDialogOpen(true)}
                disabled={isLoading}
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Tarefas
              </Button>
            )}
          </div>
          <TaskList
            tasks={sprint.tasks}
            onRemoveTask={handleRemoveTask}
            isReadOnly={sprint.status === "completed"}
          />
        </TabsContent>

        <TabsContent value="burndown">
          <SprintProgress
            sprint={sprint}
            completedTasks={completedTasks}
            totalTasks={sprint.tasks.length}
          />
        </TabsContent>
      </Tabs>

      {/* Diálogo para editar o sprint */}
      <EditSprintDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        sprint={sprint}
      />

      {/* Diálogo para adicionar tarefas ao sprint */}
      <AddTasksDialog
        isOpen={isAddTasksDialogOpen}
        onOpenChange={setIsAddTasksDialogOpen}
        sprintId={sprint.id}
      />

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir Sprint"
        description="Tem certeza que deseja excluir este sprint? As tarefas não serão excluídas, apenas desvinculadas do sprint."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        onConfirm={handleDeleteSprint}
        isLoading={isLoading}
      />
    </>
  );
}
