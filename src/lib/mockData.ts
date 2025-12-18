import { addDays } from "date-fns";
import { ActionCategory } from "@/entities/action/types";
import { BenefitSource } from "@/entities/benefit/types";
import { Card } from "@/entities/card/types";

const today = new Date();
const isoDate = (offset = 0) => addDays(today, offset).toISOString();

export interface ActionApiResponse {
  id: string;
  date: string;
  title: string;
  category: ActionCategory;
  description?: string;
  relatedCardId?: string;
}

export interface ActionCreateRequest {
  date: string;
  title: string;
  category: ActionCategory;
  relatedCardId?: string;
  description?: string;
}

export const mockActionsResponse: ActionApiResponse[] = [
  {
    id: "action-1",
    date: isoDate(0),
    title: "택시 결제",
    category: "payment",
    description: "출장 이동",
    relatedCardId: "card-1"
  },
  {
    id: "action-2",
    date: isoDate(1),
    title: "영화 관람",
    category: "dining",
    relatedCardId: "card-2"
  },
  {
    id: "action-3",
    date: isoDate(-2),
    title: "주간 구독료",
    category: "subscription"
  }
];

export const mockCreateActionRequest: ActionCreateRequest = {
  date: isoDate(3),
  title: "커피숍 방문",
  category: "dining",
  relatedCardId: "card-2",
  description: "출근 전 커피"
};

export const mockCreateActionResponse: ActionApiResponse = {
  id: "action-4",
  ...mockCreateActionRequest
};

export interface BenefitApiResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  value?: string;
  source: BenefitSource;
  sourceName: string;
  availableFrom: string;
}

export const mockBenefitsResponse: BenefitApiResponse[] = [
  {
    id: "benefit-1",
    title: "월간 통합 포인트",
    description: "지정일에 자동 납부하면 최대 5,000포인트 적립",
    category: "자동납부",
    value: "5,000P",
    source: "subscription",
    sourceName: "통합 멤버십",
    availableFrom: isoDate(0)
  },
  {
    id: "benefit-2",
    title: "프리미엄 카드 캐시백",
    description: "역대 실적 대비 1% 높은 캐시백을 제공합니다",
    category: "결제",
    value: "1% 캐시백",
    source: "card",
    sourceName: "골드플러스 카드",
    availableFrom: isoDate(2)
  },
  {
    id: "benefit-3",
    title: "외식 할인 쿠폰",
    description: "주말 외식 시 20% 할인 쿠폰 자동 발급",
    category: "외식",
    value: "20%",
    source: "card",
    sourceName: "다이닝카드",
    availableFrom: isoDate(5)
  }
];

export const mockCardsResponse: Card[] = [
  {
    id: "card-1",
    name: "우수 소비 카드",
    issuer: "조조뱅크",
    currency: "KRW"
  },
  {
    id: "card-2",
    name: "라이프스타일 카드",
    issuer: "나비카드",
    currency: "KRW"
  },
  {
    id: "card-3",
    name: "해외 여행 카드",
    issuer: "유니언 파이낸스",
    currency: "USD"
  }
];
