import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { Home, Search, User, type LucideIcon } from "lucide-react";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  // { label: "검색", href: "/app/search", icon: Search },
  { label: "메인", href: "/app", icon: Home },
  { label: "마이페이지", href: "/app/mypage", icon: User }
];

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>

      <nav
        aria-label="하단 네비게이션"
        className="sticky bottom-0 z-10 flex items-center justify-between border-t border-border/70 bg-card/95 px-6 py-4 text-sm shadow-[0_-2px_10px_rgba(15,23,42,0.1)] backdrop-blur"
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
