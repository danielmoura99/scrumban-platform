import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SprintNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Sprint não encontrado</h1>
      <p className="text-gray-500 mb-6">
        O sprint que você está procurando não existe ou foi removido.
      </p>
      <Button asChild>
        <Link href="/sprints">Voltar para lista de sprints</Link>
      </Button>
    </div>
  );
}
