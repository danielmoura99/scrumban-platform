// app/(dashboard)/teams/[id]/page.tsx
import { notFound } from "next/navigation";
import { getTeamById } from "../_actions/team-actions";
import TeamDetailClient from "./_components/TeamDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Verificar se params.id existe antes de usá-lo
  if (!id) {
    notFound();
  }

  try {
    const team = await getTeamById(id);

    return (
      <div className="p-6">
        <TeamDetailClient team={team} />
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar equipe:", error);
    notFound();
  }
}
