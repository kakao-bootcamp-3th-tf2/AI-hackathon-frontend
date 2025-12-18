import React, { useState } from "react";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Wand2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryIcons } from "@/entities/action/constants";
import type { Action } from "@/entities/action/types";
import type { DateRange } from "@/store/StoreProvider";

interface SelectedDateSummaryProps {
  selectedRange: DateRange;
  getActionsForRange: (range: DateRange) => Action[];
  onEventClick?: (event: Action) => void;
  onSuggestEvents?: () => void;
  isLoadingSuggest?: boolean;
}

export default function SelectedDateSummary({
  selectedRange,
  getActionsForRange,
  onEventClick,
  onSuggestEvents,
  isLoadingSuggest
}: SelectedDateSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!selectedRange.start) {
    return null;
  }

  console.log(getActionsForRange(selectedRange));

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

  // Google Calendar 이벤트 여부 확인 (id가 "google-"로 시작)
  const hasGoogleEvents = actions.some((action) => action.id.startsWith("google-"));

  return (
    <div className="p-4 border-t border-border/50 bg-muted/20">
      {/* 제목과 AI 추천 버튼 - 한 줄 */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm font-medium">
          <span>{title}</span>
        </div>

        {/* AI 추천 버튼 - 오른쪽 위 */}
        {hasGoogleEvents && onSuggestEvents && (
          <Button
            onClick={onSuggestEvents}
            disabled={isLoadingSuggest}
            size="sm"
            className="h-9 gap-2 whitespace-nowrap"
          >
            <Wand2 className="h-4 w-16" />
            {isLoadingSuggest ? "추천 중..." : "AI 추천"}
          </Button>
        )}
      </div>

      {/* 일정 목록 또는 안내 문구 */}
      {actions.length > 0 ? (
        <>
          {/* 토글 버튼 - 항상 표시 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mb-4 py-3 px-4 text-sm text-muted-foreground rounded-lg border border-border/50 hover:bg-card/50 hover:border-border transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>{actions.length}개의 일정이 있습니다</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* 일정 리스트 - 펼쳐졌을 때만 표시 */}
          {isExpanded && (
            <div className="space-y-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onEventClick?.(action)}
                  className="w-full flex items-center gap-2 text-sm rounded-lg bg-card px-3 py-2 border border-border/50 hover:bg-card/80 hover:border-border transition-colors cursor-pointer text-left"
                >
                  <span>
                    {React.createElement(categoryIcons[action.category], {
                      className: "h-4 w-4"
                    })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{action.title}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">등록된 행동이 없습니다</p>
      )}
    </div>
  );
}
