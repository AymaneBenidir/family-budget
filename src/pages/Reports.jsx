import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Download, Table, BarChart3, Loader2, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  Calendar, Lightbulb, Target
} from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [monthlyReport, setMonthlyReport] = useState(null);
  const [spendingAnalysis, setSpendingAnalysis] = useState(null);

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const response = await base44.functions.invoke('exportToPDF', { month: selectedMonth });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = async (type = 'all') => {
    try {
      setExportingExcel(true);
      const response = await base44.functions.invoke('exportToExcel', { 
        month: selectedMonth,
        type 
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-${selectedMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Erreur lors de l\'export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      setLoadingReport(true);
      const response = await base44.functions.invoke('getMonthlyReport', { 
        month: selectedMonth 
      });
      setMonthlyReport(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Erreur lors du chargement du rapport');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadSpendingAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const response = await base44.functions.invoke('analyzeSpending', { 
        period: 6 
      });
      setSpendingAnalysis(response.data);
    } catch (error) {
      console.error('Error loading analysis:', error);
      alert('Erreur lors de l\'analyse');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Rapports & Exports</h1>
          <p className="text-slate-500 mt-1">
            Générez des rapports détaillés et exportez vos données
          </p>
        </div>

        {/* Month Selector */}
        <Card className="mb-6 border-2 border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="month" className="text-slate-700">
                  Sélectionnez le mois
                </Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-2 border-slate-200"
                  max={format(new Date(), 'yyyy-MM')}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {exportingPDF ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Export PDF
                </Button>
                <Button
                  onClick={() => handleExportExcel('all')}
                  disabled={exportingExcel}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {exportingExcel ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Table className="w-4 h-4 mr-2" />
                  )}
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Report */}
          <Card className="border-2 border-indigo-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <BarChart3 className="w-5 h-5" />
                Rapport mensuel détaillé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Obtenez une analyse complète de votre budget pour le mois sélectionné avec 
                comparaisons, insights et recommandations personnalisées.
              </p>
              <Button 
                onClick={loadMonthlyReport}
                disabled={loadingReport}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {loadingReport ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Générer le rapport
              </Button>
            </CardContent>
          </Card>

          {/* Spending Analysis */}
          <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <TrendingUp className="w-5 h-5" />
                Analyse avancée (6 mois)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Analyse approfondie de vos habitudes de dépenses sur 6 mois avec score de 
                santé financière, tendances et prédictions.
              </p>
              <Button 
                onClick={loadSpendingAnalysis}
                disabled={loadingAnalysis}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loadingAnalysis ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-2" />
                )}
                Analyser
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Report Results */}
        {monthlyReport && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              Rapport - {format(new Date(selectedMonth), 'MMMM yyyy', { locale: fr })}
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card className="border-2 border-emerald-200 bg-emerald-50">
                <CardContent className="p-4">
                  <p className="text-sm text-emerald-600 font-medium">Revenus</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {monthlyReport.summary.totalIncomes.toLocaleString('fr-MA')} MAD
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-rose-200 bg-rose-50">
                <CardContent className="p-4">
                  <p className="text-sm text-rose-600 font-medium">Dépenses</p>
                  <p className="text-2xl font-bold text-rose-700">
                    {monthlyReport.summary.totalExpenses.toLocaleString('fr-MA')} MAD
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-teal-200 bg-teal-50">
                <CardContent className="p-4">
                  <p className="text-sm text-teal-600 font-medium">Solde</p>
                  <p className="text-2xl font-bold text-teal-700">
                    {monthlyReport.summary.balance.toLocaleString('fr-MA')} MAD
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-indigo-200 bg-indigo-50">
                <CardContent className="p-4">
                  <p className="text-sm text-indigo-600 font-medium">Épargne</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {monthlyReport.summary.savingsRate}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Comparison */}
            {monthlyReport.comparison && (
              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Comparaison avec le mois précédent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      {monthlyReport.comparison.expenseChange > 0 ? (
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-emerald-500" />
                      )}
                      <span className="text-sm text-slate-600">
                        Dépenses: {monthlyReport.comparison.expenseChange > 0 ? '+' : ''}
                        {monthlyReport.comparison.expenseChange}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {monthlyReport.comparison.incomeChange > 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-rose-500" />
                      )}
                      <span className="text-sm text-slate-600">
                        Revenus: {monthlyReport.comparison.incomeChange > 0 ? '+' : ''}
                        {monthlyReport.comparison.incomeChange}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Lightbulb className="w-5 h-5" />
                    Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monthlyReport.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                      {insight.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />}
                      {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />}
                      {insight.type === 'alert' && <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />}
                      {insight.type === 'info' && <BarChart3 className="w-5 h-5 text-indigo-500 mt-0.5" />}
                      <p className="text-sm text-slate-700">{insight.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-teal-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <Target className="w-5 h-5" />
                    Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monthlyReport.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Spending Analysis Results */}
        {spendingAnalysis && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Analyse détaillée - {spendingAnalysis.period.months} derniers mois
            </h2>

            {/* Health Score */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium mb-2">
                      Score de santé financière
                    </p>
                    <p className="text-5xl font-bold text-purple-700">
                      {spendingAnalysis.healthScore.score}
                      <span className="text-2xl text-purple-500">/100</span>
                    </p>
                    <Badge className="mt-3 bg-purple-100 text-purple-700 border-purple-200">
                      {spendingAnalysis.healthScore.rating}
                    </Badge>
                  </div>
                  <div className="text-6xl">
                    {spendingAnalysis.healthScore.score >= 80 ? '🌟' : 
                     spendingAnalysis.healthScore.score >= 60 ? '👍' : 
                     spendingAnalysis.healthScore.score >= 40 ? '⚠️' : '📉'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictions */}
            <Card className="border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <Calendar className="w-5 h-5" />
                  Prévisions pour le mois prochain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-emerald-600 mb-1">Revenus estimés</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {parseFloat(spendingAnalysis.predictions.nextMonthIncomes).toLocaleString('fr-MA')} MAD
                    </p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-xl">
                    <p className="text-xs text-rose-600 mb-1">Dépenses estimées</p>
                    <p className="text-lg font-bold text-rose-700">
                      {parseFloat(spendingAnalysis.predictions.nextMonthExpenses).toLocaleString('fr-MA')} MAD
                    </p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-xl">
                    <p className="text-xs text-teal-600 mb-1">Solde projeté</p>
                    <p className="text-lg font-bold text-teal-700">
                      {parseFloat(spendingAnalysis.predictions.projectedBalance).toLocaleString('fr-MA')} MAD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Insights */}
            {spendingAnalysis.insights.length > 0 && (
              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle>Insights avancés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {spendingAnalysis.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <Badge className={cn(
                        insight.type === 'warning' && "bg-amber-100 text-amber-700",
                        insight.type === 'alert' && "bg-rose-100 text-rose-700",
                        insight.type === 'info' && "bg-indigo-100 text-indigo-700"
                      )}>
                        {insight.category}
                      </Badge>
                      <p className="text-sm text-slate-700 flex-1">{insight.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}