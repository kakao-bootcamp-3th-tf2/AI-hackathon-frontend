import React, { useCallback, useMemo } from "react";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/shared/form/FormField";
import { useActionForm } from "./hooks/useActionForm";
import { useStore } from "@/store/useStore";
import { categoryIcons, categoryLabels } from "@/entities/action/constants";
import { ActionCategory, ActionDateRange } from "@/entities/action/types";
import {
  useCreateCalendarEvent,
  SuggestBenefitWithEventInfo,
  googleCalendarQueryKeys
} from "@/entities/googleCalendar";

// Action category를 Google Calendar 카테고리로 변환
const getCategoryForCalendar = (category: ActionCategory): string => {
  const categoryMap: Record<ActionCategory, string> = {
    shopping: "쇼핑",
    dining: "음식",
    cafe: "카페",
    movie: "영화"
  };
  return categoryMap[category];
};

const toUtcISOString = (date: Date) => {
  const utcTimestamp = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
  return new Date(utcTimestamp).toISOString();
};

interface ActionInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialText?: string;
  initialDate?: Date;
  onEventCreated?: (suggestBenefits: SuggestBenefitWithEventInfo[]) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function ActionInputDialog({
  open,
  onOpenChange,
  initialText = "",
  initialDate,
  onEventCreated,
  onLoadingChange
}: ActionInputDialogProps) {
  const { selectedRange, addAction, removeAction } = useStore();
  const { title, setTitle, category, setCategory, resetForm, isValid } =
    useActionForm(initialText);

  const queryClient = useQueryClient();

  const createCalendarEventMutation = useCreateCalendarEvent({
    onSuccess: (eventData) => {
      console.log("이벤트 생성 성공:", eventData);
      console.log("suggestList:", eventData.suggestList);

      // suggestList 여부와 관계없이 항상 부모에 전달 (리렌더링 필요)
      const suggestBenefit: SuggestBenefitWithEventInfo = {
        eventId: eventData.eventId || eventData.id.toString(),
        summary: eventData.summary || eventData.title || "",
        startAt: eventData.startAt || eventData.startTime || "",
        endAt: eventData.endAt || eventData.endTime || "",
        suggestList: eventData.suggestList || []
      };
      console.log("부모에 전달하는 suggestBenefit:", suggestBenefit);
      onEventCreated?.([suggestBenefit]);
      onLoadingChange?.(false);
    },
    onError: () => {
      onLoadingChange?.(false);
    }
  });

  // 이벤트 생성 로딩 상태 감지
  React.useEffect(() => {
    onLoadingChange?.(createCalendarEventMutation.isPending);
  }, [createCalendarEventMutation.isPending, onLoadingChange]);

  const start = selectedRange.start;
  const end = selectedRange.end;
  const rangeToSubmit: ActionDateRange | undefined = start
    ? { start, end: end ?? start }
    : undefined;

  const normalizedEnd = rangeToSubmit?.end;
  const date = initialDate || start || new Date();
  const formattedRangeLabel = start
    ? normalizedEnd && !isSameDay(start, normalizedEnd)
      ? `${format(start, "M월 d일")} ~ ${format(normalizedEnd, "M월 d일")}`
      : format(start, "M월 d일")
    : undefined;

  const categoryOptions = useMemo(
    () =>
      Object.entries(categoryLabels).map(([value, label]) => ({
        value: value as ActionCategory,
        label
      })),
    []
  );

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [onOpenChange, resetForm]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const tempActionId = `temp-action-${Date.now()}`;
    addAction({
      id: tempActionId,
      date,
      title: title.trim(),
      category,
      range: rangeToSubmit
    });

    const eventStart = start || date;
    const eventEnd = normalizedEnd || eventStart;

    try {
      const startAtIso = toUtcISOString(startOfDay(eventStart));
      const endAtIso = toUtcISOString(endOfDay(eventEnd));

      console.log("이벤트 생성 시작...");
      await createCalendarEventMutation.mutateAsync({
        category: getCategoryForCalendar(category),
        brand: title.trim(),
        startAt: startAtIso,
        endAt: endAtIso
      });

      await queryClient.refetchQueries({
        queryKey: googleCalendarQueryKeys.primary.all,
        type: "all"
      });

      console.log("이벤트 생성 완료, 캘린더 갱신 중...");
    } catch (error) {
      console.error("일정 추가 실패:", error);
    } finally {
      removeAction(tempActionId);
    }

    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="일정 추가">
      <form className="space-y-4 py-2" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          {formattedRangeLabel && (
            <p className="text-xs text-muted-foreground">
              선택된 기간:{" "}
              <span className="font-semibold text-foreground">{formattedRangeLabel}</span>
            </p>
          )}
        </div>

        <FormField label="브랜드" htmlFor="action-title">
          <Input
            id="action-title"
            placeholder="예: 스타벅스, 메가박스"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </FormField>

        <FormField label="카테고리">
          <div className="grid gap-2 sm:grid-cols-2">
            {categoryOptions.map((option) => {
              const Icon = categoryIcons[option.value];
              const isSelected = category === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-background/60 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} type="button">
            취소
          </Button>
          <Button
            type="submit"
            disabled={!isValid || createCalendarEventMutation.isPending}
            className="gap-2"
          >
            {createCalendarEventMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {createCalendarEventMutation.isPending ? "추가 중..." : "추가하기"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
