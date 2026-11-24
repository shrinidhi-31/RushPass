import React from 'react';
import { MapPin } from 'lucide-react';

interface RouteTimelineProps {
  stops: string[];
  currentStopIndex: number;
  boardingPoint?: string;
  destination?: string;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  stops,
  currentStopIndex,
  boardingPoint,
  destination,
}) => {
  return (
    <ol className="relative space-y-0" aria-label="Route stop timeline">
      {stops.map((stop, idx) => {
        const isPassed = idx < currentStopIndex;
        const isCurrent = idx === currentStopIndex;
        const isNext = idx === currentStopIndex + 1;
        const isLast = idx === stops.length - 1;
        const isBoarding = boardingPoint === stop;
        const isDest = destination === stop;

        return (
          <li key={stop} className="relative flex items-start gap-3.5 pb-5 last:pb-0">
            {/* Vertical 2px spine */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[9px] top-5 bottom-0 w-[2px] ${
                  isPassed ? 'bg-[#7D909E]' : 'bg-[#E5DFD3]'
                }`}
              />
            )}

            {/* Node marker */}
            <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              {isCurrent ? (
                <span className="relative flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#278B78] opacity-40" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#278B78] ring-2 ring-white" />
                </span>
              ) : isPassed ? (
                <span className="h-2.5 w-2.5 rounded-full bg-[#7D909E]" />
              ) : (
                <span className="h-3 w-3 rounded-full border-2 border-[#183B50] bg-white" />
              )}
            </div>

            {/* Stop details */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={`text-sm leading-tight truncate ${
                    isCurrent
                      ? 'font-extrabold text-[#006858]'
                      : isPassed
                      ? 'font-medium text-[#7D909E]'
                      : 'font-semibold text-[#183B50]'
                  }`}
                >
                  {stop}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#4B6272] mt-0.5">
                  {isCurrent && (
                    <span className="font-bold text-[#006858]">Current Bus Location</span>
                  )}
                  {isNext && <span className="font-semibold text-[#183B50]">Next Stop</span>}
                  {isPassed && <span>Departed</span>}
                  {!isCurrent && !isNext && !isPassed && <span>Upcoming</span>}
                  {(isBoarding || isDest) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-[#278B78]">
                        {isBoarding ? 'Your Boarding' : 'Your Destination'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {isCurrent && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006858] shrink-0">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  Live
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
