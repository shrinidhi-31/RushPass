import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Bus, CheckCircle2, Clock } from 'lucide-react';
import { PassengerLayout } from '../../components/PassengerLayout';
import { CrowdIndicator } from '../../components/CrowdIndicator';
import { RouteTimeline } from '../../components/RouteTimeline';
import { useTransit } from '../../services/transitStore';
import { calculateStageFare, formatTimeShort, getCrowdStatus } from '../../utils/occupancy';

export const BusDetailBookingPage: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const { buses, currentUser, issueTicket } = useTransit();

  const bus = buses.find((b) => b.id === busId) || buses[0];

  const [boardingPoint, setBoardingPoint] = useState<string>(bus.stops[0]);
  const [destination, setDestination] = useState<string>(bus.stops[bus.stops.length - 1]);
  const [passengerName, setPassengerName] = useState<string>(currentUser?.name || 'Shrinidhi');
  const [error, setError] = useState<string>('');

  const availableDestinations = useMemo(() => {
    const startIdx = bus.stops.indexOf(boardingPoint);
    return bus.stops.slice(startIdx + 1);
  }, [boardingPoint, bus.stops]);

  const fare = useMemo(() => {
    return calculateStageFare(
      bus.stops,
      boardingPoint,
      destination,
      bus.baseFare,
      bus.maxFare
    );
  }, [bus.baseFare, bus.maxFare, bus.stops, boardingPoint, destination]);

  const crowdStatus = getCrowdStatus(bus.currentPassengers, bus.capacity);
  const seatsLeft = Math.max(0, bus.capacity - bus.currentPassengers);
  const isFull = seatsLeft === 0;

  // Suggest a less crowded alternative on the same corridor if this bus is crowded/full
  const alternativeBus = useMemo(() => {
    if (crowdStatus !== 'Very Crowded' && crowdStatus !== 'Full') return null;
    return buses.find(
      (b) =>
        b.id !== bus.id &&
        b.origin === bus.origin &&
        b.destination === bus.destination &&
        b.currentPassengers < bus.currentPassengers
    );
  }, [buses, bus, crowdStatus]);

  const handleBoardingChange = (nextBoarding: string) => {
    setBoardingPoint(nextBoarding);
    const startIdx = bus.stops.indexOf(nextBoarding);
    const destIdx = bus.stops.indexOf(destination);
    if (destIdx <= startIdx) {
      setDestination(bus.stops[bus.stops.length - 1]);
    }
  };

  const handleGenerateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passengerName.trim()) {
      setError('Please enter passenger name for the ticket.');
      return;
    }

    const result = issueTicket({
      busId: bus.id,
      boardingPoint,
      destination,
      fare,
      passengerName: passengerName.trim(),
    });

    if (!result.ok || !result.ticket) {
      setError(result.error || 'Unable to generate ticket.');
      return;
    }

    navigate(`/passenger/ticket/${result.ticket.ticketId}`);
  };

  return (
    <PassengerLayout>
      <div className="space-y-6">
        {/* Back Breadcrumb */}
        <div>
          <Link
            to="/passenger"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4B6272] hover:text-[#183B50] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Bus Search</span>
          </Link>
        </div>

        {/* Two-Column Detail & Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Booking Form & Occupancy Card */}
          <div className="lg:col-span-7 space-y-6">
            <section className="tactile-card p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center rounded-[6px] bg-[#183B50] text-white px-3.5 py-1.5 text-lg font-extrabold tabular-nums">
                    {bus.routeCode}
                  </span>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#183B50]">
                      {bus.origin} → {bus.destination}
                    </h1>
                    <p className="text-xs font-medium text-[#4B6272] tabular-nums mt-0.5">
                      Bus {bus.busNumber} · {bus.serviceType} · Conductor: {bus.conductorName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#278B78] text-white px-3 py-1 text-xs font-bold tabular-nums">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>ETA {bus.etaMinutes} min</span>
                  </span>
                  <p className="text-[11px] text-[#7D909E] mt-1 tabular-nums">
                    Updated {formatTimeShort(bus.lastUpdatedAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#FDF9F0] border border-[#E5DFD3] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#183B50]">Live Crowd Occupancy</span>
                  <span className="font-bold text-[#006858] tabular-nums">
                    {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} remaining
                  </span>
                </div>
                <CrowdIndicator
                  currentPassengers={bus.currentPassengers}
                  capacity={bus.capacity}
                />
              </div>

              {alternativeBus && (
                <div className="rounded-xl bg-[#E9F6F2] border border-[#B6E2D6] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#005144]">
                    <p className="font-bold">Less Crowded Option Available</p>
                    <p className="mt-0.5">
                      Route {alternativeBus.routeCode} ({alternativeBus.busNumber}) on the same corridor is only{' '}
                      <strong>
                        {Math.round((alternativeBus.currentPassengers / alternativeBus.capacity) * 100)}% full
                      </strong>
                      .
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/passenger/bus/${alternativeBus.id}`)}
                    className="px-3.5 py-2 rounded-[10px] bg-[#006858] text-white text-xs font-bold whitespace-nowrap hover:bg-[#005144] transition-colors cursor-pointer shrink-0"
                  >
                    Switch to {alternativeBus.routeCode}
                  </button>
                </div>
              )}

              {/* Ticket Booking Form */}
              <form onSubmit={handleGenerateTicket} className="space-y-4 pt-2 border-t border-[#E5DFD3]">
                <h2 className="text-base font-bold text-[#183B50]">
                  Select Journey &amp; Generate Digital Pass
                </h2>

                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-xs font-bold text-[#183B50] mb-1.5"
                  >
                    Passenger Name
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm font-semibold text-[#183B50] focus:outline-none focus:border-[#278B78]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="boarding-select"
                      className="block text-xs font-bold text-[#183B50] mb-1.5"
                    >
                      Boarding Point
                    </label>
                    <select
                      id="boarding-select"
                      value={boardingPoint}
                      onChange={(e) => handleBoardingChange(e.target.value)}
                      className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm font-semibold text-[#183B50] focus:outline-none focus:border-[#278B78]"
                    >
                      {bus.stops.slice(0, -1).map((stop) => (
                        <option key={stop} value={stop}>
                          {stop}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="destination-select"
                      className="block text-xs font-bold text-[#183B50] mb-1.5"
                    >
                      Destination
                    </label>
                    <select
                      id="destination-select"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm font-semibold text-[#183B50] focus:outline-none focus:border-[#278B78]"
                    >
                      {availableDestinations.map((stop) => (
                        <option key={stop} value={stop}>
                          {stop}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fare Summary */}
                <div className="rounded-xl bg-[#F7F3EA] px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#4B6272]">Calculated Stage Fare</p>
                    <p className="text-xs text-[#7D909E]">
                      {boardingPoint} → {destination}
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-[#183B50] tabular-nums">
                    ₹{fare}
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl bg-[#FDECEC] border border-[#F5C2BF] px-4 py-3 text-xs font-bold text-[#A03934] flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isFull}
                  className={`w-full min-h-[48px] rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    isFull
                      ? 'bg-[#E6E2D9] text-[#7D909E] cursor-not-allowed'
                      : 'bg-[#278B78] hover:bg-[#1E7060] text-white cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {isFull
                      ? 'Bus at Full Capacity — Select Another Bus'
                      : `Generate Digital QR Ticket · ₹${fare}`}
                  </span>
                  {!isFull && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                </button>
              </form>
            </section>
          </div>

          {/* Right: Live Stop Timeline */}
          <aside className="lg:col-span-5 tactile-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-[#278B78]" aria-hidden="true" />
                <h2 className="text-base font-bold text-[#183B50]">Live Route Progress</h2>
              </div>
              <span className="text-xs font-semibold text-[#7D909E] tabular-nums">
                Stop {bus.currentStopIndex + 1} of {bus.stops.length}
              </span>
            </div>

            <RouteTimeline
              stops={bus.stops}
              currentStopIndex={bus.currentStopIndex}
              boardingPoint={boardingPoint}
              destination={destination}
            />
          </aside>
        </div>
      </div>
    </PassengerLayout>
  );
};
