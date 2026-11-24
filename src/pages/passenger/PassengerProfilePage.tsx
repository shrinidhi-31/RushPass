import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, RotateCcw, ShieldCheck, User } from 'lucide-react';
import { PassengerLayout } from '../../components/PassengerLayout';
import { useTransit } from '../../services/transitStore';

export const PassengerProfilePage: React.FC = () => {
  const { currentUser, tickets, loginAsDemo, resetDemoData } = useTransit();
  const navigate = useNavigate();
  const [resetNotice, setResetNotice] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2500);
  };

  return (
    <PassengerLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#006858]">
            Commuter Account &amp; Reference
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#183B50] mt-1">
            Passenger Profile
          </h1>
        </div>

        {/* Account Info Card */}
        <section className="tactile-card p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#183B50] text-white flex items-center justify-center shrink-0">
              <User className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#183B50]">
                {currentUser?.name || 'Shrinidhi'}
              </h2>
              <p className="text-sm text-[#4B6272]">
                {currentUser?.email || 'shrinidhisbadiger@gmail.com'}
              </p>
              <p className="text-xs text-[#7D909E] mt-0.5">
                Total Passes in History: <strong className="text-[#183B50] tabular-nums">{tickets.length}</strong>
              </p>
            </div>
          </div>

          <div className="border-t border-[#E5DFD3] pt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                loginAsDemo('conductor', 'BUS-500D-1234');
                navigate('/conductor');
              }}
              className="min-h-[44px] px-4 py-2 rounded-[10px] bg-[#183B50] text-white text-sm font-bold inline-flex items-center gap-2 hover:bg-[#112B3B] transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" aria-hidden="true" />
              <span>Switch to Conductor Interface</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-4 py-2 rounded-[10px] border border-[#E5DFD3] bg-white text-[#183B50] text-sm font-bold inline-flex items-center gap-2 hover:bg-[#F5F1E8] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset Prototype Demo Data</span>
            </button>
          </div>

          {resetNotice && (
            <p className="text-xs font-bold text-[#006858]">
              Demo buses, occupancy counts, and sample ticket RP10248 restored to initial state.
            </p>
          )}
        </section>

        {/* Crowd Category Legend */}
        <section className="tactile-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#278B78]" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#183B50]">
              Crowd Threshold Guide
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-[#E9F6F2] border border-[#B6E2D6] p-3.5">
              <p className="font-extrabold text-[#006858]">0% – 40% · Less Crowded</p>
              <p className="text-[#4B6272] mt-1">
                Plenty of open seats available for a comfortable commute.
              </p>
            </div>
            <div className="rounded-xl bg-[#EAF3FA] border border-[#C2DAEC] p-3.5">
              <p className="font-extrabold text-[#294A60]">Above 40% – 70% · Moderate</p>
              <p className="text-[#4B6272] mt-1">
                Balanced load; most commuters can find seating or easy standing space.
              </p>
            </div>
            <div className="rounded-xl bg-[#FDF2E6] border border-[#F1D2AE] p-3.5">
              <p className="font-extrabold text-[#9A4E10]">Above 70% – 90% · Very Crowded</p>
              <p className="text-[#4B6272] mt-1">
                Limited seats left; primarily standing room. Consider alternate buses if available.
              </p>
            </div>
            <div className="rounded-xl bg-[#FDECEC] border border-[#F5C2BF] p-3.5">
              <p className="font-extrabold text-[#A03934]">Above 90% · Full</p>
              <p className="text-[#4B6272] mt-1">
                At or near full capacity. Boarding may be restricted until passengers alight.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PassengerLayout>
  );
};
