import React from "react";
import { format, isSameDay, isSameMonth, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { categoryIcons } from "@/entities/action/constants";
import type { Action } from "@/entities/action/types";
import type { DateRange } from "@/store/StoreProvider";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarGridProps {
  calendarDays: Date[];
  currentMonth: Date;
  selectedRange: DateRange;
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

          const { start, end } = selectedRange;
          const normalizedEnd = end ?? start;
          const rangeIncludesDay =
            start && normalizedEnd && isWithinInterval(day, { start, end: normalizedEnd });
          const isRangeStart = start && isSameDay(day, start);
          const isRangeEnd = normalizedEnd && isSameDay(day, normalizedEnd);

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

              <div className="space-y-0.5 overflow-hidden">
                {dayActions.slice(0, 3).map((action) => (
                  <div
                    key={action.id}
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] md:text-xs truncate",
                      // dark 모드 텍스트는 라이트 기준만 유지하도록 제거
                      action.category === "payment" &&
                        "bg-emerald-500/20 text-emerald-700",
                      action.category === "shopping" &&
                        "bg-orange-500/20 text-orange-700",
                      action.category === "subscription" &&
                        "bg-purple-500/20 text-purple-700",
                      action.category === "travel" && "bg-blue-500/20 text-blue-700",
                      action.category === "dining" && "bg-pink-500/20 text-pink-700",
                      action.category === "other" && "bg-gray-500/20 text-gray-700"
                    )}
                    title={action.title}
                  >
                    <span className="shrink-0">
                      {React.createElement(categoryIcons[action.category], {
                        className: "h-3 w-3"
                      })}
                    </span>
                    <span className="truncate hidden sm:inline">{action.title}</span>
                  </div>
                ))}
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
