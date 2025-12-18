import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { categoryIcons } from "@/entities/action/constants";
import type { Action } from "@/entities/action/types";

interface EventDetailModalProps {
  event: Action | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose
}: EventDetailModalProps) {
  if (!isOpen || !event) return null;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      payment: "결제",
      shopping: "쇼핑",
      subscription: "구독",
      travel: "여행",
      dining: "식사",
      work: "업무",
      health: "건강",
      finance: "금융",
      entertainment: "오락",
      other: "기타"
    };
    return labels[category] || category;
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* 모달 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            "bg-card rounded-2xl border border-border/50 shadow-lg w-full max-w-sm",
            "animate-fade-in"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-border/50">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground line-clamp-2">
                {event.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {format(event.date, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 ml-4 p-1 hover:bg-muted rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="p-6 space-y-4">
            {/* 카테고리 */}
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {React.createElement(categoryIcons[event.category], {
                  className: "w-5 h-5"
                })}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">카테고리</div>
                <div className="text-sm font-medium text-foreground">
                  {getCategoryLabel(event.category)}
                </div>
              </div>
            </div>

            {/* 설명 */}
            {event.description && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">설명</div>
                <p className="text-sm text-foreground bg-muted/20 rounded-lg p-3 break-words">
                  {event.description}
                </p>
              </div>
            )}

            {/* 이벤트 ID (구글 캘린더 이벤트인 경우) */}
            {event.id.startsWith("google-") && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Google Calendar에서 동기화됨
                </div>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3 p-6 border-t border-border/50">
            <button
              onClick={onClose}
              className={cn(
                "flex-1 px-4 py-2 rounded-xl font-medium transition-colors",
                "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
