import React, { useEffect, useMemo } from "react";
import { format, isSameDay, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ko } from "date-fns/locale";
import { Gift, CalendarDays, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useStore } from "@/store/useStore";
import BenefitCard from "../BenefitCard";
import SuggestBenefitCard from "../SuggestBenefitCard";
import { Benefit } from "@/entities/benefit/types";
import { SuggestBenefitWithEventInfo } from "@/entities/googleCalendar";
import type { DateRange } from "@/store/StoreProvider";

interface BenefitPanelProps {
  className?: string;
  suggestedBenefits?: SuggestBenefitWithEventInfo[];
  isLoading?: boolean;
}

interface BenefitPanelContentProps {
  benefits: Benefit[];
  hasSelection: boolean;
  suggestedBenefits?: SuggestBenefitWithEventInfo[];
  isLoading?: boolean;
}

const BenefitPanelHeader: React.FC<{ range: DateRange; hasSelection: boolean }> = ({
  range,
  hasSelection
}) => {
  const startLabel = range.start ? format(range.start, "M월 d일", { locale: ko }) : null;
  const endLabel =
    range.start && range.end && !isSameDay(range.start, range.end)
      ? format(range.end, "M월 d일", { locale: ko })
      : null;

  const labelText = startLabel
    ? endLabel
      ? `${startLabel} ~ ${endLabel} 이후 받을 수 있는 혜택`
      : `${startLabel} 이후 받을 수 있는 혜택`
    : undefined;

  return (
    <div className="flex items-center gap-3 mb-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">예상 혜택</h2>
        {hasSelection && labelText && (
          <p className="text-sm text-muted-foreground">{labelText}</p>
        )}
      </div>
    </div>
  );
};

const BenefitPanelContent: React.FC<BenefitPanelContentProps> = ({
  benefits,
  hasSelection,
  suggestedBenefits = [],
  isLoading = false
}) => {
  const hasSuggestedBenefits = suggestedBenefits.length > 0;

  useEffect(() => {
    console.log("Suggested Benefits:", suggestedBenefits);
  }, [suggestedBenefits]);

  // 로딩 중일 때 spinner 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">혜택 정보 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!hasSelection && !hasSuggestedBenefits) {
    return <EmptySelectionMessage />;
  }

  if (benefits.length === 0 && !hasSuggestedBenefits) {
    return <EmptyBenefitsMessage />;
  }

  return (
    <div className="space-y-3 pr-2">
      {/* AI 추천 혜택 섹션 */}
      {hasSuggestedBenefits && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI 추천 혜택
            </span>
          </div>
          <div className="space-y-4 mb-6 pb-6 border-b border-border/50">
            {/* 이벤트별로 suggestList를 표시 */}
            {suggestedBenefits.map((eventWithSuggests, eventIndex) => (
              <div
                key={`${eventWithSuggests.eventId}-${eventIndex}`}
                className="space-y-2"
              >
                {/* 이벤트 정보 헤더 */}
                <div className="text-xs font-semibold text-muted-foreground px-2">
                  {eventWithSuggests.summary}
                </div>
                {/* 해당 이벤트의 suggestList */}
                <div className="space-y-2">
                  {eventWithSuggests.suggestList.map((suggest, suggestIndex) => (
                    <SuggestBenefitCard
                      key={`${eventWithSuggests.eventId}-suggest-${suggestIndex}`}
                      suggest={suggest}
                      index={suggestIndex}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 일반 혜택 섹션 */}
      {benefits.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              총 {benefits.length}개의 혜택
            </span>
          </div>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <BenefitCard key={benefit.id} benefit={benefit} index={index} />
            ))}
          </div>
        </>
      )}

      {/* 혜택이 없는 경우 */}
      {benefits.length === 0 && hasSuggestedBenefits && (
        <p className="text-sm text-muted-foreground">추가 혜택이 없습니다</p>
      )}
    </div>
  );
};

const EmptySelectionMessage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted animate-float">
      <CalendarDays className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">날짜를 선택해 주세요</h3>
    <p className="text-sm text-muted-foreground max-w-60">
      캘린더에서 날짜를 선택하거나 음성으로 행동을 입력하면 혜택을 확인할 수 있어요
    </p>
  </div>
);

const EmptyBenefitsMessage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
      <Sparkles className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">혜택 정보가 없어요</h3>
    <p className="text-sm text-muted-foreground max-w-60">
      카드나 요금제를 등록하면 해당 날짜의 혜택을 확인할 수 있어요
    </p>
  </div>
);

export const BenefitPanel: React.FC<BenefitPanelProps> = ({
  className,
  suggestedBenefits = [],
  isLoading = false
}) => {
  const { selectedRange, getBenefitsForDate } = useStore();
  const hasSelection = Boolean(selectedRange.start);
  const benefits = selectedRange.start ? getBenefitsForDate(selectedRange.start) : [];

  // 선택한 날짜 범위 내의 추천 혜택만 필터링
  const filteredSuggestedBenefits = useMemo(() => {
    if (!hasSelection || suggestedBenefits.length === 0) {
      return suggestedBenefits;
    }

    return suggestedBenefits.filter((benefit) => {
      const eventDate = startOfDay(new Date(benefit.startAt));
      const rangeStart = startOfDay(selectedRange.start!);
      const rangeEnd = endOfDay(selectedRange.end ?? selectedRange.start!);

      return isWithinInterval(eventDate, { start: rangeStart, end: rangeEnd });
    });
  }, [selectedRange, suggestedBenefits, hasSelection]);

  return (
    <section className={cn("flex flex-col h-full", className)}>
      <BenefitPanelHeader
        range={selectedRange}
        hasSelection={hasSelection || filteredSuggestedBenefits.length > 0}
      />
      <div className="flex-1 overflow-y-auto">
        <BenefitPanelContent
          benefits={benefits}
          hasSelection={hasSelection}
          suggestedBenefits={filteredSuggestedBenefits}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};
