/**
 * Google Calendar Entity Types
 */

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO-8601
  endTime: string; // ISO-8601
  location?: string;
  attendees?: Array<{
    email: string;
    name?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
}

export interface GoogleCalendarEventsResponse {
  events: GoogleCalendarEvent[];
  nextPageToken?: string;
}

export interface GoogleCalendarCreateEventRequest {
  title: string;
  description?: string;
  startTime: string; // ISO-8601
  endTime: string; // ISO-8601
  location?: string;
  attendees?: Array<{
    email: string;
    name?: string;
  }>;
  category?: string;
  brand?: string;
  benefit?: string; // AI 추천 혜택 정보
}

export interface GoogleCalendarEventDto {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO-8601
  endTime: string; // ISO-8601
  location?: string;
  attendees?: Array<{
    email: string;
    name?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T> {
  code: string;
  message: string;
  data: T;
}
