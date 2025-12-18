import { Card } from "@/entities/card/types";

// Card selection options for setup modal
export const cardSelectionOptions: Card[] = [
  {
    id: "card-samsung",
    name: "삼성 카드",
    issuer: "삼성카드",
    currency: "KRW"
  },
  {
    id: "card-hyundai",
    name: "현대카드",
    issuer: "현대카드",
    currency: "KRW"
  },
  {
    id: "card-hana",
    name: "하나카드",
    issuer: "하나카드",
    currency: "KRW"
  },
  {
    id: "card-kookmin",
    name: "국민카드",
    issuer: "국민은행",
    currency: "KRW"
  }
];

// Pay selection options
export interface Pay {
  id: string;
  name: string;
  provider: string;
}

export const paySelectionOptions: Pay[] = [
  {
    id: "pay-kakao",
    name: "카카오페이",
    provider: "카카오"
  },
  {
    id: "pay-toss",
    name: "토스 페이",
    provider: "토스"
  },
  {
    id: "pay-naver",
    name: "네이버 페이",
    provider: "네이버"
  }
];

// Plan selection options
export interface Plan {
  id: string;
  name: string;
  provider: string;
}

export const planSelectionOptions: Plan[] = [
  {
    id: "plan-lgu",
    name: "LG U+",
    provider: "LG U+"
  },
  {
    id: "plan-skt",
    name: "SKT",
    provider: "SKT"
  },
  {
    id: "plan-kt",
    name: "KT",
    provider: "KT"
  }
];
