//app/(dashboard)/teams/_components/TeamsClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusIcon, Users, LayoutGrid } from "lucide-react";
import CreateTeamDialog from "./CreateTeamDialog";

type Team = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  boardCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type TeamsClientProps = {
  teams: Team[];
};

export default function TeamsClient({ teams }: TeamsClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreateTeam = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Equipes</h1>
        <Button onClick={handleCreateTeam}>Nova Equipe</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card para criar nova equipe - posicionado primeiro */}
        <Card
          className="h-full flex items-center justify-center border-dashed cursor-pointer hover:bg-gray-50"
          onClick={handleCreateTeam}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <PlusIcon className="h-6 w-6" />
            </div>
            <p className="text-gray-500">Criar nova equipe</p>
          </CardContent>
        </Card>

        {/* Lista de equipes existentes */}
        {teams.map((team) => (
          <Link href={`/teams/${team.id}`} key={team.id} className="h-full">
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {team.description || "Sem descrição"}
                </p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {team.memberCount}{" "}
                      {team.memberCount === 1 ? "membro" : "membros"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <LayoutGrid className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {team.boardCount}{" "}
                      {team.boardCount === 1 ? "quadro" : "quadros"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-5 py-3 border-t text-xs text-gray-500">
                Atualizado em:{" "}
                {new Date(team.updatedAt).toLocaleDateString("pt-BR")}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <CreateTeamDialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Revalidar a página quando o diálogo fechar
            router.refresh();
          }
        }}
      />
    </>
  );
}
