
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, CheckCircle2, Circle, CalendarDays, User } from 'lucide-react';
import { TaskItem, Responsible } from '../types';

interface ClientViewProps {
  tasks: TaskItem[];
  responsibles: Responsible[];
  onToggleTask: (id: number) => void;
}

const ClientView: React.FC<ClientViewProps> = ({ tasks, responsibles, onToggleTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const toISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const weekStart = new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0);
    return weekStart;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const getResp = (id: number | null) => responsibles.find(r => r.id === id);
  const isToday = (date: Date) => toISODate(date) === toISODate(new Date());

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Encabezado Responsables */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-6 p-6 bg-white/30 backdrop-blur-sm rounded-[3rem] border border-white/50 shadow-lg">
          {responsibles.map((r) => (
            <div key={r.id} className="flex flex-col items-center gap-2 group transition-transform hover:scale-110">
              <div 
                className="w-16 h-16 rounded-full p-1 shadow-md border-2" 
                style={{ borderColor: r.color, backgroundColor: 'white' }}
              >
                {r.avatar ? (
                  <img src={r.avatar} alt={r.nombre} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                {r.nombre}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
            <CalendarDays className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {startOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Planificador Semanal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-500 active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-6 text-[10px] font-black hover:text-indigo-600 uppercase tracking-[0.2em] text-slate-500 transition-colors">HOY</button>
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-500 active:scale-90"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
        {weekDays.map((day, idx) => {
          const dateStr = toISODate(day);
          const dayTasks = tasks.filter(t => t.fecha === dateStr);
          const today = isToday(day);
          
          return (
            <div key={dateStr} 
                 className={`group flex flex-col gap-6 p-4 rounded-[2.5rem] border-2 transition-all min-h-[400px] ${
                   today 
                   ? 'bg-indigo-50/40 border-indigo-200 ring-[12px] ring-indigo-500/5' 
                   : 'bg-white/30 border-white hover:border-slate-200'
                 }`}
                 style={{ animationDelay: `${idx * 50}ms` }}>
              
              <div className="text-center relative">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${today ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                </p>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-black transition-all ${
                  today ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-700'
                }`}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-8 flex-1">
                {dayTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="w-1 h-1 bg-slate-400 rounded-full mb-1" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full mb-1" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  </div>
                ) : (
                  dayTasks.map((task, tIdx) => {
                    const resp = getResp(task.responsableId);
                    const rotation = (task.id % 4) - 2; 
                    
                    return (
                      <button
                        key={task.id}
                        onClick={() => onToggleTask(task.id)}
                        className={`group/item relative w-full text-left px-5 py-7 rounded-2xl post-it-shadow transition-all hover:-translate-y-2 hover:scale-[1.02] active:scale-95 border-b-4 border-black/10 flex flex-col gap-4 ${
                          task.check ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : ''
                        }`}
                        style={{ 
                          backgroundColor: resp?.color || '#f1f5f9',
                          transform: !task.check ? `rotate(${rotation}deg)` : 'none',
                          transitionDelay: `${tIdx * 30}ms`
                        }}
                      >
                        {/* Washi Tape mejorada */}
                        <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-[70px] h-[22px] bg-white/40 backdrop-blur-[2px] border-x-2 border-dashed border-black/5 rotate-[-1deg] z-10" style={{ opacity: task.check ? 0.3 : 0.8 }} />
                        
                        {/* Sticker del Responsable */}
                        {resp?.avatar && (
                          <div className="absolute -top-4 -right-2 w-10 h-10 rounded-full border-2 border-white shadow-lg rotate-[8deg] z-30 overflow-hidden bg-white group-hover/item:rotate-[12deg] transition-transform">
                            <img src={resp.avatar} className="w-full h-full object-cover" alt={resp.nombre} />
                          </div>
                        )}

                        <div className="flex justify-between items-start w-full gap-2 relative z-20">
                          <div className="flex flex-col">
                            <span className="font-handwriting text-[13px] font-bold text-black/80 truncate uppercase tracking-tight leading-none">
                              {resp?.nombre || 'SIN ASIGNAR'}
                            </span>
                            <div className="w-full h-[2px] bg-black/10 mt-1 rounded-full" />
                          </div>
                          {task.check ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-black/10 shrink-0 group-hover/item:text-black/30 transition-colors" />
                          )}
                        </div>
                        
                        <p className={`font-handwriting text-[15px] leading-tight text-slate-900 font-bold pr-2 ${
                          task.check ? 'line-through decoration-black/40 text-slate-600' : ''
                        }`}>
                          {task.tarea}
                        </p>

                        {task.check && (
                          <div className="absolute -bottom-3 -right-3 animate-float pointer-events-none">
                            <Star className="w-8 h-8 text-amber-500 fill-amber-400 rotate-12 drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientView;
