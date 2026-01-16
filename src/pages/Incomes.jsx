import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Pencil, Loader2, ArrowDownLeft, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import IncomeForm from '@/components/forms/IncomeForm';

export default function Incomes() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => base44.entities.Income.list('-date')
  });

  const createIncome = useMutation({
    mutationFn: (data) => base44.entities.Income.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incomes'] })
  });

  const updateIncome = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Income.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setEditingIncome(null);
    }
  });

  const deleteIncome = useMutation({
    mutationFn: (id) => base44.entities.Income.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setDeleteConfirmId(null);
    }
  });

  const handleSubmit = async (data) => {
    if (editingIncome) {
      await updateIncome.mutateAsync({ id: editingIncome.id, data });
    } else {
      await createIncome.mutateAsync(data);
    }
  };

  const filteredIncomes = incomes.filter(income => 
    income.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFiltered = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mes revenus</h1>
            <p className="text-slate-500 mt-1">Suivez vos sources de revenus</p>
          </div>
          <Button 
            onClick={() => { setEditingIncome(null); setFormOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau revenu
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6 border-2 border-slate-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un revenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mb-6 p-4 bg-emerald-100 rounded-xl flex items-center justify-between">
          <span className="text-emerald-700 font-medium">
            {filteredIncomes.length} revenu{filteredIncomes.length > 1 ? 's' : ''}
          </span>
          <span className="text-emerald-800 font-bold text-lg">
            {totalFiltered.toLocaleString('fr-MA')} MAD
          </span>
        </div>

        {/* Incomes List */}
        {filteredIncomes.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="py-12 text-center">
              <ArrowDownLeft className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">Aucun revenu trouvé</p>
              <p className="text-sm text-slate-400">
                Ajoutez vos revenus pour un meilleur suivi
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredIncomes.map((income) => (
              <Card 
                key={income.id} 
                className="border-2 border-slate-200 hover:border-emerald-200 transition-all hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{income.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(income.date), 'd MMM yyyy', { locale: fr })}
                          </span>
                          {income.is_recurring && (
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-600">
                              Récurrent
                            </Badge>
                          )}
                        </div>
                        {income.notes && (
                          <p className="text-sm text-slate-500 mt-1">{income.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-emerald-600">
                        +{income.amount.toLocaleString('fr-MA')} MAD
                      </span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setEditingIncome(income); setFormOpen(true); }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteConfirmId(income.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <IncomeForm 
        open={formOpen} 
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingIncome(null); }}
        onSubmit={handleSubmit}
        income={editingIncome}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce revenu ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le revenu sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteIncome.mutate(deleteConfirmId)}
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

export default function Incomes() {
  return (
    <AuthGuard requirePlan={true}>
      <IncomesContent />
    </AuthGuard>
  );
}