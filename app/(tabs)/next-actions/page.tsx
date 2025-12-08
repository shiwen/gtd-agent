'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Task } from '@/types';
import { Search } from 'lucide-react';

export default function NextActionsPage() {
  const { loadTasks, getNextActions, updateTask, deleteTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  let nextActions = getNextActions();

  // Apply search filter
  if (searchQuery.trim()) {
    nextActions = nextActions.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    await updateTask(task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      await deleteTask(taskId);
      setIsModalOpen(false);
      setSelectedTask(undefined);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">下一步行动</h1>

        {/* Search bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {nextActions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">
              {searchQuery ? '没有找到匹配的任务' : '暂无下一步行动'}
            </p>
            <p className="text-sm">
              {searchQuery ? '尝试其他搜索词' : '从收件箱处理任务后，它们会出现在这里'}
            </p>
          </div>
        ) : (
          <div>
            {nextActions.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                showActions
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        )}

        <BottomNav />
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(undefined);
        }}
        onSave={handleSaveTask}
      />
    </>
  );
}

