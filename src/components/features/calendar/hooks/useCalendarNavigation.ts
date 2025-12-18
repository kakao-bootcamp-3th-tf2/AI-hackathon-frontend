import { useCallback, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
  startOfDay,
  endOfDay
} from "date-fns";

export interface CalendarMonthRange {
  /** ISO-8601 형식의 월 시작 (00:00:00Z) */
  monthStartISO: string;
  /** ISO-8601 형식의 월 끝 (23:59:59Z) */
  monthEndISO: string;
  /** ISO-8601 형식의 캘린더 표시 시작 (주의 시작, 00:00:00Z) */
  calendarStartISO: string;
  /** ISO-8601 형식의 캘린더 표시 끝 (주의 끝, 23:59:59Z) */
  calendarEndISO: string;
}

export const useCalendarNavigation = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const calendarRange = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  }, [currentMonth]);

  const monthRange = useMemo<CalendarMonthRange>(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return {
      monthStartISO: startOfDay(monthStart).toISOString(),
      monthEndISO: endOfDay(monthEnd).toISOString(),
      calendarStartISO: startOfDay(calendarStart).toISOString(),
      calendarEndISO: endOfDay(calendarEnd).toISOString()
    };
  }, [currentMonth]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  return {
    currentMonth,
    calendarDays: calendarRange,
    monthRange,
    handlePrevMonth,
    handleNextMonth,
    goToToday,
    setCurrentMonth
  };
};
