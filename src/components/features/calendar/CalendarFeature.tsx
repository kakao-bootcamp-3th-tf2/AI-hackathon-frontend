import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { isSameDay, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { useStore } from "@/store/useStore";
import type { DateRange } from "@/store/StoreProvider";
import {
  usePrimaryCalendarEvents,
  useSuggestEvents,
  GoogleCalendarEvent,
  SuggestBenefitWithEventInfo
} from "@/entities/googleCalendar";
import { useSuggestNotification } from "@/store/suggestions/SuggestNotificationProvider";
import type { Action } from "@/entities/action/types";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import SelectedDateSummary from "./components/SelectedDateSummary";
import EventDetailModal from "./components/EventDetailModal";
import CalendarLoadingSpinner from "./components/CalendarLoadingSpinner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface CalendarFeatureProps {
  className?: string;
  onSuggestedBenefits?: (benefits: SuggestBenefitWithEventInfo[]) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function CalendarFeature({
  className,
  onSuggestedBenefits,
  onLoadingChange
}: CalendarFeatureProps) {
  const {
    selectedRange,
    selectSingleDate,
    setSelectedRange,
    getActionsForDate: getLocalActionsForDate,
    getActionsForRange
  } = useStore();
  const selectedDate = selectedRange?.start ?? null;
  const {
    currentMonth,
    calendarDays,
    monthRange,
    handlePrevMonth,
    handleNextMonth,
    goToToday
  } = useCalendarNavigation();

  // 이벤트 상세 모달 상태
  const [selectedEvent, setSelectedEvent] = useState<Action | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [pendingEventIds, setPendingEventIds] = useState<string[]>([]);
  const { setNotifications } = useSuggestNotification();

  // Google Calendar API 호출 - 월 범위로 조회
  const {
    data: googleCalendarResponse,
    isLoading: googleCalendarLoading,
    isError: googleCalendarError,
    error: googleCalendarErrorObj
  } = usePrimaryCalendarEvents({
    from: monthRange.calendarStartISO,
    to: monthRange.calendarEndISO,
    enabled: true
  });

  /**
   * Google Calendar 이벤트를 로컬 Action으로 변환
   * category는 "shopping"으로 기본 설정
   * content는 EventDetailModal에서만 표시
   */
  const convertGoogleEventToAction = useCallback((event: GoogleCalendarEvent): Action => {
    const start = new Date(event.startAt);
    const end = event.endAt ? new Date(event.endAt) : start;

    return {
      id: `google-${event.id}`,
      date: start,
      title: event.summary,
      description: event.description || event.content,
      category: "shopping", // Google Calendar 이벤트는 "shopping" 카테고리로 기본 설정
      range: { start, end }
    };
  }, []);

  const getActionBounds = useCallback((action: Action) => {
    const rangeStart = startOfDay(action.range?.start ?? action.date);
    const rangeEnd = endOfDay(action.range?.end ?? action.range?.start ?? action.date);
    return { start: rangeStart, end: rangeEnd };
  }, []);

  /**
   * 특정 날짜의 Google Calendar 이벤트 조회
   * ISO-8601 시간과 날짜를 비교해서 같은 날의 이벤트를 반환
   */
  const getGoogleEventsForDate = useCallback(
    (date: Date): Action[] => {
      if (!googleCalendarResponse?.events) return [];

      const targetStart = startOfDay(date);
      const targetEnd = endOfDay(date);

      return googleCalendarResponse.events
        .map(convertGoogleEventToAction)
        .filter((action) => {
          const { start, end } = getActionBounds(action);
          return start <= targetEnd && end >= targetStart;
        });
    },
    [googleCalendarResponse, convertGoogleEventToAction, getActionBounds]
  );

  /**
   * 로컬 액션과 Google Calendar 이벤트를 병합해서 반환
   */
  const getCombinedActionsForDate = useCallback(
    (date: Date): Action[] => {
      const localActions = getLocalActionsForDate(date);
      const googleActions = getGoogleEventsForDate(date);
      return [...localActions, ...googleActions];
    },
    [getLocalActionsForDate, getGoogleEventsForDate]
  );

  /**
   * 날짜 범위의 로컬 액션과 Google Calendar 이벤트를 병합해서 반환
   * 시간은 무시하고 일자만 비교
   */
  const getCombinedActionsForRange = useCallback(
    (range: DateRange | null): Action[] => {
      const localActions = getActionsForRange(range);

      if (!googleCalendarResponse?.events) return localActions;

      const fallbackStart = new Date(monthRange.calendarStartISO);
      const fallbackEnd = new Date(monthRange.calendarEndISO);
      const rangeStart = startOfDay(range?.start ?? fallbackStart);
      const rangeEnd = endOfDay(range?.end ?? range?.start ?? fallbackEnd);

      const googleActions = googleCalendarResponse.events
        .map(convertGoogleEventToAction)
        .filter((action) => {
          const { start, end } = getActionBounds(action);
          return start <= rangeEnd && end >= rangeStart;
        });

      return [...localActions, ...googleActions];
    },
    [getActionsForRange, googleCalendarResponse, convertGoogleEventToAction, monthRange]
  );

  /**
   * 드래그 범위 내의 Google Calendar eventId 추출
   * Google 이벤트는 id가 "google-"로 시작함
   */
  const getGoogleEventIdsForRange = useCallback(
    (range: DateRange | null): string[] => {
      if (!googleCalendarResponse?.events) return [];

      const fallbackStart = new Date(monthRange.calendarStartISO);
      const fallbackEnd = new Date(monthRange.calendarEndISO);
      const rangeStart = startOfDay(range?.start ?? fallbackStart);
      const rangeEnd = endOfDay(range?.end ?? range?.start ?? fallbackEnd);

      const googleEventIds = googleCalendarResponse.events
        .map((event) => ({
          event,
          action: convertGoogleEventToAction(event)
        }))
        .filter(({ action }) => {
          const { start, end } = getActionBounds(action);
          return start <= rangeEnd && end >= rangeStart;
        })
        .map(({ event }) => event.id);

      return googleEventIds;
    },
    [googleCalendarResponse, convertGoogleEventToAction, getActionBounds, monthRange]
  );

  // useSuggestEvents 뮤테이션
  const suggestEventsMutation = useSuggestEvents({
    onSuccess: (data) => {
      console.log("AI 추천 혜택 받음:", data);

      // 각 응답에서 이벤트 정보와 suggestList를 추출
      const suggestBenefits = data.map((response) => ({
        eventId: response.notity.eventId,
        summary: response.notity.summary,
        startAt: response.notity.startAt,
        endAt: response.notity.endAt,
        suggestList: response.notity.suggestList
      }));

      console.log("추천 혜택 (이벤트별):", suggestBenefits);
      setNotifications(suggestBenefits);
      onSuggestedBenefits?.(suggestBenefits);
      onLoadingChange?.(false);
    },
    onError: () => {
      onLoadingChange?.(false);
    }
  });

  // AI 추천 로딩 상태 감지
  React.useEffect(() => {
    onLoadingChange?.(suggestEventsMutation.isPending);
  }, [suggestEventsMutation.isPending, onLoadingChange]);

  // AI 일정 추천 핸들러
  const handleCancelSuggestEvents = useCallback(() => {
    setIsSuggestModalOpen(false);
    setPendingEventIds([]);
  }, []);

  const handleConfirmSuggestEvents = useCallback(() => {
    if (pendingEventIds.length === 0) {
      handleCancelSuggestEvents();
      return;
    }

    setIsSuggestModalOpen(false);
    const eventIds = pendingEventIds;
    setPendingEventIds([]);
    console.log("AI 일정 추천 시작:", eventIds);
    suggestEventsMutation.mutate({ needSuggestList: eventIds });
  }, [pendingEventIds, suggestEventsMutation, handleCancelSuggestEvents]);

  const handleSuggestEvents = useCallback(() => {
    const eventIds = getGoogleEventIdsForRange(selectedRange);

    if (eventIds.length === 0) {
      console.log("추천할 일정이 없습니다");
      return;
    }

    setPendingEventIds(eventIds);
    setIsSuggestModalOpen(true);
  }, [selectedRange, getGoogleEventIdsForRange]);

  // 이벤트 클릭 핸들러
  const handleEventClick = useCallback((event: Action) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleToday = useCallback(() => {
    goToToday();
    selectSingleDate(new Date());
  }, [goToToday, selectSingleDate]);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Date | null>(null);

  const handleSelectDay = useCallback(
    (day: Date) => {
      selectSingleDate(day);
    },
    [selectSingleDate]
  );

  const handleDayPointerDown = useCallback(
    (day: Date) => {
      setIsDragging(true);
      dragStartRef.current = day;
      setSelectedRange(day, day);
    },
    [setSelectedRange]
  );

  const handleDayPointerEnter = useCallback(
    (day: Date) => {
      if (!isDragging || !dragStartRef.current) {
        return;
      }
      setSelectedRange(dragStartRef.current, day);
    },
    [isDragging, setSelectedRange]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleWindowPointerUp = () => {
      handlePointerUp();
    };

    window.addEventListener("mouseup", handleWindowPointerUp);
    window.addEventListener("touchend", handleWindowPointerUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowPointerUp);
      window.removeEventListener("touchend", handleWindowPointerUp);
    };
  }, [handlePointerUp]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden",
        className
      )}
    >
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Google Calendar 로딩 중 스피너 표시 */}
      {googleCalendarLoading ? (
        <CalendarLoadingSpinner />
      ) : (
        <CalendarGrid
          calendarDays={calendarDays}
          currentMonth={currentMonth}
          selectedRange={selectedRange}
          onSelectDate={handleSelectDay}
          onDayPointerDown={handleDayPointerDown}
          onDayPointerEnter={handleDayPointerEnter}
          onDayPointerUp={handlePointerUp}
          getActionsForDate={getCombinedActionsForDate}
        />
      )}

      <SelectedDateSummary
        selectedRange={selectedRange}
        getActionsForRange={getCombinedActionsForRange}
        onEventClick={handleEventClick}
        onSuggestEvents={handleSuggestEvents}
        isLoadingSuggest={suggestEventsMutation.isPending}
      />

      {/* 이벤트 상세 모달 */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <Modal
        open={isSuggestModalOpen}
        onClose={handleCancelSuggestEvents}
        title="AI 추천 요청"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            선택한 일정 {pendingEventIds.length}건에 대해 AI 추천 혜택을 요청하시겠습니까?
          </p>
          <p className="text-xs text-muted-foreground">
            확인 시 AI 추천 API를 호출하여 결과를 반영합니다.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancelSuggestEvents}>
            취소
          </Button>
          <Button
            onClick={handleConfirmSuggestEvents}
            disabled={suggestEventsMutation.isPending}
            className="gap-2"
          >
            {suggestEventsMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {suggestEventsMutation.isPending ? "요청 중..." : "확인"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
