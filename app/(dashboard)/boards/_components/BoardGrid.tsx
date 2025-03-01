"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

type Board = {
  id: string;
  name: string;
  description: string | null;
  teamName: string;
  activeSprint: string;
  taskCount: number;
  updatedAt: Date;
};

type BoardGridProps = {
  boards: Board[];
  onCreateBoard: () => void;
};

export default function BoardGrid({ boards, onCreateBoard }: BoardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card para criar novo quadro - posicionado primeiro */}
      <Card
        className="h-full flex items-center justify-center border-dashed cursor-pointer hover:bg-gray-50"
        onClick={onCreateBoard}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <PlusIcon className="h-6 w-6" />
          </div>
          <p className="text-gray-500">Criar novo quadro</p>
        </CardContent>
      </Card>

      {/* Lista de quadros existentes */}
      {boards.map((board) => (
        <Link href={`/boards/${board.id}`} key={board.id} className="h-full">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{board.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">
                {board.description || "Sem descrição"}
              </p>
              <div className="text-sm">
                <span className="font-medium">Equipe:</span> {board.teamName}
              </div>
              <div className="text-sm">
                <span className="font-medium">Sprint:</span>{" "}
                {board.activeSprint}
              </div>
              <div className="text-sm">
                <span className="font-medium">Tarefas:</span> {board.taskCount}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-gray-500">
              Atualizado em:{" "}
              {new Date(board.updatedAt).toLocaleDateString("pt-BR")}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
