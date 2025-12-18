import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/widgets/Header";
import CalendarFeature from "@/components/features/calendar/CalendarFeature";
import { BenefitPanel } from "@/components/features/benefits/components/BenefitPanel";
import ActionInputDialog from "@/components/features/actions/ActionInputDialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";

export default function MainPage() {
  const { selectedRange } = useStore();
  const selectedDate = selectedRange.start;
  const { toast } = useToast();
  const [showActionDialog, setShowActionDialog] = useState(false);

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
            <CalendarFeature />

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
              <BenefitPanel />
            </div>
          </aside>
        </div>
      </main>

      <ActionInputDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        initialDate={selectedDate || undefined}
      />
    </div>
  );
}
