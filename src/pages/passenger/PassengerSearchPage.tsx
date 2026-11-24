import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight, Clock, MapPin, Search, Ticket } from 'lucide-react';
import { PassengerLayout } from '../../components/PassengerLayout';
import { CrowdIndicator } from '../../components/CrowdIndicator';
import { useTransit } from '../../services/transitStore';
import { CrowdStatus } from '../../types/transit';
import { formatTimeShort, getCrowdStatus } from '../../utils/occupancy';

type CrowdFilter = 'ALL' | CrowdStatus;

export const PassengerSearchPage: React.FC = () => {
  const { buses, tickets, currentUser } = useTransit();
  const navigate = useNavigate();

  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [crowdFilter, setCrowdFilter] = useState<CrowdFilter>('ALL');

  const popularCorridors = [
    { label: 'All Routes', from: '', to: '' },
    { label: 'Electronic City → Majestic', from: 'Electronic City', to: 'Majestic' },
    { label: 'Majestic → Whitefield', from: 'Majestic', to: 'Whitefield' },
    { label: 'Banashankari → ITPL', from: 'Banashankari', to: 'ITPL' },
  ];

  const allStops = useMemo(() => {
    const set = new Set<string>();
    buses.forEach((b) => b.stops.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [buses]);

  const filteredBuses = useMemo(() => {
    const src = sourceQuery.trim().toLowerCase();
    const dst = destQuery.trim().toLowerCase();

    return buses.filter((bus) => {
      const stopNames = bus.stops.map((s) => s.toLowerCase());
      let matchesRoute = true;

      if (src && dst) {
        const srcIdx = stopNames.findIndex((s) => s.includes(src));
        const dstIdx = stopNames.findIndex((s) => s.includes(dst));
        matchesRoute = srcIdx !== -1 && dstIdx !== -1 && srcIdx < dstIdx;
      } else if (src) {
        matchesRoute =
          stopNames.some((s) => s.includes(src)) ||
          bus.routeCode.toLowerCase().includes(src) ||
          bus.busNumber.toLowerCase().includes(src);
      } else if (dst) {
        matchesRoute =
          stopNames.some((s) => s.includes(dst)) ||
          bus.routeCode.toLowerCase().includes(dst);
      }

      if (!matchesRoute) return false;

      if (crowdFilter !== 'ALL') {
        const status = getCrowdStatus(bus.currentPassengers, bus.capacity);
        return status === crowdFilter;
      }

      return true;
    });
  }, [buses, sourceQuery, destQuery, crowdFilter]);

  const activeSampleTicket = tickets.find((t) => t.status === 'ACTIVE') || tickets[0];

  const handleSwap = () => {
    setSourceQuery(destQuery);
    setDestQuery(sourceQuery);
  };

  return (
    <PassengerLayout>
      <div className="space-y-6">
        {/* Greeting + Active Ticket Shortcut */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#006858]">
              Live Occupancy Search
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183B50] mt-1">
              Find a comfortable bus, {currentUser?.name || 'Shrinidhi'}
            </h1>
            <p className="text-sm text-[#4B6272] mt-1">
              Compare live seat availability before boarding and generate your QR pass in seconds.
            </p>
          </div>

          {activeSampleTicket && (
            <Link
              to={`/passenger/ticket/${activeSampleTicket.ticketId}`}
              className="tactile-card px-4 py-3 flex items-center justify-between gap-4 hover:border-[#278B78] transition-colors shrink-0"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F6F2] text-[#006858]">
                  <Ticket className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#006858]">
                    {activeSampleTicket.status === 'ACTIVE' ? 'Active Pass Ready' : 'Recent Pass'}
                  </p>
                  <p className="text-sm font-bold text-[#183B50] tabular-nums">
                    {activeSampleTicket.ticketId} · Route {activeSampleTicket.routeCode}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#4B6272]" aria-hidden="true" />
            </Link>
          )}
        </section>

        {/* Search Card */}
        <section className="tactile-card p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label
                htmlFor="bus-source"
                className="block text-xs font-bold text-[#183B50] mb-1.5"
              >
                Boarding Stop / Route
              </label>
              <div className="relative">
                <MapPin
                  className="w-4 h-4 text-[#278B78] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="bus-source"
                  list="rushpass-stops"
                  type="text"
                  value={sourceQuery}
                  onChange={(e) => setSourceQuery(e.target.value)}
                  placeholder="e.g. Electronic City, Silk Board, 500D"
                  className="w-full rounded-[12px] border border-[#E5DFD3] bg-white pl-10 pr-4 py-3 text-sm font-medium text-[#183B50] placeholder:text-[#7D909E] focus:outline-none focus:border-[#278B78]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap boarding stop and destination"
              className="h-[46px] w-full md:w-[46px] rounded-[12px] border border-[#E5DFD3] bg-[#FDF9F0] hover:bg-[#ECE8DF] flex items-center justify-center text-[#183B50] transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <div>
              <label
                htmlFor="bus-dest"
                className="block text-xs font-bold text-[#183B50] mb-1.5"
              >
                Destination Stop
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#4B6272] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="bus-dest"
                  list="rushpass-stops"
                  type="text"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  placeholder="e.g. Majestic, Whitefield, BTM Layout"
                  className="w-full rounded-[12px] border border-[#E5DFD3] bg-white pl-10 pr-4 py-3 text-sm font-medium text-[#183B50] placeholder:text-[#7D909E] focus:outline-none focus:border-[#278B78]"
                />
              </div>
            </div>

            <datalist id="rushpass-stops">
              {allStops.map((stop) => (
                <option key={stop} value={stop} />
              ))}
            </datalist>
          </div>

          {/* Quick Corridors & Crowd Filters */}
          <div className="pt-2 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-t border-[#E5DFD3]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#7D909E] mr-1">Corridors:</span>
              {popularCorridors.map((corridor) => {
                const isSelected =
                  sourceQuery === corridor.from && destQuery === corridor.to;
                return (
                  <button
                    key={corridor.label}
                    type="button"
                    onClick={() => {
                      setSourceQuery(corridor.from);
                      setDestQuery(corridor.to);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#278B78] text-white border-[#278B78]'
                        : 'bg-white text-[#4B6272] border-[#E5DFD3] hover:border-[#183B50]'
                    }`}
                  >
                    {corridor.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'Less Crowded', 'Moderate', 'Very Crowded', 'Full'] as CrowdFilter[]).map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCrowdFilter(level)}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      crowdFilter === level
                        ? 'bg-[#183B50] text-white'
                        : 'bg-[#F1EEE5] text-[#4B6272] hover:text-[#183B50]'
                    }`}
                  >
                    {level === 'ALL' ? 'All Crowds' : level}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* Results Count Header */}
        <div className="flex items-center justify-between gap-4 text-sm">
          <h2 className="font-bold text-[#183B50]">
            Available Buses ({filteredBuses.length})
          </h2>
          <span className="text-xs text-[#4B6272]">
            Thresholds: 0–40% Less Crowded · 41–70% Moderate · 71–90% Very Crowded · &gt;90% Full
          </span>
        </div>

        {/* Bus Results Grid */}
        {filteredBuses.length === 0 ? (
          <div className="tactile-card p-10 text-center space-y-3">
            <p className="text-base font-bold text-[#183B50]">
              No matching buses found for this filter
            </p>
            <p className="text-sm text-[#4B6272]">
              Try clearing your crowd filter or searching a major hub such as Electronic City, Silk Board, or Majestic.
            </p>
            <button
              type="button"
              onClick={() => {
                setSourceQuery('');
                setDestQuery('');
                setCrowdFilter('ALL');
              }}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-[10px] bg-[#278B78] text-white text-sm font-bold hover:bg-[#1E7060] transition-colors cursor-pointer"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredBuses.map((bus) => {
              const status = getCrowdStatus(bus.currentPassengers, bus.capacity);
              const nextStop =
                bus.stops[bus.currentStopIndex + 1] || 'Final Terminus';
              const isFull = bus.currentPassengers >= bus.capacity;

              return (
                <article
                  key={bus.id}
                  className="tactile-card p-5 flex flex-col justify-between gap-4 hover:border-[#278B78] transition-colors"
                >
                  <div className="space-y-4">
                    {/* Top Row: Route Badge + Bus Number + ETA */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex items-center justify-center rounded-[6px] bg-[#183B50] text-white px-3 py-1.5 text-base font-extrabold tabular-nums shrink-0">
                          {bus.routeCode}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-[#183B50] truncate">
                            {bus.origin} → {bus.destination}
                          </h3>
                          <p className="text-xs font-medium text-[#4B6272] tabular-nums">
                            {bus.busNumber} · {bus.serviceType} · Every {bus.frequencyMinutes} min
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#278B78] text-white px-2.5 py-1 text-xs font-bold tabular-nums shrink-0">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{bus.etaMinutes} min</span>
                      </span>
                    </div>

                    {/* Current & Next Stop Strip */}
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#FDF9F0] border border-[#E5DFD3] px-3.5 py-2.5 text-xs">
                      <div>
                        <span className="text-[#7D909E] font-semibold block">Current Stop</span>
                        <span className="font-bold text-[#183B50] text-sm">
                          {bus.stops[bus.currentStopIndex]}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7D909E] font-semibold block">Next Stop</span>
                        <span className="font-bold text-[#183B50] text-sm">{nextStop}</span>
                      </div>
                    </div>

                    {/* Live Crowd Meter */}
                    <CrowdIndicator
                      currentPassengers={bus.currentPassengers}
                      capacity={bus.capacity}
                    />
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#7D909E] font-semibold">
                        Fare up to <strong className="text-[#183B50] tabular-nums">₹{bus.maxFare}</strong>
                      </p>
                      <p className="text-[11px] text-[#7D909E] tabular-nums">
                        Updated {formatTimeShort(bus.lastUpdatedAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/passenger/bus/${bus.id}`)}
                      className={`min-h-[44px] px-4 py-2 rounded-[10px] text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                        isFull || status === 'Full'
                          ? 'border border-[#183B50] bg-white text-[#183B50] hover:bg-[#F5F1E8]'
                          : 'bg-[#278B78] text-white hover:bg-[#1E7060]'
                      }`}
                    >
                      <span>{isFull ? 'View Route' : 'Select & Book'}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PassengerLayout>
  );
};
