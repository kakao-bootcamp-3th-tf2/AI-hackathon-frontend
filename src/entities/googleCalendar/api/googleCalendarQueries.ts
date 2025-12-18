/**
 * Google Calendar Queries
 * TanStack React Query hooks for Google Calendar domain
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions
} from "@tanstack/react-query";
import { googleCalendarQueryKeys } from "./googleCalendarQueryKeys";
import {
  fetchPrimaryCalendarEvents,
  createCalendarEvent,
  manualUpdateEvent,
  suggestEvents,
  fetchNotities,
  deleteNotity
} from "./googleCalendarApi";
import {
  GoogleCalendarCreateEventRequest,
  GoogleCalendarManualUpdateRequest,
  GoogleCalendarSuggestRequest,
  GoogleCalendarSuggestResponse,
  GoogleCalendarEventDto,
  NotityDto
} from "../types";

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
 * @param mutationOptions - Optional mutation options including onSuccess, onError callbacks
 */
export const useCreateCalendarEvent = (
  mutationOptions?: Partial<
    UseMutationOptions<
      GoogleCalendarEventDto,
      Error,
      GoogleCalendarCreateEventRequest
    >
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = mutationOptions || {};

  return useMutation({
    mutationFn: (request: GoogleCalendarCreateEventRequest) =>
      createCalendarEvent(request),
    ...restOptions,
    onSuccess: (data, variables) => {
      // Invalidate all calendar event queries to fetch fresh data
      queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.primary.all
      });

      // Call external onSuccess if provided
      onSuccess?.(data, variables, undefined as any);
    },
    onError: (error, variables) => {
      console.error("Failed to create calendar event:", error);

      // Call external onError if provided
      onError?.(error, variables, undefined as any);
    }
  });
};

/**
 * useManualUpdateEvent - Manually overwrite event details
 * Mutation for: PUT /api/calendar/events/manual
 * @param mutationOptions - Optional mutation options including onSuccess, onError callbacks
 */
export const useManualUpdateEvent = (
  mutationOptions?: Partial<
    UseMutationOptions<
      GoogleCalendarEventDto,
      Error,
      GoogleCalendarManualUpdateRequest
    >
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = mutationOptions || {};

  return useMutation({
    mutationFn: (request: GoogleCalendarManualUpdateRequest) =>
      manualUpdateEvent(request),
    ...restOptions,
    onSuccess: (data, variables) => {
      // Invalidate all calendar event queries
      queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.primary.all
      });

      // Call external onSuccess if provided
      onSuccess?.(data, variables, undefined as any);
    },
    onError: (error, variables) => {
      console.error("Failed to manually update event:", error);

      // Call external onError if provided
      onError?.(error, variables, undefined as any);
    }
  });
};

/**
 * useSuggestEvents - Add AI suggestions to multiple events
 * Mutation for: PATCH /api/calendar/events/suggest
 * @param mutationOptions - Optional mutation options including onSuccess, onError callbacks
 */
export const useSuggestEvents = (
  mutationOptions?: Partial<
    UseMutationOptions<
      GoogleCalendarSuggestResponse[],
      Error,
      GoogleCalendarSuggestRequest
    >
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = mutationOptions || {};

  return useMutation({
    mutationFn: (request: GoogleCalendarSuggestRequest) =>
      suggestEvents(request),
    ...restOptions,
    onSuccess: (data, variables) => {
      // Invalidate all calendar event queries
      queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.primary.all
      });

      // Call external onSuccess if provided
      onSuccess?.(data, variables, undefined as any);
    },
    onError: (error, variables) => {
      console.error("Failed to suggest events:", error);

      // Call external onError if provided
      onError?.(error, variables, undefined as any);
    }
  });
};

/**
 * useNotities - Fetch all notities (reminders)
 * Query for: GET /api/calendar/notities
 */
export const useNotities = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: googleCalendarQueryKeys.notities.list(),
    queryFn: fetchNotities,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * useDeleteNotity - Delete a notity (reminder)
 * Mutation for: DELETE /api/calendar/notities/{notityId}
 * @param mutationOptions - Optional mutation options including onSuccess, onError callbacks
 */
export const useDeleteNotity = (
  mutationOptions?: Partial<UseMutationOptions<void, Error, number>>
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = mutationOptions || {};

  return useMutation({
    mutationFn: (notityId: number) => deleteNotity(notityId),
    ...restOptions,
    onSuccess: (data, notityId) => {
      // Invalidate notities list
      queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.notities.all
      });

      // Call external onSuccess if provided
      onSuccess?.(data, notityId, undefined as any);
    },
    onError: (error, notityId) => {
      console.error("Failed to delete notity:", error);

      // Call external onError if provided
      onError?.(error, notityId, undefined as any);
    }
  });
};
