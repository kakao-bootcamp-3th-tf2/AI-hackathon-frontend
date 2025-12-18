import type { LucideIcon } from "lucide-react";
import { Coffee, CreditCard, ShoppingBag, Sparkles } from "lucide-react";
import { ActionCategory } from "./types";

export const categoryLabels: Record<ActionCategory, string> = {
  dining: "음식",
  shopping: "쇼핑",
  cafe: "카페",
  movie: "영화"
};

export const categoryIcons: Record<ActionCategory, LucideIcon> = {
  shopping: ShoppingBag,
  dining: CreditCard,
  cafe: Coffee,
  movie: Sparkles
};
