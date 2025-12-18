import { Action } from "./types";
import { mockActionsResponse } from "@/lib/mockData";

export const defaultActions: Action[] = mockActionsResponse.map((action) => ({
  ...action,
  date: new Date(action.date)
}));
