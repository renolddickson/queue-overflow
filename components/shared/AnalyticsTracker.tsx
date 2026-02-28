'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/actions/analytics';

interface AnalyticsTrackerProps {
  documentId: string;
  eventType?: 'view' | 'share' | 'upvote';
}

export function AnalyticsTracker({ documentId, eventType = 'view' }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Small delay to ensure it's a real view and not a quick bounce or prefetch
    const timer = setTimeout(() => {
      trackEvent(documentId, eventType, {
        path: window.location.pathname,
        referrer: document.referrer
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [documentId, eventType]);

  return null; // This component doesn't render anything
}
