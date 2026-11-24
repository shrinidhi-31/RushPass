import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode, Ticket } from 'lucide-react';
import { PassengerLayout } from '../../components/PassengerLayout';
import { DigitalTicketCard } from '../../components/DigitalTicketCard';
import { useTransit } from '../../services/transitStore';

export const TicketPassPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { tickets, buses, loginAsDemo } = useTransit();
  const [copied, setCopied] = useState(false);

  const ticket = tickets.find(
    (t) => t.ticketId.toUpperCase() === (ticketId || '').toUpperCase()
  );

  if (!ticket) {
    return (
      <PassengerLayout>
        <div className="tactile-card p-8 max-w-md mx-auto text-center space-y-4">
          <p className="text-lg font-bold text-[#183B50]">Ticket Not Found</p>
          <p className="text-sm text-[#4B6272]">
            No RushPass ticket with ID <strong className="tabular-nums">{ticketId}</strong> exists in this session.
          </p>
          <Link
            to="/passenger/tickets"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] bg-[#278B78] text-white text-sm font-bold hover:bg-[#1E7060] transition-colors"
          >
            View My Tickets
          </Link>
        </div>
      </PassengerLayout>
    );
  }

  const bus = buses.find((b) => b.id === ticket.busId);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleTestInConductorScanner = () => {
    loginAsDemo('conductor', ticket.busId);
    navigate(`/conductor/scanner?ticketId=${encodeURIComponent(ticket.ticketId)}`);
  };

  return (
    <PassengerLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/passenger/tickets"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4B6272] hover:text-[#183B50] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>All My Tickets</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[#E5DFD3] bg-white text-xs font-bold text-[#183B50] hover:bg-[#F5F1E8] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print Pass</span>
            </button>

            <button
              type="button"
              onClick={handleTestInConductorScanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#183B50] text-white text-xs font-bold hover:bg-[#112B3B] transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Verify as Conductor</span>
            </button>
          </div>
        </div>

        <DigitalTicketCard
          ticket={ticket}
          bus={bus}
          onCopyId={handleCopyId}
          copied={copied}
        />

        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <Link
            to="/passenger"
            className="flex-1 min-h-[44px] rounded-[10px] border-[1.5px] border-[#183B50] bg-white hover:bg-[#F5F1E8] text-[#183B50] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Ticket className="w-4 h-4" aria-hidden="true" />
            <span>Book Another Bus</span>
          </Link>
        </div>
      </div>
    </PassengerLayout>
  );
};
