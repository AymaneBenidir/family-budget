import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Loader2, Target, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import GoalForm from '@/components/forms/GoalForm';

const CATEGORIES = {
  food: { label: 'Alimentation', icon: '🍽️', color: 'emerald' },
  rent: { label: 'Loyer', icon: '🏠', color: 'indigo' },
  transport: { label: 'Transport', icon: '🚗', color: 'amber' },
  education: { label: 'Éducation', icon: '📚', color: 'violet' },
  health: { label: 'Santé', icon: '💊', color: 'red' },
  leisure: { label: 'Loisirs', icon: '🎮', color: 'pink' },
  utilities: { label: 'Services', icon: '💡', color: 'cyan' },
  clothing: { label: 'Vêtements', icon: '👕', color: 'orange' },
  savings: { label: 'Épargne', icon: '💰', color: 'green' },
  other: { label: 'Autres', icon: '📦', color: 'slate' }
};

export default function Goals() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const currentMonth = format(new Date(), 'yyyy-MM');

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.BudgetGoal.list()
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list()
  });

  const currentMonthGoals = goals.filter(g => g.month === currentMonth);
  const existingCategories = currentMonthGoals.map(g => g.category);

  // Calculate expenses for current month by category
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  
  const categoryExpenses = expenses
    .filter(e => isWithinInterval(new Date(e.date), { start: currentMonthStart, end: currentMonthEnd }))
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const createGoal = useMutation({
    mutationFn: (data) => base44.entities.BudgetGoal.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const updateGoal = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BudgetGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setEditingGoal(null);
    }
  });

  const deleteGoal = useMutation({
    mutationFn: (id) => base44.entities.BudgetGoal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setDeleteConfirmId(null);
    }
  });

  const handleSubmit = async (data) => {
    if (editingGoal) {
      await updateGoal.mutateAsync({ id: editingGoal.id, data });
    } else {
      await createGoal.mutateAsync(data);
    }
  };

  if (loadingGoals) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Objectifs budgétaires</h1>
            <p className="text-slate-500 mt-1">
              {format(new Date(), 'MMMM yyyy', { locale: fr })} - Définissez vos limites de dépenses
            </p>
          </div>
          <Button 
            onClick={() => { setEditingGoal(null); setFormOpen(true); }}
            className="bg-amber-600 hover:bg-amber-700"
            disabled={existingCategories.length >= Object.keys(CATEGORIES).length}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel objectif
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Comment ça marche ?</p>
                <p className="text-sm text-amber-700 mt-1">
                  Définissez une limite de dépenses pour chaque catégorie. 
                  Vous recevrez une alerte lorsque vous approcherez de cette limite, 
                  vous aidant ainsi à mieux contrôler vos finances.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals List */}
        {currentMonthGoals.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">Aucun objectif défini pour ce mois</p>
              <p className="text-sm text-slate-400 mb-4">
                Créez des objectifs pour mieux gérer vos dépenses
              </p>
              <Button 
                onClick={() => setFormOpen(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier objectif
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {currentMonthGoals.map((goal) => {
              const cat = CATEGORIES[goal.category] || CATEGORIES.other;
              const spent = categoryExpenses[goal.category] || 0;
              const percentage = Math.min((spent / goal.monthly_limit) * 100, 100);
              const remaining = goal.monthly_limit - spent;
              const isWarning = percentage >= (goal.alert_threshold || 80);
              const isOver = percentage >= 100;

              return (
                <Card 
                  key={goal.id} 
                  className={cn(
                    "border-2 transition-all hover:shadow-md",
                    isOver ? "border-rose-200 bg-rose-50/50" : 
                    isWarning ? "border-amber-200 bg-amber-50/50" : 
                    "border-slate-200"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{cat.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-800">{cat.label}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {isOver ? (
                              <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                                <XCircle className="w-3 h-3 mr-1" />
                                Dépassé
                              </Badge>
                            ) : isWarning ? (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Attention
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                En bonne voie
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setEditingGoal(goal); setFormOpen(true); }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteConfirmId(goal.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Dépensé ce mois</span>
                        <span className={cn(
                          "font-semibold",
                          isOver ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-700"
                        )}>
                          {spent.toLocaleString('fr-MA')} MAD
                        </span>
                      </div>
                      
                      <Progress 
                        value={percentage} 
                        className={cn(
                          "h-3",
                          isOver ? "[&>div]:bg-rose-500" : 
                          isWarning ? "[&>div]:bg-amber-500" : 
                          "[&>div]:bg-emerald-500"
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Limite: {goal.monthly_limit.toLocaleString('fr-MA')} MAD
                        </span>
                        <span className={cn(
                          "text-sm font-medium",
                          remaining >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {remaining >= 0 
                            ? `${remaining.toLocaleString('fr-MA')} MAD restant`
                            : `${Math.abs(remaining).toLocaleString('fr-MA')} MAD de dépassement`
                          }
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400">
                          Alerte configurée à {goal.alert_threshold || 80}% de la limite
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">💡 Astuce finance responsable</h3>
              <p className="text-white/90">
                Commencez par définir des objectifs pour vos catégories de dépenses les plus importantes. 
                Révisez-les chaque mois pour les adapter à vos besoins réels.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <GoalForm 
        open={formOpen} 
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingGoal(null); }}
        onSubmit={handleSubmit}
        goal={editingGoal}
        existingCategories={editingGoal ? [] : existingCategories}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet objectif ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'objectif sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteGoal.mutate(deleteConfirmId)}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}