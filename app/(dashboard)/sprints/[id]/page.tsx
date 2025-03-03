// app/(dashboard)/sprints/[id]/page.tsx
import { notFound } from "next/navigation";
import { getSprintById } from "../_actions/sprint-actions";
import SprintDetailClient from "./_components/SprintDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SprintDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Verificar se params.id existe antes de usá-lo
  if (!id) {
    notFound();
  }

  try {
    const sprint = await getSprintById(id);

    return (
      <div className="p-6">
        <SprintDetailClient sprint={sprint} />
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar sprint:", error);
    notFound();
  }
}
