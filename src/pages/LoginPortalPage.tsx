import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bus, QrCode, ShieldCheck, Ticket, UserCheck } from 'lucide-react';
import { useTransit } from '../services/transitStore';
import { CrowdIndicator } from '../components/CrowdIndicator';
import { formatTimeShort } from '../utils/occupancy';

export const LoginPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { buses, loginAsDemo, loginPassenger, registerPassenger, loginConductor } = useTransit();

  const [activePortal, setActivePortal] = useState<'passenger' | 'conductor'>('passenger');
  const [passengerMode, setPassengerMode] = useState<'login' | 'register'>('login');

  // Passenger login/register form state
  const [email, setEmail] = useState('shrinidhisbadiger@gmail.com');
  const [password, setPassword] = useState('demo1234');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [passengerError, setPassengerError] = useState('');

  // Conductor login form state
  const [badgeId, setBadgeId] = useState('COND-500D-01');
  const [pin, setPin] = useState('4500');
  const [selectedBusId, setSelectedBusId] = useState('BUS-500D-1234');
  const [conductorError, setConductorError] = useState('');

  const featuredBus = buses.find((b) => b.id === 'BUS-500D-1234') || buses[0];

  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassengerError('');

    if (passengerMode === 'login') {
      if (!email.trim() || !email.includes('@')) {
        setPassengerError('Please enter a valid email address.');
        return;
      }
      if (!password.trim() || password.length < 4) {
        setPassengerError('Password must be at least 4 characters.');
        return;
      }
      loginPassenger(email);
      navigate('/passenger');
    } else {
      if (!password.trim() || password.length < 4) {
        setPassengerError('Please choose a password of at least 4 characters.');
        return;
      }
      const res = registerPassenger(fullName, email, phone);
      if (!res.ok) {
        setPassengerError(res.error || 'Could not create account.');
        return;
      }
      navigate('/passenger');
    }
  };

  const handleConductorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConductorError('');
    if (!pin.trim() || pin.length < 4) {
      setConductorError('Please enter your 4-digit duty PIN.');
      return;
    }
    const res = loginConductor(badgeId, selectedBusId);
    if (!res.ok) {
      setConductorError(res.error || 'Conductor sign in failed.');
      return;
    }
    navigate('/conductor');
  };

  const handleQuickDemo = (role: 'passenger' | 'conductor') => {
    if (role === 'passenger') {
      loginAsDemo('passenger');
      navigate('/passenger');
    } else {
      loginAsDemo('conductor', selectedBusId);
      navigate('/conductor');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#183B50] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E5DFD3]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#278B78] text-white">
              <Bus className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#183B50]">
              RushPass
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleQuickDemo('passenger')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[#183B50] text-xs font-bold text-[#183B50] hover:bg-[#F5F1E8] transition-colors cursor-pointer"
            >
              Passenger Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('conductor')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#278B78] text-xs font-bold text-white hover:bg-[#1E7060] transition-colors cursor-pointer"
            >
              Conductor Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Product Overview & Shared Live Sample Feed */}
          <section className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#006858]">
                Prototype Demo · Bangalore Urban Bus Transit
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#183B50] leading-tight">
                Crowd-aware digital bus ticketing &amp; live occupancy control.
              </h1>
              <p className="text-base text-[#4B6272] leading-relaxed max-w-xl">
                Passengers check real-time bus crowd levels before boarding and generate instant QR tickets. Conductors verify passes and update onboard counts on a shared data layer.
              </p>
            </div>

            {/* Live Shared Bus Snapshot */}
            <div className="tactile-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center rounded-[6px] bg-[#183B50] text-white px-2.5 py-1 text-sm font-extrabold tabular-nums">
                    {featuredBus.routeCode}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#183B50] tabular-nums">
                      {featuredBus.busNumber}
                    </p>
                    <p className="text-xs text-[#4B6272]">
                      {featuredBus.origin} → {featuredBus.destination}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#7D909E] tabular-nums">
                  Updated {formatTimeShort(featuredBus.lastUpdatedAt)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FDF9F0] rounded-xl p-3 border border-[#E5DFD3]">
                <div>
                  <span className="text-[#7D909E] font-semibold block">Current Stop</span>
                  <span className="font-bold text-[#183B50] text-sm">
                    {featuredBus.stops[featuredBus.currentStopIndex]}
                  </span>
                </div>
                <div>
                  <span className="text-[#7D909E] font-semibold block">Next Stop</span>
                  <span className="font-bold text-[#183B50] text-sm">
                    {featuredBus.stops[featuredBus.currentStopIndex + 1] || 'Terminus'}
                  </span>
                </div>
              </div>

              <CrowdIndicator
                currentPassengers={featuredBus.currentPassengers}
                capacity={featuredBus.capacity}
              />

              <div className="pt-1 flex items-center justify-between text-xs text-[#4B6272]">
                <span>Sample Ticket Ready: <strong className="text-[#183B50] tabular-nums">RP10248</strong> (Shrinidhi · ₹35)</span>
                <span className="font-semibold text-[#006858]">Shared Live State</span>
              </div>
            </div>

            {/* Prototype Note */}
            <div className="rounded-xl bg-[#FDF9F0] border border-[#E5DFD3] px-4 py-3 text-xs text-[#4B6272] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#278B78] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <strong>Sample Data Notice:</strong> All routes, fares, and occupancy figures shown here are simulated prototype data stored locally in your browser so Passenger and Conductor screens stay synchronized.
              </p>
            </div>
          </section>

          {/* Right Column: Role Selection & Auth Card */}
          <section className="lg:col-span-6">
            <div className="tactile-ticket overflow-hidden">
              {/* Role Selector Tabs */}
              <div className="grid grid-cols-2 border-b border-[#E5DFD3] bg-[#F7F3EA]">
                <button
                  type="button"
                  onClick={() => setActivePortal('passenger')}
                  className={`py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[52px] ${
                    activePortal === 'passenger'
                      ? 'bg-white text-[#183B50] border-b-2 border-[#278B78]'
                      : 'text-[#4B6272] hover:text-[#183B50]'
                  }`}
                >
                  <Ticket className="w-4 h-4" aria-hidden="true" />
                  <span>Passenger Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePortal('conductor')}
                  className={`py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[52px] ${
                    activePortal === 'conductor'
                      ? 'bg-white text-[#183B50] border-b-2 border-[#278B78]'
                      : 'text-[#4B6272] hover:text-[#183B50]'
                  }`}
                >
                  <QrCode className="w-4 h-4" aria-hidden="true" />
                  <span>Conductor Login</span>
                </button>
              </div>

              {activePortal === 'passenger' ? (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#183B50]">
                        {passengerMode === 'login' ? 'Commuter Sign In' : 'Create Passenger Account'}
                      </h2>
                      <p className="text-xs text-[#4B6272] mt-0.5">
                        Search buses, check crowd levels, and carry QR passes
                      </p>
                    </div>
                    <div className="inline-flex rounded-lg bg-[#F1EEE5] p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerMode('login');
                          setPassengerError('');
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          passengerMode === 'login'
                            ? 'bg-white text-[#183B50] shadow-xs'
                            : 'text-[#4B6272]'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerMode('register');
                          setPassengerError('');
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          passengerMode === 'register'
                            ? 'bg-white text-[#183B50] shadow-xs'
                            : 'text-[#4B6272]'
                        }`}
                      >
                        Register
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handlePassengerSubmit} className="space-y-4">
                    {passengerMode === 'register' && (
                      <>
                        <div>
                          <label
                            htmlFor="pass-name"
                            className="block text-xs font-bold text-[#183B50] mb-1.5"
                          >
                            Full Name
                          </label>
                          <input
                            id="pass-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Shrinidhi S"
                            className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm text-[#183B50] placeholder:text-[#7D909E] focus:outline-none focus:border-[#278B78]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="pass-phone"
                            className="block text-xs font-bold text-[#183B50] mb-1.5"
                          >
                            Mobile Number (Optional)
                          </label>
                          <input
                            id="pass-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98450 00000"
                            className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm text-[#183B50] placeholder:text-[#7D909E] focus:outline-none focus:border-[#278B78]"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label
                        htmlFor="pass-email"
                        className="block text-xs font-bold text-[#183B50] mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        id="pass-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="commuter@example.com"
                        className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm text-[#183B50] placeholder:text-[#7D909E] focus:outline-none focus:border-[#278B78]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="pass-password"
                        className="block text-xs font-bold text-[#183B50] mb-1.5"
                      >
                        Password
                      </label>
                      <input
                        id="pass-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm text-[#183B50] placeholder:text-[#7D909E] focus:outline-none focus:border-[#278B78]"
                      />
                    </div>

                    {passengerError && (
                      <p role="alert" className="text-xs font-semibold text-[#C95750]">
                        {passengerError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full min-h-[48px] rounded-[10px] bg-[#278B78] hover:bg-[#1E7060] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>
                        {passengerMode === 'login' ? 'Sign In to Passenger App' : 'Register & Continue'}
                      </span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </form>

                  <div className="border-t border-[#E5DFD3] pt-4">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('passenger')}
                      className="w-full min-h-[44px] rounded-[10px] border-[1.5px] border-[#183B50] bg-white hover:bg-[#F5F1E8] text-[#183B50] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-[#278B78]" aria-hidden="true" />
                      <span>Instant Demo: Continue as Shrinidhi</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#183B50]">Conductor Duty Sign In</h2>
                    <p className="text-xs text-[#4B6272] mt-0.5">
                      Scan QR tickets, confirm boarding, and manage live bus occupancy
                    </p>
                  </div>

                  <form onSubmit={handleConductorSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="cond-bus"
                        className="block text-xs font-bold text-[#183B50] mb-1.5"
                      >
                        Assigned Bus &amp; Route
                      </label>
                      <select
                        id="cond-bus"
                        value={selectedBusId}
                        onChange={(e) => setSelectedBusId(e.target.value)}
                        className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm font-semibold text-[#183B50] focus:outline-none focus:border-[#278B78]"
                      >
                        {buses.map((bus) => (
                          <option key={bus.id} value={bus.id}>
                            Route {bus.routeCode} · {bus.busNumber} ({bus.origin} → {bus.destination})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="cond-badge"
                          className="block text-xs font-bold text-[#183B50] mb-1.5"
                        >
                          Conductor Badge ID
                        </label>
                        <input
                          id="cond-badge"
                          type="text"
                          value={badgeId}
                          onChange={(e) => setBadgeId(e.target.value)}
                          placeholder="COND-500D-01"
                          className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm text-[#183B50] uppercase tabular-nums focus:outline-none focus:border-[#278B78]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cond-pin"
                          className="block text-xs font-bold text-[#183B50] mb-1.5"
                        >
                          Duty PIN
                        </label>
                        <input
                          id="cond-pin"
                          type="password"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="••••"
                          className="w-full rounded-[12px] border border-[#E5DFD3] bg-white px-4 py-3 text-sm text-[#183B50] tabular-nums focus:outline-none focus:border-[#278B78]"
                        />
                      </div>
                    </div>

                    {conductorError && (
                      <p role="alert" className="text-xs font-semibold text-[#C95750]">
                        {conductorError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full min-h-[48px] rounded-[10px] bg-[#183B50] hover:bg-[#112B3B] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Start Duty Shift</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </form>

                  <div className="border-t border-[#E5DFD3] pt-4">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('conductor')}
                      className="w-full min-h-[44px] rounded-[10px] border-[1.5px] border-[#278B78] bg-[#E9F6F2] hover:bg-[#D6EFE8] text-[#006858] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" aria-hidden="true" />
                      <span>Instant Demo: Bus 500D (KA-01-AB-1234)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
