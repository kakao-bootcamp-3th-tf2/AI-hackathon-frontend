export type BenefitSource = "card" | "subscription";

export interface Benefit {
  id: string;
  title: string;
  description: string;
  category: string;
  value?: string;
  source: BenefitSource;
  sourceName: string;
  availableFrom: Date;
}
