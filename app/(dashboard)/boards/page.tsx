///app/(dashboard)/boards/page.tsx
import { getAllBoards, getAllTeams } from "./_actions/board-list-actions";
import BoardsClient from "./_components/BoardsClient";

export default async function BoardsPage() {
  // Carregar dados diretamente no servidor
  const boards = await getAllBoards();
  const teams = await getAllTeams();

  return (
    <div className="p-6">
      <BoardsClient boards={boards} teams={teams} />
    </div>
  );
}
