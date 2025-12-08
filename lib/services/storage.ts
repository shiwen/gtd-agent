import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Task, Project, Context, AIAdvice, Reference } from '@/types';

interface GTDDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': string; 'by-project': string; 'by-due-date': string };
  };
  projects: {
    key: string;
    value: Project;
  };
  contexts: {
    key: string;
    value: Context;
  };
  aiAdvice: {
    key: string;
    value: AIAdvice;
    indexes: { 'by-task': string };
  };
  references: {
    key: string;
    value: Reference;
  };
}

let db: IDBPDatabase<GTDDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<GTDDB>> {
  if (db) return db;

  db = await openDB<GTDDB>('gtd-agent', 1, {
    upgrade(database) {
      // Tasks store
      if (!database.objectStoreNames.contains('tasks')) {
        const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-status', 'status');
        taskStore.createIndex('by-project', 'projectId');
        taskStore.createIndex('by-due-date', 'dueDate');
      }

      // Projects store
      if (!database.objectStoreNames.contains('projects')) {
        database.createObjectStore('projects', { keyPath: 'id' });
      }

      // Contexts store
      if (!database.objectStoreNames.contains('contexts')) {
        database.createObjectStore('contexts', { keyPath: 'id' });
      }

      // AI Advice store
      if (!database.objectStoreNames.contains('aiAdvice')) {
        const adviceStore = database.createObjectStore('aiAdvice', { keyPath: 'id' });
        adviceStore.createIndex('by-task', 'taskId');
      }

      // References store
      if (!database.objectStoreNames.contains('references')) {
        database.createObjectStore('references', { keyPath: 'id' });
      }
    },
  });

  return db;
}

// Task operations
export const taskStorage = {
  async getAll(): Promise<Task[]> {
    const database = await getDB();
    return database.getAll('tasks');
  },

  async get(id: string): Promise<Task | undefined> {
    const database = await getDB();
    return database.get('tasks', id);
  },

  async getByStatus(status: Task['status']): Promise<Task[]> {
    const database = await getDB();
    return database.getAllFromIndex('tasks', 'by-status', status);
  },

  async getByProject(projectId: string): Promise<Task[]> {
    const database = await getDB();
    return database.getAllFromIndex('tasks', 'by-project', projectId);
  },

  async add(task: Task): Promise<void> {
    const database = await getDB();
    await database.add('tasks', task);
  },

  async update(task: Task): Promise<void> {
    const database = await getDB();
    await database.put('tasks', task);
  },

  async delete(id: string): Promise<void> {
    const database = await getDB();
    await database.delete('tasks', id);
  },
};

// Project operations
export const projectStorage = {
  async getAll(): Promise<Project[]> {
    const database = await getDB();
    return database.getAll('projects');
  },

  async get(id: string): Promise<Project | undefined> {
    const database = await getDB();
    return database.get('projects', id);
  },

  async add(project: Project): Promise<void> {
    const database = await getDB();
    await database.add('projects', project);
  },

  async update(project: Project): Promise<void> {
    const database = await getDB();
    await database.put('projects', project);
  },

  async delete(id: string): Promise<void> {
    const database = await getDB();
    await database.delete('projects', id);
  },
};

// Context operations
export const contextStorage = {
  async getAll(): Promise<Context[]> {
    const database = await getDB();
    return database.getAll('contexts');
  },

  async get(id: string): Promise<Context | undefined> {
    const database = await getDB();
    return database.get('contexts', id);
  },

  async add(context: Context): Promise<void> {
    const database = await getDB();
    await database.add('contexts', context);
  },

  async update(context: Context): Promise<void> {
    const database = await getDB();
    await database.put('contexts', context);
  },

  async delete(id: string): Promise<void> {
    const database = await getDB();
    await database.delete('contexts', id);
  },
};

// AI Advice operations
export const aiAdviceStorage = {
  async getByTask(taskId: string): Promise<AIAdvice[]> {
    const database = await getDB();
    return database.getAllFromIndex('aiAdvice', 'by-task', taskId);
  },

  async add(advice: AIAdvice): Promise<void> {
    const database = await getDB();
    await database.add('aiAdvice', advice);
  },

  async delete(id: string): Promise<void> {
    const database = await getDB();
    await database.delete('aiAdvice', id);
  },
};

// Reference operations
export const referenceStorage = {
  async getAll(): Promise<Reference[]> {
    const database = await getDB();
    return database.getAll('references');
  },

  async get(id: string): Promise<Reference | undefined> {
    const database = await getDB();
    return database.get('references', id);
  },

  async add(reference: Reference): Promise<void> {
    const database = await getDB();
    await database.add('references', reference);
  },

  async update(reference: Reference): Promise<void> {
    const database = await getDB();
    await database.put('references', reference);
  },

  async delete(id: string): Promise<void> {
    const database = await getDB();
    await database.delete('references', id);
  },
};

