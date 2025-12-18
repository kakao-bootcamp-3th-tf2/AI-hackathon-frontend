import Link from "next/link";
import { Calendar, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
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
      </div>
    </header>
  );
}
