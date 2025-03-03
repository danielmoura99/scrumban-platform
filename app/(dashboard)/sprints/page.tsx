// app/(dashboard)/sprints/page.tsx

import { getAllSprints } from "./_actions/sprint-actions";
import SprintsClient from "./_components/SprintsClient";

export default async function SprintsPage() {
  // Carregar dados diretamente no servidor
  const sprints = await getAllSprints();

  return (
    <div className="p-6">
      <SprintsClient sprints={sprints} />
    </div>
  );
}
