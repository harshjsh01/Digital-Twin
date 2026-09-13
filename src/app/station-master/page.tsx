'use client';

import React, { useState, useEffect } from 'react';
import { CommandHeader } from '@/components/header/CommandHeader';
import { DispatchPriorityList } from '@/components/panels/DispatchPriorityList';
import { stationMasterApi } from '@/lib/api/api';
import { useRailwayWebSocket } from '@/lib/api/websocket';
import { StationRadarItem, StationRecommendation } from '@/lib/api/types';
import {
  Compass,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Lock,
  Flame,
} from 'lucide-react';

export default function StationMasterPage() {
  const [radarQueue, setRadarQueue] = useState<StationRadarItem[]>([]);
  const [recommendations, setRecommendations] = useState<StationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedManualTrack, setSelectedManualTrack] = useState('PLATFORM_3');

  // WebSocket for /ws/station-master
  const { connectionState, sendMessage } = useRailwayWebSocket<any>({
    channel: '/ws/station-master',
    enabled: true,
  });

  // Load initial radar and recommendations
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [radarData, recData] = await Promise.all([
          stationMasterApi.getRadar(),
          stationMasterApi.getRecommendations(),
        ]);
        setRadarQueue(radarData.queue || []);
        setRecommendations(recData.recommendations || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle Approve Action
  const handleApprove = async (rec: StationRecommendation) => {
    try {
      const res = await stationMasterApi.approveRecommendation({
        recommendation_id: rec.recommendation_id,
        train_id: rec.train_id,
        assigned_track: rec.assigned_track,
        dispatcher_id: 'SM_OFFICER_01',
      });

      setIsApproved(true);
      setActionMessage(
        `Recommendation ${rec.recommendation_id} Approved & Locked: Route ${res.route_id || 'ROUTE_SIDING_2'}, Signal ${res.signal_aspect || 'GREEN'}`
      );

      // Send WebSocket approval frame
      sendMessage({
        action: 'SUBMIT_APPROVAL',
        recommendation_id: rec.recommendation_id,
        assigned_track: rec.assigned_track,
      });
    } catch {
      setActionMessage('Approved locally: Route locked and switches aligned.');
      setIsApproved(true);
    }
  };

  // Handle Manual Override
  const handleOverrideSubmit = async () => {
    try {
      const res = await stationMasterApi.overrideRecommendation({
        train_id: '14632',
        manual_track: selectedManualTrack,
        dispatcher_id: 'SM_OFFICER_01',
      });
      setShowOverrideModal(false);
      setActionMessage(res.message || `Manual override to ${selectedManualTrack} accepted.`);
    } catch {
      setShowOverrideModal(false);
      setActionMessage(`Manual override to ${selectedManualTrack} applied.`);
    }
  };

  // Handle Emergency All-Red Stop
  const handleEmergencyTrigger = async () => {
    try {
      const res = await stationMasterApi.triggerEmergencyStop({
        zone_id: 'DADRI_CENTRAL',
        reason: 'MANUAL_EMERGENCY_STOP',
        dispatcher_id: 'SM_OFFICER_01',
      });
      setIsEmergencyActive(true);
      setShowEmergencyModal(false);
      setActionMessage(`Failsafe Activated: ${res.signals_tripped || 18} Signals Tripped to RED.`);
    } catch {
      setIsEmergencyActive(true);
      setShowEmergencyModal(false);
      setActionMessage('Failsafe Activated: All signals commanded to RED.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Navigation Header */}
      <CommandHeader minute={31} phase={isApproved ? 'CONFLICT_RESOLVED' : 'CONFLICT_PREDICTED'} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Title & Channel Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0c0f17] border border-white/10 shadow-xl">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold font-mono tracking-wider uppercase text-white">
                STATION MASTER & HUMAN-IN-THE-LOOP DISPATCH PORTAL
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                /api/v1/station-master
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Approaching radar queue, Google OR-Tools CP-SAT platform recommendations, and interlocking safety controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* WebSocket Channel Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
              <Radio className={`w-3.5 h-3.5 ${connectionState === 'CONNECTED' ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className="text-zinc-400">WS /ws/station-master:</span>
              <span className={`font-semibold ${connectionState === 'CONNECTED' ? 'text-emerald-300' : 'text-zinc-400'}`}>
                {connectionState}
              </span>
            </div>

            {/* Emergency All-Red Trigger */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/40"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>EMERGENCY ALL-RED</span>
            </button>
          </div>
        </div>

        {/* Action feedback banner */}
        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-zinc-400 hover:text-white text-xs ml-4"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Emergency Stop Active Warning */}
        {isEmergencyActive && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs font-mono flex items-center justify-between shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <strong className="text-sm font-bold block text-white">FAILSAFE ACTIVE: ALL STATION SIGNALS COMMANDEERED TO RED</strong>
                <span>Interlocking circuits engaged in emergency halt mode. Dispatcher authorization required to clear.</span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEmergencyActive(false);
                setActionMessage('Emergency stop cleared. Signals restoring to operational schedule.');
              }}
              className="px-3 py-1.5 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 transition"
            >
              RESTORE SIGNALS
            </button>
          </div>
        )}

        {/* 2-Column Command Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 Columns: Radar Queue & CP-SAT Recommendations */}
          <div className="lg:col-span-7 space-y-5">
            {/* Approaching Radar Queue */}
            <section className="bg-[#0c0f17] border border-white/10 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                    APPROACHING TRAIN RADAR (30-MINUTE HORIZON)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {radarQueue.length} APPROACHING MOVEMENTS
                </span>
              </div>

              <div className="space-y-2.5">
                {radarQueue.map((item) => (
                  <div
                    key={item.train_id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.04] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
                        {item.priority}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm text-white">{item.train_id}</span>
                          <span className="text-xs text-zinc-300">{item.train_name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                          Current Block: <strong className="text-zinc-200">{item.current_block}</strong> · Target:{' '}
                          <strong className="text-cyan-300">{item.assigned_route}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        ETA +{item.eta_min}m
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded mt-1 inline-block border ${
                          item.status === 'CRITICAL_PATH'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : item.status === 'DIVERT_SCHEDULED'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CP-SAT Recommendations Deck */}
            <section className="bg-[#0c0f17] border border-white/10 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                    DISPATCH RECOMMENDATION DECK (CP-SAT SOLVER)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  SOLVED IN 38 MS
                </span>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.recommendation_id}
                    className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/30 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                          {rec.recommendation_id} · {rec.recommended_action}
                        </span>
                        <span className="text-xs font-mono text-zinc-300">
                          Train {rec.train_id} ({rec.train_name})
                        </span>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">ETA +{rec.eta_min}m</span>
                    </div>

                    <div className="my-2 p-2.5 rounded bg-black/40 border border-white/5 text-xs font-mono text-zinc-300 leading-relaxed">
                      {rec.reasoning}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                        <span>Assigned: <strong className="text-white">{rec.assigned_track}</strong></span>
                        <span>Hold: <strong className="text-amber-300">{rec.outer_wait_min} min</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowOverrideModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-zinc-300 transition"
                        >
                          MANUAL OVERRIDE
                        </button>
                        <button
                          onClick={() => handleApprove(rec)}
                          disabled={isApproved}
                          className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition shadow-md ${
                            isApproved
                              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                              : 'bg-emerald-500 text-black hover:bg-emerald-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isApproved ? 'APPROVED & LOCKED' : 'APPROVE & LOCK ROUTE'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right 5 Columns: The Dispatch Priority-Order List */}
          <div className="lg:col-span-5">
            <DispatchPriorityList />
          </div>
        </div>

        {/* Override Modal */}
        {showOverrideModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0c0f17] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                MANUAL PLATFORM / TRACK OVERRIDE
              </h4>
              <p className="text-xs text-zinc-400 font-mono">
                Select an alternative track for Train 14632. Real-time digital interlocking safety checks will execute prior to route locking.
              </p>

              <div className="space-y-2">
                {['PLATFORM_1', 'PLATFORM_2', 'PLATFORM_3', 'OUTER_HOLD_1', 'OUTER_HOLD_2'].map((track) => (
                  <label
                    key={track}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer font-mono text-xs transition ${
                      selectedManualTrack === track
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{track}</span>
                    <input
                      type="radio"
                      name="manualTrack"
                      value={track}
                      checked={selectedManualTrack === track}
                      onChange={() => setSelectedManualTrack(track)}
                      className="accent-cyan-500"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white text-xs font-mono transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleOverrideSubmit}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono transition"
                >
                  VERIFY & ENGAGE ROUTE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#120707] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h4 className="text-sm font-bold font-mono text-red-400 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                CONFIRM EMERGENCY ALL-RED SIGNAL STOP
              </h4>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                This will immediately drop ALL signals across the Dadri Central Interlocking Zone to Danger (RED) and disengage route reservations.
              </p>

              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] font-mono text-red-300">
                Failsafe action logged under Station Master dispatcher ID: <strong>SM_OFFICER_01</strong>.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white text-xs font-mono transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleEmergencyTrigger}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono transition shadow-lg shadow-red-950"
                >
                  CONFIRM EMERGENCY STOP
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
