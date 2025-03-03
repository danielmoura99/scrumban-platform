//app/(dashboard)/boards/_actions/board-list-actions.ts

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/boards");
    return board;
  } catch (error) {
    console.error("Erro ao criar quadro:", error);
    throw new Error("Falha ao criar novo quadro");
  }
}

export async function deleteBoard(boardId: string) {
  try {
    // Verificar se o quadro existe
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
        sprints: true,
      },
    });

    if (!board) {
      throw new Error("Quadro não encontrado");
    }

    // Usamos uma transação para garantir que tudo seja excluído ou nada seja excluído
    await prisma.$transaction(async (tx) => {
      // 1. Para cada coluna, excluir tarefas e subtarefas
      for (const column of board.columns) {
        for (const task of column.tasks) {
          // Excluir subtarefas
          await tx.subtask.deleteMany({
            where: { taskId: task.id },
          });

          // Excluir comentários
          await tx.comment.deleteMany({
            where: { taskId: task.id },
          });

          // Excluir atividades
          await tx.activity.deleteMany({
            where: { taskId: task.id },
          });
        }

        // Excluir todas as tarefas da coluna
        await tx.task.deleteMany({
          where: { columnId: column.id },
        });
      }

      // 2. Excluir colunas
      await tx.column.deleteMany({
        where: { boardId },
      });

      // 3. Excluir sprints
      await tx.sprint.deleteMany({
        where: { boardId },
      });

      // 4. Finalmente excluir o quadro
      await tx.board.delete({
        where: { id: boardId },
      });
    });

    revalidatePath("/boards");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir quadro:", error);
    throw new Error("Falha ao excluir o quadro");
  }
}

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
