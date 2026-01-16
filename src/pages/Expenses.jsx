import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Search, Filter, Trash2, Pencil, Loader2, 
  ArrowUpRight, Calendar
} from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import ExpenseForm from '@/components/forms/ExpenseForm';

const CATEGORIES = {
  food: { label: 'Alimentation', icon: '🍽️', color: 'bg-emerald-100 text-emerald-700' },
  rent: { label: 'Loyer', icon: '🏠', color: 'bg-indigo-100 text-indigo-700' },
  transport: { label: 'Transport', icon: '🚗', color: 'bg-amber-100 text-amber-700' },
  education: { label: 'Éducation', icon: '📚', color: 'bg-violet-100 text-violet-700' },
  health: { label: 'Santé', icon: '💊', color: 'bg-red-100 text-red-700' },
  leisure: { label: 'Loisirs', icon: '🎮', color: 'bg-pink-100 text-pink-700' },
  utilities: { label: 'Services', icon: '💡', color: 'bg-cyan-100 text-cyan-700' },
  clothing: { label: 'Vêtements', icon: '👕', color: 'bg-orange-100 text-orange-700' },
  savings: { label: 'Épargne', icon: '💰', color: 'bg-green-100 text-green-700' },
  other: { label: 'Autres', icon: '📦', color: 'bg-slate-100 text-slate-700' }
};

export default function Expenses() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date')
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setEditingExpense(null);
    }
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDeleteConfirmId(null);
    }
  });

  const handleSubmit = async (data) => {
    if (editingExpense) {
      await updateExpense.mutateAsync({ id: editingExpense.id, data });
    } else {
      await createExpense.mutateAsync(data);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50">
        <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mes dépenses</h1>
            <p className="text-slate-500 mt-1">Gérez et suivez vos dépenses</p>
          </div>
          <Button 
            onClick={() => { setEditingExpense(null); setFormOpen(true); }}
            className="bg-rose-600 hover:bg-rose-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle dépense
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-2 border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher une dépense..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 border-slate-200">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mb-6 p-4 bg-rose-100 rounded-xl flex items-center justify-between">
          <span className="text-rose-700 font-medium">
            {filteredExpenses.length} dépense{filteredExpenses.length > 1 ? 's' : ''} 
            {categoryFilter !== 'all' && ` en ${CATEGORIES[categoryFilter]?.label.toLowerCase()}`}
          </span>
          <span className="text-rose-800 font-bold text-lg">
            {totalFiltered.toLocaleString('fr-MA')} MAD
          </span>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="py-12 text-center">
              <ArrowUpRight className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">Aucune dépense trouvée</p>
              <p className="text-sm text-slate-400">
                Commencez par ajouter votre première dépense
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const cat = CATEGORIES[expense.category] || CATEGORIES.other;
              return (
                <Card 
                  key={expense.id} 
                  className="border-2 border-slate-200 hover:border-slate-300 transition-all hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{cat.icon}</div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{expense.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cat.color}>{cat.label}</Badge>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(expense.date), 'd MMM yyyy', { locale: fr })}
                            </span>
                            {expense.is_recurring && (
                              <Badge variant="outline" className="text-xs">Récurrent</Badge>
                            )}
                          </div>
                          {expense.notes && (
                            <p className="text-sm text-slate-500 mt-1">{expense.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-rose-600">
                          -{expense.amount.toLocaleString('fr-MA')} MAD
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setEditingExpense(expense); setFormOpen(true); }}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteConfirmId(expense.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form */}
      <ExpenseForm 
        open={formOpen} 
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingExpense(null); }}
        onSubmit={handleSubmit}
        expense={editingExpense}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La dépense sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteExpense.mutate(deleteConfirmId)}
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