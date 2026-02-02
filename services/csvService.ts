
import { TaskItem, Responsible } from '../types';

const TASKS_HEADER = "id,responsableId,tarea,fecha,check,updatedAt\n";
const RESP_HEADER = "id,nombre,color,updatedAt\n";

const cleanId = (id: string | number | null): number | null => {
  if (id === null || id === undefined) return null;
  if (typeof id === 'number') return id;
  const cleaned = String(id).replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : null;
};

export const parseTasksCSV = (csvContent: string): TaskItem[] => {
  const lines = csvContent.split('\n');
  if (lines.length <= 1) return [];
  const dataLines = lines.slice(1).filter(line => line.trim() !== "");
  
  return dataLines.map((line) => {
    const [id, responsableId, tarea, fecha, check, updatedAt] = line.split(',');
    return {
      id: cleanId(id) || (Date.now() + Math.random()),
      responsableId: cleanId(responsableId),
      tarea: (tarea || "").trim(),
      fecha: (fecha || "").trim(),
      check: check?.trim().toLowerCase() === 'true' || check?.trim() === 'COMPLETADA',
      updatedAt: updatedAt ? updatedAt.trim() : new Date().toISOString()
    };
  });
};

export const generateTasksCSV = (tasks: TaskItem[]): string => {
  const csvRows = tasks.map(task => 
    `${task.id},${task.responsableId},${task.tarea},${task.fecha},${task.check},${task.updatedAt || new Date().toISOString()}`
  );
  return TASKS_HEADER + csvRows.join('\n');
};

export const parseRespCSV = (csvContent: string): Responsible[] => {
  const lines = csvContent.split('\n');
  if (lines.length <= 1) return [];
  const dataLines = lines.slice(1).filter(line => line.trim() !== "");
  
  return dataLines.map((line) => {
    const [id, nombre, color, updatedAt] = line.split(',');
    return {
      id: cleanId(id) || Date.now(),
      nombre: (nombre || "").trim(),
      color: (color || "#fef08a").trim(),
      updatedAt: updatedAt ? updatedAt.trim() : new Date().toISOString()
    };
  });
};

export const generateRespCSV = (resps: Responsible[]): string => {
  const csvRows = resps.map(r => `${r.id},${r.nombre},${r.color},${r.updatedAt || new Date().toISOString()}`);
  return RESP_HEADER + csvRows.join('\n');
};

export const localDB = {
  saveTasks: (tasks: TaskItem[]) => {
    localStorage.setItem('db_tasks', JSON.stringify(tasks));
  },
  loadTasks: (): TaskItem[] | null => {
    const data = localStorage.getItem('db_tasks');
    return data ? JSON.parse(data) : null;
  },
  saveResponsibles: (resps: Responsible[]) => {
    localStorage.setItem('db_responsibles', JSON.stringify(resps));
  },
  loadResponsibles: (): Responsible[] | null => {
    const data = localStorage.getItem('db_responsibles');
    return data ? JSON.parse(data) : null;
  }
};
