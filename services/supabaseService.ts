
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TaskItem, Responsible } from '../types';

const envUrl = process.env.Project_URL;
const envKey = process.env.Anon_Key || process.env.Publishable_Key;

export let supabase: SupabaseClient | null = null;

if (envUrl && envKey && envUrl !== "undefined" && envKey !== "undefined") {
  try {
    supabase = createClient(envUrl, envKey);
  } catch (err) {
    console.error("Supabase init error", err);
  }
}

export const isSupabaseConnected = () => !!supabase;

const TEMP_ID_THRESHOLD = 1000000000000; 

export const db = {
  async getTasks(): Promise<TaskItem[]> {
    if (!supabase) return JSON.parse(localStorage.getItem('db_tasks') || '[]');
    try {
      const { data, error } = await supabase.from('task').select('*').order('fecha', { ascending: true });
      if (error) throw error;
      
      return (data as any[]).map(t => ({
        id: Number(t.id),
        responsableId: t.responsableId ? Number(t.responsableId) : null,
        tarea: t.tarea || "",
        fecha: t.fecha,
        check: !!t.check,
        updatedAt: t.updatedAt
      })) as TaskItem[];
    } catch (err) {
      console.warn("Using local tasks fallback due to error:", err);
      return JSON.parse(localStorage.getItem('db_tasks') || '[]');
    }
  },

  async getResponsibles(): Promise<Responsible[]> {
    if (!supabase) return JSON.parse(localStorage.getItem('db_responsibles') || '[]');
    try {
      const { data, error } = await supabase.from('Responsables').select('*').order('id', { ascending: true });
      if (error) throw error;
      return (data as any[]).map(r => ({ ...r, id: Number(r.id) })) as Responsible[];
    } catch (err) {
      return JSON.parse(localStorage.getItem('db_responsibles') || '[]');
    }
  },

  async upsertTask(task: TaskItem) {
    const tasks = JSON.parse(localStorage.getItem('db_tasks') || '[]');
    const idx = tasks.findIndex((t: any) => t.id === task.id);
    if (idx > -1) tasks[idx] = task; else tasks.push(task);
    localStorage.setItem('db_tasks', JSON.stringify(tasks));

    if (!supabase) return;
    
    const isNew = Number(task.id) >= TEMP_ID_THRESHOLD;
    const payload: any = {
      "responsableId": task.responsableId ? Number(task.responsableId) : null,
      "tarea": task.tarea,
      "fecha": task.fecha,
      "check": !!task.check,
      "updatedAt": new Date().toISOString()
    };

    if (!isNew) payload.id = Number(task.id);

    try {
      const { error } = await supabase.from('task').upsert(payload);
      if (error) throw error;
    } catch (e) {
      console.error("Error al guardar tarea:", e);
    }
  },

  async deleteTask(id: number) {
    const tasks = JSON.parse(localStorage.getItem('db_tasks') || '[]');
    localStorage.setItem('db_tasks', JSON.stringify(tasks.filter((t: any) => t.id !== id)));
    if (!supabase) return;
    try {
      await supabase.from('task').delete().eq('id', id);
    } catch (e) { console.error(e); }
  },

  async upsertResponsible(resp: Responsible) {
    const resps = JSON.parse(localStorage.getItem('db_responsibles') || '[]');
    const idx = resps.findIndex((r: any) => r.id === resp.id);
    if (idx > -1) resps[idx] = resp; else resps.push(resp);
    localStorage.setItem('db_responsibles', JSON.stringify(resps));

    if (!supabase) return;
    const isNew = Number(resp.id) >= TEMP_ID_THRESHOLD;
    const payload: any = { nombre: resp.nombre, color: resp.color, avatar: resp.avatar };
    if (!isNew) payload.id = Number(resp.id);
    try {
      await supabase.from('Responsables').upsert(payload);
    } catch (e) { console.error(e); }
  },

  async deleteResponsible(id: number) {
    const resps = JSON.parse(localStorage.getItem('db_responsibles') || '[]');
    localStorage.setItem('db_responsibles', JSON.stringify(resps.filter((r: any) => r.id !== id)));
    if (!supabase) return;
    try {
      await supabase.from('Responsables').delete().eq('id', id);
    } catch (e) { console.error(e); }
  }
};
