/**
 * Google Calendar Query Keys
 * TanStack React Query key factory for Google Calendar domain
 */

interface FetchEventsParams {
  from: string;
  to: string;
}

export const googleCalendarQueryKeys = {
  all: ["googleCalendar"] as const,
  primary: {
    all: ["googleCalendar", "primary"] as const,
    events: () => [...googleCalendarQueryKeys.primary.all, "events"] as const,
    eventsByRange: (params: FetchEventsParams) =>
      [
        ...googleCalendarQueryKeys.primary.events(),
        { from: params.from, to: params.to }
      ] as const
  },
  create: {
    all: ["googleCalendar", "create"] as const,
    event: () => [...googleCalendarQueryKeys.create.all, "event"] as const
  },
  update: {
    all: ["googleCalendar", "update"] as const,
    manual: () => [...googleCalendarQueryKeys.update.all, "manual"] as const
  },
  suggest: {
    all: ["googleCalendar", "suggest"] as const,
    events: () => [...googleCalendarQueryKeys.suggest.all, "events"] as const
  },
  notities: {
    all: ["googleCalendar", "notities"] as const,
    list: () => [...googleCalendarQueryKeys.notities.all, "list"] as const,
    detail: (id: number) =>
      [...googleCalendarQueryKeys.notities.all, { id }] as const
  }
} as const;
