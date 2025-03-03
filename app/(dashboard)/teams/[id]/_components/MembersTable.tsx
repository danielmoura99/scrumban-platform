"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserCog, UserMinus } from "lucide-react";
import { removeMember, updateMemberRole } from "../_actions/member-actions";
import { ConfirmDialog } from "./ConfirmDialog";
import { UpdateRoleDialog } from "./UpdateRoleDialog";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
};

type MembersTableProps = {
  members: Member[];
  teamId: string;
};

export default function MembersTable({ members, teamId }: MembersTableProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isUpdateRoleDialogOpen, setIsUpdateRoleDialogOpen] = useState(false);

  const router = useRouter();

  // Função para remover membro
  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      setIsLoading(true);
      await removeMember(teamId, selectedMember.userId);
      router.refresh();
    } catch (error) {
      console.error("Erro ao remover membro:", error);
    } finally {
      setIsLoading(false);
      setIsRemoveDialogOpen(false);
      setSelectedMember(null);
    }
  };

  // Função para atualizar papel do membro
  const handleUpdateRole = async (role: string) => {
    if (!selectedMember) return;

    try {
      setIsLoading(true);
      await updateMemberRole(teamId, selectedMember.userId, role);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar papel do membro:", error);
    } finally {
      setIsLoading(false);
      setIsUpdateRoleDialogOpen(false);
      setSelectedMember(null);
    }
  };

  // Obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Formatar papel
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-purple-100 text-purple-800">Proprietário</Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-100 text-blue-800">Administrador</Badge>
        );
      case "member":
        return <Badge className="bg-green-100 text-green-800">Membro</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Verificar se existem membros
  if (members.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-md">
        <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
        <p className="text-gray-500 mb-4">
          Adicione membros para colaborar nesta equipe.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={member.image || undefined}
                    alt={member.name}
                  />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.name}</span>
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{getRoleBadge(member.role)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsUpdateRoleDialogOpen(true);
                    }}
                    disabled={member.role === "owner"} // Não permitir alterar o proprietário
                  >
                    <UserCog className="h-4 w-4" />
                    <span className="sr-only">Alterar função</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsRemoveDialogOpen(true);
                    }}
                    disabled={member.role === "owner"} // Não permitir remover o proprietário
                  >
                    <UserMinus className="h-4 w-4" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diálogos */}
      <ConfirmDialog
        isOpen={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        title="Remover Membro"
        description={`Tem certeza que deseja remover ${selectedMember?.name} da equipe?`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        onConfirm={handleRemoveMember}
        isLoading={isLoading}
      />

      <UpdateRoleDialog
        isOpen={isUpdateRoleDialogOpen}
        onOpenChange={setIsUpdateRoleDialogOpen}
        member={selectedMember}
        onUpdateRole={handleUpdateRole}
        isLoading={isLoading}
      />
    </>
  );
}
