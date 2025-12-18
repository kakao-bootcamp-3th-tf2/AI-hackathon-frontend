import type { LucideIcon } from "lucide-react";
import {
  Coffee,
  CreditCard,
  Globe,
  Repeat,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { ActionCategory } from "./types";

export const categoryLabels: Record<ActionCategory, string> = {
  payment: "결제",
  shopping: "쇼핑",
  subscription: "구독",
  travel: "여행",
  dining: "외식",
  other: "기타"
};

export const categoryIcons: Record<ActionCategory, LucideIcon> = {
  payment: CreditCard,
  shopping: ShoppingBag,
  subscription: Repeat,
  travel: Globe,
  dining: Coffee,
  other: Sparkles
};
