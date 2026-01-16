import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, Plus, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

import SummaryCard from '@/components/dashboard/SummaryCard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import MonthlyTrend from '@/components/dashboard/MonthlyTrend';
import ExpenseForm from '@/components/forms/ExpenseForm';
import IncomeForm from '@/components/forms/IncomeForm';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date')
  });

  const { data: incomes = [], isLoading: loadingIncomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => base44.entities.Income.list('-date')
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.BudgetGoal.list()
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });

  const createIncome = useMutation({
    mutationFn: (data) => base44.entities.Income.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incomes'] })
  });

  // Current month calculations
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const currentMonthExpenses = expenses.filter(e => 
    isWithinInterval(new Date(e.date), { start: currentMonthStart, end: currentMonthEnd })
  );
  const currentMonthIncomes = incomes.filter(i => 
    isWithinInterval(new Date(i.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const currentMonthGoals = goals.filter(g => 
    g.month === format(new Date(), 'yyyy-MM')
  );

  const isLoading = loadingExpenses || loadingIncomes;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto" />
          <p className="text-slate-600">Chargement de votre budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Tableau de bord
            </h1>
            <p className="text-slate-500 mt-1">
              {format(new Date(), 'MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIncomeFormOpen(true)}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Revenu
            </Button>
            <Button 
              onClick={() => setExpenseFormOpen(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dépense
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Revenus du mois"
            amount={totalIncomes}
            icon={TrendingUp}
            variant="income"
          />
          <SummaryCard
            title="Dépenses du mois"
            amount={totalExpenses}
            icon={TrendingDown}
            variant="expense"
          />
          <SummaryCard
            title="Solde disponible"
            amount={balance}
            icon={Wallet}
            variant="balance"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SpendingChart expenses={currentMonthExpenses} />
          <BudgetProgress goals={currentMonthGoals} expenses={currentMonthExpenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrend expenses={expenses} incomes={incomes} />
          <RecentTransactions expenses={expenses} incomes={incomes} />
        </div>

        {/* Ethical Tip */}
        <div className="mt-8 p-6 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">💡 Conseil du jour</h3>
              <p className="text-white/90">
                La règle 50/30/20 est un bon point de départ : 50% pour les besoins, 
                30% pour les envies, et 20% pour l'épargne. Ajustez selon votre situation familiale.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms */}
      <ExpenseForm 
        open={expenseFormOpen} 
        onOpenChange={setExpenseFormOpen}
        onSubmit={createExpense.mutateAsync}
      />
      <IncomeForm 
        open={incomeFormOpen} 
        onOpenChange={setIncomeFormOpen}
        onSubmit={createIncome.mutateAsync}
      />
    </div>
  );
}