import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SummaryCard({ 
  title, 
  amount, 
  icon: Icon, 
  trend = null, 
  trendLabel = "",
  variant = "default" 
}) {
  const variants = {
    default: "bg-white border-slate-200",
    income: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
    expense: "bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200",
    balance: "bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-600 text-white"
  };

  const iconVariants = {
    default: "bg-slate-100 text-slate-600",
    income: "bg-emerald-100 text-emerald-600",
    expense: "bg-rose-100 text-rose-600",
    balance: "bg-white/20 text-white"
  };

  const getTrendIcon = () => {
    if (trend === null) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <Card className={cn(
      "p-6 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "balance" ? "text-white/80" : "text-slate-500"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === "balance" ? "text-white" : "text-slate-800"
          )}>
            {amount.toLocaleString('fr-MA')} <span className="text-lg font-normal">MAD</span>
          </p>
          {trend !== null && (
            <div className="flex items-center gap-1.5 pt-1">
              {getTrendIcon()}
              <span className={cn(
                "text-xs font-medium",
                trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-slate-500"
              )}>
                {trend > 0 ? "+" : ""}{trend}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-2xl",
          iconVariants[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}