import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Clock, Copy, ShieldCheck } from 'lucide-react';
import { BusRoute, TicketRecord } from '../types/transit';
import { formatDateTimeShort } from '../utils/occupancy';
import { CrowdIndicator } from './CrowdIndicator';

interface DigitalTicketCardProps {
  ticket: TicketRecord;
  bus?: BusRoute;
  onCopyId?: (ticketId: string) => void;
  copied?: boolean;
}

export const DigitalTicketCard: React.FC<DigitalTicketCardProps> = ({
  ticket,
  bus,
  onCopyId,
  copied,
}) => {
  const qrPayload = JSON.stringify({
    app: 'RushPass',
    ticketId: ticket.ticketId,
    busNumber: ticket.busNumber,
    routeCode: ticket.routeCode,
  });

  const isUsed = ticket.status === 'USED';

  return (
    <article className="tactile-ticket overflow-hidden max-w-md w-full mx-auto">
      {/* Top Authority Header */}
      <div className="bg-[#183B50] text-white px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center justify-center rounded-[6px] bg-white text-[#183B50] px-2.5 py-1 text-sm font-extrabold tabular-nums shrink-0">
            {ticket.routeCode}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#C2E4FF] tracking-wide uppercase">
              Digital Bus Pass
            </p>
            <p className="text-sm font-bold text-white truncate tabular-nums">
              {ticket.busNumber}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${
              isUsed
                ? 'bg-[#31302B] text-[#E5DFD3]'
                : 'bg-[#278B78] text-white'
            }`}
          >
            {isUsed ? (
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isUsed ? 'Used / Boarded' : 'Active Pass'}</span>
          </span>
        </div>
      </div>

      {/* QR Code Zone */}
      <div className="px-6 py-6 flex flex-col items-center text-center bg-white">
        <div
          className={`p-4 rounded-2xl border-2 ${
            isUsed ? 'border-[#E5DFD3] opacity-60' : 'border-[#183B50]'
          } bg-white`}
        >
          <QRCodeSVG
            value={qrPayload}
            size={188}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#183B50"
            includeMargin={false}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-semibold text-[#7D909E] uppercase tracking-wider">
            Ticket ID
          </span>
          <span className="text-lg font-extrabold text-[#183B50] tracking-tight tabular-nums">
            {ticket.ticketId}
          </span>
          {onCopyId && (
            <button
              type="button"
              onClick={() => onCopyId(ticket.ticketId)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E5DFD3] text-[#4B6272] hover:text-[#183B50] hover:bg-[#F5F1E8] transition-colors cursor-pointer"
              aria-label={`Copy ticket ID ${ticket.ticketId}`}
              title="Copy ticket ID"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {copied && (
          <p className="text-xs font-semibold text-[#006858] mt-1">
            Ticket ID copied to clipboard
          </p>
        )}
        <p className="text-xs text-[#4B6272] mt-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#278B78]" aria-hidden="true" />
          <span>Show this QR code to the bus conductor when boarding</span>
        </p>
      </div>

      {/* Perforated Cutout Divider */}
      <div className="ticket-perforation mx-0" />

      {/* Passenger & Trip Details */}
      <div className="px-6 py-5 bg-[#FDF9F0] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E]">
              Boarding Point
            </p>
            <p className="text-sm font-bold text-[#183B50] mt-0.5">{ticket.boardingPoint}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E]">
              Destination
            </p>
            <p className="text-sm font-bold text-[#183B50] mt-0.5">{ticket.destination}</p>
          </div>
        </div>

        <div className="border-t border-[#E5DFD3] pt-3 grid grid-cols-3 gap-3 text-left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E]">
              Passenger
            </p>
            <p className="text-sm font-bold text-[#183B50] truncate mt-0.5">
              {ticket.passengerName}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E]">
              Fare Paid
            </p>
            <p className="text-sm font-extrabold text-[#006858] tabular-nums mt-0.5">
              ₹{ticket.fare}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E]">
              Issued
            </p>
            <p className="text-xs font-semibold text-[#4B6272] tabular-nums mt-1">
              {formatDateTimeShort(ticket.issuedAt)}
            </p>
          </div>
        </div>

        {isUsed && ticket.usedAt && (
          <div className="rounded-xl bg-[#ECE8DF] px-3.5 py-2.5 text-xs font-semibold text-[#4B6272] flex items-center justify-between">
            <span>Boarding confirmed on {ticket.verifiedByBus || ticket.busNumber}</span>
            <span className="tabular-nums">{formatDateTimeShort(ticket.usedAt)}</span>
          </div>
        )}

        {bus && (
          <div className="border-t border-[#E5DFD3] pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E] mb-2">
              Live Bus Occupancy ({bus.stops[bus.currentStopIndex]} → {bus.stops[bus.currentStopIndex + 1] || 'Terminus'})
            </p>
            <CrowdIndicator
              currentPassengers={bus.currentPassengers}
              capacity={bus.capacity}
              compact
            />
          </div>
        )}
      </div>
    </article>
  );
};
