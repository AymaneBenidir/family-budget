import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Loader2 } from 'lucide-react';

/**
 * AuthGuard - Protects pages that require authentication + plan selection
 * Redirects to appropriate page if requirements not met
 */
export default function AuthGuard({ children, requirePlan = true }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check authentication
        const isAuth = await base44.auth.isAuthenticated();
        
        if (!isAuth) {
          // Not authenticated → redirect to landing
          window.location.href = createPageUrl('Landing');
          return;
        }

        // If plan is required, check for plan selection
        if (requirePlan) {
          const user = await base44.auth.me();
          
          if (!user.subscription_plan) {
            // No plan selected → redirect to plan selection
            window.location.href = createPageUrl('PlanSelection');
            return;
          }
        }

        // All checks passed
        setIsAuthorized(true);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = createPageUrl('Landing');
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [requirePlan]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Vérification...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : null;
}