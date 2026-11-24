import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bus, LogOut, Search, Ticket, User } from 'lucide-react';
import { useTransit } from '../services/transitStore';

interface PassengerLayoutProps {
  children: React.ReactNode;
}

export const PassengerLayout: React.FC<PassengerLayoutProps> = ({ children }) => {
  const { currentUser, logout, tickets } = useTransit();
  const navigate = useNavigate();

  const activeTicketCount = tickets.filter((t) => t.status === 'ACTIVE').length;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#183B50]">
      {/* Desktop & Mobile Top Bar (Strict 3-zone contract on desktop) */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5DFD3]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <Link
            to="/passenger"
            className="text-lg sm:text-xl font-extrabold tracking-tight text-[#183B50] whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#278B78] text-white">
              <Bus className="w-4 h-4" aria-hidden="true" />
            </span>
            <span>RushPass</span>
          </Link>

          {/* Zone 2: Concise single-line nav links (desktop/tablet) */}
          <nav
            aria-label="Passenger navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#4B6272]"
          >
            <NavLink
              to="/passenger"
              end
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#278B78] text-[#183B50]'
                    : 'border-transparent hover:text-[#183B50]'
                }`
              }
            >
              Find Buses
            </NavLink>
            <NavLink
              to="/passenger/tickets"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#278B78] text-[#183B50]'
                    : 'border-transparent hover:text-[#183B50]'
                }`
              }
            >
              My Tickets ({activeTicketCount})
            </NavLink>
            <NavLink
              to="/passenger/ticket/RP10248"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#278B78] text-[#183B50]'
                    : 'border-transparent hover:text-[#183B50]'
                }`
              }
            >
              Sample Pass
            </NavLink>
            <NavLink
              to="/passenger/profile"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#278B78] text-[#183B50]'
                    : 'border-transparent hover:text-[#183B50]'
                }`
              }
            >
              Account
            </NavLink>
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[#183B50] bg-white text-[#183B50] text-xs font-bold hover:bg-[#F5F1E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{currentUser ? 'Switch Role' : 'Portal Login'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-6 pb-24 md:pb-10">
        {children}
      </main>

      {/* Quiet Prototype Attribution Footer (Desktop) */}
      <footer className="hidden md:block border-t border-[#E5DFD3] bg-[#FDF9F0] py-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between text-xs text-[#7D909E]">
          <span>
            Prototype Demo Data · Simulated Bangalore bus routes and occupancy for RushPass demonstration
          </span>
          <span>
            Signed in as <strong className="text-[#183B50]">{currentUser?.name || 'Shrinidhi (Demo)'}</strong>
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Within 15% mobile viewport cap) */}
      <nav
        aria-label="Mobile passenger navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5DFD3]"
      >
        <div className="grid grid-cols-3 h-16">
          <NavLink
            to="/passenger"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-bold transition-colors ${
                isActive ? 'text-[#006858]' : 'text-[#7D909E]'
              }`
            }
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            <span>Find Bus</span>
          </NavLink>
          <NavLink
            to="/passenger/tickets"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-bold transition-colors ${
                isActive ? 'text-[#006858]' : 'text-[#7D909E]'
              }`
            }
          >
            <Ticket className="w-5 h-5" aria-hidden="true" />
            <span>Tickets ({activeTicketCount})</span>
          </NavLink>
          <NavLink
            to="/passenger/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-bold transition-colors ${
                isActive ? 'text-[#006858]' : 'text-[#7D909E]'
              }`
            }
          >
            <User className="w-5 h-5" aria-hidden="true" />
            <span>Account</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
