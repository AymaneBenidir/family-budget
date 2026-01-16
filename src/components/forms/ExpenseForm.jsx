import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: 'food', label: 'Alimentation', icon: '🍽️' },
  { value: 'rent', label: 'Loyer', icon: '🏠' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'education', label: 'Éducation', icon: '📚' },
  { value: 'health', label: 'Santé', icon: '💊' },
  { value: 'leisure', label: 'Loisirs', icon: '🎮' },
  { value: 'utilities', label: 'Services', icon: '💡' },
  { value: 'clothing', label: 'Vêtements', icon: '👕' },
  { value: 'savings', label: 'Épargne', icon: '💰' },
  { value: 'other', label: 'Autres', icon: '📦' }
];

export default function ExpenseForm({ open, onOpenChange, onSubmit, expense = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || 'other',
    date: expense?.date || format(new Date(), 'yyyy-MM-dd'),
    notes: expense?.notes || '',
    is_recurring: expense?.is_recurring || false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setLoading(false);
    onOpenChange(false);
    setFormData({
      title: '',
      amount: '',
      category: 'other',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      is_recurring: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700">Description</Label>
            <Input
              id="title"
              placeholder="Ex: Courses au supermarché"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-700">Montant (MAD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-700">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">Catégorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Détails supplémentaires..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500 resize-none"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-700">Dépense récurrente</p>
              <p className="text-xs text-slate-500">Cette dépense se répète chaque mois</p>
            </div>
            <Switch
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-slate-200"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {expense ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}