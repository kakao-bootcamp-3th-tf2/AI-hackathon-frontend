/**
 * Google Calendar Entity Types
 */

export interface GoogleCalendarSuggest {
  suggest: string;
  startAt: string; // ISO-8601 datetime
  endAt: string; // ISO-8601 datetime
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string; // 이벤트 제목
  startAt: string; // ISO-8601 datetime
  endAt: string; // ISO-8601 datetime
  suggestList: GoogleCalendarSuggest[];
  content?: string; // 이벤트 상세 내용
  description?: string;
  location?: string;
}

export interface GoogleCalendarEventsResponse {
  events: GoogleCalendarEvent[];
}

export interface GoogleCalendarCreateEventRequest {
  category: string; // 이벤트 카테고리 (예: "금융 이벤트")
  brand: string; // 브랜드명
  startAt: string; // ISO-8601 datetime (예: "2025-12-20T09:00:00Z")
  endAt: string; // ISO-8601 datetime (예: "2025-12-20T11:00:00Z")
  description?: string;
  location?: string;
  attendees?: Array<{
    email: string;
    name?: string;
  }>;
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
