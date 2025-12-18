import Link from "next/link";
import { useState } from "react";
import { Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BenefitPanel } from "@/components/features/benefits/components/BenefitPanel";
import { GoogleCalendarSuggest } from "@/entities/googleCalendar";
import { useSuggestNotification } from "@/store/suggestions/SuggestNotificationProvider";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const { notifications, requestSuggestionEdit } = useSuggestNotification();
  const hasNotifications = notifications.length > 0;

  const handleNotificationEdit = (eventId: string, suggest: GoogleCalendarSuggest) => {
    requestSuggestionEdit(eventId, suggest);
    setIsAlarmModalOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg",
          className
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/app" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              조조 할인
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAlarmModalOpen(true)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <Modal
        open={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        title="AI 추천 알림"
        className="max-w-2xl w-full"
      >
        {hasNotifications ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI가 새로 제안한 혜택들을 확인하고 일정에 반영해보세요.
            </p>
            <div className="h-[480px] overflow-auto">
            <BenefitPanel
              suggestedBenefits={notifications}
              deliverAllSuggestedBenefits
              onEditSuggest={handleNotificationEdit}
            />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            새로운 AI 추천 혜택이 없습니다.
          </p>
        )}
      </Modal>
    </>
  );
}
