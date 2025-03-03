//app/(dashboard)/teams/[id]/_components/TeamDetailClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  PlusCircle,
  Users,
  UserPlus,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTeam } from "../../_actions/team-actions";
import EditTeamDialog from "./EditTeamDialog";
import DeleteTeamDialog from "./DeletedTeamDialog";
import MembersTable from "./MembersTable";
import AddMemberDialog from "./AddMemberDialog";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
};

type Board = {
  id: string;
  name: string;
  columnCount: number;
  updatedAt: Date;
};

type Team = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: Member[];
  boards: Board[];
  memberCount: number;
  boardCount: number;
};

interface TeamDetailClientProps {
  team: Team;
}

export default function TeamDetailClient({ team }: TeamDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleDeleteTeam = async () => {
    try {
      setIsLoading(true);
      await deleteTeam(team.id);
      router.push("/teams");
    } catch (error) {
      console.error("Erro ao excluir equipe:", error);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{team.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
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

      {team.description && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <p className="text-gray-600">{team.description}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="boards">Quadros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md flex flex-col items-center">
                  <Users className="h-6 w-6 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">{team.memberCount}</div>
                  <div className="text-sm text-gray-500">Membros</div>
                </div>
                <div className="bg-green-50 p-4 rounded-md flex flex-col items-center">
                  <LayoutGrid className="h-6 w-6 text-green-500 mb-2" />
                  <div className="text-2xl font-bold">{team.boardCount}</div>
                  <div className="text-sm text-gray-500">Quadros</div>
                </div>
              </CardContent>
            </Card>

            {/* Informações */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Criado em</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(team.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Atualizado em
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(team.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Membros da equipe</h2>
            <Button onClick={() => setIsAddMemberDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>

          <MembersTable members={team.members} teamId={team.id} />
        </TabsContent>

        <TabsContent value="boards">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Quadros da equipe</h2>
            <Link href={`/boards?team=${team.id}`}>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Quadro
              </Button>
            </Link>
          </div>

          {team.boards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {team.boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {board.name}
                      </h3>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{board.columnCount} colunas</span>
                        <span>Atualizado: {formatDate(board.updatedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  Esta equipe ainda não possui quadros.
                </p>
                <Link href={`/boards?team=${team.id}`}>
                  <Button>Criar primeiro quadro</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <EditTeamDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        team={team}
      />

      <DeleteTeamDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        teamId={team.id}
        teamName={team.name}
        onConfirm={handleDeleteTeam}
        isLoading={isLoading}
      />

      <AddMemberDialog
        isOpen={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
        teamId={team.id}
        existingMemberIds={team.members.map((member) => member.userId)}
      />
    </>
  );
}
