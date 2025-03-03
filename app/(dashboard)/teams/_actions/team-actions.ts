//app/(dashboard)/teams/_actions/team-actions.ts

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Obter todas as equipes
export async function getAllTeams() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            members: true,
            boards: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description || "",
      memberCount: team._count.members,
      boardCount: team._count.boards,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }));
  } catch (error) {
    console.error("Erro ao buscar equipes:", error);
    throw new Error("Falha ao buscar lista de equipes");
  }
}

// Criar uma nova equipe
export async function createTeam(data: {
  name: string;
  description?: string;
  creatorId: string; // ID do usuário que está criando a equipe
}) {
  try {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    // Adicionar o criador como membro da equipe (role: owner)
    await prisma.teamMember.create({
      data: {
        role: "owner",
        userId: data.creatorId,
        teamId: team.id,
      },
    });

    revalidatePath("/teams");

    return team;
  } catch (error) {
    console.error("Erro ao criar equipe:", error);
    throw new Error("Falha ao criar nova equipe");
  }
}

// Excluir uma equipe
export async function deleteTeam(teamId: string) {
  try {
    // Verificar se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error("Equipe não encontrada");
    }

    // Usar uma transação para excluir a equipe e seus membros
    await prisma.$transaction(async (tx) => {
      // 1. Excluir os membros da equipe
      await tx.teamMember.deleteMany({
        where: { teamId },
      });

      // 2. Excluir a equipe
      await tx.team.delete({
        where: { id: teamId },
      });
    });

    revalidatePath("/teams");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir equipe:", error);
    throw new Error("Falha ao excluir a equipe");
  }
}

// Atualizar uma equipe
export async function updateTeam(
  teamId: string,
  data: {
    name?: string;
    description?: string | null;
  }
) {
  try {
    const team = await prisma.team.update({
      where: { id: teamId },
      data,
    });

    revalidatePath("/teams");
    revalidatePath(`/teams/${teamId}`);

    return team;
  } catch (error) {
    console.error("Erro ao atualizar equipe:", error);
    throw new Error("Falha ao atualizar equipe");
  }
}

// Obter detalhes de uma equipe específica com seus membros
export async function getTeamById(teamId: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: {
            role: "asc", // "owner" vem primeiro alfabeticamente
          },
        },
        boards: {
          select: {
            id: true,
            name: true,
            updatedAt: true,
            _count: {
              select: {
                columns: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        _count: {
          select: {
            members: true,
            boards: true,
          },
        },
      },
    });

    if (!team) {
      throw new Error("Equipe não encontrada");
    }

    // Transformar os dados para um formato adequado para o frontend
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: team.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: member.role,
      })),
      boards: team.boards.map((board) => ({
        id: board.id,
        name: board.name,
        columnCount: board._count.columns,
        updatedAt: board.updatedAt,
      })),
      memberCount: team._count.members,
      boardCount: team._count.boards,
    };
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);
    throw new Error("Falha ao buscar detalhes da equipe");
  }
}
