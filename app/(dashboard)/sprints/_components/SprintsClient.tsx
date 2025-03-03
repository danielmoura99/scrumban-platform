//app/(dashboard)/sprints/_components/SprintsClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  CheckCircle,
  PlusCircle,
  ClipboardList,
  Clock,
} from "lucide-react";
import { updateSprintStatus } from "../_actions/sprint-actions";
import CreateSprintDialog from "./CreateSprintDialog";

type Sprint = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string | null;
  status: string;
  boardId: string;
  boardName: string;
  teamName: string;
  taskCount: number;
  progress: number;
};

type SprintsClientProps = {
  sprints: Sprint[];
};

export default function SprintsClient({ sprints }: SprintsClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Função para formatar datas
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Função para lidar com a mudança de status do sprint
  const handleStatusChange = async (
    sprintId: string,
    newStatus: "planning" | "active" | "completed"
  ) => {
    try {
      setIsLoading(true);
      await updateSprintStatus(sprintId, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar sprints por status
  const activeSprintsList = sprints.filter(
    (sprint) => sprint.status === "active"
  );
  const plannedSprintsList = sprints.filter(
    (sprint) => sprint.status === "planning"
  );
  const completedSprintsList = sprints.filter(
    (sprint) => sprint.status === "completed"
  );

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

  // Função para renderizar os botões de ação baseados no status
  const renderActionButtons = (sprint: Sprint) => {
    switch (sprint.status) {
      case "planning":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-green-600"
            onClick={() => handleStatusChange(sprint.id, "active")}
            disabled={isLoading}
          >
            <PlayCircle className="w-4 h-4 mr-1" /> Iniciar
          </Button>
        );
      case "active":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600"
            onClick={() => handleStatusChange(sprint.id, "completed")}
            disabled={isLoading}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Concluir
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sprints</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Novo Sprint
        </Button>
      </div>

      {/* Sprints Ativos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sprints Ativos</h2>
        {activeSprintsList.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeSprintsList.map((sprint) => (
              <Link
                key={sprint.id}
                href={`/sprints/${sprint.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{sprint.name}</h3>
                      {renderSprintStatus(sprint.status)}
                    </div>

                    <p className="text-sm text-gray-500 mb-3">
                      {sprint.teamName} • {sprint.boardName}
                    </p>

                    {/* Progresso do sprint */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progresso</span>
                        <span className="text-xs font-medium">
                          {sprint.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${sprint.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDate(sprint.startDate)} -{" "}
                        {formatDate(sprint.endDate)}
                      </div>

                      <div className="flex items-center text-sm">
                        <ClipboardList className="w-4 h-4 inline mr-1" />
                        {sprint.taskCount} tarefas
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {renderActionButtons(sprint)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Nenhum sprint ativo no momento.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sprints Planejados */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sprints Planejados</h2>
        {plannedSprintsList.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {plannedSprintsList.map((sprint) => (
              <Link
                key={sprint.id}
                href={`/sprints/${sprint.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{sprint.name}</h3>
                      {renderSprintStatus(sprint.status)}
                    </div>

                    <p className="text-sm text-gray-500 mb-3">
                      {sprint.teamName} • {sprint.boardName}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDate(sprint.startDate)} -{" "}
                        {formatDate(sprint.endDate)}
                      </div>

                      <div className="flex items-center text-sm">
                        <ClipboardList className="w-4 h-4 inline mr-1" />
                        {sprint.taskCount} tarefas
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {renderActionButtons(sprint)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Nenhum sprint em planejamento.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sprints Concluídos */}
      {completedSprintsList.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Sprints Concluídos</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {completedSprintsList.map((sprint) => (
              <Link
                key={sprint.id}
                href={`/sprints/${sprint.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{sprint.name}</h3>
                      {renderSprintStatus(sprint.status)}
                    </div>

                    <p className="text-sm text-gray-500 mb-3">
                      {sprint.teamName} • {sprint.boardName}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDate(sprint.startDate)} -{" "}
                        {formatDate(sprint.endDate)}
                      </div>

                      <div className="flex items-center text-sm">
                        <ClipboardList className="w-4 h-4 inline mr-1" />
                        {sprint.taskCount} tarefas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Diálogo para criar um novo sprint */}
      <CreateSprintDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
