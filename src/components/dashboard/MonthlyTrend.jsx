import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MonthlyTrend({ expenses, incomes }) {
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
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
        name: format(monthDate, 'MMM', { locale: fr }),
        depenses: monthExpenses,
        revenus: monthIncomes
      });
    }
    return months;
  };

  const data = getMonthlyData();
  const hasData = data.some(m => m.depenses > 0 || m.revenus > 0);

  if (!hasData) {
    return (
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">
            Évolution mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-slate-400">
          Pas assez de données pour afficher la tendance
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-700">
          Évolution mensuelle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={8}>
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
            <Bar 
              dataKey="revenus" 
              name="Revenus" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]}
            />
            <Bar 
              dataKey="depenses" 
              name="Dépenses" 
              fill="#f43f5e" 
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}