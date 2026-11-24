export type CrowdStatus = 'Less Crowded' | 'Moderate' | 'Very Crowded' | 'Full';

export type UserRole = 'passenger' | 'conductor';

export type TicketStatus = 'ACTIVE' | 'USED';

export type VerificationOutcome = 'VALID' | 'INVALID' | 'ALREADY_USED' | 'MISMATCHED';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  badgeId?: string;
  assignedBusId?: string;
}

export interface BusRoute {
  id: string;
  routeCode: string;
  busNumber: string;
  origin: string;
  destination: string;
  stops: string[];
  currentStopIndex: number;
  currentPassengers: number;
  capacity: number;
  baseFare: number;
  maxFare: number;
  etaMinutes: number;
  frequencyMinutes: number;
  serviceType: 'Ordinary' | 'AC Vajra' | 'Express';
  conductorId: string;
  conductorName: string;
  lastUpdatedAt: string;
}

export interface TicketRecord {
  ticketId: string;
  passengerId: string;
  passengerName: string;
  busId: string;
  busNumber: string;
  routeCode: string;
  boardingPoint: string;
  destination: string;
  fare: number;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
  verifiedByBus?: string;
}

export interface ActivityLogEntry {
  id: string;
  busId: string;
  routeCode: string;
  busNumber: string;
  type: 'BOARDING_QR' | 'MANUAL_COUNT' | 'STOP_ADVANCE' | 'TICKET_ISSUED' | 'ALERT';
  summary: string;
  timestamp: string;
  passengerDelta?: number;
}

export interface CrowdAlert {
  id: string;
  busId: string;
  routeCode: string;
  busNumber: string;
  severity: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface VerificationResult {
  outcome: VerificationOutcome;
  scannedRaw: string;
  ticket?: TicketRecord;
  message: string;
  checkedAt: string;
}
