"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LiveMap } from "@/components/LiveMap";
import { MetricsSidebar } from "@/components/MetricsSidebar";
import { DecisionLog } from "@/components/DecisionLog";
import { Play, Square, FastForward, Settings2, Train, Database } from "lucide-react";

export default function Dashboard() {
  const [network, setNetwork] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [mode, setMode] = useState("UNOPTIMIZED");
  const [isPlaying, setIsPlaying] = useState(false);
  const [decisions, setDecisions] = useState<any[]>([]);

  const API_BASE = "http://localhost:8000/api";

  // Polling for live state
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(async () => {
        try {
          const res = await axios.post(`${API_BASE}/simulate/tick`);
          setState(res.data);
          
          // Mock some decisions for the aesthetic (in real app, fetched from API)
          if (res.data.time % 10 === 0 && mode === "AI_OPTIMIZED") {
            setDecisions(prev => [
              { id: Math.random().toString(), time: res.data.time, message: `System Action: Optimized ${res.data.trains.length} trains`, type: 'ACTION' },
              ...prev
            ].slice(0, 50));
          }
        } catch (e) {
          console.error("Scale error", e);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  // Initial network fetch
  useEffect(() => {
    const fetchMeta = async () => {
      const res = await axios.get(`${API_BASE}/network`);
      setNetwork(res.data);
      const stateRes = await axios.get(`${API_BASE}/state`);
      setState(stateRes.data);
    };
    fetchMeta();
  }, []);

  const toggleMode = async () => {
    const newMode = mode === "UNOPTIMIZED" ? "AI_OPTIMIZED" : "UNOPTIMIZED";
    await axios.put(`${API_BASE}/mode?mode=${newMode}`);
    setMode(newMode);
    if (newMode === "AI_OPTIMIZED") {
      setDecisions(prev => [{ id: "init", time: state?.time || 0, message: "AI Engine Initialized: Running Look-Ahead Solver", type: 'INFO' }, ...prev]);
    }
  };

  if (!network || !state) return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">
      Initializing Aahavaan Control Center...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              Project Aahavaan
            </h1>
            <span className="bg-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              v1.0 - Digital Twin
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Indian Railways Decision Support Simulation</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                isPlaying ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {isPlaying ? <Square size={14} /> : <Play size={14} />}
              {isPlaying ? "HALT" : "RESUME"}
            </button>
          </div>

          <button 
            onClick={toggleMode}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border shadow-lg ${
              mode === "AI_OPTIMIZED" 
              ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20" 
              : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <Settings2 size={14} />
            {mode === "AI_OPTIMIZED" ? "AI Mode ACTIVE" : "Manual Mode"}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-180px)]">
        {/* Map Area */}
        <div className="col-span-8 flex flex-col gap-6">
          <LiveMap network={network} trains={state.trains} />
          
          <div className="grid grid-cols-3 gap-6">
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-lg shadow-black/50">
               <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                 <Train className="text-indigo-400" size={20} />
               </div>
               <div>
                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Active Trains</p>
                 <p className="text-xl font-bold text-white">{state.trains.filter((t:any) => !t.completed).length}</p>
               </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-lg shadow-black/50">
               <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                 <Database className="text-indigo-400" size={20} />
               </div>
               <div>
                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Zone Capacity</p>
                 <p className="text-xl font-bold text-white">92.4%</p>
               </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-lg shadow-black/50">
               <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                 <Play className="text-emerald-400" size={20} />
               </div>
               <div>
                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Sim Time</p>
                 <p className="text-xl font-bold text-white">{state.time || 0}m</p>
               </div>
             </div>
          </div>
        </div>

        {/* Analytics & Decisions */}
        <div className="col-span-4 flex flex-col gap-6">
          <MetricsSidebar 
            delayUnoptimized={mode === "UNOPTIMIZED" ? state.trains.reduce((acc:any, t:any) => acc + t.delay_min, 0) : 1554} 
            delayOptimized={mode === "AI_OPTIMIZED" ? state.trains.reduce((acc:any, t:any) => acc + t.delay_min, 0) : 4218}
            mode={mode} 
          />
          <DecisionLog decisions={decisions} />
        </div>
      </div>
    </div>
  );
}
