import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { createPageUrl } from '../utils';

/**
 * FeatureGate Component
 * Restricts access to premium features based on user's subscription plan
 * 
 * Usage:
 * <FeatureGate feature="premium">
 *   <PremiumContent />
 * </FeatureGate>
 */
export default function FeatureGate({ feature = 'premium', children, fallback = null }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-100 rounded-lg p-6 h-32"></div>
    );
  }

  // Check if user has access to the feature
  const hasAccess = () => {
    if (!user) return false;
    
    // Free features are accessible to everyone
    if (feature === 'free') return true;
    
    // Premium features require premium plan
    if (feature === 'premium') {
      return user.subscription_plan === 'premium';
    }
    
    return false;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Fonctionnalité Premium
              <Sparkles className="w-5 h-5 text-teal-600" />
            </CardTitle>
            <CardDescription>
              Passez au plan Premium pour débloquer cette fonctionnalité
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              ✓ Synchronisation bancaire automatique
            </li>
            <li className="flex items-center gap-2">
              ✓ Analyse IA de vos dépenses
            </li>
            <li className="flex items-center gap-2">
              ✓ Alertes avancées et insights
            </li>
            <li className="flex items-center gap-2">
              ✓ Support prioritaire
            </li>
          </ul>
          
          <Button
            onClick={() => window.location.href = createPageUrl('PlanSelection')}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
          >
            Passer au Premium - 29 DH/mois
          </Button>
          
          <p className="text-xs text-center text-slate-500">
            Sans engagement • Résiliable à tout moment
          </p>
        </div>
      </CardContent>
    </Card>
  );
}