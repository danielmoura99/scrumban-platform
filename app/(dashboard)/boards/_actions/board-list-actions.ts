//app/(dashboard)/boards/_actions/board-list-actions.ts

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAllBoards() {
  try {
    const boards = await prisma.board.findMany({
      include: {
        team: {
          select: {
            name: true,
          },
        },
        sprints: {
          where: { status: "active" },
          select: {
            name: true,
          },
          take: 1,
        },
        columns: {
          include: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transformar os dados para um formato mais amigável para o frontend
    return boards.map((board) => {
      const taskCount = board.columns.reduce(
        (sum, column) => sum + column._count.tasks,
        0
      );

      return {
        id: board.id,
        name: board.name,
        description: board.description,
        teamName: board.team.name,
        activeSprint: board.sprints[0]?.name || "Sem sprint ativo",
        taskCount,
        updatedAt: board.updatedAt,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar quadros:", error);
    throw new Error("Falha ao buscar lista de quadros");
  }
}

export async function createBoard(data: {
  name: string;
  description?: string;
  teamId: string;
}) {
  try {
    // Criar um novo quadro
    const board = await prisma.board.create({
      data: {
        name: data.name,
        description: data.description,
        team: {
          connect: {
            id: data.teamId,
          },
        },
      },
    });

    // Criar colunas padrão para o quadro
    await prisma.$transaction([
      prisma.column.create({
        data: {
          name: "Backlog",
          order: 0,
          boardId: board.id,
        },
      }),
      prisma.column.create({
        data: {
          name: "Em Progresso",
          order: 1,
          wipLimit: 3,
          boardId: board.id,
        },
      }),
      prisma.column.create({
        data: {
          name: "Em Revisão",
          order: 2,
          wipLimit: 2,
          boardId: board.id,
        },
      }),
      prisma.column.create({
        data: {
          name: "Concluído",
          order: 3,
          boardId: board.id,
        },
      }),
    ]);

    // Adicionar um sprint padrão
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 14); // Sprint de duas semanas

    await prisma.sprint.create({
      data: {
        name: "Sprint 1",
        startDate: today,
        endDate: endDate,
        goal: "Implementar funcionalidades essenciais do MVP",
        status: "active",
        boardId: board.id,
      },
    });

    revalidatePath("/boards");
    return board;
  } catch (error) {
    console.error("Erro ao criar quadro:", error);
    throw new Error("Falha ao criar novo quadro");
  }
}

export async function getAllTeams() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return teams;
  } catch (error) {
    console.error("Erro ao buscar equipes:", error);
    throw new Error("Falha ao buscar lista de equipes");
  }
}
