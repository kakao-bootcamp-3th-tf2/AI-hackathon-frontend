/**
 * Google Calendar API Functions
 * Axios-based API calls for Google Calendar integration
 */

import { apiInstance } from "@/shared/api/instance";
import {
  GoogleCalendarEventsResponse,
  GoogleCalendarCreateEventRequest,
  GoogleCalendarEventDto,
  APIResponse
} from "../types";

interface FetchCalendarEventsParams {
  from: string; // ISO-8601 datetime
  to: string; // ISO-8601 datetime
}

/**
 * Fetch events from primary Google Calendar
 * GET /api/calendar/events
 */
export const fetchPrimaryCalendarEvents = async (
  params: FetchCalendarEventsParams
) => {
  const response = await apiInstance.get<
    APIResponse<GoogleCalendarEventsResponse>
  >("/api/calendar/events", {
    params: {
      from: params.from,
      to: params.to
    }
  });
  return response.data.data;
};

/**
 * Create a new calendar event with AI-recommended benefits
 * POST /api/calendar/events
 */
export const createCalendarEvent = async (
  request: GoogleCalendarCreateEventRequest
) => {
  const response = await apiInstance.post<APIResponse<GoogleCalendarEventDto>>(
    "/api/calendar/events",
    request
  );
  return response.data.data;
};
