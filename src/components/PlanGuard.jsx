import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function PlanGuard({ children, requiredPlan = 'premium', user }) {
  const hasPremium = user?.subscription_plan === 'premium';

  if (requiredPlan === 'premium' && !hasPremium) {
    return (
      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            <CardTitle>Fonctionnalité Premium</CardTitle>
          </div>
          <CardDescription>
            Cette fonctionnalité est réservée aux utilisateurs Premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-2">Passez à Premium pour accéder à :</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Synchronisation bancaire automatique</li>
                  <li>• Analyse IA des dépenses</li>
                  <li>• Alertes avancées et insights</li>
                  <li>• Export avancé (PDF & Excel)</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = createPageUrl('SelectPlan')}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
            >
              Passer à Premium - 29 DH/mois
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return children;
}