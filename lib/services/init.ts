import { contextStorage } from './storage';
import type { Context } from '@/types';

const defaultContexts: Context[] = [
  { id: 'ctx-home', name: '@家', icon: 'home' },
  { id: 'ctx-office', name: '@办公室', icon: 'briefcase' },
  { id: 'ctx-computer', name: '@电脑', icon: 'laptop' },
  { id: 'ctx-phone', name: '@电话', icon: 'phone' },
  { id: 'ctx-errands', name: '@外出', icon: 'map-pin' },
  { id: 'ctx-waiting', name: '@等待', icon: 'clock' },
];

export async function initializeDefaultContexts() {
  const existingContexts = await contextStorage.getAll();
  
  if (existingContexts.length === 0) {
    // Initialize with default contexts
    for (const context of defaultContexts) {
      await contextStorage.add(context);
    }
  }
}

