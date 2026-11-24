import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  QrCode,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { ConductorLayout } from '../../components/ConductorLayout';
import { CrowdIndicator } from '../../components/CrowdIndicator';
import { useTransit } from '../../services/transitStore';
import { VerificationResult } from '../../types/transit';
import { formatDateTimeShort } from '../../utils/occupancy';

const SCANNER_ELEMENT_ID = 'rushpass-qr-reader';

export const ConductorScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    buses,
    currentUser,
    verifyTicketPayload,
    confirmTicketBoarding,
  } = useTransit();

  const assignedBus =
    buses.find((b) => b.id === currentUser?.assignedBusId) || buses[0];

  const [manualInput, setManualInput] = useState<string>(
    searchParams.get('ticketId') || ''
  );
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [boardingFeedback, setBoardingFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  // Camera scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const runVerification = useCallback(
    (payload: string) => {
      setBoardingFeedback(null);
      const result = verifyTicketPayload(payload, assignedBus.id);
      setVerification(result);
    },
    [assignedBus.id, verifyTicketPayload]
  );

  // Auto-verify if navigated directly with ?ticketId=...
  useEffect(() => {
    const initialId = searchParams.get('ticketId');
    if (initialId) {
      runVerification(initialId);
    }
  }, [searchParams, runVerification]);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // Ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const instance = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = instance;
      setCameraActive(true);

      await instance.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          setManualInput(decodedText);
          runVerification(decodedText);
          void stopCamera();
        },
        () => {
          // Per-frame decode misses are expected
        }
      );
    } catch {
      setCameraActive(false);
      scannerRef.current = null;
      setCameraError(
        'Camera access is unavailable or was denied in this browser. Use Manual Ticket ID verification below.'
      );
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    runVerification(manualInput);
  };

  const handleConfirmBoarding = () => {
    if (!verification?.ticket) return;
    const res = confirmTicketBoarding(verification.ticket.ticketId, assignedBus.id);
    if (!res.ok) {
      setBoardingFeedback({
        type: 'err',
        text: res.error || 'Could not confirm boarding.',
      });
      return;
    }

    setBoardingFeedback({
      type: 'ok',
      text: `Boarding confirmed for ${verification.ticket.passengerName} (${verification.ticket.ticketId}). Ticket marked as USED and passenger count incremented.`,
    });
    setVerification({
      ...verification,
      ticket: res.ticket,
    });
  };

  return (
    <ConductorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#006858]">
              Ticket Verification · Bus {assignedBus.routeCode} ({assignedBus.busNumber})
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183B50] mt-1">
              QR Ticket Scanner
            </h1>
            <p className="text-sm text-[#4B6272] mt-1">
              Scan passenger QR passes or enter a Ticket ID to validate against live RushPass records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 6 Cols: Camera Scanner & Manual Entry */}
          <div className="lg:col-span-6 space-y-5">
            {/* Camera QR Viewport Card */}
            <section className="tactile-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#278B78]" aria-hidden="true" />
                  <h2 className="text-base font-bold text-[#183B50]">Device Camera Scanner</h2>
                </div>

                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="min-h-[40px] px-4 py-2 rounded-[10px] bg-[#278B78] hover:bg-[#1E7060] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void stopCamera()}
                    className="min-h-[40px] px-4 py-2 rounded-[10px] bg-[#C95750] hover:bg-[#A03934] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>

              <div className="rounded-xl overflow-hidden border border-[#E5DFD3] bg-[#FDF9F0] min-h-[220px] flex flex-col items-center justify-center relative">
                <div id={SCANNER_ELEMENT_ID} className="w-full" />
                {!cameraActive && (
                  <div className="p-6 text-center space-y-2">
                    <QrCode className="w-10 h-10 text-[#7D909E] mx-auto" aria-hidden="true" />
                    <p className="text-sm font-bold text-[#183B50]">
                      Camera preview is paused
                    </p>
                    <p className="text-xs text-[#4B6272] max-w-xs mx-auto">
                      Tap &ldquo;Start Camera&rdquo; to scan a live passenger QR code, or verify manually below.
                    </p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#FDF2E6] border border-[#F1D2AE] px-3.5 py-2.5 text-xs font-semibold text-[#9A4E10]"
                >
                  {cameraError}
                </div>
              )}
            </section>

            {/* Manual Ticket Entry Fallback & Test Shortcuts */}
            <section className="tactile-card p-5 space-y-4">
              <h2 className="text-base font-bold text-[#183B50]">
                Manual Ticket ID Verification
              </h2>

              <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search
                    className="w-4 h-4 text-[#7D909E] absolute left-3.5 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    aria-label="Enter Ticket ID or QR payload"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. RP10248)"
                    className="w-full rounded-[12px] border border-[#E5DFD3] bg-white pl-10 pr-4 py-3 text-sm font-semibold text-[#183B50] placeholder:text-[#7D909E] focus:outline-none focus:border-[#278B78]"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[46px] px-5 py-2.5 rounded-[10px] bg-[#183B50] hover:bg-[#112B3B] text-white text-sm font-bold whitespace-nowrap transition-colors cursor-pointer"
                >
                  Verify Ticket
                </button>
              </form>

              <div className="pt-2 border-t border-[#E5DFD3] space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D909E]">
                  Quick Prototype Test Payloads
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualInput('RP10248');
                      runVerification('RP10248');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#B6E2D6] bg-[#E9F6F2] text-xs font-bold text-[#006858] hover:bg-[#D6EFE8] cursor-pointer"
                  >
                    Valid Sample (RP10248)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualInput('RP10085');
                      runVerification('RP10085');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FDF9F0] text-xs font-bold text-[#4B6272] hover:bg-[#ECE8DF] cursor-pointer"
                  >
                    Already Used (RP10085)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualInput('RP10192');
                      runVerification('RP10192');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#F1D2AE] bg-[#FDF2E6] text-xs font-bold text-[#9A4E10] hover:bg-[#FAE4CA] cursor-pointer"
                  >
                    Wrong Bus (RP10192)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualInput('RANDOM-QR-TEXT-999');
                      runVerification('RANDOM-QR-TEXT-999');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#F5C2BF] bg-[#FDECEC] text-xs font-bold text-[#A03934] hover:bg-[#FAD6D4] cursor-pointer"
                  >
                    Unregistered QR
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right 6 Cols: Verification Result & Live Occupancy */}
          <div className="lg:col-span-6 space-y-5">
            {!verification ? (
              <section className="tactile-card p-8 text-center space-y-3">
                <QrCode className="w-10 h-10 text-[#7D909E] mx-auto" aria-hidden="true" />
                <h2 className="text-base font-bold text-[#183B50]">
                  Awaiting Ticket Scan
                </h2>
                <p className="text-sm text-[#4B6272] max-w-sm mx-auto">
                  Scan a passenger QR pass or enter Ticket ID <strong className="tabular-nums">RP10248</strong> to verify validity against RushPass records.
                </p>
              </section>
            ) : (
              <section
                aria-live="polite"
                className="tactile-ticket overflow-hidden"
              >
                {/* Outcome Banner */}
                <div
                  className={`px-6 py-4 flex items-center gap-3 ${
                    verification.outcome === 'VALID'
                      ? 'bg-[#278B78] text-white'
                      : verification.outcome === 'MISMATCHED'
                      ? 'bg-[#D97706] text-white'
                      : 'bg-[#C95750] text-white'
                  }`}
                >
                  {verification.outcome === 'VALID' ? (
                    <CheckCircle2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                  ) : verification.outcome === 'MISMATCHED' ? (
                    <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden="true" />
                  ) : verification.outcome === 'ALREADY_USED' ? (
                    <ShieldAlert className="w-6 h-6 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-6 h-6 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                      Verification Result
                    </p>
                    <h2 className="text-lg font-extrabold">
                      {verification.outcome === 'VALID' && 'Valid Ticket — Ready to Board'}
                      {verification.outcome === 'ALREADY_USED' && 'Ticket Already Used'}
                      {verification.outcome === 'MISMATCHED' && 'Bus / Route Mismatch'}
                      {verification.outcome === 'INVALID' && 'Invalid / Unrecognized Ticket'}
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-sm font-medium text-[#183B50]">
                    {verification.message}
                  </p>

                  {verification.ticket && (
                    <div className="rounded-xl bg-[#FDF9F0] border border-[#E5DFD3] p-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#7D909E] font-semibold block">Ticket ID</span>
                        <span className="font-extrabold text-[#183B50] text-sm tabular-nums">
                          {verification.ticket.ticketId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7D909E] font-semibold block">Passenger</span>
                        <span className="font-bold text-[#183B50] text-sm">
                          {verification.ticket.passengerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7D909E] font-semibold block">Journey</span>
                        <span className="font-bold text-[#183B50]">
                          {verification.ticket.boardingPoint} → {verification.ticket.destination}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7D909E] font-semibold block">Issued Bus &amp; Fare</span>
                        <span className="font-bold text-[#183B50] tabular-nums">
                          {verification.ticket.routeCode} ({verification.ticket.busNumber}) · ₹
                          {verification.ticket.fare}
                        </span>
                      </div>
                      {verification.ticket.usedAt && (
                        <div className="col-span-2 pt-2 border-t border-[#E5DFD3] text-[#A03934] font-semibold tabular-nums">
                          Previously boarded at {formatDateTimeShort(verification.ticket.usedAt)}
                        </div>
                      )}
                    </div>
                  )}

                  {boardingFeedback && (
                    <div
                      role="status"
                      className={`rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2 ${
                        boardingFeedback.type === 'ok'
                          ? 'bg-[#E9F6F2] text-[#006858] border border-[#B6E2D6]'
                          : 'bg-[#FDECEC] text-[#A03934] border border-[#F5C2BF]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{boardingFeedback.text}</span>
                    </div>
                  )}

                  {verification.outcome === 'VALID' &&
                    verification.ticket?.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={handleConfirmBoarding}
                        className="w-full min-h-[48px] rounded-[10px] bg-[#278B78] hover:bg-[#1E7060] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                        <span>Confirm Boarding &amp; Mark Ticket Used (+1 Passenger)</span>
                      </button>
                    )}
                </div>
              </section>
            )}

            {/* Shared Live Bus Occupancy Status */}
            <section className="tactile-card p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#183B50]">
                  Current Occupancy · Route {assignedBus.routeCode}
                </span>
                <span className="text-[#4B6272] font-semibold">
                  Stop: {assignedBus.stops[assignedBus.currentStopIndex]}
                </span>
              </div>
              <CrowdIndicator
                currentPassengers={assignedBus.currentPassengers}
                capacity={assignedBus.capacity}
              />
            </section>
          </div>
        </div>
      </div>
    </ConductorLayout>
  );
};
