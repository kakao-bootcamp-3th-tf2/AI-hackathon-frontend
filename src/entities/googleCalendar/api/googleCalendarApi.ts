/**
 * Google Calendar API Functions
 * Axios-based API calls for Google Calendar integration
 */

import { apiInstance } from "@/shared/api/instance";
import {
  GoogleCalendarEventsResponse,
  GoogleCalendarCreateEventRequest,
  GoogleCalendarEventDto,
  APIResponse,
  GoogleCalendarManualUpdateRequest,
  GoogleCalendarSuggestRequest,
  GoogleCalendarSuggestResponseItem,
  NotityDto
} from "../types";

interface FetchCalendarEventsParams {
  from: string; // ISO-8601 datetime
  to: string; // ISO-8601 datetime
}

/**
 * Fetch events from primary Google Calendar
 * GET /api/calendar/events
 */
export const fetchPrimaryCalendarEvents = async (params: FetchCalendarEventsParams) => {
  const response = await apiInstance.get<APIResponse<GoogleCalendarEventsResponse>>(
    "/api/calendar/events",
    {
      params: {
        from: params.from,
        to: params.to
      }
    }
  );
  return response.data.data;
};

/**
 * Create a new calendar event with AI-recommended benefits
 * POST /api/calendar/events
 */
export const createCalendarEvent = async (request: GoogleCalendarCreateEventRequest) => {
  const response = await apiInstance.post<APIResponse<GoogleCalendarEventDto>>(
    "/api/calendar/events",
    request
  );
  return response.data.data;
};

/**
 * Manually overwrite event details
 * PUT /api/calendar/events/manual
 */
export const manualUpdateEvent = async (request: GoogleCalendarManualUpdateRequest) => {
  const response = await apiInstance.put<APIResponse<GoogleCalendarEventDto>>(
    "/api/calendar/events/manual",
    request
  );
  return response.data.data;
};

/**
 * Add AI suggestions to multiple events
 * PATCH /api/calendar/events/suggest
 */
export const suggestEvents = async (request: GoogleCalendarSuggestRequest): Promise<GoogleCalendarSuggestResponseItem[]> => {
  const response = await apiInstance.patch<APIResponse<GoogleCalendarSuggestResponseItem[]>>(
    "/api/calendar/events/suggest",
    request
  );
  return response.data.data;
};

/**
 * Fetch all notities (reminders) for user
 * GET /api/calendar/notities
 */
export const fetchNotities = async () => {
  const response = await apiInstance.get<APIResponse<NotityDto[]>>(
    "/api/calendar/notities"
  );
  return response.data.data;
};

/**
 * Delete a notity (reminder)
 * DELETE /api/calendar/notities/{notityId}
 */
export const deleteNotity = async (notityId: number) => {
  const response = await apiInstance.delete<APIResponse<void>>(
    `/api/calendar/notities/${notityId}`
  );
  return response.data.data;
};
