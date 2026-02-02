
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trash2, Plus, Search, UserPlus, X, Database, RefreshCw, AlertCircle, CheckCircle, Clock, Camera, Edit2 } from 'lucide-react';
import { TaskItem, Responsible } from '../types';
import { db, isSupabaseConnected } from '../services/supabaseService';

interface AdminViewProps {
  tasks: TaskItem[];
  responsibles: Responsible[];
  onDataChange: () => void;
}

const EditableTaskRow: React.FC<{
  task: TaskItem;
  responsibles: Responsible[];
  onUpdate: (id: number, updates: Partial<TaskItem>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = ({ task, responsibles, onUpdate, onDelete }) => {
  const [localTarea, setLocalTarea] = useState(task.tarea);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setLocalTarea(task.tarea);
  }, [task.tarea, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (localTarea !== task.tarea) onUpdate(task.id, { tarea: localTarea });
  };

  const currentResp = responsibles.find(r => r.id === task.responsableId);

  return (
    <tr className="group hover:bg-indigo-50/30 transition-all duration-300">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center">
                {currentResp?.avatar ? (
                  <img src={currentResp.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: currentResp?.color || '#e2e8f0' }} />
                )}
             </div>
          </div>
          <select 
            value={task.responsableId || ''} 
            onChange={e => onUpdate(task.id, { responsableId: e.target.value ? Number(e.target.value) : null })} 
            className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer hover:text-indigo-600 focus:text-indigo-600 text-sm transition-colors"
          >
            <option value="">(Sin asignar)</option>
            {responsibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
      </td>
      <td className="px-6 py-5">
        <input 
          type="text" 
          value={localTarea} 
          onFocus={() => setIsFocused(true)}
          onChange={e => setLocalTarea(e.target.value)} 
          onBlur={handleBlur}
          className={`w-full bg-transparent border-none outline-none text-sm font-semibold transition-all ${
            task.check ? 'text-slate-400 line-through' : 'text-slate-700 focus:text-indigo-600'
          }`} 
        />
      </td>
      <td className="px-6 py-5">
        <input 
          type="date" 
          value={task.fecha} 
          onChange={e => onUpdate(task.id, { fecha: e.target.value })} 
          className="bg-slate-100/50 px-3 py-1 rounded-lg border-none outline-none text-[10px] text-slate-500 font-extrabold uppercase tracking-wider cursor-pointer hover:bg-slate-200/50 transition-colors" 
        />
      </td>
      <td className="px-6 py-5 text-center">
        <button 
          onClick={() => onUpdate(task.id, { check: !task.check })} 
          className={`group/status inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
            task.check 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' 
            : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600'
          }`}
        >
          {task.check ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {task.check ? 'Listo' : 'Pendiente'}
        </button>
      </td>
      <td className="px-6 py-5 text-right">
        <button 
          onClick={() => onDelete(task.id)} 
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

const AdminView: React.FC<AdminViewProps> = ({ tasks, responsibles, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<string | number>('ALL');
  const [search, setSearch] = useState('');
  const [showAddResp, setShowAddResp] = useState(false);
  const [editingResp, setEditingResp] = useState<Responsible | null>(null);
  const [newResp, setNewResp] = useState({ nombre: '', color: '#bae6fd', avatar: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (activeTab !== 'ALL') result = result.filter(t => t.responsableId === activeTab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => t.tarea.toLowerCase().includes(s));
    }
    return result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [tasks, activeTab, search]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onDataChange();
    setIsRefreshing(false);
  };

  const handleAddTask = async () => {
    const respId = activeTab === 'ALL' ? (responsibles[0]?.id || null) : (activeTab as number);
    const newTask: TaskItem = {
      id: Date.now(),
      responsableId: respId,
      tarea: 'Nueva tarea...',
      fecha: new Date().toISOString().split('T')[0],
      check: false,
    };
    await db.upsertTask(newTask);
  };

  const updateTask = async (id: number, updates: Partial<TaskItem>) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const hasChanges = Object.keys(updates).some(key => (updates as any)[key] !== (task as any)[key]);
      if (hasChanges) await db.upsertTask({ ...task, ...updates });
    }
  };

  const deleteTask = async (id: number) => {
    if (confirm("¿Eliminar tarea permanentemente?")) await db.deleteTask(id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (editingResp) {
        setEditingResp({ ...editingResp, avatar: base64String });
      } else {
        setNewResp({ ...newResp, avatar: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveResp = async () => {
    if (editingResp) {
      if (!editingResp.nombre.trim()) return;
      await db.upsertResponsible(editingResp);
      setEditingResp(null);
    } else {
      if (!newResp.nombre.trim()) return;
      await db.upsertResponsible({ id: Date.now(), nombre: newResp.nombre, color: newResp.color, avatar: newResp.avatar });
      setNewResp({ nombre: '', color: '#bae6fd', avatar: '' });
      setShowAddResp(false);
    }
  };

  const deleteResponsible = async (id: number) => {
    if (confirm("¿Eliminar responsable?")) await db.deleteResponsible(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${isSupabaseConnected() ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Estado del Servidor</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isSupabaseConnected() ? 'Base de datos en tiempo real' : 'Almacenamiento local'}
              </p>
            </div>
          </div>
          <button onClick={handleManualRefresh} disabled={isRefreshing} className="p-4 bg-white hover:bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90 disabled:opacity-50">
            <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 flex flex-col justify-center">
          <p className="text-indigo-100 text-xs font-extrabold uppercase tracking-widest mb-1">Total Tareas</p>
          <p className="text-4xl font-black text-white">{tasks.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('ALL')} 
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Todos
          </button>
          {responsibles.map(r => (
            <div key={r.id} className="relative group flex-shrink-0">
              <button 
                onClick={() => setActiveTab(r.id)} 
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${
                  activeTab === r.id ? 'bg-white text-indigo-600 shadow-md border-slate-200' : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-white shrink-0">
                  {r.avatar ? <img src={r.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: r.color }} />}
                </div>
                {r.nombre}
              </button>
              <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setEditingResp(r)} className="p-1.5 bg-white border border-slate-100 rounded-full text-indigo-500 shadow-sm hover:bg-indigo-50 hover:scale-110">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => deleteResponsible(r.id)} className="p-1.5 bg-white border border-slate-100 rounded-full text-red-500 shadow-sm hover:bg-red-50 hover:scale-110">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => { setNewResp({ nombre: '', color: '#bae6fd', avatar: '' }); setShowAddResp(true); }} className="w-12 h-12 flex items-center justify-center text-indigo-600 hover:bg-white hover:shadow-sm rounded-2xl transition-all active:scale-90">
            <UserPlus className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar tareas por título..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-14 pr-8 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-indigo-500 focus:ring-4 ring-indigo-500/5 outline-none text-sm transition-all font-medium" 
            />
          </div>
          <button 
            onClick={handleAddTask} 
            className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white font-extrabold rounded-[2rem] shadow-xl hover:bg-black hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Nueva Tarea
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-y border-slate-100">
                <th className="px-10 py-5">Responsable</th>
                <th className="px-6 py-5">Descripción de Tarea</th>
                <th className="px-6 py-5">Vencimiento</th>
                <th className="px-6 py-5 text-center">Estado</th>
                <th className="px-10 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Clock className="w-12 h-12 mb-4" />
                      <p className="font-extrabold uppercase tracking-widest text-xs">No hay tareas que mostrar</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <EditableTaskRow 
                    key={task.id} 
                    task={task} 
                    responsibles={responsibles} 
                    onUpdate={updateTask} 
                    onDelete={deleteTask}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Añadir / Editar Responsable */}
      {(showAddResp || editingResp) && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md space-y-10 animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="text-center">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingResp ? 'Editar Perfil' : 'Nuevo Responsable'}</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Personaliza la apariencia del responsable</p>
            </div>
            
            <div className="space-y-8">
              {/* Imagen del Perfil */}
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-24 h-24 rounded-full border-4 border-indigo-50 shadow-lg overflow-hidden bg-slate-100"
                >
                  {(editingResp?.avatar || newResp.avatar) ? (
                    <img src={editingResp ? editingResp.avatar : newResp.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Foto del Sticker</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre Completo</label>
                <input 
                  type="text" 
                  autoFocus
                  value={editingResp ? editingResp.nombre : newResp.nombre} 
                  onChange={e => editingResp ? setEditingResp({...editingResp, nombre: e.target.value}) : setNewResp({ ...newResp, nombre: e.target.value })} 
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500 transition-all font-bold text-slate-800" 
                  placeholder="Ej. Juan Pérez" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Color de Identificación</label>
                <div className="flex gap-3 flex-wrap justify-center">
                  {['#bae6fd', '#fef08a', '#bbf7d0', '#ffccae', '#e9d5ff', '#fda4af', '#fecaca', '#e2e8f0'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => editingResp ? setEditingResp({...editingResp, color: c}) : setNewResp({ ...newResp, color: c })} 
                      className={`w-12 h-12 rounded-2xl transition-all transform hover:scale-110 active:scale-90 ${
                        (editingResp ? editingResp.color : newResp.color) === c ? 'ring-4 ring-indigo-500 ring-offset-4 scale-110 shadow-lg' : 'shadow-sm'
                      }`} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => { setShowAddResp(false); setEditingResp(null); }} className="flex-1 py-5 bg-slate-100 text-slate-600 font-extrabold rounded-[2rem] hover:bg-slate-200 transition-all">Cancelar</button>
                <button onClick={handleSaveResp} className="flex-1 py-5 bg-indigo-600 text-white font-extrabold rounded-[2rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
