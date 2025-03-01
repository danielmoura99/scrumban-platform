// Tipos compartilhados entre os componentes do quadro
export type User = {
  id: string;
  name: string;
  image?: string | null;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
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
  // Conforme o schema prisma, tags é um array de strings
  tags: string[];
  assignee?: User | null;
  assigneeId?: string | null;
  columnId: string;
  sprintId?: string | null;
  subtasks: Subtask[];
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
