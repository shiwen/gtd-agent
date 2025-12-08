'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Task } from '@/types';
import { generateId } from '@/lib/utils/id';

export default function InboxPage() {
  const { tasks, loadTasks, addTask, updateTask, deleteTask, getInboxTasks } = useTaskStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  let inboxTasks = getInboxTasks();

  // Apply search filter
  if (searchQuery.trim()) {
    inboxTasks = inboxTasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleQuickAdd = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle,
      status: 'inbox',
      priority: 'medium',
      contextIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addTask(newTask);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    if (task.id && tasks.find(t => t.id === task.id)) {
      await updateTask(task);
    } else {
      await addTask(task);
    }
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">收件箱</h1>
          <Button
            size="icon"
            onClick={() => {
              setSelectedTask(undefined);
              setIsModalOpen(true);
            }}
            className="rounded-full"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

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

        {/* Quick add */}
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg bg-card">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuickAdd();
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewTaskTitle('');
                }
              }}
              placeholder="快速添加任务..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button onClick={handleQuickAdd} size="sm">添加</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle('');
                }}
                size="sm"
              >
                取消
              </Button>
            </div>
          </div>
        )}

        {inboxTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">
              {searchQuery ? '没有找到匹配的任务' : '收件箱是空的'}
            </p>
            <p className="text-sm">
              {searchQuery ? '尝试其他搜索词' : '点击 + 按钮快速添加任务'}
            </p>
          </div>
        ) : (
          <div>
            {inboxTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
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

