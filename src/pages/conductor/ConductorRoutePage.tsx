import React from 'react';
import { ArrowRight, MapPin, RotateCcw, Ticket } from 'lucide-react';
import { ConductorLayout } from '../../components/ConductorLayout';
import { CrowdIndicator } from '../../components/CrowdIndicator';
import { RouteTimeline } from '../../components/RouteTimeline';
import { useTransit } from '../../services/transitStore';
import { formatTimeShort } from '../../utils/occupancy';

export const ConductorRoutePage: React.FC = () => {
  const { buses, tickets, currentUser, advanceBusStop, resetBusTrip } = useTransit();

  const assignedBus =
    buses.find((b) => b.id === currentUser?.assignedBusId) || buses[0];

  const isAtTerminus = assignedBus.currentStopIndex >= assignedBus.stops.length - 1;
  const activeBusTickets = tickets.filter(
    (t) => t.busId === assignedBus.id && t.status === 'ACTIVE'
  );

  return (
    <ConductorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#006858]">
              Route Monitoring · {assignedBus.busNumber}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183B50] mt-1">
              Route {assignedBus.routeCode}: {assignedBus.origin} → {assignedBus.destination}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => resetBusTrip(assignedBus.id)}
              className="min-h-[44px] px-4 py-2 rounded-[10px] border border-[#E5DFD3] bg-white hover:bg-[#F5F1E8] text-xs font-bold text-[#183B50] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Trip</span>
            </button>

            <button
              type="button"
              onClick={() => advanceBusStop(assignedBus.id)}
              disabled={isAtTerminus}
              className={`min-h-[44px] px-4 py-2 rounded-[10px] text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                isAtTerminus
                  ? 'bg-[#E6E2D9] text-[#7D909E] cursor-not-allowed'
                  : 'bg-[#278B78] hover:bg-[#1E7060] text-white cursor-pointer'
              }`}
            >
              <span>{isAtTerminus ? 'At Terminus' : 'Advance to Next Stop'}</span>
              {!isAtTerminus && <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stop Timeline */}
          <section className="lg:col-span-7 tactile-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#278B78]" aria-hidden="true" />
                <h2 className="text-base font-bold text-[#183B50]">Stop-by-Stop Progression</h2>
              </div>
              <span className="text-xs font-semibold text-[#7D909E] tabular-nums">
                Stop {assignedBus.currentStopIndex + 1} / {assignedBus.stops.length} · Updated{' '}
                {formatTimeShort(assignedBus.lastUpdatedAt)}
              </span>
            </div>

            <RouteTimeline
              stops={assignedBus.stops}
              currentStopIndex={assignedBus.currentStopIndex}
            />
          </section>

          {/* Right Summary */}
          <aside className="lg:col-span-5 space-y-6">
            <section className="tactile-card p-6 space-y-4">
              <h2 className="text-base font-bold text-[#183B50]">Live Load Summary</h2>
              <CrowdIndicator
                currentPassengers={assignedBus.currentPassengers}
                capacity={assignedBus.capacity}
              />
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5DFD3] text-xs">
                <div>
                  <span className="text-[#7D909E] font-semibold block">Current Stop</span>
                  <span className="font-bold text-[#183B50] text-sm">
                    {assignedBus.stops[assignedBus.currentStopIndex]}
                  </span>
                </div>
                <div>
                  <span className="text-[#7D909E] font-semibold block">Next Stop</span>
                  <span className="font-bold text-[#183B50] text-sm">
                    {assignedBus.stops[assignedBus.currentStopIndex + 1] || 'Final Terminus'}
                  </span>
                </div>
              </div>
            </section>

            <section className="tactile-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#183B50] flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#278B78]" aria-hidden="true" />
                  <span>Active Issued Passes ({activeBusTickets.length})</span>
                </h2>
              </div>

              {activeBusTickets.length === 0 ? (
                <p className="text-xs text-[#7D909E]">
                  No unboarded active passes pending for this bus.
                </p>
              ) : (
                <ul className="divide-y divide-[#E5DFD3]">
                  {activeBusTickets.map((t) => (
                    <li key={t.ticketId} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#183B50] tabular-nums">
                          {t.ticketId} · {t.passengerName}
                        </p>
                        <p className="text-[#4B6272]">
                          {t.boardingPoint} → {t.destination}
                        </p>
                      </div>
                      <span className="font-bold text-[#006858] tabular-nums">₹{t.fare}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>
    </ConductorLayout>
  );
};
