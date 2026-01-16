import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
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

export default function RecentTransactions({ expenses, incomes }) {
  const transactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...incomes.map(i => ({ ...i, type: 'income' }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  if (transactions.length === 0) {
    return (
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">
            Transactions récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-slate-400">
          Aucune transaction enregistrée
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-700">
          Transactions récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                transaction.type === 'income' 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-rose-100 text-rose-600"
              )}>
                {transaction.type === 'income' 
                  ? <ArrowDownLeft className="w-4 h-4" />
                  : <ArrowUpRight className="w-4 h-4" />
                }
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">{transaction.title}</p>
                <p className="text-xs text-slate-400">
                  {transaction.type === 'expense' 
                    ? CATEGORY_LABELS[transaction.category] 
                    : 'Revenu'
                  } • {format(new Date(transaction.date), 'd MMM', { locale: fr })}
                </p>
              </div>
            </div>
            <p className={cn(
              "font-semibold",
              transaction.type === 'income' ? "text-emerald-600" : "text-rose-600"
            )}>
              {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('fr-MA')} MAD
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}