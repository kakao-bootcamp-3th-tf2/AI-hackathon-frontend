import React from "react";
import { format, isSameDay, isSameMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { categoryIcons } from "@/entities/action/constants";
import type { Action } from "@/entities/action/types";
import type { DateRange } from "@/store/StoreProvider";

const CATEGORY_STYLES: Record<Action["category"], string> = {
  shopping: "bg-orange-500/20 text-orange-700",
  dining: "bg-red-500/20 text-red-700",
  cafe: "bg-amber-500/20 text-amber-700",
  movie: "bg-purple-500/20 text-purple-700"
};

const getActionBounds = (action: Action) => {
  const start = startOfDay(action.range?.start ?? action.date);
  const fallbackEnd = action.range?.end ?? action.range?.start;
  const resolvedEnd = fallbackEnd ?? action.date;
  const end = endOfDay(resolvedEnd);
  return { start, end };
};

const getActionSpanState = (action: Action, day: Date) => {
  const { start, end } = getActionBounds(action);
  const isStart = isSameDay(day, start);
  const isEnd = isSameDay(day, end);
  return {
    start,
    end,
    isStart,
    isEnd,
    isSingleDay: isStart && isEnd
  };
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarGridProps {
  calendarDays: Date[];
  currentMonth: Date;
  selectedRange: DateRange | null;
  onSelectDate: (date: Date) => void;
  getActionsForDate: (date: Date) => Action[];
  onDayPointerDown: (date: Date) => void;
  onDayPointerEnter: (date: Date) => void;
  onDayPointerUp: () => void;
}

export default function CalendarGrid({
  calendarDays,
  currentMonth,
  selectedRange,
  onSelectDate,
  getActionsForDate,
  onDayPointerDown,
  onDayPointerEnter,
  onDayPointerUp
}: CalendarGridProps) {
  return (
    <>
      <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center text-xs font-medium",
              index === 0 && "text-red-500",
              index === 6 && "text-blue-500",
              index !== 0 && index !== 6 && "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayActions = getActionsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const dayOfWeek = day.getDay();

        const rangeStart = selectedRange?.start ?? null;
        const rangeEnd = selectedRange?.end ?? rangeStart;
        const hasRange = Boolean(rangeStart && rangeEnd);
        const rangeIncludesDay =
          hasRange && isWithinInterval(day, { start: rangeStart!, end: rangeEnd! });
        const isRangeStart = hasRange && isSameDay(day, rangeStart!);
        const isRangeEnd = hasRange && rangeEnd && isSameDay(day, rangeEnd);

          const isRangeBorder = isRangeStart || isRangeEnd;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(day)}
              onPointerDown={(event) => {
                event.preventDefault();
                onDayPointerDown(day);
              }}
              onPointerEnter={() => onDayPointerEnter(day)}
              onPointerUp={onDayPointerUp}
              className={cn(
                "min-h-[80px] md:min-h-[100px] p-1 border-b border-r border-border/30 text-left transition-colors",
                "hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/20",
                rangeIncludesDay && "bg-primary/10",
                isRangeBorder && "ring-2 ring-primary ring-inset",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
                    isToday && "bg-primary text-primary-foreground",
                    !isToday && !isCurrentMonth && "text-muted-foreground/50",
                    !isToday && isCurrentMonth && dayOfWeek === 0 && "text-red-500",
                    !isToday && isCurrentMonth && dayOfWeek === 6 && "text-blue-500",
                    !isToday &&
                      isCurrentMonth &&
                      dayOfWeek !== 0 &&
                      dayOfWeek !== 6 &&
                      "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1 overflow-hidden">
                {dayActions.slice(0, 3).map((action) => {
                  const spanState = getActionSpanState(action, day);
                  const categoryClasses = CATEGORY_STYLES[action.category];
                  const spanClasses = cn(
                    "flex items-center gap-1 px-1.5 py-0.5 text-[10px] md:text-xs truncate w-full transition-colors",
                    categoryClasses,
                    spanState.isSingleDay
                      ? "rounded-2xl"
                      : spanState.isStart
                      ? "rounded-l-2xl rounded-r-none"
                      : spanState.isEnd
                      ? "rounded-r-2xl rounded-l-none"
                      : "rounded-none"
                  );

                  return (
                    <div key={`${action.id}-${format(day, "yyyyMMdd")}`} className="w-full">
                      <div className={spanClasses} title={action.title}>
                        <span className="shrink-0">
                          {React.createElement(categoryIcons[action.category], {
                            className: "h-3 w-3"
                          })}
                        </span>
                        <span className="truncate hidden sm:inline">{action.title}</span>
                      </div>
                    </div>
                  );
                })}
                {dayActions.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1.5">
                    +{dayActions.length - 3}개 더
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
