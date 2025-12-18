import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/widgets/Header";
import CalendarFeature from "@/components/features/calendar/CalendarFeature";
import { BenefitPanel } from "@/components/features/benefits/components/BenefitPanel";
import ActionInputDialog from "@/components/features/actions/ActionInputDialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import {
  SuggestBenefitWithEventInfo,
  GoogleCalendarSuggest,
  useManualUpdateEvent
} from "@/entities/googleCalendar";
import { useQueryClient } from "@tanstack/react-query";
import { googleCalendarQueryKeys } from "@/entities/googleCalendar/api/googleCalendarQueryKeys";

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
    setSuggestedBenefitsMap((prev) => {
      const updated = { ...prev };
      newBenefits.forEach((benefit) => {
        updated[benefit.eventId] = benefit;
      });
      return updated;
    });
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setIsLoadingBenefits(isLoading);
  };

  const handleSuggestedBenefitsUpdate = (newBenefits: SuggestBenefitWithEventInfo[]) => {
    console.log("AI 추천 혜택 받음:", newBenefits);
    setSuggestedBenefitsMap((prev) => {
      const updated = { ...prev };
      newBenefits.forEach((benefit) => {
        updated[benefit.eventId] = benefit;
      });
      return updated;
    });
  };

  // 혜택 수정 핸들러
  const handleEditSuggest = (eventId: string, suggest: GoogleCalendarSuggest) => {
    console.log("혜택 수정:", eventId, suggest);

    // API 호출
    manualUpdateMutation.mutate({
      eventId,
      startAt: suggest.startAt,
      endAt: suggest.endAt,
      suggest: suggest.suggest
    });

    // 선택한 혜택을 suggestedBenefitsMap에서 제거
    setSuggestedBenefitsMap((prev) => {
      const updated = { ...prev };
      if (updated[eventId]) {
        // 해당 eventId의 suggestList에서 이 suggest를 제거
        const filtered = updated[eventId].suggestList.filter(
          (s) => s.suggest !== suggest.suggest
        );

        if (filtered.length === 0) {
          // suggestList가 비었으면 전체 entry 제거
          delete updated[eventId];
        } else {
          // 남은 suggestList로 업데이트
          updated[eventId] = {
            ...updated[eventId],
            suggestList: filtered
          };
        }
      }
      return updated;
    });
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
    </div>
  );
}
