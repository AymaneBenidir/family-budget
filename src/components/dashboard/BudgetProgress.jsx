import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS = {
  food: 'Alimentation',
  rent: 'Loyer',
  transport: 'Transport',
  education: 'Éducation',
  health: 'Santé',
  leisure: 'Loisirs',
  utilities: 'Services',
  clothing: 'Vêtements',
  savings: 'Épargne',
  other: 'Autres'
};

const CATEGORY_ICONS = {
  food: '🍽️',
  rent: '🏠',
  transport: '🚗',
  education: '📚',
  health: '💊',
  leisure: '🎮',
  utilities: '💡',
  clothing: '👕',
  savings: '💰',
  other: '📦'
};

export default function BudgetProgress({ goals, expenses }) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'other';
    acc[cat] = (acc[cat] || 0) + expense.amount;
    return acc;
  }, {});

  if (goals.length === 0) {
    return (
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">
            Objectifs budgétaires
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-slate-400">
          <p>Aucun objectif défini</p>
          <p className="text-sm mt-2">Définissez des limites pour mieux gérer vos dépenses</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-700">
          Objectifs budgétaires
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {goals.map((goal) => {
          const spent = categoryTotals[goal.category] || 0;
          const percentage = Math.min((spent / goal.monthly_limit) * 100, 100);
          const isWarning = percentage >= (goal.alert_threshold || 80);
          const isOver = percentage >= 100;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_ICONS[goal.category]}</span>
                  <span className="font-medium text-slate-700">
                    {CATEGORY_LABELS[goal.category]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isOver ? (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    isOver ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-600"
                  )}>
                    {spent.toLocaleString('fr-MA')} / {goal.monthly_limit.toLocaleString('fr-MA')} MAD
                  </span>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className={cn(
                  "h-2.5",
                  isOver ? "[&>div]:bg-rose-500" : isWarning ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
                )}
              />
              {isOver && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Dépassement de {(spent - goal.monthly_limit).toLocaleString('fr-MA')} MAD
                </p>
              )}
              {isWarning && !isOver && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Attention: {percentage.toFixed(0)}% du budget utilisé
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}