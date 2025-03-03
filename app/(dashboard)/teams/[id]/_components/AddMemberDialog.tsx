//app/(dashboard)/teams/[id]/_components/AddMemberDialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserCheck, UserX } from "lucide-react";
import { addMember, searchUsers } from "../_actions/member-actions";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type AddMemberDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  existingMemberIds: string[];
};

export default function AddMemberDialog({
  isOpen,
  onOpenChange,
  teamId,
  existingMemberIds,
}: AddMemberDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Resetar estado quando o diálogo abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setSelectedUserId("");
      setRole("member");
      setError("");
    }
  }, [isOpen]);

  // Procurar usuários quando o termo de busca mudar
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const users = await searchUsers(searchTerm);

      // Filtrar usuários que já são membros
      const filteredUsers = users.filter(
        (user) => !existingMemberIds.includes(user.id)
      );

      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Adicionar membro à equipe
  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError("Selecione um usuário para adicionar à equipe");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await addMember(teamId, {
        userId: selectedUserId,
        role,
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao adicionar o membro"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          {/* Busca de usuários */}
          <div className="grid gap-2">
            <Label>Buscar usuário</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite nome ou e-mail"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={!searchTerm.trim() || isSearching}
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Resultados da busca */}
          {isSearching ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Buscando usuários...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="border rounded-md max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                    selectedUserId === user.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  {selectedUserId === user.id ? (
                    <UserCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <UserX className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm && !isSearching ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          ) : null}

          {/* Seleção de função */}
          {selectedUserId && (
            <div className="grid gap-2 mt-2">
              <Label htmlFor="role">Função</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                <strong>Administrador:</strong> Pode gerenciar membros e quadros
                da equipe.
                <br />
                <strong>Membro:</strong> Pode visualizar e colaborar nos quadros
                da equipe.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAddMember}
            disabled={isLoading || !selectedUserId}
          >
            {isLoading ? "Adicionando..." : "Adicionar Membro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
