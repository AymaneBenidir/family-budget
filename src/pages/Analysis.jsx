import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, TrendingUp, TrendingDown, Target, Wallet, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = {
  food: '#10b981',
  rent: '#6366f1',
  transport: '#f59e0b',
  education: '#8b5cf6',
  health: '#ef4444',
  leisure: '#ec4899',
  utilities: '#06b6d4',
  clothing: '#f97316',
  savings: '#22c55e',
  other: '#94a3b8'
};

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

export default function Analysis() {
  const [period, setPeriod] = useState('6');

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date')
  });

  const { data: incomes = [], isLoading: loadingIncomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => base44.entities.Income.list('-date')
  });

  const isLoading = loadingExpenses || loadingIncomes;

  // Calculate monthly data for the selected period
  const getMonthlyData = () => {
    const months = [];
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthExpenses = expenses
        .filter(e => isWithinInterval(new Date(e.date), { start, end }))
        .reduce((sum, e) => sum + e.amount, 0);

      const monthIncomes = incomes
        .filter(i => isWithinInterval(new Date(i.date), { start, end }))
        .reduce((sum, i) => sum + i.amount, 0);

      months.push({
        name: format(monthDate, 'MMM yy', { locale: fr }),
        fullName: format(monthDate, 'MMMM yyyy', { locale: fr }),
        depenses: monthExpenses,
        revenus: monthIncomes,
        solde: monthIncomes - monthExpenses
      });
    }
    return months;
  };

  // Category breakdown for pie chart
  const getCategoryData = () => {
    const periodStart = startOfMonth(subMonths(new Date(), parseInt(period) - 1));
    const periodEnd = endOfMonth(new Date());

    const categoryTotals = expenses
      .filter(e => isWithinInterval(new Date(e.date), { start: periodStart, end: periodEnd }))
      .reduce((acc, expense) => {
        const cat = expense.category || 'other';
        acc[cat] = (acc[cat] || 0) + expense.amount;
        return acc;
      }, {});

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category] || category,
        value: amount,
        color: CATEGORY_COLORS[category] || '#94a3b8'
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    const periodStart = startOfMonth(subMonths(new Date(), parseInt(period) - 1));
    const periodEnd = endOfMonth(new Date());

    const periodExpenses = expenses
      .filter(e => isWithinInterval(new Date(e.date), { start: periodStart, end: periodEnd }));
    const periodIncomes = incomes
      .filter(i => isWithinInterval(new Date(i.date), { start: periodStart, end: periodEnd }));

    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncomes = periodIncomes.reduce((sum, i) => sum + i.amount, 0);
    const avgMonthlyExpense = totalExpenses / parseInt(period);
    const savingsRate = totalIncomes > 0 ? ((totalIncomes - totalExpenses) / totalIncomes * 100) : 0;

    return { totalExpenses, totalIncomes, avgMonthlyExpense, savingsRate };
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const stats = getSummaryStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Analyse financière</h1>
            <p className="text-slate-500 mt-1">Comprenez vos habitudes de dépenses</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 derniers mois</SelectItem>
                <SelectItem value="6">6 derniers mois</SelectItem>
                <SelectItem value="12">12 derniers mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Total revenus</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {stats.totalIncomes.toLocaleString('fr-MA')} <span className="text-sm font-normal">MAD</span>
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600 font-medium">Total dépenses</p>
                  <p className="text-2xl font-bold text-rose-700">
                    {stats.totalExpenses.toLocaleString('fr-MA')} <span className="text-sm font-normal">MAD</span>
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-rose-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Moyenne mensuelle</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {Math.round(stats.avgMonthlyExpense).toLocaleString('fr-MA')} <span className="text-sm font-normal">MAD</span>
                  </p>
                </div>
                <Target className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2",
            stats.savingsRate >= 0 
              ? "border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50" 
              : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    stats.savingsRate >= 0 ? "text-teal-600" : "text-amber-600"
                  )}>
                    Taux d'épargne
                  </p>
                  <p className={cn(
                    "text-2xl font-bold",
                    stats.savingsRate >= 0 ? "text-teal-700" : "text-amber-700"
                  )}>
                    {stats.savingsRate.toFixed(1)} <span className="text-sm font-normal">%</span>
                  </p>
                </div>
                <Wallet className={cn(
                  "w-8 h-8",
                  stats.savingsRate >= 0 ? "text-teal-400" : "text-amber-400"
                )} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Comparison */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">
                Évolution mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} barGap={4}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString('fr-MA')} MAD`, '']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenus" name="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="depenses" name="Dépenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">
                Répartition par catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString('fr-MA')} MAD`, '']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Balance Trend */}
        <Card className="border-2 border-slate-200 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">
              Évolution du solde mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString('fr-MA')} MAD`, 'Solde']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="solde" 
                  stroke="#0d9488" 
                  strokeWidth={3}
                  dot={{ fill: '#0d9488', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">
              Détail par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                {categoryData.map((cat, index) => {
                  const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                  const percentage = (cat.value / total * 100).toFixed(1);
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">{cat.name}</span>
                          <span className="text-slate-600">{cat.value.toLocaleString('fr-MA')} MAD</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: cat.color
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 w-12 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                Aucune dépense enregistrée pour cette période
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}