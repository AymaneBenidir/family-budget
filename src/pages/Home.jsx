import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Loader2 } from 'lucide-react';

/**
 * Home - Entry point router
 * Enforces the strict user flow:
 * 1. Not authenticated → Landing
 * 2. Authenticated + No plan → PlanSelection
 * 3. Authenticated + Has plan → Dashboard
 */
export default function Home() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const routeUser = async () => {
      try {
        // Check if user is authenticated
        const isAuth = await base44.auth.isAuthenticated();
        
        if (!isAuth) {
          // Not authenticated → Landing page
          window.location.href = createPageUrl('Landing');
          return;
        }

        // User is authenticated, check if they have a plan
        const user = await base44.auth.me();
        
        if (!user.subscription_plan) {
          // No plan selected → Plan Selection
          window.location.href = createPageUrl('PlanSelection');
          return;
        }

        // Authenticated + has plan → Dashboard
        window.location.href = createPageUrl('Dashboard');
        
      } catch (error) {
        console.error('Routing error:', error);
        // On error, redirect to landing
        window.location.href = createPageUrl('Landing');
      }
    };

    routeUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Chargement...</p>
      </div>
    </div>
  );
}