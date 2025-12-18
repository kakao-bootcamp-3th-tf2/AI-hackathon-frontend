import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import Header from "@/components/widgets/Header";
import CalendarFeature from "@/components/features/calendar/CalendarFeature";
import { BenefitPanel } from "@/components/features/benefits/components/BenefitPanel";
import ActionInputDialog from "@/components/features/actions/ActionInputDialog";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import {
  SuggestBenefitWithEventInfo,
  GoogleCalendarSuggest,
  useManualUpdateEvent
} from "@/entities/googleCalendar";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { googleCalendarQueryKeys } from "@/entities/googleCalendar/api/googleCalendarQueryKeys";

type PendingSuggestion = {
  eventId: string;
  suggest: GoogleCalendarSuggest;
};

export default function MainPage() {
  const { selectedRange } = useStore();
  const selectedDate = selectedRange.start;
  const { toast } = useToast();
  const [showActionDialog, setShowActionDialog] = useState(false);
  // eventId를 key로 하는 Record로 중복 방지 및 효율적 관리
  const [suggestedBenefitsMap, setSuggestedBenefitsMap] = useState<
    Record<string, SuggestBenefitWithEventInfo>
  >({});
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] =
    useState<PendingSuggestion | null>(null);

  // 혜택 수정 mutation
  const queryClient = useQueryClient();
  const manualUpdateMutation = useManualUpdateEvent({
    onSuccess: () => {
      toast({
        title: "혜택 수정 완료",
        description: "혜택이 성공적으로 수정되었습니다."
      });
      queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.primary.all
      });
      // Note: Google Calendar API는 자동으로 refetch됩니다 (useManualUpdateEvent의 onSuccess에서 invalidateQueries)
    },
    onError: (error) => {
      toast({
        title: "혜택 수정 실패",
        description: "혜택 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      console.error("Failed to edit suggest:", error);
    }
  });

  // 🔍 suggestedBenefitsMap 변경 감시
  useEffect(() => {
    console.log("📊 suggestedBenefitsMap 업데이트됨:", suggestedBenefitsMap);
    console.log("📊 suggestedBenefitsArray (BenefitPanel에 전달):", Object.values(suggestedBenefitsMap));
  }, [suggestedBenefitsMap]);

  const handleAddAction = () => {
    if (!selectedDate) {
      toast({
        title: "날짜를 선택해 주세요",
        description: "캘린더에서 날짜를 먼저 선택해 주세요.",
        variant: "destructive"
      });
      return;
    }

    setShowActionDialog(true);
  };

  const handleEventCreated = (newBenefits: SuggestBenefitWithEventInfo[]) => {
    console.log("일정 생성 완료, 추천 혜택:", newBenefits);
    console.log("newBenefits[0].eventId:", newBenefits[0]?.eventId);
    console.log("newBenefits[0].suggestList:", newBenefits[0]?.suggestList);

    setSuggestedBenefitsMap((prev) => {
      const updated = { ...prev };
      newBenefits.forEach((benefit) => {
        console.log("추가 중:", benefit.eventId, benefit);
        updated[benefit.eventId] = benefit;
      });
      console.log("✅ setState에서 반환할 updated:", updated);
      return updated;
    });
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setIsLoadingBenefits(isLoading);
  };

  const handleSuggestedBenefitsUpdate = (newBenefits: SuggestBenefitWithEventInfo[]) => {
    setSuggestedBenefitsMap((prev) => {
      const updated = { ...prev };
      newBenefits.forEach((benefit) => {
        updated[benefit.eventId] = benefit;
      });
      return updated;
    });
    console.log("AI 추천 혜택 받음:", suggestedBenefitsMap);
  };

  const handleEditSuggest = (eventId: string, suggest: GoogleCalendarSuggest) => {
    setPendingSuggestion({ eventId, suggest });
  };

  const clearSuggestionFromMap = (eventId: string, suggestText: string) => {
    setSuggestedBenefitsMap((prev) => {
      const updated = { ...prev };
      if (!updated[eventId]) {
        return updated;
      }
      const filtered = updated[eventId].suggestList.filter(
        (s) => s.suggest !== suggestText
      );
      if (filtered.length === 0) {
        delete updated[eventId];
      } else {
        updated[eventId] = {
          ...updated[eventId],
          suggestList: filtered
        };
      }
      return updated;
    });
  };

  const applyPendingSuggestion = () => {
    if (!pendingSuggestion) return;
    const { eventId, suggest } = pendingSuggestion;

    manualUpdateMutation.mutate(
      {
        eventId,
        startAt: suggest.startAt,
        endAt: suggest.endAt,
        suggest: suggest.suggest
      },
      {
        onSuccess: () => {
          clearSuggestionFromMap(eventId, suggest.suggest);
          setPendingSuggestion(null);
        },
        onError: () => {
          setPendingSuggestion(null);
        }
      }
    );
  };

  // Record를 배열로 변환 (BenefitPanel에 전달용)
  const suggestedBenefitsArray = Object.values(suggestedBenefitsMap);

  return (
    <div className="min-h-screen gradient-hero">
      <Header />

      <main className="container px-4 py-6 lg:py-8">
        <section className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 animate-fade-in">
            나의 <span className="text-primary">혜택</span>을 한눈에
          </h1>
          <p className="text-muted-foreground animate-fade-in [animation-delay:100ms]">
            캘린더에 일정을 입력하고 놓친 혜택을 확인하세요
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          <div className="space-y-4 animate-fade-in [animation-delay:200ms]">
            <CalendarFeature
              onSuggestedBenefits={handleSuggestedBenefitsUpdate}
              onLoadingChange={handleLoadingChange}
            />

            <Button
              onClick={handleAddAction}
              className="w-full"
              size="lg"
              disabled={!selectedDate}
            >
              <Plus className="h-5 w-5 mr-2" />
              {selectedDate ? "일정 추가하기" : "날짜를 선택해 주세요"}
            </Button>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit animate-slide-in-right">
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card h-[calc(100vh-200px)] lg:h-[600px]">
              <BenefitPanel
                suggestedBenefits={suggestedBenefitsArray}
                isLoading={isLoadingBenefits}
                onEditSuggest={handleEditSuggest}
              />
            </div>
          </aside>
        </div>
      </main>

      <ActionInputDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        initialDate={selectedDate || undefined}
        onEventCreated={handleEventCreated}
        onLoadingChange={handleLoadingChange}
      />
      {pendingSuggestion && (
        <Modal
          open={Boolean(pendingSuggestion)}
          onClose={() => setPendingSuggestion(null)}
          title="추천 혜택 적용"
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              다음 AI 추천 혜택을 일정에 반영하시겠습니까?
            </p>
            <div>
              <p className="text-xs text-muted-foreground">이벤트</p>
              <p className="text-base font-semibold text-foreground">
                {suggestedBenefitsMap[pendingSuggestion.eventId]?.summary ?? "추천 일정"}
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
                `${format(new Date(pendingSuggestion.suggest.startAt), "yyyy.MM.dd HH:mm")} - ${
                  pendingSuggestion.suggest.endAt
                    ? format(new Date(pendingSuggestion.suggest.endAt), "HH:mm")
                    : format(new Date(pendingSuggestion.suggest.startAt), "HH:mm")
                }`}
            </div>
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
      )}
    </div>
  );
}
