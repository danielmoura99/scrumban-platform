"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// Buscar um quadro específico com todas as relações
export async function getBoardById(boardId: string) {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                assignee: true,
                subtasks: true,
              },
            },
          },
        },
        sprints: {
          where: { status: "active" },
          take: 1,
        },
        team: true,
      },
    });

    if (!board) {
      throw new Error("Quadro não encontrado");
    }

    return board;
  } catch (error) {
    console.error("Erro ao buscar quadro:", error);
    throw new Error("Falha ao buscar dados do quadro");
  }
}

// Criar uma nova coluna
export async function createColumn(boardId: string, data: { name: string }) {
  try {
    // Encontrar a ordem mais alta atual
    const highestOrder = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (highestOrder?.order ?? -1) + 1;

    // Criar nova coluna
    const column = await prisma.column.create({
      data: {
        name: data.name,
        order: newOrder,
        boardId,
      },
    });

    revalidatePath(`/boards/${boardId}`);
    return column;
  } catch (error) {
    console.error("Erro ao criar coluna:", error);
    throw new Error("Falha ao criar nova coluna");
  }
}
