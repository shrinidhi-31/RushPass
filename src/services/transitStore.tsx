import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityLogEntry,
  BusRoute,
  CrowdAlert,
  TicketRecord,
  UserAccount,
  UserRole,
  VerificationResult,
} from '../types/transit';
import {
  DEMO_USERS,
  INITIAL_ALERTS,
  INITIAL_BUSES,
  INITIAL_LOGS,
  INITIAL_TICKETS,
} from '../data/mockTransitData';
import {
  calculateOccupancyPercentage,
  computeUpdatedPassengerCount,
  getCrowdStatus,
} from '../utils/occupancy';

const STORAGE_KEY = 'rushpass_shared_state_v1';

interface PersistedState {
  buses: BusRoute[];
  tickets: TicketRecord[];
  logs: ActivityLogEntry[];
  alerts: CrowdAlert[];
  users: UserAccount[];
  currentUser: UserAccount | null;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed.buses && parsed.tickets && parsed.users) {
        return parsed;
      }
    }
  } catch {
    // Fallback to default seed data if storage is unreadable
  }
  return {
    buses: INITIAL_BUSES,
    tickets: INITIAL_TICKETS,
    logs: INITIAL_LOGS,
    alerts: INITIAL_ALERTS,
    users: DEMO_USERS,
    currentUser: null,
  };
}

export function extractTicketIdFromPayload(rawInput: string): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Support structured RushPass QR JSON payloads
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { ticketId?: string; id?: string };
      if (parsed.ticketId && typeof parsed.ticketId === 'string') {
        return parsed.ticketId.trim().toUpperCase();
      }
      if (parsed.id && typeof parsed.id === 'string') {
        return parsed.id.trim().toUpperCase();
      }
      return null;
    } catch {
      return null;
    }
  }

  // Support pipe-delimited payload e.g. RUSHPASS|RP10248|500D
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|');
    const candidate = parts.find((part) => /^RP\d{4,}$/i.test(part.trim()));
    return candidate ? candidate.trim().toUpperCase() : null;
  }

  // Direct ticket ID e.g. RP10248
  return trimmed.toUpperCase();
}

export interface CreateTicketInput {
  busId: string;
  boardingPoint: string;
  destination: string;
  fare: number;
  passengerName?: string;
}

export interface TransitContextValue {
  buses: BusRoute[];
  tickets: TicketRecord[];
  logs: ActivityLogEntry[];
  alerts: CrowdAlert[];
  users: UserAccount[];
  currentUser: UserAccount | null;
  loginAsDemo: (role: UserRole, busId?: string) => UserAccount;
  loginPassenger: (email: string, name?: string) => UserAccount;
  registerPassenger: (name: string, email: string, phone: string) => { ok: boolean; error?: string; user?: UserAccount };
  loginConductor: (badgeId: string, busId: string) => { ok: boolean; error?: string; user?: UserAccount };
  logout: () => void;
  selectConductorBus: (busId: string) => void;
  issueTicket: (input: CreateTicketInput) => { ok: boolean; ticket?: TicketRecord; error?: string };
  verifyTicketPayload: (rawPayload: string, conductorBusId: string) => VerificationResult;
  confirmTicketBoarding: (ticketId: string, conductorBusId: string) => { ok: boolean; error?: string; ticket?: TicketRecord };
  updateBusPassengerCount: (
    busId: string,
    boarded: number,
    exited: number,
    note?: string
  ) => { ok: boolean; error?: string; bus?: BusRoute };
  advanceBusStop: (busId: string) => { ok: boolean; bus?: BusRoute };
  resetBusTrip: (busId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  requestReliefBus: (busId: string) => void;
  resetDemoData: () => void;
}

const TransitContext = createContext<TransitContextValue | null>(null);

export const TransitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());

  // Persist to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  // Sync across open browser tabs (e.g. Passenger in tab 1, Conductor in tab 2)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as PersistedState;
          setState(parsed);
        } catch {
          // Ignore malformed storage sync
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const appendAlertIfThresholdCrossed = useCallback(
    (bus: BusRoute, existingAlerts: CrowdAlert[]): CrowdAlert[] => {
      const pct = calculateOccupancyPercentage(bus.currentPassengers, bus.capacity);
      const status = getCrowdStatus(bus.currentPassengers, bus.capacity);
      if (status !== 'Very Crowded' && status !== 'Full') {
        return existingAlerts;
      }

      const severity = status === 'Full' ? 'critical' : 'warning';
      const newAlert: CrowdAlert = {
        id: `ALT-${Date.now().toString().slice(-5)}`,
        busId: bus.id,
        routeCode: bus.routeCode,
        busNumber: bus.busNumber,
        severity,
        title:
          status === 'Full'
            ? `Capacity Alert on Route ${bus.routeCode}`
            : `High Occupancy on Route ${bus.routeCode}`,
        message: `Bus ${bus.busNumber} is now at ${pct}% (${bus.currentPassengers}/${bus.capacity} · ${status}) near ${bus.stops[bus.currentStopIndex]}.`,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      };
      return [newAlert, ...existingAlerts].slice(0, 20);
    },
    []
  );

  const loginAsDemo = useCallback((role: UserRole, busId?: string): UserAccount => {
    let targetUser: UserAccount;
    if (role === 'passenger') {
      targetUser = DEMO_USERS[0];
    } else {
      targetUser = {
        ...DEMO_USERS[1],
        assignedBusId: busId || 'BUS-500D-1234',
      };
    }
    setState((prev) => ({ ...prev, currentUser: targetUser }));
    return targetUser;
  }, []);

  const loginPassenger = useCallback((email: string, name?: string): UserAccount => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = state.users.find(
      (u) => u.role === 'passenger' && u.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      setState((prev) => ({ ...prev, currentUser: existing }));
      return existing;
    }
    const created: UserAccount = {
      id: `USR-PASS-${Date.now().toString().slice(-4)}`,
      name: name?.trim() || cleanEmail.split('@')[0] || 'Commuter',
      email: cleanEmail,
      role: 'passenger',
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, created],
      currentUser: created,
    }));
    return created;
  }, [state.users]);

  const registerPassenger = useCallback(
    (name: string, email: string, phone: string) => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanName || cleanName.length < 2) {
        return { ok: false, error: 'Please enter your full name (at least 2 characters).' };
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { ok: false, error: 'Please enter a valid email address.' };
      }
      const duplicate = state.users.find(
        (u) => u.role === 'passenger' && u.email.toLowerCase() === cleanEmail
      );
      if (duplicate) {
        return { ok: false, error: 'An account with this email already exists. Please sign in.' };
      }
      const newUser: UserAccount = {
        id: `USR-PASS-${Date.now().toString().slice(-4)}`,
        name: cleanName,
        email: cleanEmail,
        phone: phone.trim(),
        role: 'passenger',
      };
      setState((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUser: newUser,
      }));
      return { ok: true, user: newUser };
    },
    [state.users]
  );

  const loginConductor = useCallback(
    (badgeId: string, busId: string) => {
      const cleanBadge = badgeId.trim().toUpperCase();
      if (!cleanBadge) {
        return { ok: false, error: 'Please enter your conductor badge ID.' };
      }
      const bus = state.buses.find((b) => b.id === busId) || state.buses[0];
      const matched = state.users.find(
        (u) => u.role === 'conductor' && u.badgeId?.toUpperCase() === cleanBadge
      );
      const conductorUser: UserAccount = matched
        ? { ...matched, assignedBusId: bus.id }
        : {
            id: `USR-COND-${Date.now().toString().slice(-4)}`,
            name: bus.conductorName,
            email: `${cleanBadge.toLowerCase()}@rushpass.demo`,
            role: 'conductor',
            badgeId: cleanBadge,
            assignedBusId: bus.id,
          };
      setState((prev) => ({ ...prev, currentUser: conductorUser }));
      return { ok: true, user: conductorUser };
    },
    [state.buses, state.users]
  );

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUser: null }));
  }, []);

  const selectConductorBus = useCallback((busId: string) => {
    setState((prev) => {
      if (!prev.currentUser || prev.currentUser.role !== 'conductor') return prev;
      return {
        ...prev,
        currentUser: { ...prev.currentUser, assignedBusId: busId },
      };
    });
  }, []);

  const issueTicket = useCallback(
    (input: CreateTicketInput) => {
      const bus = state.buses.find((b) => b.id === input.busId);
      if (!bus) {
        return { ok: false, error: 'Selected bus could not be found.' };
      }
      const startIdx = bus.stops.indexOf(input.boardingPoint);
      const endIdx = bus.stops.indexOf(input.destination);
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
        return { ok: false, error: 'Destination must come after the boarding stop.' };
      }
      if (bus.currentPassengers >= bus.capacity) {
        return {
          ok: false,
          error: `Bus ${bus.busNumber} is currently Full (${bus.currentPassengers}/${bus.capacity}). Please choose another less crowded bus.`,
        };
      }

      // Generate unique RP ticket ID
      let randomNum = Math.floor(10300 + Math.random() * 89000);
      while (state.tickets.some((t) => t.ticketId === `RP${randomNum}`)) {
        randomNum++;
      }
      const newTicketId = `RP${randomNum}`;
      const nowIso = new Date().toISOString();

      const ticket: TicketRecord = {
        ticketId: newTicketId,
        passengerId: state.currentUser?.id || 'USR-PASS-01',
        passengerName: input.passengerName || state.currentUser?.name || 'Shrinidhi',
        busId: bus.id,
        busNumber: bus.busNumber,
        routeCode: bus.routeCode,
        boardingPoint: input.boardingPoint,
        destination: input.destination,
        fare: input.fare,
        status: 'ACTIVE',
        issuedAt: nowIso,
      };

      const logEntry: ActivityLogEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        busId: bus.id,
        routeCode: bus.routeCode,
        busNumber: bus.busNumber,
        type: 'TICKET_ISSUED',
        summary: `Ticket ${ticket.ticketId} issued to ${ticket.passengerName} (${ticket.boardingPoint} → ${ticket.destination})`,
        timestamp: nowIso,
      };

      setState((prev) => ({
        ...prev,
        tickets: [ticket, ...prev.tickets],
        logs: [logEntry, ...prev.logs].slice(0, 40),
      }));

      return { ok: true, ticket };
    },
    [state.buses, state.currentUser, state.tickets]
  );

  const verifyTicketPayload = useCallback(
    (rawPayload: string, conductorBusId: string): VerificationResult => {
      const checkedAt = new Date().toISOString();
      const conductorBus = state.buses.find((b) => b.id === conductorBusId);
      const extractedId = extractTicketIdFromPayload(rawPayload);

      if (!extractedId) {
        return {
          outcome: 'INVALID',
          scannedRaw: rawPayload,
          message: 'Unrecognized QR format. This code does not contain a valid RushPass ticket ID.',
          checkedAt,
        };
      }

      const matchedTicket = state.tickets.find(
        (t) => t.ticketId.toUpperCase() === extractedId.toUpperCase()
      );

      if (!matchedTicket) {
        return {
          outcome: 'INVALID',
          scannedRaw: rawPayload,
          message: `Ticket "${extractedId}" was not found in RushPass ticket records. Reject boarding.`,
          checkedAt,
        };
      }

      if (matchedTicket.status === 'USED') {
        return {
          outcome: 'ALREADY_USED',
          scannedRaw: rawPayload,
          ticket: matchedTicket,
          message: `Ticket ${matchedTicket.ticketId} has already been used for boarding and cannot be accepted again.`,
          checkedAt,
        };
      }

      if (conductorBus && matchedTicket.busId !== conductorBus.id) {
        return {
          outcome: 'MISMATCHED',
          scannedRaw: rawPayload,
          ticket: matchedTicket,
          message: `Ticket ${matchedTicket.ticketId} is issued for Route ${matchedTicket.routeCode} (${matchedTicket.busNumber}), not this bus (${conductorBus.routeCode} · ${conductorBus.busNumber}).`,
          checkedAt,
        };
      }

      return {
        outcome: 'VALID',
        scannedRaw: rawPayload,
        ticket: matchedTicket,
        message: `Ticket ${matchedTicket.ticketId} verified for ${matchedTicket.passengerName}. Ready to confirm boarding.`,
        checkedAt,
      };
    },
    [state.buses, state.tickets]
  );

  const confirmTicketBoarding = useCallback(
    (ticketId: string, conductorBusId: string) => {
      const ticket = state.tickets.find((t) => t.ticketId === ticketId);
      const bus = state.buses.find((b) => b.id === conductorBusId);

      if (!ticket || !bus) {
        return { ok: false, error: 'Ticket or bus record could not be located.' };
      }
      if (ticket.status === 'USED') {
        return { ok: false, error: `Ticket ${ticket.ticketId} is already marked as used.` };
      }
      if (ticket.busId !== bus.id) {
        return { ok: false, error: 'Ticket does not belong to the currently assigned bus.' };
      }

      const countCheck = computeUpdatedPassengerCount(bus.currentPassengers, 1, 0, bus.capacity);
      if (!countCheck.valid) {
        return { ok: false, error: countCheck.error };
      }

      const nowIso = new Date().toISOString();
      const updatedTicket: TicketRecord = {
        ...ticket,
        status: 'USED',
        usedAt: nowIso,
        verifiedByBus: bus.busNumber,
      };
      const updatedBus: BusRoute = {
        ...bus,
        currentPassengers: countCheck.nextCount,
        lastUpdatedAt: nowIso,
      };

      const logEntry: ActivityLogEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        busId: bus.id,
        routeCode: bus.routeCode,
        busNumber: bus.busNumber,
        type: 'BOARDING_QR',
        summary: `QR verified ${ticket.ticketId} (${ticket.passengerName}) · Count updated ${bus.currentPassengers} → ${updatedBus.currentPassengers}`,
        timestamp: nowIso,
        passengerDelta: 1,
      };

      setState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) => (t.ticketId === ticket.ticketId ? updatedTicket : t)),
        buses: prev.buses.map((b) => (b.id === bus.id ? updatedBus : b)),
        logs: [logEntry, ...prev.logs].slice(0, 40),
        alerts: appendAlertIfThresholdCrossed(updatedBus, prev.alerts),
      }));

      return { ok: true, ticket: updatedTicket };
    },
    [appendAlertIfThresholdCrossed, state.buses, state.tickets]
  );

  const updateBusPassengerCount = useCallback(
    (busId: string, boarded: number, exited: number, note?: string) => {
      const bus = state.buses.find((b) => b.id === busId);
      if (!bus) {
        return { ok: false, error: 'Bus record not found.' };
      }

      const calc = computeUpdatedPassengerCount(bus.currentPassengers, boarded, exited, bus.capacity);
      if (!calc.valid) {
        return { ok: false, error: calc.error };
      }

      const nowIso = new Date().toISOString();
      const updatedBus: BusRoute = {
        ...bus,
        currentPassengers: calc.nextCount,
        lastUpdatedAt: nowIso,
      };

      const stopName = bus.stops[bus.currentStopIndex];
      const summary =
        note ||
        `${stopName} manual count: +${boarded} boarded, -${exited} exited (${calc.nextCount}/${bus.capacity} onboard)`;

      const logEntry: ActivityLogEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        busId: bus.id,
        routeCode: bus.routeCode,
        busNumber: bus.busNumber,
        type: 'MANUAL_COUNT',
        summary,
        timestamp: nowIso,
        passengerDelta: boarded - exited,
      };

      setState((prev) => ({
        ...prev,
        buses: prev.buses.map((b) => (b.id === bus.id ? updatedBus : b)),
        logs: [logEntry, ...prev.logs].slice(0, 40),
        alerts: appendAlertIfThresholdCrossed(updatedBus, prev.alerts),
      }));

      return { ok: true, bus: updatedBus };
    },
    [appendAlertIfThresholdCrossed, state.buses]
  );

  const advanceBusStop = useCallback(
    (busId: string) => {
      const bus = state.buses.find((b) => b.id === busId);
      if (!bus) return { ok: false };
      const nextIdx = Math.min(bus.stops.length - 1, bus.currentStopIndex + 1);
      const nowIso = new Date().toISOString();
      const updatedBus: BusRoute = {
        ...bus,
        currentStopIndex: nextIdx,
        lastUpdatedAt: nowIso,
      };

      const nextStopName =
        nextIdx < bus.stops.length - 1 ? bus.stops[nextIdx + 1] : 'Final Terminus';

      const logEntry: ActivityLogEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        busId: bus.id,
        routeCode: bus.routeCode,
        busNumber: bus.busNumber,
        type: 'STOP_ADVANCE',
        summary: `Arrived at ${bus.stops[nextIdx]} · Next stop ${nextStopName}`,
        timestamp: nowIso,
      };

      setState((prev) => ({
        ...prev,
        buses: prev.buses.map((b) => (b.id === bus.id ? updatedBus : b)),
        logs: [logEntry, ...prev.logs].slice(0, 40),
      }));

      return { ok: true, bus: updatedBus };
    },
    [state.buses]
  );

  const resetBusTrip = useCallback((busId: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      buses: prev.buses.map((b) =>
        b.id === busId
          ? {
              ...b,
              currentStopIndex: 0,
              currentPassengers: 12,
              lastUpdatedAt: nowIso,
            }
          : b
      ),
    }));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    }));
  }, []);

  const requestReliefBus = useCallback(
    (busId: string) => {
      const bus = state.buses.find((b) => b.id === busId);
      if (!bus) return;
      const nowIso = new Date().toISOString();
      const newAlert: CrowdAlert = {
        id: `ALT-${Date.now().toString().slice(-5)}`,
        busId: bus.id,
        routeCode: bus.routeCode,
        busNumber: bus.busNumber,
        severity: 'info',
        title: `Relief Bus Requested for Route ${bus.routeCode}`,
        message: `Depot dispatch notified from ${bus.stops[bus.currentStopIndex]} due to sustained high demand on ${bus.busNumber}.`,
        createdAt: nowIso,
        acknowledged: false,
      };
      setState((prev) => ({
        ...prev,
        alerts: [newAlert, ...prev.alerts].slice(0, 20),
      }));
    },
    [state.buses]
  );

  const resetDemoData = useCallback(() => {
    const fresh: PersistedState = {
      buses: INITIAL_BUSES,
      tickets: INITIAL_TICKETS,
      logs: INITIAL_LOGS,
      alerts: INITIAL_ALERTS,
      users: DEMO_USERS,
      currentUser: state.currentUser,
    };
    setState(fresh);
  }, [state.currentUser]);

  const value = useMemo<TransitContextValue>(
    () => ({
      buses: state.buses,
      tickets: state.tickets,
      logs: state.logs,
      alerts: state.alerts,
      users: state.users,
      currentUser: state.currentUser,
      loginAsDemo,
      loginPassenger,
      registerPassenger,
      loginConductor,
      logout,
      selectConductorBus,
      issueTicket,
      verifyTicketPayload,
      confirmTicketBoarding,
      updateBusPassengerCount,
      advanceBusStop,
      resetBusTrip,
      acknowledgeAlert,
      requestReliefBus,
      resetDemoData,
    }),
    [
      state,
      loginAsDemo,
      loginPassenger,
      registerPassenger,
      loginConductor,
      logout,
      selectConductorBus,
      issueTicket,
      verifyTicketPayload,
      confirmTicketBoarding,
      updateBusPassengerCount,
      advanceBusStop,
      resetBusTrip,
      acknowledgeAlert,
      requestReliefBus,
      resetDemoData,
    ]
  );

  return <TransitContext.Provider value={value}>{children}</TransitContext.Provider>;
};

export function useTransit(): TransitContextValue {
  const ctx = useContext(TransitContext);
  if (!ctx) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return ctx;
}
