
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutGrid, Lock, RefreshCw, Database, Cloud, WifiOff, Zap, Sparkles } from 'lucide-react';
import { TaskItem, ViewType, Responsible } from './types';
import { db, isSupabaseConnected, supabase } from './services/supabaseService';
import ClientView from './components/ClientView.tsx';
import AdminView from './components/AdminView.tsx';

const ADMIN_PIN = "1234";
const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      console.log("🔥 beforeinstallprompt DISPARADO");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    console.log("deferredPrompt:", deferredPrompt);
  }, [deferredPrompt]);

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
      }}
      className="fixed bottom-5 right-5 z-[300] px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
    >
      Instalar App
    </button>
  );
};


const App: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [view, setView] = useState<ViewType>('CLIENT');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isCloud, setIsCloud] = useState(isSupabaseConnected());
  const [isLive, setIsLive] = useState(false);
  
  const isInitialLoad = useRef(true);

  const loadAllData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [t, r] = await Promise.all([db.getTasks(), db.getResponsibles()]);
      setTasks(t);
      setResponsibles(r);
      setIsCloud(isSupabaseConnected());
    } catch (e) {
      console.error("Error cargando base de datos", e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      loadAllData();
      isInitialLoad.current = false;
    }

    if (supabase) {
      const channel = supabase.channel('schema-db-changes');
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'task' }, () => loadAllData(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Responsables' }, () => loadAllData(true))
        .subscribe((status) => setIsLive(status === 'SUBSCRIBED'));

      return () => { supabase.removeChannel(channel); };
    }
  }, [loadAllData]);

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updatedTask = { ...task, check: !task.check };
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    try { await db.upsertTask(updatedTask); } catch (e) { loadAllData(true); }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdminAuthorized(true);
      setView('ADMIN');
      setShowPinModal(false);
      setPinInput("");
    } else {
      alert("PIN Incorrecto");
      setPinInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin" />
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="mt-6 font-extrabold text-slate-400 uppercase tracking-[0.3em] text-xs">Preparando tu espacio</p>
      </div>
    );
  }

  return (
   



    <div className="min-h-screen flex flex-col">
                  
 

    <InstallButton />

      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center transform hover:rotate-12 transition-transform cursor-pointer">
              <LayoutGrid className="text-white w-5 h-5" />
   
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Sync</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Workspace v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
              isCloud ? 'bg-indigo-50/50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <div className="relative">
                {isCloud ? <Cloud className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {isLive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {isCloud ? (isLive ? 'Sincronizado' : 'Nube Conectada') : 'Sin Conexión'}
              </span>
            </div>
            
            <nav className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
              <button onClick={() => setView('CLIENT')} className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${view === 'CLIENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Semana</button>
              <button onClick={() => isAdminAuthorized ? setView('ADMIN') : setShowPinModal(true)} className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${view === 'ADMIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Gestión</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {view === 'CLIENT' ? (
          <ClientView tasks={tasks} responsibles={responsibles} onToggleTask={toggleTask} />
        ) : (
          <AdminView tasks={tasks} responsibles={responsibles} onDataChange={() => loadAllData(true)} />
        )}
      </main>

      {showPinModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-indigo-50 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Zona Restringida</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Solo administradores autorizados</p>
            </div>
            <form onSubmit={verifyPin} className="space-y-5">
              <input 
                autoFocus 
                type="password" 
                maxLength={4} 
                placeholder="••••" 
                value={pinInput} 
                onChange={e => setPinInput(e.target.value)} 
                className="w-full text-center text-4xl py-5 bg-slate-50 border-2 rounded-3xl outline-none focus:ring-4 ring-indigo-500/10 border-slate-200 focus:border-indigo-500 tracking-[0.5em] transition-all font-mono" 
              />
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-extrabold rounded-3xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all">Desbloquear Panel</button>
              <button type="button" onClick={() => setShowPinModal(false)} className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 transition-colors">Volver al Calendario</button>
            </form>
          </div>
        </div>
      )}
    </div>
    
  );
  
};

export default App;