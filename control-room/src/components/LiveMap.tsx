"use client";
import React from "react";
import { Train, Station as StnIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Network {
  stations: any[];
  segments: any[];
}

interface LiveMapProps {
  network: Network;
  trains: any[];
}

export const LiveMap: React.FC<LiveMapProps> = ({ network, trains }) => {
  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <svg className="w-full h-full p-10" viewBox="0 0 1000 200">
        {/* Tracks */}
        {network.segments.map((seg, i) => {
          const from = network.stations.find((s) => s.id === seg.from_stn);
          const to = network.stations.find((s) => s.id === seg.to_stn);
          if (!from || !to) return null;
          return (
            <line
              key={seg.id}
              x1={from.coords.x + 50}
              y1={from.coords.y + 50}
              x2={to.coords.x + 50}
              y2={to.coords.y + 50}
              stroke="#334155"
              strokeWidth="4"
              strokeDasharray="8 4"
            />
          );
        })}

        {/* Stations */}
        {network.stations.map((stn) => (
          <g key={stn.id} transform={`translate(${stn.coords.x + 50}, ${stn.coords.y + 50})`}>
            <circle r="12" fill="#1e293b" stroke="#6366f1" strokeWidth="2" />
            <text
              y="-20"
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-medium"
            >
              {stn.name}
            </text>
          </g>
        ))}

        {/* Trains */}
        {trains.map((t) => {
          // Simplified position logic for visualization
          // STN_00 to STN_07 corresponds to x=0 to x=700
          const stnIdx = parseInt(t.current_stn.split("_")[1]);
          const x = stnIdx * 100 + (t.status === "MOVING" ? t.pos_km * 6.6 : 0) + 50;
          const y = 50 + 50;

          return (
            <motion.g
              key={t.id}
              animate={{ x, y }}
              transition={{ type: "spring", stiffness: 50 }}
            >
              <rect x="-10" y="-6" width="20" height="12" rx="2" fill={t.priority > 5 ? "#818cf8" : "#94a3b8"} />
              <circle cx="-4" cy="8" r="3" fill="#334155" />
              <circle cx="4" cy="8" r="3" fill="#334155" />
              <title>{t.name} ({t.status})</title>
            </motion.g>
          );
        })}
      </svg>

      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        Live Network Feed
      </div>
    </div>
  );
};
