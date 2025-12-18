import React, { useCallback, useEffect, useRef, useState } from "react";
import { isSameDay, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { useStore } from "@/store/useStore";
import type { DateRange } from "@/store/StoreProvider";
import { usePrimaryCalendarEvents, GoogleCalendarEvent } from "@/entities/googleCalendar";
import type { Action } from "@/entities/action/types";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import SelectedDateSummary from "./components/SelectedDateSummary";
import EventDetailModal from "./components/EventDetailModal";
import CalendarLoadingSpinner from "./components/CalendarLoadingSpinner";

interface CalendarFeatureProps {
  className?: string;
}

export default function CalendarFeature({ className }: CalendarFeatureProps) {
  const {
    selectedRange,
    selectSingleDate,
    setSelectedRange,
    getActionsForDate: getLocalActionsForDate,
    getActionsForRange
  } = useStore();
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
    return {
      id: `google-${event.id}`,
      date: new Date(event.startAt),
      title: event.summary,
      description: event.description || event.content,
      category: "shopping" // Google Calendar 이벤트는 "shopping" 카테고리로 기본 설정
    };
  }, []);

  /**
   * 특정 날짜의 Google Calendar 이벤트 조회
   * ISO-8601 시간과 날짜를 비교해서 같은 날의 이벤트를 반환
   */
  const getGoogleEventsForDate = useCallback(
    (date: Date): Action[] => {
      if (!googleCalendarResponse?.events) return [];

      return googleCalendarResponse.events
        .filter((event) => {
          const eventDate = new Date(event.startAt);
          return isSameDay(eventDate, date);
        })
        .map(convertGoogleEventToAction);
    },
    [googleCalendarResponse, convertGoogleEventToAction]
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
    (range: DateRange): Action[] => {
      const localActions = getActionsForRange(range);
      console.log("range", range);

      // 날짜 범위 내의 Google 이벤트 필터링
      if (!googleCalendarResponse?.events) return localActions;

      const googleActions = googleCalendarResponse.events
        .filter((event) => {
          const eventDate = startOfDay(new Date(event.startAt));
          const rangeStart = startOfDay(range.start!);
          const rangeEnd = endOfDay(range.end ?? range.start!);

          // 이벤트가 범위 내에 있는지 확인 (일자만 비교, 시간 제외)
          return eventDate >= rangeStart && eventDate <= rangeEnd;
        })
        .map(convertGoogleEventToAction);

      return [...localActions, ...googleActions];
    },
    [getActionsForRange, googleCalendarResponse, convertGoogleEventToAction]
  );

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
      />

      {/* 이벤트 상세 모달 */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
