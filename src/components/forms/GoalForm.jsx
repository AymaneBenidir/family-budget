import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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

export default function GoalForm({ open, onOpenChange, onSubmit, goal = null, existingCategories = [] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: goal?.category || '',
    monthly_limit: goal?.monthly_limit || '',
    alert_threshold: goal?.alert_threshold || 80,
    month: goal?.month || format(new Date(), 'yyyy-MM')
  });

  const availableCategories = goal 
    ? CATEGORIES 
    : CATEGORIES.filter(cat => !existingCategories.includes(cat.value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ...formData,
      monthly_limit: parseFloat(formData.monthly_limit),
      alert_threshold: formData.alert_threshold
    });
    setLoading(false);
    onOpenChange(false);
    setFormData({
      category: '',
      monthly_limit: '',
      alert_threshold: 80,
      month: format(new Date(), 'yyyy-MM')
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {goal ? 'Modifier l\'objectif' : 'Nouvel objectif budgétaire'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-slate-700">Catégorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={!!goal}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
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
            <Label htmlFor="monthly_limit" className="text-slate-700">Limite mensuelle (MAD)</Label>
            <Input
              id="monthly_limit"
              type="number"
              step="0.01"
              placeholder="Ex: 2000"
              value={formData.monthly_limit}
              onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
              required
              className="border-slate-200 focus:border-amber-500 focus:ring-amber-500"
            />
            <p className="text-xs text-slate-500">
              Le montant maximum que vous souhaitez dépenser dans cette catégorie
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-700">Seuil d'alerte</Label>
              <span className="text-sm font-medium text-amber-600">{formData.alert_threshold}%</span>
            </div>
            <Slider
              value={[formData.alert_threshold]}
              onValueChange={(value) => setFormData({ ...formData, alert_threshold: value[0] })}
              min={50}
              max={95}
              step={5}
              className="[&>span]:bg-amber-500"
            />
            <p className="text-xs text-slate-500">
              Vous serez alerté lorsque vous atteindrez ce pourcentage de votre limite
            </p>
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
              disabled={loading || !formData.category}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {goal ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}