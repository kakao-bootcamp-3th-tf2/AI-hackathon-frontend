import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
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
  if (!event) return null;

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
    <Modal
      open={isOpen}
      onClose={onClose}
      className="max-w-sm"
    >
      <div className="space-y-4">
        {/* 이벤트 제목 및 날짜 */}
        <div>
          <h2 className="text-lg font-semibold text-foreground line-clamp-2">
            {event.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {format(event.date, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
          </p>
        </div>

        {/* 카테고리 */}
        <div className="flex items-center gap-3 pt-2">
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

        {/* 설명 또는 내용 */}
        {event.description && (
          <div className="pt-2">
            <div className="text-xs text-muted-foreground mb-2">
              {event.id.startsWith("google-") ? "이벤트 내용" : "설명"}
            </div>
            <p className="text-sm text-foreground bg-muted/20 rounded-lg p-3 break-words">
              {event.description}
            </p>
          </div>
        )}

        {/* Google Calendar 동기화 표시 */}
        {event.id.startsWith("google-") && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Google Calendar에서 동기화됨
            </div>
          </div>
        )}

        {/* 닫기 버튼 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
