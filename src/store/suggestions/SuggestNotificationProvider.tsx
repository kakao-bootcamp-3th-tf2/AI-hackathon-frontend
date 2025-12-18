import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import {
  SuggestBenefitWithEventInfo,
  GoogleCalendarSuggest,
  useManualUpdateEvent
} from "@/entities/googleCalendar";
import { googleCalendarQueryKeys } from "@/entities/googleCalendar/api/googleCalendarQueryKeys";
import { useQueryClient } from "@tanstack/react-query";

interface PendingSuggestion {
  eventId: string;
  suggest: GoogleCalendarSuggest;
}

interface SuggestNotificationContextValue {
  notifications: SuggestBenefitWithEventInfo[];
  setNotifications: (items: SuggestBenefitWithEventInfo[]) => void;
  requestSuggestionEdit: (eventId: string, suggest: GoogleCalendarSuggest) => void;
}

const SuggestNotificationContext = createContext<SuggestNotificationContextValue | null>(
  null
);

export const SuggestNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotificationsState] = useState<SuggestBenefitWithEventInfo[]>(
    []
  );
  const [pendingSuggestion, setPendingSuggestion] = useState<PendingSuggestion | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setNotifications = useCallback((items: SuggestBenefitWithEventInfo[]) => {
    setNotificationsState(items);
  }, []);

  const clearSuggestionFromNotifications = useCallback(
    (eventId: string, suggestText: string) => {
      setNotificationsState((prev) => {
        const updated = {
          ...Object.fromEntries(prev.map((item) => [item.eventId, item]))
        };
        const target = updated[eventId];
        if (!target) {
          return prev;
        }
        const filtered = target.suggestList.filter((s) => s.suggest !== suggestText);
        if (filtered.length === 0) {
          delete updated[eventId];
        } else {
          updated[eventId] = {
            ...target,
            suggestList: filtered
          };
        }
        return Object.values(updated);
      });
    },
    []
  );

  const manualUpdateMutation = useManualUpdateEvent({
    onSuccess: () => {
      toast({
        title: "혜택 수정 완료",
        description: "혜택이 성공적으로 수정되었습니다."
      });
      queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.primary.all
      });
      setPendingSuggestion(null);
    },
    onError: (error) => {
      toast({
        title: "혜택 수정 실패",
        description: "혜택 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      console.error("Failed to edit suggest:", error);
      setPendingSuggestion(null);
    }
  });

  const applyPendingSuggestion = useCallback(() => {
    if (!pendingSuggestion) return;
    manualUpdateMutation.mutate(
      {
        eventId: pendingSuggestion.eventId,
        startAt: pendingSuggestion.suggest.startAt,
        endAt: pendingSuggestion.suggest.endAt,
        suggest: pendingSuggestion.suggest.suggest
      },
      {
        onSuccess: () => {
          clearSuggestionFromNotifications(
            pendingSuggestion.eventId,
            pendingSuggestion.suggest.suggest
          );
        },
        onError: () => {
          /* errors handled via mutation's onError */
        }
      }
    );
  }, [clearSuggestionFromNotifications, manualUpdateMutation, pendingSuggestion]);

  const requestSuggestionEdit = useCallback(
    (eventId: string, suggest: GoogleCalendarSuggest) => {
      setPendingSuggestion({ eventId, suggest });
    },
    []
  );

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      requestSuggestionEdit
    }),
    [notifications, setNotifications, requestSuggestionEdit]
  );

  const selectedSummary = pendingSuggestion
    ? notifications.find((item) => item.eventId === pendingSuggestion.eventId)?.summary
    : undefined;

  return (
    <SuggestNotificationContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(pendingSuggestion)}
        onClose={() => setPendingSuggestion(null)}
        title="추천 혜택 적용"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            다음 AI 추천 혜택을 일정에 반영하시겠습니까?
          </p>
          {pendingSuggestion && (
            <>
              <div>
                <p className="text-xs text-muted-foreground">이벤트</p>
                <p className="text-base font-semibold text-foreground">
                  {selectedSummary ?? "추천 일정"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">추천 내용</p>
                <p className="text-sm text-foreground whitespace-pre-line">
                  {pendingSuggestion.suggest.suggest}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {pendingSuggestion.suggest.startAt &&
                  `${format(
                    new Date(pendingSuggestion.suggest.startAt),
                    "yyyy.MM.dd HH:mm",
                    {
                      locale: ko
                    }
                  )} - ${
                    pendingSuggestion.suggest.endAt
                      ? format(
                          new Date(pendingSuggestion.suggest.endAt),
                          "yyyy.MM.dd HH:mm",
                          { locale: ko }
                        )
                      : format(
                          new Date(pendingSuggestion.suggest.startAt),
                          "yyyy.MM.dd HH:mm",
                          { locale: ko }
                        )
                  }`}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 pt-6">
          <Button variant="outline" onClick={() => setPendingSuggestion(null)}>
            취소
          </Button>
          <Button
            onClick={applyPendingSuggestion}
            disabled={manualUpdateMutation.isPending}
            className="gap-2"
          >
            {manualUpdateMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {manualUpdateMutation.isPending ? "적용 중..." : "적용하기"}
          </Button>
        </div>
      </Modal>
    </SuggestNotificationContext.Provider>
  );
};

export const useSuggestNotification = () => {
  const context = useContext(SuggestNotificationContext);
  if (!context) {
    throw new Error(
      "useSuggestNotification must be used within a SuggestNotificationProvider"
    );
  }
  return context;
};
