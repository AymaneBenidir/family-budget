import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await base44.auth.isAuthenticated();
      
      if (isAuthenticated) {
        // Check if user has completed onboarding
        try {
          const user = await base44.auth.me();
          
          if (!user.onboarding_completed || !user.subscription_plan) {
            // Redirect to plan selection if onboarding not completed
            window.location.href = createPageUrl('PlanSelection');
          } else {
            // User is authenticated and has selected a plan
            window.location.href = createPageUrl('Dashboard');
          }
        } catch (error) {
          console.error('Error checking user:', error);
          window.location.href = createPageUrl('Landing');
        }
      } else {
        // Not authenticated - show landing page
        window.location.href = createPageUrl('Landing');
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Chargement...</p>
      </div>
    </div>
  );
}