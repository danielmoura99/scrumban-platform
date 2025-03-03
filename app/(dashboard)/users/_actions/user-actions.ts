//app/(dashboard)/users/_actions/user-actions.ts

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Obter todos os usuários
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Falha ao buscar lista de usuários");
  }
}

// Criar um novo usuário
export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role?: string;
  image?: string;
}) {
  try {
    // Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Este e-mail já está sendo usado");
    }

    // Definir senha padrão ou usar a fornecida
    const passwordToUse = data.password || "Senha@123";
    const hashedPassword = await bcrypt.hash(passwordToUse, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "user", // Padrão: user
        image: data.image,
      },
    });

    // Remover senha do objeto retornado
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    revalidatePath("/users");

    return userWithoutPassword;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao criar usuário"
    );
  }
}

// Excluir um usuário
export async function deleteUser(userId: string) {
  try {
    // Verificar se existem dependências (membros de equipe)
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId },
    });

    if (teamMemberships.length > 0) {
      throw new Error(
        "Não é possível excluir este usuário porque ele é membro de uma ou mais equipes"
      );
    }

    // Verificar se existem tarefas atribuídas a este usuário
    const assignedTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
    });

    if (assignedTasks.length > 0) {
      throw new Error(
        "Não é possível excluir este usuário porque existem tarefas atribuídas a ele"
      );
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/users");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao excluir usuário"
    );
  }
}
