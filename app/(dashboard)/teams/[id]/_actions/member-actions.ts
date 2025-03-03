//app/(dashboard)/teams/[id]/_actions/member-actions.ts

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Adicionar um membro à equipe
export async function addMember(
  teamId: string,
  data: {
    userId: string;
    role: string;
  }
) {
  try {
    // Verificar se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error("Equipe não encontrada");
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o usuário já é membro da equipe
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: data.userId,
      },
    });

    if (existingMember) {
      throw new Error("Este usuário já é membro da equipe");
    }

    // Adicionar o membro
    const member = await prisma.teamMember.create({
      data: {
        userId: data.userId,
        teamId,
        role: data.role,
      },
    });

    revalidatePath(`/teams/${teamId}`);

    return member;
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Falha ao adicionar membro à equipe"
    );
  }
}

// Remover um membro da equipe
export async function removeMember(teamId: string, userId: string) {
  try {
    // Verificar se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error("Equipe não encontrada");
    }

    // Verificar se o membro existe
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!member) {
      throw new Error("Membro não encontrado");
    }

    // Verificar se o membro é o proprietário
    if (member.role === "owner") {
      throw new Error("Não é possível remover o proprietário da equipe");
    }

    // Remover o membro
    await prisma.teamMember.delete({
      where: {
        id: member.id,
      },
    });

    revalidatePath(`/teams/${teamId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Falha ao remover membro da equipe"
    );
  }
}

// Atualizar o papel de um membro
export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: string
) {
  try {
    // Verificar se os papéis são válidos
    if (!["admin", "member"].includes(role)) {
      throw new Error("Papel inválido");
    }

    // Verificar se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error("Equipe não encontrada");
    }

    // Verificar se o membro existe
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!member) {
      throw new Error("Membro não encontrado");
    }

    // Verificar se o membro é o proprietário
    if (member.role === "owner") {
      throw new Error("Não é possível alterar o papel do proprietário");
    }

    // Atualizar o papel
    const updatedMember = await prisma.teamMember.update({
      where: {
        id: member.id,
      },
      data: {
        role,
      },
    });

    revalidatePath(`/teams/${teamId}`);

    return updatedMember;
  } catch (error) {
    console.error("Erro ao atualizar papel do membro:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Falha ao atualizar papel do membro"
    );
  }
}

// Buscar usuários para adicionar à equipe
export async function searchUsers(searchTerm: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 10, // Limitar a 10 resultados
    });

    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Falha ao buscar usuários");
  }
}
