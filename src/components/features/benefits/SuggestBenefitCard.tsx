import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Sparkles } from "lucide-react";
import { GoogleCalendarSuggest } from "@/entities/googleCalendar";

interface SuggestBenefitCardProps {
  suggest: GoogleCalendarSuggest;
  index: number;
}

export default function SuggestBenefitCard({ suggest, index }: SuggestBenefitCardProps) {
  // 시간 포맷팅
  const startTime = format(new Date(suggest.startAt), "HH:mm", { locale: ko });
  const endTime = format(new Date(suggest.endAt), "HH:mm", { locale: ko });
  const timeRange = `${startTime} ~ ${endTime}`;

  return (
    <article
      className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-accent/10 to-card p-4 shadow-card transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* AI 추천 아이콘 */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Sparkles className="h-5 w-5 text-accent-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          {/* 혜택 텍스트 */}
          <h4 className="font-semibold text-card-foreground break-words">
            {suggest.suggest}
          </h4>

          {/* 시간 범위 */}
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {timeRange}
            </span>
            <span className="text-xs text-muted-foreground">AI 추천</span>
          </div>
        </div>
      </div>
    </article>
  );
}
