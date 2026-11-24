import React from 'react';
import { AlertTriangle, CheckCircle2, MinusCircle, Users } from 'lucide-react';
import {
  calculateOccupancyPercentage,
  getCrowdStatus,
  getCrowdTheme,
} from '../utils/occupancy';

interface CrowdIndicatorProps {
  currentPassengers: number;
  capacity: number;
  showBar?: boolean;
  compact?: boolean;
}

export const CrowdIndicator: React.FC<CrowdIndicatorProps> = ({
  currentPassengers,
  capacity,
  showBar = true,
  compact = false,
}) => {
  const pct = calculateOccupancyPercentage(currentPassengers, capacity);
  const status = getCrowdStatus(currentPassengers, capacity);
  const theme = getCrowdTheme(status);

  const Icon =
    status === 'Less Crowded'
      ? CheckCircle2
      : status === 'Moderate'
      ? Users
      : status === 'Very Crowded'
      ? AlertTriangle
      : MinusCircle;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold border ${theme.bgTint} ${theme.textColor} ${theme.borderColor}`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{status}</span>
          </span>
          {!compact && (
            <span className="text-xs font-medium text-[#4B6272]">{theme.shortNote}</span>
          )}
        </div>
        <div className="text-sm font-bold text-[#183B50] tabular-nums whitespace-nowrap">
          {pct}%{' '}
          <span className="text-xs font-semibold text-[#4B6272]">
            ({currentPassengers}/{capacity} seats)
          </span>
        </div>
      </div>

      {showBar && (
        <div
          className="h-2.5 w-full rounded-full bg-[#ECE8DF] overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Bus occupancy ${pct}%, ${status}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${theme.barColor}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}
    </div>
  );
};
