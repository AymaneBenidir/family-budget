import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Check, Sparkles, Loader2 } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function SelectPlan() {
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        if (userData.plan) {
          setSelectedPlan(userData.plan);
        }
      } catch (error) {
        window.location.href = createPageUrl('Landing');
      } finally {
        setInitialLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSelectPlan = async () => {
    setIsLoading(true);
    try {
      await base44.auth.updateMe({
        plan: selectedPlan,
        plan_selected_date: new Date().toISOString()
      });
      window.location.href = createPageUrl('Dashboard');
    } catch (error) {
      console.error('Error updating plan:', error);
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const freePlanFeatures = [
    'Suivi manuel des dépenses',
    'Tableau de bord de base',
    'Analyse mensuelle',
    'Objectifs budgétaires',
    'Alertes de dépassement'
  ];

  const premiumPlanFeatures = [
    'Tout du plan gratuit',
    'Synchronisation bancaire',
    'Analyse IA des dépenses',
    'Prévisions sur 6 mois',
    'Alertes avancées et insights',
    'Export PDF & Excel avancés'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-6 py-2 rounded-full mb-4 shadow-lg">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-lg">FamilyBudget+</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Choisissez votre plan
          </h1>
          <p className="text-slate-600">
            Sélectionnez le plan qui correspond à vos besoins
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <Card
            className={`cursor-pointer transition-all border-2 ${
              selectedPlan === 'free'
                ? 'border-teal-500 shadow-lg scale-105'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setSelectedPlan('free')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gratuit</CardTitle>
                {selectedPlan === 'free' && (
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="pt-2">
                <span className="text-4xl font-bold">0 DH</span>
                <span className="text-slate-500"> / mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card
            className={`cursor-pointer transition-all border-2 relative ${
              selectedPlan === 'premium'
                ? 'border-teal-500 shadow-lg scale-105'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setSelectedPlan('premium')}
          >
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-teal-500 to-emerald-600">
              Recommandé
            </Badge>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Premium
                  <Sparkles className="w-4 h-4 text-teal-600" />
                </CardTitle>
                {selectedPlan === 'premium' && (
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="pt-2">
                <span className="text-4xl font-bold text-teal-600">29 DH</span>
                <span className="text-slate-500"> / mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {premiumPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={handleSelectPlan}
            disabled={isLoading}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-lg px-12 py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              `Continuer avec ${selectedPlan === 'free' ? 'Gratuit' : 'Premium'}`
            )}
          </Button>
          
          <p className="text-sm text-slate-500">
            {selectedPlan === 'premium' ? (
              '💳 Paiement sécurisé • Aucun frais caché • Résiliable à tout moment'
            ) : (
              '✨ Vous pouvez passer à Premium à tout moment'
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}