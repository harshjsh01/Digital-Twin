'use client';

import React, { useState, useEffect } from 'react';
import { CommandHeader } from '@/components/header/CommandHeader';
import { passengerApi } from '@/lib/api/api';
import {
  PassengerTrainSearchResult,
  PassengerTrainStatus,
  PassengerWhyStoppedResponse,
} from '@/lib/api/types';
import {
  Search,
  Train,
  Gauge,
  MapPin,
  Clock,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function PassengerPortalPage() {
  const [searchQuery, setSearchQuery] = useState('14632');
  const [searchResults, setSearchResults] = useState<PassengerTrainSearchResult[]>([]);
  const [selectedTrainId, setSelectedTrainId] = useState<string>('14632');
  const [trainStatus, setTrainStatus] = useState<PassengerTrainStatus | null>(null);
  const [whyStopped, setWhyStopped] = useState<PassengerWhyStoppedResponse | null>(null);
  const [hasAahavaanPass, setHasAahavaanPass] = useState(true);
  const [loading, setLoading] = useState(false);

  // Initial load
  useEffect(() => {
    handleSearch(searchQuery);
  }, []);

  // Fetch train status & why stopped whenever selected train changes
  useEffect(() => {
    if (selectedTrainId) {
      passengerApi.getTrainStatus(selectedTrainId).then((st) => setTrainStatus(st));
      passengerApi.getWhyStopped(selectedTrainId).then((ws) => setWhyStopped(ws));
    }
  }, [selectedTrainId]);

  const handleSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await passengerApi.searchTrains(q);
      setSearchResults(res.results || []);
      if (res.results && res.results.length > 0 && !res.results.find((t) => t.number === selectedTrainId)) {
        setSelectedTrainId(res.results[0].number);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Navigation Header */}
      <CommandHeader minute={31} phase="SIMULATING" />

      {/* Main Passenger Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1424] to-[#0a101d] border border-cyan-500/20 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xl font-bold font-mono text-white tracking-wide">
                AAHAVAAN PASSENGER TELEMETRY & WAIT LOGS
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1 max-w-2xl">
              Real-time corridor journey progress, operational precedence diagnostics, and transparent explainability when your train is stationary.
            </p>
          </div>

          {/* x402 Pass Status Pill */}
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <div className="text-xs font-mono">
              <span className="text-zinc-400 block text-[10px]">x402 PASS STATUS:</span>
              <span className={hasAahavaanPass ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                {hasAahavaanPass ? 'VERIFIED ACTIVE (₹9/MO)' : 'NO PASS'}
              </span>
            </div>
            <button
              onClick={() => setHasAahavaanPass(!hasAahavaanPass)}
              className="text-[10px] font-mono underline text-zinc-400 hover:text-white ml-2"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-xl bg-[#0c0f17] border border-white/10 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search train by number (e.g. 14632, 12804, 22416) or name..."
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition shadow-md"
            >
              TRACK TRAIN
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-2 mt-3 text-xs font-mono text-zinc-400">
            <span className="text-[10px] text-zinc-400 uppercase">Hero Trains:</span>
            {['14632', '12804', '22416', '12401'].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setSearchQuery(num);
                  setSelectedTrainId(num);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] border transition ${
                  selectedTrainId === num
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Train Overview Cards & Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Train Selector & Telemetry */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0c0f17] border border-white/10 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    {trainStatus?.train_name || 'Amritsar Passenger'}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    TRAIN #{trainStatus?.train_number || '14632'}
                  </span>
                </div>
              </div>

              {/* Digital Gauges */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono uppercase mb-1">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    Current Speed
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {trainStatus?.speed_kmph || 0} <span className="text-xs text-zinc-500 font-normal">km/h</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono uppercase mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Accumulated Delay
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-300">
                    +{trainStatus?.delay_min || 0} <span className="text-xs text-zinc-500 font-normal">min</span>
                  </div>
                </div>
              </div>

              {/* Current Block Location */}
              <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  Active Track Circuit:
                </span>
                <strong className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {trainStatus?.current_block || 'Block B17-LOOP'}
                </strong>
              </div>

              {/* Status Banner */}
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Status: {trainStatus?.status || 'HOLDING IN LOOP SIDING'}</span>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Explainable "Why is My Train Stopped?" Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#0c0f17] border border-cyan-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 border-b border-l border-cyan-500/40 text-[10px] font-mono text-cyan-300 uppercase font-semibold">
                RFC HTTP 402 EXPLAINABILITY LOG
              </div>

              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold font-mono text-white tracking-wide">
                  WHY IS MY TRAIN STOPPED?
                </h3>
              </div>

              {hasAahavaanPass ? (
                <div className="space-y-4">
                  {/* Natural Language Operational Reason */}
                  <div className="p-4 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20 text-xs font-mono text-zinc-200 leading-relaxed">
                    <p className="font-semibold text-cyan-300 mb-1">
                      {whyStopped?.plain_english_reason ||
                        'Your train is held in Loop Siding 2 for 3 minutes to allow High-Priority Express 12804 (Purushottam Express) to clear the interlocking crossover throat.'}
                    </p>
                    <p className="text-zinc-400 text-[11px] mt-2">
                      Holding Location: <strong className="text-white">{whyStopped?.stopped_at_location || 'Dadri Loop Siding 2'}</strong> · Expected Departure:{' '}
                      <strong className="text-emerald-400">in {whyStopped?.expected_clearance_min || 1} minute</strong>.
                    </p>
                  </div>

                  {/* Technical Precedence Comparison */}
                  {whyStopped?.technical_conflict && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
                      <div className="text-xs font-mono font-semibold text-zinc-300 uppercase flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        DISPATCH SOLVER HEADWAY RESOLUTION
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-zinc-400 block mb-0.5">Precedent Train</span>
                          <span className="text-white font-bold">{whyStopped.technical_conflict.conflicting_train}</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-zinc-400 block mb-0.5">Throat Junction Section</span>
                          <span className="text-white font-bold">{whyStopped.technical_conflict.conflict_section}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                        Rule Applied: <strong>{whyStopped.technical_conflict.priority_comparison}</strong>. Holding this passenger train prevents a 7-minute cascade to 3 trailing trains.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* HTTP 402 Paywall State */
                <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/30 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-mono text-white">
                      HTTP 402 PAYMENT REQUIRED · AAHAVAAN PASS
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono mt-1 max-w-md mx-auto">
                      Access to explainable real-time delay diagnostics and signal hold insights requires an active ₹9/month Aahavaan Pass settled via x402 on Algorand Testnet.
                    </p>
                  </div>
                  <button
                    onClick={() => setHasAahavaanPass(true)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold transition shadow-lg shadow-emerald-950/40"
                  >
                    ACTIVATE TESTNET PASS (100,000 µALGO)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
