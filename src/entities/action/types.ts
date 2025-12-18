export type ActionCategory =
  | "payment"
  | "shopping"
  | "subscription"
  | "travel"
  | "dining"
  | "other";

export interface ActionDateRange {
  start: Date;
  end: Date | null;
}

export interface Action {
  id: string;
  date: Date;
  title: string;
  description?: string;
  category: ActionCategory;
  relatedCardId?: string;
  range?: ActionDateRange;
}

export interface ActionFormPayload extends Omit<Action, "id" | "description"> {
  description?: string;
  id?: string;
}
