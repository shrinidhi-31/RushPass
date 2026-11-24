import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, QrCode, Ticket } from 'lucide-react';
import { PassengerLayout } from '../../components/PassengerLayout';
import { useTransit } from '../../services/transitStore';
import { formatDateTimeShort } from '../../utils/occupancy';

type TicketFilter = 'ALL' | 'ACTIVE' | 'USED';

export const PassengerTicketsPage: React.FC = () => {
  const { tickets } = useTransit();
  const [filter, setFilter] = useState<TicketFilter>('ALL');

  const filteredTickets = useMemo(() => {
    if (filter === 'ALL') return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  const activeCount = tickets.filter((t) => t.status === 'ACTIVE').length;
  const usedCount = tickets.filter((t) => t.status === 'USED').length;

  return (
    <PassengerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#006858]">
              Digital Passes &amp; History
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183B50] mt-1">
              My Bus Tickets
            </h1>
            <p className="text-sm text-[#4B6272] mt-1">
              Tap any active pass to show its QR code to the bus conductor.
            </p>
          </div>

          <div className="inline-flex rounded-[12px] bg-[#ECE8DF] p-1 self-start">
            {(
              [
                { key: 'ALL', label: `All (${tickets.length})` },
                { key: 'ACTIVE', label: `Active (${activeCount})` },
                { key: 'USED', label: `Used (${usedCount})` },
              ] as { key: TicketFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-2 rounded-[10px] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-white text-[#183B50] shadow-xs'
                    : 'text-[#4B6272] hover:text-[#183B50]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="tactile-card p-10 text-center space-y-3">
            <Ticket className="w-8 h-8 text-[#7D909E] mx-auto" aria-hidden="true" />
            <p className="text-base font-bold text-[#183B50]">No tickets in this category</p>
            <p className="text-sm text-[#4B6272]">
              Search a bus route to generate a new digital QR pass.
            </p>
            <Link
              to="/passenger"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-[10px] bg-[#278B78] text-white text-sm font-bold hover:bg-[#1E7060] transition-colors"
            >
              Find a Bus
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => {
              const isUsed = ticket.status === 'USED';
              return (
                <Link
                  key={ticket.ticketId}
                  to={`/passenger/ticket/${ticket.ticketId}`}
                  className="tactile-card p-5 flex flex-col justify-between gap-4 hover:border-[#278B78] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center justify-center rounded-[6px] bg-[#183B50] text-white px-2.5 py-1 text-sm font-extrabold tabular-nums shrink-0">
                        {ticket.routeCode}
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-[#183B50] truncate">
                          {ticket.boardingPoint} → {ticket.destination}
                        </p>
                        <p className="text-xs font-medium text-[#4B6272] tabular-nums">
                          {ticket.ticketId} · {ticket.busNumber} · {ticket.passengerName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold shrink-0 ${
                        isUsed
                          ? 'bg-[#ECE8DF] text-[#4B6272]'
                          : 'bg-[#E9F6F2] text-[#006858]'
                      }`}
                    >
                      {isUsed ? (
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{isUsed ? 'Used' : 'Active'}</span>
                    </span>
                  </div>

                  <div className="border-t border-[#E5DFD3] pt-3 flex items-center justify-between text-xs">
                    <div className="text-[#4B6272] tabular-nums">
                      <span>Issued {formatDateTimeShort(ticket.issuedAt)}</span>
                      <span className="mx-2" aria-hidden="true">·</span>
                      <strong className="text-[#183B50]">₹{ticket.fare}</strong>
                    </div>

                    <span className="inline-flex items-center gap-1.5 font-bold text-[#006858]">
                      <QrCode className="w-4 h-4" aria-hidden="true" />
                      <span>Open QR</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PassengerLayout>
  );
};
