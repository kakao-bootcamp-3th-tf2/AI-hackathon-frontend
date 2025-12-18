import React from "react";
import { Loader2 } from "lucide-react";

interface CalendarLoadingSpinnerProps {
  message?: string;
}

export default function CalendarLoadingSpinner({
  message = "Google Calendar를 불러오는 중..."
}: CalendarLoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] md:min-h-[600px]">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
