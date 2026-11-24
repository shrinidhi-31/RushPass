import React, { useState } from 'react';
import { AlertTriangle, BellRing, Check, CheckCircle2, Info } from 'lucide-react';
import { ConductorLayout } from '../../components/ConductorLayout';
import { CrowdIndicator } from '../../components/CrowdIndicator';
import { useTransit } from '../../services/transitStore';
import { formatTimeShort } from '../../utils/occupancy';

export const ConductorAlertsPage: React.FC = () => {
  const {
    alerts,
    buses,
    currentUser,
    acknowledgeAlert,
    requestReliefBus,
  } = useTransit();

  const assignedBus =
    buses.find((b) => b.id === currentUser?.assignedBusId) || buses[0];
  const [reliefSent, setReliefSent] = useState(false);

  const handleRequestRelief = () => {
    requestReliefBus(assignedBus.id);
    setReliefSent(true);
    setTimeout(() => setReliefSent(false), 3000);
  };

  return (
    <ConductorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#006858]">
              Occupancy Dispatch &amp; Thresholds
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183B50] mt-1">
              Crowd Alerts &amp; Fleet Monitor
            </h1>
          </div>

          <button
            type="button"
            onClick={handleRequestRelief}
            className="min-h-[44px] px-4 py-2 rounded-[10px] bg-[#C95750] hover:bg-[#A03934] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <BellRing className="w-4 h-4" aria-hidden="true" />
            <span>Request Relief Bus for {assignedBus.routeCode}</span>
          </button>
        </div>

        {reliefSent && (
          <div
            role="status"
            className="rounded-xl bg-[#E9F6F2] border border-[#B6E2D6] px-4 py-3 text-xs font-bold text-[#006858] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Relief bus dispatch request logged for Route {assignedBus.routeCode} ({assignedBus.busNumber}).
            </span>
          </div>
        )}

        {/* Active Alerts List */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#183B50]">
            Threshold &amp; Dispatch Alerts ({alerts.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';
              return (
                <article
                  key={alert.id}
                  className={`tactile-card p-5 space-y-3 ${
                    alert.acknowledged ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                          isCritical
                            ? 'bg-[#FDECEC] text-[#A03934]'
                            : isWarning
                            ? 'bg-[#FDF2E6] text-[#9A4E10]'
                            : 'bg-[#E9F6F2] text-[#006858]'
                        }`}
                      >
                        {isCritical || isWarning ? (
                          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Info className="w-4 h-4" aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#183B50]">{alert.title}</h3>
                        <p className="text-[11px] font-semibold text-[#7D909E] tabular-nums">
                          {alert.routeCode} · {alert.busNumber} · {formatTimeShort(alert.createdAt)}
                        </p>
                      </div>
                    </div>

                    {!alert.acknowledged ? (
                      <button
                        type="button"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-white hover:bg-[#F5F1E8] text-xs font-bold text-[#183B50] inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5 text-[#278B78]" aria-hidden="true" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#7D909E]">Acknowledged</span>
                    )}
                  </div>

                  <p className="text-xs text-[#4B6272] leading-relaxed">{alert.message}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Fleet-Wide Occupancy Monitor */}
        <section className="tactile-card p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#183B50]">
              Fleet-Wide Occupancy Comparison
            </h2>
            <p className="text-xs text-[#4B6272]">
              Monitor adjacent buses across corridors to advise passengers on less crowded alternatives.
            </p>
          </div>

          <div className="divide-y divide-[#E5DFD3]">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                <div className="md:col-span-5 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center rounded-[6px] bg-[#183B50] text-white px-2.5 py-1 text-xs font-extrabold tabular-nums shrink-0">
                    {bus.routeCode}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#183B50] truncate">
                      {bus.origin} → {bus.destination}
                    </p>
                    <p className="text-xs text-[#4B6272] tabular-nums">
                      {bus.busNumber} · At {bus.stops[bus.currentStopIndex]}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-7">
                  <CrowdIndicator
                    currentPassengers={bus.currentPassengers}
                    capacity={bus.capacity}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ConductorLayout>
  );
};
