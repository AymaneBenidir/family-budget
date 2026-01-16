import React from 'react';
import FeatureGate from './FeatureGate';

/**
 * Simple wrapper for premium-only features
 * 
 * Usage:
 * <PremiumFeature>
 *   <BankSyncComponent />
 * </PremiumFeature>
 */
export default function PremiumFeature({ children, fallback }) {
  return (
    <FeatureGate feature="premium" fallback={fallback}>
      {children}
    </FeatureGate>
  );
}