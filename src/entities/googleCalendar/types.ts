/**
 * Google Calendar Entity Types
 */

export interface GoogleCalendarEvent {
  id: string;
  summary: string; // 이벤트 제목
  start: string; // ISO-8601 datetime
  end: string; // ISO-8601 datetime
  suggestList: Array<{
    category?: string;
    brand?: string;
    benefit?: string;
  }>;
  description?: string;
  location?: string;
}

export interface GoogleCalendarEventsResponse {
  events: GoogleCalendarEvent[];
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
