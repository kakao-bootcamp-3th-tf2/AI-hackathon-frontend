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
  }
} as const;
