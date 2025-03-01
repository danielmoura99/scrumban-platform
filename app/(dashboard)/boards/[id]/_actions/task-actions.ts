//app/dashboard/boards/[id]/_actions/task-actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// Criar uma nova tarefa
export async function createTask(data: {
  title: string;
  columnId: string;
  priority?: string;
  sprintId?: string;
}) {
  try {
    // Encontrar a ordem mais alta atual na coluna
    const highestOrder = await prisma.task.findFirst({
      where: { columnId: data.columnId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (highestOrder?.order ?? -1) + 1;

    // Obter o boardId para revalidação
    const column = await prisma.column.findUnique({
      where: { id: data.columnId },
      select: { boardId: true },
    });

    if (!column) {
      throw new Error("Coluna não encontrada");
    }

    // Criar nova tarefa
    const task = await prisma.task.create({
      data: {
        title: data.title,
        status: "to-do",
        priority: data.priority || "medium",
        order: newOrder,
        columnId: data.columnId,
        sprintId: data.sprintId,
        tags: [],
      },
      include: {
        assignee: true,
        subtasks: true,
      },
    });

    revalidatePath(`/boards/${column.boardId}`);
    return task;
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    throw new Error("Falha ao criar nova tarefa");
  }
}

// Move uma tarefa entre colunas ou reordena dentro da mesma coluna
export async function moveTask(
  taskId: string,
  data: {
    columnId: string;
    position: number;
  }
) {
  try {
    // Buscar a tarefa atual com sua coluna
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        columnId: true,
        order: true,
        column: {
          select: { boardId: true },
        },
      },
    });

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    const boardId = task.column.boardId;
    const currentColumnId = task.columnId;
    const currentPosition = task.order;
    const newColumnId = data.columnId;
    const newPosition = data.position;

    // Verificar se é uma mudança de coluna ou apenas reordenação
    if (currentColumnId === newColumnId) {
      // Reordenar na mesma coluna
      await reorderInSameColumn(
        taskId,
        currentColumnId,
        currentPosition,
        newPosition
      );
    } else {
      // Mover para outra coluna
      await moveBetweenColumns(
        taskId,
        currentColumnId,
        newColumnId,
        currentPosition,
        newPosition
      );
    }

    revalidatePath(`/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao mover tarefa:", error);
    throw new Error("Falha ao mover a tarefa");
  }
}

// Funções auxiliares
async function reorderInSameColumn(
  taskId: string,
  columnId: string,
  fromPosition: number,
  toPosition: number
) {
  await prisma.$transaction(async (tx) => {
    if (fromPosition < toPosition) {
      // Movendo para baixo: ajustar tarefas entre fromPosition e toPosition
      await tx.task.updateMany({
        where: {
          columnId,
          order: {
            gt: fromPosition,
            lte: toPosition,
          },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    } else if (fromPosition > toPosition) {
      // Movendo para cima: ajustar tarefas entre toPosition e fromPosition
      await tx.task.updateMany({
        where: {
          columnId,
          order: {
            gte: toPosition,
            lt: fromPosition,
          },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    // Atualizar a posição da tarefa
    await tx.task.update({
      where: { id: taskId },
      data: { order: toPosition },
    });
  });
}

async function moveBetweenColumns(
  taskId: string,
  fromColumnId: string,
  toColumnId: string,
  fromPosition: number,
  toPosition: number
) {
  await prisma.$transaction(async (tx) => {
    // 1. Ajustar ordem na coluna de origem
    await tx.task.updateMany({
      where: {
        columnId: fromColumnId,
        order: { gt: fromPosition },
      },
      data: {
        order: { decrement: 1 },
      },
    });

    // 2. Ajustar ordem na coluna de destino
    await tx.task.updateMany({
      where: {
        columnId: toColumnId,
        order: { gte: toPosition },
      },
      data: {
        order: { increment: 1 },
      },
    });

    // 3. Mover a tarefa para a nova coluna e posição
    await tx.task.update({
      where: { id: taskId },
      data: {
        columnId: toColumnId,
        order: toPosition,
      },
    });
  });
}

// Atualizar uma tarefa
export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    columnId?: string;
    assigneeId?: string;
    dueDate?: Date;
  }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { column: { select: { boardId: true } } },
    });

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    // Registrar atividade
    await prisma.activity.create({
      data: {
        action: "updated",
        taskId,
        userId: "userIdAqui", // Substitua pelo ID do usuário atual
      },
    });

    revalidatePath(`/boards/${task.column.boardId}`);
    return updatedTask;
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw new Error("Falha ao atualizar a tarefa");
  }
}

// Criar uma subtarefa
export async function createSubtask(taskId: string, data: { title: string }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { column: { select: { boardId: true } } },
    });

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    const subtask = await prisma.subtask.create({
      data: {
        title: data.title,
        completed: false,
        taskId,
      },
    });

    revalidatePath(`/boards/${task.column.boardId}`);
    return subtask;
  } catch (error) {
    console.error("Erro ao criar subtarefa:", error);
    throw new Error("Falha ao criar subtarefa");
  }
}

// Alternar status de uma subtarefa
export async function toggleSubtask(subtaskId: string, completed: boolean) {
  try {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      select: { task: { select: { column: { select: { boardId: true } } } } },
    });

    if (!subtask) {
      throw new Error("Subtarefa não encontrada");
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { completed },
    });

    revalidatePath(`/boards/${subtask.task.column.boardId}`);
    return updatedSubtask;
  } catch (error) {
    console.error("Erro ao atualizar subtarefa:", error);
    throw new Error("Falha ao atualizar subtarefa");
  }
}

// Adicionar comentário a uma tarefa
export async function addCommentToTask(
  taskId: string,
  data: { content: string }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { column: { select: { boardId: true } } },
    });

    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        taskId,
        authorId: "userIdAqui", // Substitua pelo ID do usuário atual
      },
    });

    // Registrar atividade de comentário
    await prisma.activity.create({
      data: {
        action: "commented",
        taskId,
        userId: "userIdAqui", // Substitua pelo ID do usuário atual
      },
    });

    revalidatePath(`/boards/${task.column.boardId}`);
    return comment;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    throw new Error("Falha ao adicionar comentário");
  }
}
