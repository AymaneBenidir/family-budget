import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Check, Sparkles, Wallet } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function PlanSelection() {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Pre-select current plan if user already has one
        if (currentUser.subscription_plan) {
          setSelectedPlan(currentUser.subscription_plan);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Redirect to login if not authenticated
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };

    fetchUser();
  }, []);

  const handlePlanSelection = async () => {
    setIsLoading(true);

    try {
      // Update user's plan
      await base44.auth.updateMe({
        subscription_plan: selectedPlan,
        plan_selected_date: new Date().toISOString(),
        onboarding_completed: true
      });

      // Redirect to dashboard
      window.location.href = createPageUrl('Dashboard');
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Erreur lors de la sélection du plan. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const freePlanFeatures = [
    'Suivi manuel des dépenses',
    'Tableau de bord de base',
    'Analyse mensuelle',
    'Export PDF et Excel',
    'Objectifs budgétaires'
  ];

  const premiumPlanFeatures = [
    'Tout du plan gratuit',
    'Synchronisation bancaire',
    'Analyse IA des dépenses',
    'Alertes avancées',
    'Support prioritaire',
    'Rapports détaillés'
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

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

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <Card
            className={`cursor-pointer transition-all border-2 ${
              selectedPlan === 'free'
                ? 'border-teal-500 shadow-xl scale-105'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan('free')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plan Gratuit</CardTitle>
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
              <CardDescription className="pt-2">
                Parfait pour débuter la gestion de votre budget familial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0" />
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
                ? 'border-teal-500 shadow-xl scale-105'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan('premium')}
          >
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-teal-500 to-emerald-600">
              Recommandé
            </Badge>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Plan Premium
                  <Sparkles className="w-5 h-5 text-teal-600" />
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
              <CardDescription className="pt-2">
                Pour une gestion complète et automatisée de vos finances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {premiumPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={handlePlanSelection}
            disabled={isLoading}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-lg px-12 py-6 rounded-xl shadow-xl"
          >
            {isLoading ? 'Confirmation...' : 
             selectedPlan === 'premium' ? 'Continuer vers le paiement' : 'Commencer gratuitement'}
          </Button>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-w-2xl mx-auto">
            <p className="text-sm text-slate-600 text-center">
              💳 {selectedPlan === 'premium' 
                ? 'Paiement sécurisé • Aucun frais caché • Résiliable à tout moment' 
                : 'Aucune carte bancaire requise • Passez à Premium quand vous voulez'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}