//app/(dashboard)/dashboard/_actions/dashboard-actions.ts
"use server";

import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  const boardCount = await prisma.board.count();

  const taskCount = await prisma.task.count({
    where: {
      column: {
        name: {
          notIn: ["Concluído", "Done", "Completed", "Finalizado"],
        },
      },
    },
  });

  const sprintCount = await prisma.sprint.count({
    where: {
      status: "active",
    },
  });

  return {
    boardCount,
    taskCount,
    sprintCount,
  };
}

export async function getRecentActivities() {
  const activities = await prisma.activity.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      task: true,
    },
  });

  return activities.map((activity) => {
    let description = "";

    switch (activity.action) {
      case "created":
        description = `${activity.user.name} criou "${activity.task.title}"`;
        break;
      case "updated":
        description = `${activity.user.name} atualizou "${activity.task.title}"`;
        break;
      case "moved":
        description = `${activity.user.name} moveu "${activity.task.title}" ${activity.details}`;
        break;
      case "completed":
        description = `${activity.user.name} completou "${activity.task.title}"`;
        break;
      default:
        description = `${activity.user.name} realizou ação "${activity.action}" em "${activity.task.title}"`;
    }

    return {
      id: activity.id,
      description,
      timestamp: new Date(activity.createdAt).toLocaleString("pt-BR"),
    };
  });
}

export async function getRecentBoards() {
  const boards = await prisma.board.findMany({
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      columns: {
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      },
      sprints: {
        where: { status: "active" },
        take: 1,
      },
    },
  });

  return boards.map((board) => {
    const taskCount = board.columns.reduce(
      (sum, column) => sum + column._count.tasks,
      0
    );

    return {
      id: board.id,
      name: board.name,
      taskCount,
      activeSprint: board.sprints[0]?.name || null,
    };
  });
}
