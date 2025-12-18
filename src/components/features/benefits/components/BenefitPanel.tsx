import React from "react";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Gift, CalendarDays, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useStore } from "@/store/useStore";
import BenefitCard from "../BenefitCard";
import { Benefit } from "@/entities/benefit/types";
import type { DateRange } from "@/store/StoreProvider";

interface BenefitPanelProps {
  className?: string;
}

interface BenefitPanelContentProps {
  benefits: Benefit[];
  hasSelection: boolean;
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
      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-soft">
        <Gift className="h-6 w-6 text-primary-foreground" />
      </div>
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
  hasSelection
}) => {
  if (!hasSelection) {
    return <EmptySelectionMessage />;
  }

  if (benefits.length === 0) {
    return <EmptyBenefitsMessage />;
  }

  return (
    <div className="space-y-3 pr-2">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          총 {benefits.length}개의 혜택
        </span>
      </div>
      {benefits.map((benefit, index) => (
        <BenefitCard key={benefit.id} benefit={benefit} index={index} />
      ))}
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

export const BenefitPanel: React.FC<BenefitPanelProps> = ({ className }) => {
  const { selectedRange, getBenefitsForDate } = useStore();
  const hasSelection = Boolean(selectedRange.start);
  const benefits = selectedRange.start ? getBenefitsForDate(selectedRange.start) : [];

  return (
    <section className={cn("flex flex-col h-full", className)}>
      <BenefitPanelHeader range={selectedRange} hasSelection={hasSelection} />
      <div className="flex-1 overflow-y-auto">
        <BenefitPanelContent benefits={benefits} hasSelection={hasSelection} />
      </div>
    </section>
  );
};
