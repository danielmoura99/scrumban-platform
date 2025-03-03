//app/(dashboard)/boards/[id]/_components/TaskDetailDialog.tsx

"use client";

import { useState, useEffect } from "react"; // Adicionei useEffect
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Task, Column } from "./types";
import {
  //CalendarIcon,
  User2Icon,
  //CheckSquare,
  //MessageSquare,
  Clock,
  //TagIcon,
} from "lucide-react";
import {
  updateTask,
  createSubtask,
  toggleSubtask,
  addCommentToTask,
} from "../_actions/task-actions";
import { useRouter } from "next/navigation";

type TaskDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  columns: Column[];
  users: { id: string; name: string }[];
};

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  columns,
  users,
}: TaskDetailDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [editMode, setEditMode] = useState(false);

  // Estados para campos editáveis
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [columnId, setColumnId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newComment, setNewComment] = useState("");

  // Atualizar estados quando a tarefa muda
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setColumnId(task.columnId);
      setAssigneeId(task.assigneeId || "");
    }
  }, [task]);

  if (!task) return null;

  const handleSaveChanges = async () => {
    if (!task) return;

    try {
      setIsLoading(true);
      await updateTask(task.id, {
        title,
        description,
        priority,
        columnId,
        assigneeId: assigneeId || undefined,
      });
      setEditMode(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!task || !newSubtaskTitle.trim()) return;

    try {
      setIsLoading(true);
      await createSubtask(task.id, { title: newSubtaskTitle });
      setNewSubtaskTitle("");
      router.refresh();
    } catch (error) {
      console.error("Erro ao adicionar subtarefa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    if (!task) return;

    try {
      setIsLoading(true);
      await toggleSubtask(subtaskId, completed);
      router.refresh();
    } catch (error) {
      console.error("Erro ao alterar status da subtarefa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;

    try {
      setIsLoading(true);
      await addCommentToTask(task.id, { content: newComment });
      setNewComment("");
      router.refresh();
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcula progresso das subtarefas
  const subtaskProgress =
    task.subtasks.length > 0
      ? Math.round(
          (task.subtasks.filter((st) => st.completed).length /
            task.subtasks.length) *
            100
        )
      : 0;

  // Verificar se as propriedades opcionais existem e usar valores padrão
  const comments = task.comments || [];
  const activities = task.activities || [];
  const createdAtStr = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString()
    : "Data desconhecida";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {editMode ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-bold mb-2"
                />
              ) : (
                <DialogTitle className="text-xl">{task.title}</DialogTitle>
              )}
              <div className="text-sm text-gray-500">
                ID: {task.id.substring(0, 8)} • Criado em: {createdAtStr}
              </div>
            </div>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                  >
                    Salvar
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="subtasks">Subtarefas</TabsTrigger>
            <TabsTrigger value="comments">Comentários</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          {/* Detalhes */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Status / Coluna */}
              <div>
                <Label className="text-sm text-gray-500 mb-1 block">
                  Status
                </Label>
                {editMode ? (
                  <Select value={columnId} onValueChange={setColumnId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {columns.find((col) => col.id === task.columnId)?.name ||
                      "Não definido"}
                  </div>
                )}
              </div>

              {/* Prioridade */}
              <div>
                <Label className="text-sm text-gray-500 mb-1 block">
                  Prioridade
                </Label>
                {editMode ? (
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={`
                    ${priority === "low" ? "bg-gray-100 text-gray-800" : ""}
                    ${priority === "medium" ? "bg-blue-100 text-blue-800" : ""}
                    ${
                      priority === "high" ? "bg-orange-100 text-orange-800" : ""
                    }
                    ${priority === "urgent" ? "bg-red-100 text-red-800" : ""}
                  `}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                )}
              </div>

              {/* Responsável */}
              <div>
                <Label className="text-sm text-gray-500 mb-1 block">
                  Responsável
                </Label>
                {editMode ? (
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Atribuir a alguém" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não atribuído</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center">
                    <User2Icon size={16} className="mr-1" />
                    {task.assignee?.name || "Não atribuído"}
                  </div>
                )}
              </div>

              {/* Data de vencimento */}
              <div>
                <Label className="text-sm text-gray-500 mb-1 block">
                  Data de vencimento
                </Label>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "Não definida"}
                </div>
              </div>

              {/* Tags */}
              <div className="col-span-2">
                <Label className="text-sm text-gray-500 mb-1 block">Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Nenhuma tag</span>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-sm text-gray-500 mb-1 block">
                Descrição
              </Label>
              {editMode ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva a tarefa em detalhes..."
                  rows={5}
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded min-h-[100px] whitespace-pre-wrap">
                  {task.description || "Sem descrição"}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Subtarefas */}
          <TabsContent value="subtasks">
            <div className="space-y-4">
              {/* Progresso */}
              {task.subtasks.length > 0 && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Progresso</span>
                    <span className="text-sm">{subtaskProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${subtaskProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Lista de subtarefas */}
              <div className="space-y-2">
                {task.subtasks.length > 0 ? (
                  task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={subtask.id}
                        checked={subtask.completed}
                        onCheckedChange={(checked) =>
                          handleToggleSubtask(subtask.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={subtask.id}
                        className={`text-sm ${
                          subtask.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {subtask.title}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    Nenhuma subtarefa
                  </div>
                )}
              </div>

              {/* Adicionar subtarefa */}
              <div className="flex gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Nova subtarefa..."
                  className="flex-1"
                />
                <Button
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim() || isLoading}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Comentários */}
          <TabsContent value="comments">
            <div className="space-y-4">
              {/* Lista de comentários */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    Nenhum comentário
                  </div>
                )}
              </div>

              {/* Adicionar comentário */}
              <div className="flex flex-col gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                  className="self-end"
                >
                  Comentar
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Atividade */}
          <TabsContent value="activity">
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-2 py-2 border-b">
                    <div className="text-gray-400 min-w-[100px] text-xs">
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      {activity.action === "created" && "criou esta tarefa"}
                      {activity.action === "updated" && "atualizou esta tarefa"}
                      {activity.action === "moved" &&
                        `moveu esta tarefa ${activity.details || ""}`}
                      {activity.action === "commented" &&
                        "comentou nesta tarefa"}
                      {activity.action === "completed" &&
                        "marcou esta tarefa como concluída"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Nenhuma atividade registrada
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
