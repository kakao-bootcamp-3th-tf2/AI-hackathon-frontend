/**
 * Google Calendar Entity Exports
 * Public API for Google Calendar domain
 */

// Types
export type {
  GoogleCalendarEvent,
  GoogleCalendarEventsResponse,
  GoogleCalendarCreateEventRequest,
  GoogleCalendarManualUpdateRequest,
  GoogleCalendarSuggestRequest,
  GoogleCalendarSuggestResponse,
  GoogleCalendarEventDto,
  NotityDto,
  APIResponse
} from "./types";

// Query hooks
export {
  usePrimaryCalendarEvents,
  useCreateCalendarEvent,
  useManualUpdateEvent,
  useSuggestEvents,
  useNotities,
  useDeleteNotity
} from "./api/googleCalendarQueries";

// Query keys
export { googleCalendarQueryKeys } from "./api/googleCalendarQueryKeys";

// API functions
export {
  fetchPrimaryCalendarEvents,
  createCalendarEvent,
  manualUpdateEvent,
  suggestEvents,
  fetchNotities,
  deleteNotity
} from "./api/googleCalendarApi";
