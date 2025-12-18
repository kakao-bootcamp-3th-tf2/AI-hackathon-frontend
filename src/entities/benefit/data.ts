import { Benefit } from "./types";
import { mockBenefitsResponse } from "@/lib/mockData";

export const defaultBenefits: Benefit[] = mockBenefitsResponse.map((benefit) => ({
  ...benefit,
  availableFrom: new Date(benefit.availableFrom)
}));
