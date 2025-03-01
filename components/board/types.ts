// Arquivo: /components/board/types.ts
// Tipos compartilhados entre os componentes do quadro

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type User = {
  id: string;
  name: string;
  image?: string | null;
};

export type Tag = {
  id: string;
  name: string;
  color?: string | null;
};

export type TaskTag = {
  tagId: string;
  tag: Tag;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: Date | null;
  estimate?: number | null;
  order: number;
  columnId: string;
  assignee?: User | null;
  assigneeId?: string | null;
  sprintId?: string | null;
  subtasks: SubTask[];
  tags: TaskTag[];
};

export type Column = {
  id: string;
  name: string;
  order: number;
  wipLimit?: number | null;
  tasks: Task[];
};

export type Sprint = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal?: string | null;
  status: string;
};

export type Board = {
  id: string;
  name: string;
  description?: string | null;
  columns: Column[];
  sprints: Sprint[];
};
