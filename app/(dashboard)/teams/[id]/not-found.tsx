//app/(dashboard)/teams/[id]/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeamNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Equipe não encontrada</h1>
      <p className="text-gray-500 mb-6">
        A equipe que você está procurando não existe ou foi removida.
      </p>
      <Button asChild>
        <Link href="/teams">Voltar para lista de equipes</Link>
      </Button>
    </div>
  );
}
