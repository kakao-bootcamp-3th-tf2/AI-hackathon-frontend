import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi
} from "@/components/ui/carousel";
import { Calendar, Gift, Bell } from "lucide-react";

const AUTO_PLAY_INTERVAL = 5000;

const onboardingSlides = [
  {
    icon: Calendar,
    title: "일정 기반 혜택 추적",
    description: "캘린더에 일정을 입력하면\n받을 수 있는 혜택을 자동으로 알려드려요"
  },
  {
    icon: Gift,
    title: "나만의 혜택 관리",
    description: "사용하는 카드와 요금제를 등록하고\n맞춤형 혜택을 한눈에 확인하세요"
  },
  {
    icon: Bell,
    title: "구글 캘린더 연동",
    description: "혜택 일정을 구글 캘린더에 추가하고\n놓치지 않도록 알림을 받아보세요"
  }
];

const GOOGLE_AUTH_URL = "http://localhost:8080/oauth2/authorization/google";

export default function LoginPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = () => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  };

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const timerId = window.setInterval(() => {
      api.scrollNext();
    }, AUTO_PLAY_INTERVAL);
    return () => {
      window.clearInterval(timerId);
    };
  }, [api]);

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Carousel Section */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-16 pb-8">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="w-full max-w-sm mx-auto"
        >
          <CarouselContent>
            {onboardingSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-float">
                    <slide.icon className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {onboardingSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                current === index ? "w-6 bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Login Section */}
      <div className="w-full px-6 pb-12 safe-area-bottom flex flex-col items-center">
        <Button
          className="w-fit h-14 text-base font-medium rounded-xl bg-card border border-border hover:bg-muted shadow-card flex items-center justify-center gap-3"
          variant="outline"
          onClick={handleGoogleLogin}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-foreground">Google로 계속하기</span>
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-6">
          계속 진행하면 <span className="underline cursor-pointer">이용약관</span> 및{" "}
          <span className="underline cursor-pointer">개인정보처리방침</span>에 동의하는
          것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
