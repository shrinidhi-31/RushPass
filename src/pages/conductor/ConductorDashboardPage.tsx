import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  QrCode,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { ConductorLayout } from '../../components/ConductorLayout';
import { CrowdIndicator } from '../../components/CrowdIndicator';
import { useTransit } from '../../services/transitStore';
import { computeUpdatedPassengerCount, formatTimeShort } from '../../utils/occupancy';

export const ConductorDashboardPage: React.FC = () => {
  const {
    buses,
    logs,
    currentUser,
    updateBusPassengerCount,
    advanceBusStop,
  } = useTransit();

  const assignedBus =
    buses.find((b) => b.id === currentUser?.assignedBusId) || buses[0];

  const [boardedInput, setBoardedInput] = useState<number>(0);
  const [exitedInput, setExitedInput] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const currentStop = assignedBus.stops[assignedBus.currentStopIndex];
  const nextStop =
    assignedBus.stops[assignedBus.currentStopIndex + 1] || 'Final Terminus';
  const isAtTerminus = assignedBus.currentStopIndex >= assignedBus.stops.length - 1;

  const previewCalc = computeUpdatedPassengerCount(
    assignedBus.currentPassengers,
    boardedInput,
    exitedInput,
    assignedBus.capacity
  );

  const busLogs = logs.filter((l) => l.busId === assignedBus.id).slice(0, 6);

  const handleApplyManualUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (boardedInput === 0 && exitedInput === 0) {
      setFeedback({
        type: 'err',
        text: 'Enter at least 1 passenger boarded or exited before applying.',
      });
      return;
    }

    const res = updateBusPassengerCount(
      assignedBus.id,
      boardedInput,
      exitedInput
    );
    if (!res.ok) {
      setFeedback({ type: 'err', text: res.error || 'Update failed.' });
      return;
    }

    setFeedback({
      type: 'ok',
      text: `Updated passenger count to ${res.bus?.currentPassengers}/${assignedBus.capacity}.`,
    });
    setBoardedInput(0);
    setExitedInput(0);
  };

  const handleQuickStep = (boarded: number, exited: number) => {
    const res = updateBusPassengerCount(assignedBus.id, boarded, exited);
    if (!res.ok) {
      setFeedback({ type: 'err', text: res.error || 'Cannot update count.' });
      return;
    }
    setFeedback({
      type: 'ok',
      text: `Quick count updated: ${res.bus?.currentPassengers}/${assignedBus.capacity} onboard.`,
    });
  };

  const handleAdvanceStop = () => {
    const res = advanceBusStop(assignedBus.id);
    if (res.ok && res.bus) {
      setFeedback({
        type: 'ok',
        text: `Arrived at ${res.bus.stops[res.bus.currentStopIndex]}.`,
      });
    }
  };

  return (
    <ConductorLayout>
      <div className="space-y-6">
        {/* Duty Header + QR Scanner CTA */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="inline-flex items-center justify-center rounded-[8px] bg-[#183B50] text-white px-3.5 py-2 text-xl font-extrabold tabular-nums">
              {assignedBus.routeCode}
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#183B50]">
                {assignedBus.origin} → {assignedBus.destination}
              </h1>
              <p className="text-xs font-semibold text-[#4B6272] tabular-nums">
                Bus {assignedBus.busNumber} · Capacity {assignedBus.capacity} · Last updated{' '}
                {formatTimeShort(assignedBus.lastUpdatedAt)}
              </p>
            </div>
          </div>

          <Link
            to="/conductor/scanner"
            className="min-h-[48px] px-5 py-3 rounded-[10px] bg-[#278B78] hover:bg-[#1E7060] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <QrCode className="w-5 h-5" aria-hidden="true" />
            <span>Open QR Ticket Scanner</span>
          </Link>
        </section>

        {/* Stop Progress & Live Occupancy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Live Occupancy + Manual Count Control */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Occupancy Card */}
            <section className="tactile-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7D909E]">
                    Live Passenger Load
                  </p>
                  <p className="text-3xl font-extrabold text-[#183B50] tabular-nums mt-1">
                    {assignedBus.currentPassengers}{' '}
                    <span className="text-lg font-bold text-[#7D909E]">
                      / {assignedBus.capacity}
                    </span>
                  </p>
                </div>

                {/* Quick 1-tap boarding/alighting */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickStep(0, 1)}
                    className="min-h-[44px] px-3.5 py-2 rounded-[10px] border border-[#E5DFD3] bg-white hover:bg-[#F5F1E8] text-xs font-bold text-[#183B50] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserMinus className="w-4 h-4 text-[#C95750]" aria-hidden="true" />
                    <span>-1 Exit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStep(1, 0)}
                    className="min-h-[44px] px-3.5 py-2 rounded-[10px] bg-[#183B50] hover:bg-[#112B3B] text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-[#7BD7C1]" aria-hidden="true" />
                    <span>+1 Board</span>
                  </button>
                </div>
              </div>

              <CrowdIndicator
                currentPassengers={assignedBus.currentPassengers}
                capacity={assignedBus.capacity}
              />
            </section>

            {/* Stop Batch Count Update Form */}
            <section className="tactile-card p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#183B50]">
                  Stop Boarding &amp; Exiting Update
                </h2>
                <p className="text-xs text-[#4B6272] mt-0.5">
                  Formula: New Count = Previous ({assignedBus.currentPassengers}) + Boarded − Exited
                </p>
              </div>

              <form onSubmit={handleApplyManualUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Passengers Boarded Stepper */}
                  <div className="rounded-xl bg-[#FDF9F0] border border-[#E5DFD3] p-4 space-y-2">
                    <label
                      htmlFor="boarded-input"
                      className="block text-xs font-bold text-[#006858]"
                    >
                      Passengers Boarded (+)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBoardedInput((v) => Math.max(0, v - 1))}
                        aria-label="Decrease passengers boarded"
                        className="h-11 w-11 rounded-[10px] border border-[#E5DFD3] bg-white hover:bg-[#ECE8DF] flex items-center justify-center text-[#183B50] cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        id="boarded-input"
                        type="number"
                        min={0}
                        max={assignedBus.capacity}
                        value={boardedInput}
                        onChange={(e) =>
                          setBoardedInput(Math.max(0, parseInt(e.target.value || '0', 10) || 0))
                        }
                        className="flex-1 h-11 rounded-[10px] border border-[#E5DFD3] bg-white text-center text-base font-extrabold text-[#183B50] tabular-nums focus:outline-none focus:border-[#278B78]"
                      />
                      <button
                        type="button"
                        onClick={() => setBoardedInput((v) => v + 1)}
                        aria-label="Increase passengers boarded"
                        className="h-11 w-11 rounded-[10px] border border-[#E5DFD3] bg-white hover:bg-[#ECE8DF] flex items-center justify-center text-[#183B50] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Passengers Exited Stepper */}
                  <div className="rounded-xl bg-[#FDF9F0] border border-[#E5DFD3] p-4 space-y-2">
                    <label
                      htmlFor="exited-input"
                      className="block text-xs font-bold text-[#A03934]"
                    >
                      Passengers Exited (−)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExitedInput((v) => Math.max(0, v - 1))}
                        aria-label="Decrease passengers exited"
                        className="h-11 w-11 rounded-[10px] border border-[#E5DFD3] bg-white hover:bg-[#ECE8DF] flex items-center justify-center text-[#183B50] cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        id="exited-input"
                        type="number"
                        min={0}
                        max={assignedBus.capacity}
                        value={exitedInput}
                        onChange={(e) =>
                          setExitedInput(Math.max(0, parseInt(e.target.value || '0', 10) || 0))
                        }
                        className="flex-1 h-11 rounded-[10px] border border-[#E5DFD3] bg-white text-center text-base font-extrabold text-[#183B50] tabular-nums focus:outline-none focus:border-[#278B78]"
                      />
                      <button
                        type="button"
                        onClick={() => setExitedInput((v) => v + 1)}
                        aria-label="Increase passengers exited"
                        className="h-11 w-11 rounded-[10px] border border-[#E5DFD3] bg-white hover:bg-[#ECE8DF] flex items-center justify-center text-[#183B50] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Calculation Preview */}
                <div className="rounded-xl bg-[#F7F3EA] px-4 py-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#4B6272]">
                    Projected Onboard Count:
                  </span>
                  <span
                    className={`font-extrabold text-sm tabular-nums ${
                      previewCalc.valid ? 'text-[#183B50]' : 'text-[#C95750]'
                    }`}
                  >
                    {assignedBus.currentPassengers} + {boardedInput} − {exitedInput} ={' '}
                    {assignedBus.currentPassengers + boardedInput - exitedInput} /{' '}
                    {assignedBus.capacity}
                  </span>
                </div>

                {!previewCalc.valid && (
                  <p role="alert" className="text-xs font-bold text-[#C95750] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{previewCalc.error}</span>
                  </p>
                )}

                {feedback && (
                  <div
                    role="status"
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${
                      feedback.type === 'ok'
                        ? 'bg-[#E9F6F2] text-[#006858] border border-[#B6E2D6]'
                        : 'bg-[#FDECEC] text-[#A03934] border border-[#F5C2BF]'
                    }`}
                  >
                    {feedback.type === 'ok' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!previewCalc.valid}
                  className={`w-full min-h-[48px] rounded-[10px] text-sm font-bold transition-colors ${
                    previewCalc.valid
                      ? 'bg-[#278B78] hover:bg-[#1E7060] text-white cursor-pointer'
                      : 'bg-[#E6E2D9] text-[#7D909E] cursor-not-allowed'
                  }`}
                >
                  Apply Passenger Count Update
                </button>
              </form>
            </section>
          </div>

          {/* Right 5 Cols: Current Stop Control + Recent Bus Activity */}
          <div className="lg:col-span-5 space-y-6">
            <section className="tactile-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#183B50]">Current Route Position</h2>
                <Link
                  to="/conductor/route"
                  className="text-xs font-bold text-[#006858] hover:underline"
                >
                  Full Timeline
                </Link>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-[#E9F6F2] border border-[#B6E2D6] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#006858]">
                      Current Stop
                    </p>
                    <p className="text-lg font-extrabold text-[#183B50] mt-0.5">{currentStop}</p>
                  </div>
                  <MapPin className="w-5 h-5 text-[#006858]" aria-hidden="true" />
                </div>

                <div className="rounded-xl bg-[#FDF9F0] border border-[#E5DFD3] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E]">
                      Next Stop
                    </p>
                    <p className="text-base font-bold text-[#183B50] mt-0.5">{nextStop}</p>
                  </div>
                  <Navigation className="w-4 h-4 text-[#4B6272]" aria-hidden="true" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdvanceStop}
                disabled={isAtTerminus}
                className={`w-full min-h-[44px] rounded-[10px] border-[1.5px] text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  isAtTerminus
                    ? 'border-[#E5DFD3] text-[#7D909E] cursor-not-allowed'
                    : 'border-[#183B50] bg-white hover:bg-[#F5F1E8] text-[#183B50] cursor-pointer'
                }`}
              >
                <span>
                  {isAtTerminus ? 'Reached Final Terminus' : `Arrive at ${nextStop}`}
                </span>
                {!isAtTerminus && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
              </button>
            </section>

            <section className="tactile-card p-6 space-y-4">
              <h2 className="text-base font-bold text-[#183B50]">Recent Bus Activity</h2>
              {busLogs.length === 0 ? (
                <p className="text-xs text-[#7D909E]">No updates recorded yet for this trip.</p>
              ) : (
                <ul className="divide-y divide-[#E5DFD3]">
                  {busLogs.map((entry) => (
                    <li key={entry.id} className="py-3 first:pt-0 last:pb-0 text-xs">
                      <p className="font-semibold text-[#183B50]">{entry.summary}</p>
                      <p className="text-[#7D909E] mt-0.5 tabular-nums">
                        {formatTimeShort(entry.timestamp)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </ConductorLayout>
  );
};
