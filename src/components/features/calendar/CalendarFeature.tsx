import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useStore } from "@/store/useStore";
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
    getActionsForDate,
    getActionsForRange
  } = useStore();
  const { currentMonth, calendarDays, handlePrevMonth, handleNextMonth, goToToday } =
    useCalendarNavigation();

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
        getActionsForDate={getActionsForDate}
      />
      <SelectedDateSummary
        selectedRange={selectedRange}
        getActionsForRange={getActionsForRange}
      />
    </div>
  );
}
