import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { Home, Search, User, type LucideIcon } from "lucide-react";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "검색", href: "/app/search", icon: Search },
  { label: "메인", href: "/app", icon: Home },
  { label: "마이페이지", href: "/app/mypage", icon: User }
];

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen pb-24">
      {children}

      <nav
        aria-label="하단 네비게이션"
        className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 items-center justify-between rounded-2xl border border-border/70 bg-card/95 px-6 py-3 text-sm shadow-[0_15px_40px_-20px_rgba(15,23,42,0.8)] backdrop-blur"
      >
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className="text-xs font-semibold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
