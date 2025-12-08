import { create } from 'zustand';
import type { Task, Project, Context } from '@/types';
import { taskStorage, projectStorage, contextStorage } from '@/lib/services/storage';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  contexts: Context[];
  isLoading: boolean;
  
  // Actions
  loadTasks: () => Promise<void>;
  loadProjects: () => Promise<void>;
  loadContexts: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addContext: (context: Context) => Promise<void>;
  updateContext: (context: Context) => Promise<void>;
  deleteContext: (id: string) => Promise<void>;
  
  // Computed
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getInboxTasks: () => Task[];
  getNextActions: () => Task[];
  getScheduledTasks: () => Task[];
  getSomedayTasks: () => Task[];
  getReferenceItems: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  projects: [],
  contexts: [],
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await taskStorage.getAll();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ isLoading: false });
    }
  },

  loadProjects: async () => {
    try {
      const projects = await projectStorage.getAll();
      set({ projects });
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  },

  loadContexts: async () => {
    try {
      const contexts = await contextStorage.getAll();
      set({ contexts });
    } catch (error) {
      console.error('Failed to load contexts:', error);
    }
  },

  addTask: async (task: Task) => {
    try {
      await taskStorage.add(task);
      await get().loadTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  },

  updateTask: async (task: Task) => {
    try {
      const updatedTask = {
        ...task,
        updatedAt: new Date().toISOString(),
      };
      await taskStorage.update(updatedTask);
      await get().loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  deleteTask: async (id: string) => {
    try {
      await taskStorage.delete(id);
      await get().loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },

  addProject: async (project: Project) => {
    try {
      await projectStorage.add(project);
      await get().loadProjects();
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  },

  updateProject: async (project: Project) => {
    try {
      const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString(),
      };
      await projectStorage.update(updatedProject);
      await get().loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectStorage.delete(id);
      await get().loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  addContext: async (context: Context) => {
    try {
      await contextStorage.add(context);
      await get().loadContexts();
    } catch (error) {
      console.error('Failed to add context:', error);
    }
  },

  updateContext: async (context: Context) => {
    try {
      await contextStorage.update(context);
      await get().loadContexts();
    } catch (error) {
      console.error('Failed to update context:', error);
    }
  },

  deleteContext: async (id: string) => {
    try {
      await contextStorage.delete(id);
      await get().loadContexts();
    } catch (error) {
      console.error('Failed to delete context:', error);
    }
  },

  // Computed getters
  getTasksByStatus: (status: Task['status']) => {
    return get().tasks.filter(task => task.status === status);
  },

  getTasksByProject: (projectId: string) => {
    return get().tasks.filter(task => task.projectId === projectId);
  },

  getInboxTasks: () => {
    return get().tasks.filter(task => task.status === 'inbox');
  },

  getNextActions: () => {
    return get().tasks.filter(task => task.status === 'next-action');
  },

  getScheduledTasks: () => {
    return get().tasks.filter(task => task.status === 'scheduled');
  },

  getSomedayTasks: () => {
    return get().tasks.filter(task => task.status === 'someday');
  },

  getReferenceItems: () => {
    return get().tasks.filter(task => task.status === 'reference');
  },
}));

