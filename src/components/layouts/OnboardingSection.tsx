import { Calendar, Heart, TrendingUp, Sparkles } from "lucide-react";

export default function OnboardingSection() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-primary">조조 할인</h1>
          </div>
          <p className="text-xl font-semibold text-foreground">일정과 혜택을 한눈에</p>
          <p className="text-muted-foreground">
            일상의 모든 활동을 기록하고, 카드 혜택을 자동으로 추천받아보세요
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-white/60 p-4 backdrop-blur">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">스마트 캘린더</h3>
              <p className="text-sm text-muted-foreground">
                일정을 기록하고 카테고리별로 관리하세요
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white/60 p-4 backdrop-blur">
            <div className="rounded-full bg-primary/10 p-2">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">맞춤 혜택 추천</h3>
              <p className="text-sm text-muted-foreground">
                등록된 카드로 받을 수 있는 혜택을 자동 추천
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white/60 p-4 backdrop-blur">
            <div className="rounded-full bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">소비 패턴 분석</h3>
              <p className="text-sm text-muted-foreground">
                카테고리별 활동 내역을 시각적으로 확인
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>지금 바로 시작해보세요</span>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            오른쪽 화면에서 서비스를 체험해보실 수 있습니다
          </div>
        </div>
      </div>
    </div>
  );
}
