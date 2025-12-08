// Core GTD data models

export type TaskStatus = 'inbox' | 'next-action' | 'scheduled' | 'someday' | 'completed' | 'reference';

export type Priority = 'low' | 'medium' | 'high';

export type Context = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId?: string;
  contextIds: string[];
  dueDate?: Date | string;
  scheduledDate?: Date | string;
  priority: Priority;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string;
  energyLevel?: 'low' | 'medium' | 'high';
  estimatedTime?: number; // in minutes
  notes?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  tasks: string[]; // Task IDs
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string;
  status: 'active' | 'completed' | 'on-hold';
};

export type AIAdvice = {
  id: string;
  taskId: string;
  advice: string;
  type: 'organization' | 'scheduling' | 'implementation' | 'selection' | 'review';
  timestamp: Date | string;
  confidence?: number;
};

export type Reference = {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'link' | 'file';
  url?: string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

