//app/(dashboard)/dashboard/_components/RecentBoards.tsx

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Board = {
  id: string;
  name: string;
  taskCount: number;
  activeSprint: string | null;
};

type RecentBoardsProps = {
  boards: Board[];
};

export default function RecentBoards({ boards }: RecentBoardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quadros Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {boards.length > 0 ? (
          boards.map((board) => (
            <Link href={`/boards/${board.id}`} key={board.id}>
              <div className="border-b pb-2 hover:bg-gray-50 p-2 rounded cursor-pointer">
                <div className="font-medium">{board.name}</div>
                <div className="text-sm text-gray-500">
                  {board.taskCount} tarefas • Sprint atual:{" "}
                  {board.activeSprint || "Sem sprint ativo"}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum quadro criado ainda
          </div>
        )}
      </CardContent>
    </Card>
  );
}
