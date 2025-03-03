//app/(dashboard)/sprints/_actions/sprint-actions.ts

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Buscar todos os sprints com dados relacionados
export async function getAllSprints() {
  try {
    const sprints = await prisma.sprint.findMany({
      include: {
        board: {
          select: {
            id: true,
            name: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: [
        { status: "asc" }, // Primeiro os ativos, depois os planejados, por último os concluídos
        { endDate: "asc" }, // Ordenar por data de término
      ],
    });

    // Transformar os dados para um formato mais amigável para o frontend
    return sprints.map((sprint) => ({
      id: sprint.id,
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      goal: sprint.goal,
      status: sprint.status,
      boardId: sprint.board.id,
      boardName: sprint.board.name,
      teamName: sprint.board.team.name,
      taskCount: sprint._count.tasks,
      // Calcular progresso com base na data atual, apenas para sprints ativos
      progress: calculateSprintProgress(sprint),
    }));
  } catch (error) {
    console.error("Erro ao buscar sprints:", error);
    throw new Error("Falha ao buscar lista de sprints");
  }
}

// Buscar todos os quadros para o dropdown de criação de sprint
export async function getBoardsForSprint() {
  try {
    const boards = await prisma.board.findMany({
      select: {
        id: true,
        name: true,
        team: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return boards.map((board) => ({
      id: board.id,
      name: board.name,
      teamName: board.team.name,
    }));
  } catch (error) {
    console.error("Erro ao buscar quadros:", error);
    throw new Error("Falha ao buscar lista de quadros");
  }
}

// Criar um novo sprint
export async function createSprint(data: {
  name: string;
  boardId: string;
  startDate: Date;
  endDate: Date;
  goal?: string;
}) {
  try {
    // Verificar se as datas são válidas
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new Error("A data de término deve ser posterior à data de início");
    }

    // Criar o sprint
    const sprint = await prisma.sprint.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        goal: data.goal,
        status: "planning", // Iniciar como planejamento
        board: {
          connect: {
            id: data.boardId,
          },
        },
      },
    });

    revalidatePath("/sprints");
    revalidatePath(`/boards/${data.boardId}`);

    return sprint;
  } catch (error) {
    console.error("Erro ao criar sprint:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao criar novo sprint"
    );
  }
}

// Atualizar status do sprint
export async function updateSprintStatus(
  sprintId: string,
  status: "planning" | "active" | "completed"
) {
  try {
    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: { status },
      include: { board: true },
    });

    // Se estiver ativando o sprint, desativar outros sprints ativos do mesmo quadro
    if (status === "active") {
      await prisma.sprint.updateMany({
        where: {
          boardId: sprint.board.id,
          id: { not: sprintId },
          status: "active",
        },
        data: {
          status: "completed",
        },
      });
    }

    revalidatePath("/sprints");
    revalidatePath(`/boards/${sprint.board.id}`);

    return sprint;
  } catch (error) {
    console.error("Erro ao atualizar status do sprint:", error);
    throw new Error("Falha ao atualizar status do sprint");
  }
}

// Buscar detalhes de um sprint específico
// Buscar detalhes de um sprint específico
export async function getSprintById(sprintId: string) {
  try {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: true,
            column: true,
            subtasks: true,
          },
          orderBy: { title: "asc" },
        },
      },
    });

    if (!sprint) {
      throw new Error("Sprint não encontrado");
    }

    return {
      ...sprint,
      progress: calculateSprintProgress(sprint),
    };
  } catch (error) {
    console.error("Erro ao buscar sprint:", error);
    throw new Error("Falha ao buscar dados do sprint");
  }
}

// Buscar tarefas disponíveis para adicionar ao sprint
export async function getAvailableTasksForSprint(sprintId: string) {
  try {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      select: { boardId: true },
    });

    if (!sprint) {
      throw new Error("Sprint não encontrado");
    }

    // Buscar tarefas que estão no mesmo quadro mas não pertencem a nenhum sprint
    const tasks = await prisma.task.findMany({
      where: {
        column: {
          boardId: sprint.boardId,
        },
        sprintId: null, // Tarefas que não estão em nenhum sprint
      },
      include: {
        assignee: true,
        column: true,
        subtasks: true,
      },
      orderBy: { title: "asc" },
    });

    return tasks;
  } catch (error) {
    console.error("Erro ao buscar tarefas disponíveis:", error);
    throw new Error("Falha ao buscar tarefas disponíveis para o sprint");
  }
}

// Editar um sprint existente
export async function updateSprint(
  sprintId: string,
  data: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    goal?: string;
  }
) {
  try {
    // Verificar se as datas são válidas quando ambas são fornecidas
    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) <= new Date(data.startDate)) {
        throw new Error(
          "A data de término deve ser posterior à data de início"
        );
      }
    }

    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data,
      include: { board: true },
    });

    revalidatePath("/sprints");
    revalidatePath(`/boards/${sprint.board.id}`);
    revalidatePath(`/sprints/${sprintId}`);

    return sprint;
  } catch (error) {
    console.error("Erro ao atualizar sprint:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao atualizar sprint"
    );
  }
}

// Remover um sprint
export async function deleteSprint(sprintId: string) {
  try {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      select: { boardId: true },
    });

    if (!sprint) {
      throw new Error("Sprint não encontrado");
    }

    // Desconectar tarefas do sprint ao invés de excluí-las
    await prisma.task.updateMany({
      where: { sprintId },
      data: { sprintId: null },
    });

    // Excluir o sprint
    await prisma.sprint.delete({
      where: { id: sprintId },
    });

    revalidatePath("/sprints");
    revalidatePath(`/boards/${sprint.boardId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir sprint:", error);
    throw new Error("Falha ao excluir sprint");
  }
}

// Adicionar ou remover tarefa do sprint
export async function toggleTaskInSprint(
  taskId: string,
  sprintId: string | null
) {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { sprintId },
      include: {
        column: { select: { boardId: true } },
        sprint: true,
      },
    });

    revalidatePath(`/boards/${task.column.boardId}`);
    if (task.sprint) {
      revalidatePath(`/sprints/${task.sprint.id}`);
    }
    if (sprintId) {
      revalidatePath(`/sprints/${sprintId}`);
    }

    return task;
  } catch (error) {
    console.error("Erro ao atualizar tarefa no sprint:", error);
    throw new Error("Falha ao adicionar/remover tarefa do sprint");
  }
}

// Função auxiliar para calcular o progresso do sprint
function calculateSprintProgress(sprint: {
  startDate: Date;
  endDate: Date;
  status: string;
}) {
  if (sprint.status === "completed") {
    return 100;
  }

  if (sprint.status === "planning") {
    return 0;
  }

  const now = new Date();
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);

  // Se o sprint já acabou mas não foi marcado como concluído
  if (now > end) {
    return 100;
  }

  // Se o sprint ainda não começou mas está marcado como ativo
  if (now < start) {
    return 0;
  }

  // Calcular progresso com base no tempo decorrido
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const progress = Math.round((elapsed / totalDuration) * 100);

  return Math.min(Math.max(progress, 0), 100); // Garantir que esteja entre 0 e 100
}
