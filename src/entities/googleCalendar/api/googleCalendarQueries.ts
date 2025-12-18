/**
 * Google Calendar Queries
 * TanStack React Query hooks for Google Calendar domain
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { googleCalendarQueryKeys } from "./googleCalendarQueryKeys";
import {
  fetchPrimaryCalendarEvents,
  createCalendarEvent
} from "./googleCalendarApi";
import { GoogleCalendarCreateEventRequest } from "../types";

interface UsePrimaryCalendarEventsOptions {
  from: string; // ISO-8601 datetime
  to: string; // ISO-8601 datetime
  enabled?: boolean;
}

/**
 * usePrimaryCalendarEvents - Fetch events from primary Google Calendar
 * Query for: GET /api/calendar/events
 *
 * @param params - Query parameters (from, to dates in ISO-8601 format)
 * @param options - Query options
 */
export const usePrimaryCalendarEvents = (
  params: UsePrimaryCalendarEventsOptions
) => {
  const { from, to, enabled = true } = params;

  return useQuery({
    queryKey: googleCalendarQueryKeys.primary.eventsByRange({ from, to }),
    queryFn: () =>
      fetchPrimaryCalendarEvents({
        from,
        to
      }),
    enabled: enabled && !!from && !!to,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * useCreateCalendarEvent - Create a new calendar event with AI-recommended benefits
 * Mutation for: POST /api/calendar/events
 */
export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GoogleCalendarCreateEventRequest) =>
      createCalendarEvent(request),
    onSuccess: () => {
      // Invalidate all calendar event queries to fetch fresh data
      queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.primary.all
      });
    },
    onError: (error) => {
      console.error("Failed to create calendar event:", error);
    }
  });
};
