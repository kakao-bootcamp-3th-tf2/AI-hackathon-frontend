import type { ReactNode } from "react";
import OnboardingSection from "./OnboardingSection";

interface DesktopLayoutWrapperProps {
  children: ReactNode;
}

export default function DesktopLayoutWrapper({ children }: DesktopLayoutWrapperProps) {
  return (
    <>
      {/* Mobile: Show only children (full screen) */}
      <div className="block lg:hidden">{children}</div>

      {/* Desktop: Show onboarding section + mobile frame */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Left: Onboarding Section */}
        <div className="w-1/2 shrink-0">
          <OnboardingSection />
        </div>

        {/* Right: Mobile Frame */}
        <div className="w-1/2 flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
          <div className="relative">
            {/* Mobile Device Frame */}
            <div className="relative h-203  overflow-hidden bg-white shadow-2xl">
              {/* Screen Content */}
              <div className="h-full w-full overflow-y-auto bg-background">
                {children}
              </div>
            </div>

            {/* Device Shadow/Glow */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/5 blur-3xl" />
          </div>
        </div>
      </div>
    </>
  );
}
