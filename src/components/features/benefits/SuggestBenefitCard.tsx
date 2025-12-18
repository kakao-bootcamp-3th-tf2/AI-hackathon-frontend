import React, { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Sparkles, MoreVertical, Edit2 } from "lucide-react";
import { GoogleCalendarSuggest } from "@/entities/googleCalendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SuggestBenefitCardProps {
  suggest: GoogleCalendarSuggest;
  index: number;
  eventId: string;
  onEditSuggest?: (eventId: string, suggest: GoogleCalendarSuggest) => void;
}

export default function SuggestBenefitCard({
  suggest,
  index,
  eventId,
  onEditSuggest
}: SuggestBenefitCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 시간 포맷팅
  const startTime = format(new Date(suggest.startAt), "HH:mm", { locale: ko });
  const endTime = format(new Date(suggest.endAt), "HH:mm", { locale: ko });
  const timeRange = `${startTime} ~ ${endTime}`;

  const handleEditClick = () => {
    onEditSuggest?.(eventId, suggest);
    setIsOpen(false);
  };

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

        {/* 메뉴 버튼 */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-md p-1 hover:bg-accent/20 transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditClick}>
              <Edit2 className="h-4 w-4 mr-2" />
              <span>혜택 수정</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
