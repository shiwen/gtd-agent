'use client';

import { useEffect } from 'react';
import { initializeDefaultContexts } from '@/lib/services/init';

export function DataInitializer() {
  useEffect(() => {
    // Initialize default contexts on app load
    initializeDefaultContexts().catch(console.error);
  }, []);

  return null;
}

