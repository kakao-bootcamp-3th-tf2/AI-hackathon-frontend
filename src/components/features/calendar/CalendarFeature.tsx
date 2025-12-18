import React, { useCallback, useEffect, useRef, useState } from "react";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { useStore } from "@/store/useStore";
import { usePrimaryCalendarEvents, GoogleCalendarEvent } from "@/entities/googleCalendar";
import type { Action } from "@/entities/action/types";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import SelectedDateSummary from "./components/SelectedDateSummary";

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
  const { currentMonth, calendarDays, monthRange, handlePrevMonth, handleNextMonth, goToToday } =
    useCalendarNavigation();

  // Google Calendar API 호출 - 월 범위로 조회
  const { data: googleCalendarResponse } = usePrimaryCalendarEvents({
    from: monthRange.calendarStartISO,
    to: monthRange.calendarEndISO,
    enabled: true
  });

  /**
   * Google Calendar 이벤트를 로컬 Action으로 변환
   * category는 "other"로 고정 (향후 확장 가능)
   */
  const convertGoogleEventToAction = useCallback(
    (event: GoogleCalendarEvent): Action => {
      return {
        id: `google-${event.id}`,
        date: new Date(event.startTime),
        title: event.title,
        description: event.description,
        category: "other" // Google Calendar 이벤트는 기본적으로 "other" 카테고리
      };
    },
    []
  );

  /**
   * 특정 날짜의 Google Calendar 이벤트 조회
   * ISO-8601 시간과 날짜를 비교해서 같은 날의 이벤트를 반환
   */
  const getGoogleEventsForDate = useCallback(
    (date: Date): Action[] => {
      if (!googleCalendarResponse?.events) return [];

      return googleCalendarResponse.events
        .filter((event) => {
          const eventDate = new Date(event.startTime);
          return isSameDay(eventDate, date);
        })
        .map(convertGoogleEventToAction);
    },
    [googleCalendarResponse?.events, convertGoogleEventToAction]
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
      <SelectedDateSummary
        selectedRange={selectedRange}
        getActionsForRange={getActionsForRange}
      />
    </div>
  );
}
