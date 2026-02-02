
export interface Responsible {
  id: number;
  nombre: string;
  color: string;
  avatar?: string; // Imagen en base64 o URL
  updatedAt?: string;
}

export interface TaskItem {
  id: number;
  responsableId: number | null;
  tarea: string;
  fecha: string;
  check: boolean;
  updatedAt?: string;
}

export type ViewType = 'CLIENT' | 'ADMIN';

export interface GroupedTasks {
  [date: string]: {
    [responsableId: string]: TaskItem[];
  };
}
