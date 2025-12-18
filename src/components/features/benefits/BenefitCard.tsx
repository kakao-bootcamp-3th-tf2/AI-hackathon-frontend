import React from "react";
import { ChevronRight, CreditCard, Smartphone } from "lucide-react";
import { Benefit } from "@/entities/benefit/types";
import { cn } from "@/lib/utils/cn";

interface BenefitCardProps {
  benefit: Benefit;
  index: number;
}

export default function BenefitCard({ benefit, index }: BenefitCardProps) {
  const Icon = benefit.source === "card" ? CreditCard : Smartphone;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 shadow-card transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-card-foreground truncate">
              {benefit.title}
            </h4>
            {benefit.value && (
              <span className="shrink-0 rounded-full bg-benefit-bg px-2 py-0.5 text-xs font-medium text-benefit-foreground">
                {benefit.value}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {benefit.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {benefit.sourceName}
            </span>
            <span className="text-xs text-muted-foreground">{benefit.category}</span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </article>
  );
}
