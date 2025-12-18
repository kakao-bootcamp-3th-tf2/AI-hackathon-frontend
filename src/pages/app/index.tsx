import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/widgets/Header";
import CalendarFeature from "@/components/features/calendar/CalendarFeature";
import { BenefitPanel } from "@/components/features/benefits/components/BenefitPanel";
import ActionInputDialog from "@/components/features/actions/ActionInputDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";

export default function MainPage() {
  const { selectedRange } = useStore();
  const selectedDate = selectedRange.start;
  const { toast } = useToast();
  const [showActionDialog, setShowActionDialog] = useState(false);
  const { isAuthenticated } = useAuth();

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
    <>
      <div aria-hidden={!isAuthenticated}>
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
      </div>

      {!isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 text-center">
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-xl space-y-4 rounded-3xl border border-white/30 bg-white/90 p-6 text-left shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              회원 전용 콘텐츠
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              로그인하면 전체 서비스를 경험할 수 있어요
            </h2>
            <p className="text-base text-muted-foreground">
              혜택 캘린더, 카드 연결, 자동 추천까지 모든 기능을 확인하려면 로그인이
              필요합니다. 잠시 동안은 화면을 둘러보며 UI를 살펴보세요.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-primary/80 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/20"
              >
                로그인 하러 가기
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-full border border-muted/70 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                회원가입 하러 가기
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
