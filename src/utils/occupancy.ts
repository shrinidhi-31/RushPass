import { CrowdStatus } from '../types/transit';

/**
 * Computes Occupancy Percentage = (Current Passengers / Bus Capacity) * 100
 */
export function calculateOccupancyPercentage(currentPassengers: number, capacity: number): number {
  if (capacity <= 0) return 0;
  const clamped = Math.max(0, Math.min(currentPassengers, capacity));
  return Math.round((clamped / capacity) * 100);
}

/**
 * Exact raw occupancy percentage for threshold boundaries:
 * - 0–40%: Less Crowded
 * - Above 40–70%: Moderate
 * - Above 70–90%: Very Crowded
 * - Above 90%: Full
 */
export function getCrowdStatus(currentPassengers: number, capacity: number): CrowdStatus {
  if (capacity <= 0) return 'Full';
  const exactPercentage = (Math.max(0, Math.min(currentPassengers, capacity)) / capacity) * 100;
  if (exactPercentage <= 40) return 'Less Crowded';
  if (exactPercentage <= 70) return 'Moderate';
  if (exactPercentage <= 90) return 'Very Crowded';
  return 'Full';
}

export interface CrowdTheme {
  status: CrowdStatus;
  textColor: string;
  bgTint: string;
  borderColor: string;
  barColor: string;
  shortNote: string;
}

export function getCrowdTheme(status: CrowdStatus): CrowdTheme {
  switch (status) {
    case 'Less Crowded':
      return {
        status,
        textColor: 'text-[#006858]',
        bgTint: 'bg-[#E9F6F2]',
        borderColor: 'border-[#B6E2D6]',
        barColor: 'bg-[#278B78]',
        shortNote: 'Ample seats available',
      };
    case 'Moderate':
      return {
        status,
        textColor: 'text-[#294A60]',
        bgTint: 'bg-[#EAF3FA]',
        borderColor: 'border-[#C2DAEC]',
        barColor: 'bg-[#416279]',
        shortNote: 'Seats filling steadily',
      };
    case 'Very Crowded':
      return {
        status,
        textColor: 'text-[#9A4E10]',
        bgTint: 'bg-[#FDF2E6]',
        borderColor: 'border-[#F1D2AE]',
        barColor: 'bg-[#D97706]',
        shortNote: 'Standing room mostly',
      };
    case 'Full':
      return {
        status,
        textColor: 'text-[#A03934]',
        bgTint: 'bg-[#FDECEC]',
        borderColor: 'border-[#F5C2BF]',
        barColor: 'bg-[#C95750]',
        shortNote: 'At or near full capacity',
      };
  }
}

/**
 * Calculates New Passenger Count = Previous Count + Boarded - Exited,
 * enforcing non-negative and <= capacity constraints.
 */
export function computeUpdatedPassengerCount(
  previousCount: number,
  boarded: number,
  exited: number,
  capacity: number
): { valid: boolean; nextCount: number; error?: string } {
  if (boarded < 0 || exited < 0 || !Number.isInteger(boarded) || !Number.isInteger(exited)) {
    return {
      valid: false,
      nextCount: previousCount,
      error: 'Boarded and exited counts must be whole numbers of 0 or greater.',
    };
  }

  const nextCount = previousCount + boarded - exited;

  if (nextCount < 0) {
    return {
      valid: false,
      nextCount: previousCount,
      error: `Cannot exit ${exited} passengers when only ${previousCount + boarded} are onboard.`,
    };
  }

  if (nextCount > capacity) {
    return {
      valid: false,
      nextCount: previousCount,
      error: `Update would reach ${nextCount} passengers, exceeding bus capacity of ${capacity}.`,
    };
  }

  return { valid: true, nextCount };
}

export function calculateStageFare(
  stops: string[],
  boardingPoint: string,
  destination: string,
  baseFare: number,
  maxFare: number
): number {
  const startIdx = stops.indexOf(boardingPoint);
  const endIdx = stops.indexOf(destination);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return baseFare;
  }
  const totalSegments = Math.max(1, stops.length - 1);
  const traveledSegments = endIdx - startIdx;
  const rawFare = baseFare + ((maxFare - baseFare) * traveledSegments) / totalSegments;
  return Math.round(rawFare / 5) * 5;
}

export function formatTimeShort(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Just now';
  }
}

export function formatDateTimeShort(iso: string): string {
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Just now';
  }
}
