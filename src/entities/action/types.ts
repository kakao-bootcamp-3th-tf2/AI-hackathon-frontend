export type ActionCategory =
  | "payment"
  | "shopping"
  | "subscription"
  | "travel"
  | "dining"
  | "other";

export interface Action {
  id: string;
  date: Date;
  title: string;
  description?: string;
  category: ActionCategory;
  relatedCardId?: string;
}

export interface ActionFormPayload
  extends Omit<Action, "id" | "description"> {
  description?: string;
  id?: string;
}
