// Arquivo: /app/(dashboard)/boards/[id]/page.tsx
import { notFound } from "next/navigation";
import { getBoardById } from "./_actions/board-actions";
import BoardHeader from "./_components/BoardHeader";
import BoardContent from "./_components/BoardContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Verificar se params.id existe antes de usá-lo
  if (!id) {
    notFound();
  }

  try {
    const board = await getBoardById(id);

    // Pegar o Sprint ativo, se houver
    const activeSprint = board.sprints[0] || null;

    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <BoardHeader
          boardId={id}
          boardName={board.name}
          activeSprint={activeSprint}
          columns={board.columns}
        />

        <BoardContent board={board} />
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar quadro:", error);
    notFound();
  }
}
