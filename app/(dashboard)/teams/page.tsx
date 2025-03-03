// app/(dashboard)/teams/page.tsx
import { getAllTeams } from "./_actions/team-actions";
import TeamsClient from "./_components/TeamsClient";

export default async function TeamsPage() {
  // Carregar dados diretamente no servidor
  const teams = await getAllTeams();

  return (
    <div className="p-6">
      <TeamsClient teams={teams} />
    </div>
  );
}
