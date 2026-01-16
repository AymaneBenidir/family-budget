import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Loader2 } from "lucide-react";

export default function IncomeForm({ open, onOpenChange, onSubmit, income = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: income?.title || '',
    amount: income?.amount || '',
    date: income?.date || format(new Date(), 'yyyy-MM-dd'),
    notes: income?.notes || '',
    is_recurring: income?.is_recurring || false
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
            {income ? 'Modifier le revenu' : 'Nouveau revenu'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700">Source du revenu</Label>
            <Input
              id="title"
              placeholder="Ex: Salaire, Freelance, etc."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
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
                className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
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
                className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Détails supplémentaires..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-700">Revenu récurrent</p>
              <p className="text-xs text-slate-500">Ce revenu se répète chaque mois</p>
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
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {income ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}