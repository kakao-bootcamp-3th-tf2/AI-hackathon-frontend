import React from "react";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { categoryIcons } from "@/entities/action/constants";
import type { Action } from "@/entities/action/types";
import type { DateRange } from "@/store/StoreProvider";

interface SelectedDateSummaryProps {
  selectedRange: DateRange;
  getActionsForRange: (range: DateRange) => Action[];
}

export default function SelectedDateSummary({
  selectedRange,
  getActionsForRange
}: SelectedDateSummaryProps) {
  if (!selectedRange.start) {
    return null;
  }

  const actions = getActionsForRange(selectedRange);
  const rangeEnd = selectedRange.end ?? selectedRange.start;
  const isSingleDay = isSameDay(selectedRange.start, rangeEnd);
  const title = isSingleDay
    ? format(selectedRange.start, "yyyy년 M월 d일 (EEEE)", { locale: ko })
    : `${format(selectedRange.start, "yyyy년 M월 d일", { locale: ko })} ~ ${format(
        rangeEnd,
        "yyyy년 M월 d일",
        { locale: ko }
      )}`;

  return (
    <div className="p-4 border-t border-border/50 bg-muted/20">
      <div className="text-sm font-medium mb-2">{title}</div>
      {actions.length > 0 ? (
        <div className="space-y-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-2 text-sm rounded-lg bg-card px-3 py-2 border border-border/50"
            >
              <span>
                {React.createElement(categoryIcons[action.category], {
                  className: "h-4 w-4"
                })}
              </span>
              <div className="flex-1">
                <div className="font-medium">{action.title}</div>
                {action.description && (
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">등록된 행동이 없습니다</p>
      )}
    </div>
  );
}
