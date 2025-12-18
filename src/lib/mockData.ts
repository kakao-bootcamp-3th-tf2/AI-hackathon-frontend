import { Card } from "@/entities/card/types";

// Card selection options for setup modal
export const cardSelectionOptions: Card[] = [
  {
    id: "SamsungCard",
    name: "삼성 카드",
    issuer: "삼성카드",
    currency: "KRW"
  },
  {
    id: "HyundaiCard",
    name: "현대카드",
    issuer: "현대카드",
    currency: "KRW"
  },
  {
    id: "HanaCard",
    name: "하나카드",
    issuer: "하나카드",
    currency: "KRW"
  },
  {
    id: "KBCard",
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
    id: "KakaoPay",
    name: "카카오페이",
    provider: "카카오"
  },
  {
    id: "TossPay",
    name: "토스 페이",
    provider: "토스"
  },
  {
    id: "NaverPay",
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
    id: "LGU+",
    name: "LG U+",
    provider: "LG U+"
  },
  {
    id: "SKT",
    name: "SKT",
    provider: "SKT"
  },
  {
    id: "KT",
    name: "KT",
    provider: "KT"
  }
];
