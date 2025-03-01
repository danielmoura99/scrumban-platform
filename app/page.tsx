// Arquivo: /app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Plataforma Scrumban
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Gerencie seus projetos combinando o melhor do Scrum e Kanban
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Registrar</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
