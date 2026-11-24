import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AlertTriangle, LayoutDashboard, LogOut, Map, QrCode } from 'lucide-react';
import { useTransit } from '../services/transitStore';

interface ConductorLayoutProps {
  children: React.ReactNode;
}

export const ConductorLayout: React.FC<ConductorLayoutProps> = ({ children }) => {
  const { currentUser, logout, alerts, buses, selectConductorBus } = useTransit();
  const navigate = useNavigate();

  const assignedBus =
    buses.find((b) => b.id === currentUser?.assignedBusId) || buses[0];
  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  const handleExit = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#183B50]">
      {/* Top Bar (Strict 3-zone contract on desktop) */}
      <header className="sticky top-0 z-30 bg-[#183B50] text-white border-b border-[#112B3B]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <Link
            to="/conductor"
            className="text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#278B78] text-white">
              <QrCode className="w-4 h-4" aria-hidden="true" />
            </span>
            <span>RushPass Duty</span>
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Conductor navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#C2DAEC]"
          >
            <NavLink
              to="/conductor"
              end
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#7BD7C1] text-white'
                    : 'border-transparent hover:text-white'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/conductor/scanner"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#7BD7C1] text-white'
                    : 'border-transparent hover:text-white'
                }`
              }
            >
              QR Scanner
            </NavLink>
            <NavLink
              to="/conductor/route"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#7BD7C1] text-white'
                    : 'border-transparent hover:text-white'
                }`
              }
            >
              Route Monitor
            </NavLink>
            <NavLink
              to="/conductor/alerts"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#7BD7C1] text-white'
                    : 'border-transparent hover:text-white'
                }`
              }
            >
              Crowd Alerts ({unackCount})
            </NavLink>
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white text-[#183B50] text-xs font-bold hover:bg-[#F5F1E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Switch Role</span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Duty Bus Switcher Strip */}
      <div className="bg-[#FDF9F0] border-b border-[#E5DFD3]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#4B6272]">
            <span className="font-bold text-[#183B50]">Duty Bus:</span>
            <select
              aria-label="Select assigned bus"
              value={assignedBus.id}
              onChange={(e) => selectConductorBus(e.target.value)}
              className="rounded-lg border border-[#E5DFD3] bg-white px-2.5 py-1 text-xs font-bold text-[#183B50] focus:outline-none focus:border-[#278B78]"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  Route {b.routeCode} · {b.busNumber} ({b.origin} → {b.destination})
                </option>
              ))}
            </select>
          </div>
          <div className="text-[#4B6272] font-medium">
            Conductor: <strong className="text-[#183B50]">{currentUser?.name || assignedBus.conductorName}</strong>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Prototype Demo Data</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-6 pb-24 md:pb-10">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile conductor navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5DFD3]"
      >
        <div className="grid grid-cols-4 h-16">
          <NavLink
            to="/conductor"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-bold transition-colors ${
                isActive ? 'text-[#006858]' : 'text-[#7D909E]'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
            <span>Duty</span>
          </NavLink>
          <NavLink
            to="/conductor/scanner"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-bold transition-colors ${
                isActive ? 'text-[#006858]' : 'text-[#7D909E]'
              }`
            }
          >
            <QrCode className="w-5 h-5" aria-hidden="true" />
            <span>Scan QR</span>
          </NavLink>
          <NavLink
            to="/conductor/route"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-bold transition-colors ${
                isActive ? 'text-[#006858]' : 'text-[#7D909E]'
              }`
            }
          >
            <Map className="w-5 h-5" aria-hidden="true" />
            <span>Route</span>
          </NavLink>
          <NavLink
            to="/conductor/alerts"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-bold transition-colors ${
                isActive ? 'text-[#006858]' : 'text-[#7D909E]'
              }`
            }
          >
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <span>Alerts ({unackCount})</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
