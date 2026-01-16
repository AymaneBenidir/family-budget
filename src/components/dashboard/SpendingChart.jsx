import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

export default function SpendingChart({ expenses }) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'other';
    acc[cat] = (acc[cat] || 0) + expense.amount;
    return acc;
  }, {});

  const data = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: amount,
      color: CATEGORY_COLORS[category] || '#94a3b8'
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">
            Répartition des dépenses
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-slate-400">
          Aucune dépense enregistrée
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-700">
          Répartition des dépenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
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
            <Legend 
              formatter={(value, entry) => (
                <span className="text-sm text-slate-600">
                  {value} ({((entry.payload.value / total) * 100).toFixed(0)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}