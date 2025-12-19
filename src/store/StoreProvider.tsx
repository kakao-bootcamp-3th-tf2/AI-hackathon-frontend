import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState
} from "react";
import { endOfDay, startOfDay } from "date-fns";
import { Action, ActionFormPayload } from "@/entities/action/types";
import { defaultActions } from "@/entities/action/data";
import { Card } from "@/entities/card/types";
import { defaultCards } from "@/entities/card/data";
import { Benefit } from "@/entities/benefit/types";
import { defaultBenefits } from "@/entities/benefit/data";
import { Pay, Plan } from "@/lib/mockData";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface StoreContextValue {
  selectedRange: DateRange | null;
  setSelectedRange: (start: Date | null, end: Date | null) => void;
  selectSingleDate: (date: Date) => void;
  primarySelectedDate: Date | null;
  getActionsForDate: (date: Date) => Action[];
  getActionsForRange: (range: DateRange | null) => Action[];
  addAction: (payload: ActionFormPayload) => void;
  removeAction: (actionId: string) => void;
  cards: Card[];
  addCard: (cards: Card[]) => void;
  removeCard: (cardId: string) => void;
  pays: Pay[];
  addPay: (pays: Pay[]) => void;
  removePay: (payId: string) => void;
  plans: Plan[];
  addPlan: (plans: Plan[]) => void;
  removePlan: (planId: string) => void;
  getBenefitsForDate: (date: Date) => Benefit[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

const normalizeRange = (start: Date | null, end: Date | null): DateRange | null => {
  if (!start) {
    return null;
  }

  const normalizedEnd = end ?? start;
  const startTime = start.getTime();
  const endTime = normalizedEnd.getTime();

  if (startTime <= endTime) {
    return { start: new Date(startTime), end: new Date(endTime) };
  }

  return { start: new Date(endTime), end: new Date(startTime) };
};

interface StoreState {
  selectedRange: DateRange | null;
  actions: Action[];
}

type StoreAction =
  | { type: "SET_SELECTED_RANGE"; payload: DateRange | null }
  | { type: "ADD_ACTION"; payload: Action }
  | { type: "REMOVE_ACTION"; payload: string };

const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case "SET_SELECTED_RANGE":
      return { ...state, selectedRange: action.payload };
    case "ADD_ACTION":
      return { ...state, actions: [action.payload, ...state.actions] };
    case "REMOVE_ACTION":
      return { ...state, actions: state.actions.filter((item) => item.id !== action.payload) };
    default:
      return state;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, {
    selectedRange: null,
    actions: defaultActions
  });
  const [cards, setCards] = useState<Card[]>(defaultCards);
  const [pays, setPays] = useState<Pay[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const setSelectedRange = useCallback((start: Date | null, end: Date | null) => {
    dispatch({ type: "SET_SELECTED_RANGE", payload: normalizeRange(start, end) });
  }, []);

  const selectSingleDate = useCallback(
    (date: Date) => {
      dispatch({ type: "SET_SELECTED_RANGE", payload: normalizeRange(date, date) });
    },
    []
  );

  const addAction = useCallback((payload: ActionFormPayload) => {
    const newAction: Action = {
      id: payload.id ?? `action-${Date.now()}`,
      date: payload.date,
      title: payload.title,
      category: payload.category,
      description: payload.description
    };
    dispatch({ type: "ADD_ACTION", payload: newAction });
  }, []);

  const removeAction = useCallback((actionId: string) => {
    dispatch({ type: "REMOVE_ACTION", payload: actionId });
  }, []);

  const addCard = useCallback((newCards: Card[]) => {
    setCards((prev) => {
      const existingIds = new Set(prev.map((card) => card.id));
      const cardsToAdd = newCards.filter((card) => !existingIds.has(card.id));
      return [...prev, ...cardsToAdd];
    });
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  }, []);

  const addPay = useCallback((newPays: Pay[]) => {
    setPays((prev) => {
      const existingIds = new Set(prev.map((pay) => pay.id));
      const paysToAdd = newPays.filter((pay) => !existingIds.has(pay.id));
      return [...prev, ...paysToAdd];
    });
  }, []);

  const removePay = useCallback((payId: string) => {
    setPays((prev) => prev.filter((pay) => pay.id !== payId));
  }, []);

  const addPlan = useCallback((newPlans: Plan[]) => {
    setPlans((prev) => {
      const existingIds = new Set(prev.map((plan) => plan.id));
      const plansToAdd = newPlans.filter((plan) => !existingIds.has(plan.id));
      return [...prev, ...plansToAdd];
    });
  }, []);

  const removePlan = useCallback((planId: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== planId));
  }, []);

  const getActionInterval = useCallback((action: Action) => {
    const rangeStart = startOfDay(action.range?.start ?? action.date);
    const fallbackEnd = action.range?.end ?? action.range?.start;
    const resolvedEnd = fallbackEnd ?? action.date;
    const rangeEnd = endOfDay(resolvedEnd);
    return { start: rangeStart, end: rangeEnd };
  }, []);

  const getActionsForDate = useCallback(
    (date: Date) => {
      const targetStart = startOfDay(date);
      const targetEnd = endOfDay(date);
      return state.actions.filter((action) => {
        const { start, end } = getActionInterval(action);
        return start <= targetEnd && end >= targetStart;
      });
    },
    [state.actions, getActionInterval]
  );

  const getActionsForRange = useCallback(
    (range: DateRange | null) => {
      if (!range?.start) {
        return state.actions;
      }
      const rangeStart = startOfDay(range.start);
      const rangeEnd = endOfDay(range.end ?? range.start);

      return state.actions.filter((action) => {
        const { start, end } = getActionInterval(action);
        return start <= rangeEnd && end >= rangeStart;
      });
    },
    [state.actions, getActionInterval]
  );

  const getBenefitsForDate = useCallback(
    (date: Date) =>
      defaultBenefits
        .filter((benefit) => benefit.availableFrom <= date)
        .sort((a, b) => b.availableFrom.getTime() - a.availableFrom.getTime()),
    []
  );

  const value = useMemo(
    () => ({
      selectedRange: state.selectedRange,
      setSelectedRange,
      selectSingleDate,
      primarySelectedDate: state.selectedRange?.start ?? null,
      getActionsForDate,
      getActionsForRange,
      addAction,
      removeAction,
      cards,
      addCard,
      removeCard,
      pays,
      addPay,
      removePay,
      plans,
      addPlan,
      removePlan,
      getBenefitsForDate
    }),
    [
      state.selectedRange,
      setSelectedRange,
      selectSingleDate,
      getActionsForDate,
      getActionsForRange,
      addAction,
      removeAction,
      cards,
      addCard,
      removeCard,
      pays,
      addPay,
      removePay,
      plans,
      addPlan,
      removePlan,
      getBenefitsForDate
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextValue => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
